import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sql from '../db.js';

const router = Router();
const anthropic = new Anthropic();
const __dirname = dirname(fileURLToPath(import.meta.url));

const uploadDir = join(__dirname, '../../uploads/recipe-cards');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.mimetype);
    cb(ok ? null : new Error('Only image files allowed'), ok);
  },
});

async function getUser(clerkId) {
  const [user] = await sql`SELECT id, is_admin FROM users WHERE clerk_id = ${clerkId}`;
  return user || null;
}

// GET /api/recipe-cards — browse approved cards + user's own
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cards = await sql`
      SELECT rc.*
      FROM recipe_cards rc
      WHERE rc.approved = TRUE OR rc.user_id = ${user.id}
      ORDER BY rc.source DESC, rc.created_at DESC
    `;
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipe-cards/upload — upload image, extract recipe via Claude Vision
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!req.file) return res.status(400).json({ error: 'Image file required' });

    const imageUrl = `/uploads/recipe-cards/${req.file.filename}`;
    const imageData = readFileSync(req.file.path).toString('base64');
    const mediaType = req.file.mimetype === 'image/heic' ? 'image/jpeg' : req.file.mimetype;

    // Claude Vision extracts recipe from the card image
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          {
            type: 'text',
            text: `Extract the complete recipe from this recipe card image. Return ONLY this JSON structure:
{
  "name": "Recipe Name",
  "cuisine": "american",
  "description": "2-3 sentence description of the dish",
  "prep_minutes": 30,
  "servings": 4,
  "ingredients": [
    { "name": "flour", "quantity": "2", "unit": "cups" },
    { "name": "butter", "quantity": "4", "unit": "tbsp" }
  ],
  "steps": [
    "Preheat oven to 375°F.",
    "Mix dry ingredients together in a large bowl."
  ],
  "chef_tip": "A helpful cooking tip or null if none"
}

Valid cuisine values: american, italian, asian, latin, mediterranean, indian, steakhouse, healthy
If you cannot read the card clearly, make your best estimate from what's visible.
Return ONLY valid JSON, no other text.`,
          },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const match = text.match(/\{[\s\S]*\}/);
    let recipe = { name: 'Untitled Recipe', ingredients: [], steps: [] };
    if (match) {
      try { recipe = { ...recipe, ...JSON.parse(match[0]) }; } catch {}
    }

    const isAdmin = user.is_admin || false;

    const [card] = await sql`
      INSERT INTO recipe_cards
        (user_id, source, image_url, name, cuisine, description,
         ingredients, steps, prep_minutes, servings, chef_tip, approved)
      VALUES
        (${user.id}, ${isAdmin ? 'admin' : 'user'}, ${imageUrl},
         ${recipe.name}, ${recipe.cuisine || null}, ${recipe.description || null},
         ${JSON.stringify(recipe.ingredients || [])}, ${JSON.stringify(recipe.steps || [])},
         ${recipe.prep_minutes || null}, ${recipe.servings || null},
         ${recipe.chef_tip || null}, ${isAdmin})
      RETURNING *
    `;

    res.json(card);
  } catch (err) {
    console.error('Recipe card upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/recipe-cards/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await sql`DELETE FROM recipe_cards WHERE id = ${req.params.id} AND user_id = ${user.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipe-cards/admin/all — admin: all cards including pending
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user?.is_admin) return res.status(403).json({ error: 'Admin access required' });

    const cards = await sql`
      SELECT rc.*, u.email as uploader_email
      FROM recipe_cards rc
      LEFT JOIN users u ON u.id = rc.user_id
      ORDER BY rc.approved ASC, rc.created_at DESC
    `;
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/recipe-cards/:id/approve — admin: approve or reject
router.patch('/:id/approve', requireAuth, async (req, res) => {
  try {
    const user = await getUser(req.userId);
    if (!user?.is_admin) return res.status(403).json({ error: 'Admin access required' });

    const { approved } = req.body;
    await sql`UPDATE recipe_cards SET approved = ${approved} WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
