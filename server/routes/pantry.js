import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Anthropic from '@anthropic-ai/sdk';
import sql from '../db.js';

const router = Router();
const anthropic = new Anthropic();

async function getUserId(clerkId) {
  const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  return user?.id || null;
}

// GET /api/pantry
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const items = await sql`
      SELECT * FROM pantry_items
      WHERE user_id = ${userId}
      ORDER BY category, name
    `;
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pantry
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { name, quantity, unit, category, expires_at } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const [item] = await sql`
      INSERT INTO pantry_items (user_id, name, quantity, unit, category, expires_at)
      VALUES (${userId}, ${name.trim()}, ${quantity || null}, ${unit || null}, ${category || 'other'}, ${expires_at || null})
      RETURNING *
    `;
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pantry/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { name, quantity, unit, category, expires_at } = req.body;
    const [item] = await sql`
      UPDATE pantry_items
      SET name = ${name}, quantity = ${quantity || null}, unit = ${unit || null},
          category = ${category || 'other'}, expires_at = ${expires_at || null},
          updated_at = NOW()
      WHERE id = ${req.params.id} AND user_id = ${userId}
      RETURNING *
    `;
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/pantry/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    await sql`DELETE FROM pantry_items WHERE id = ${req.params.id} AND user_id = ${userId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pantry/scan — Claude Vision extracts items from fridge/pantry photo
router.post('/scan', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { image, mediaType = 'image/jpeg' } = req.body;
    if (!image) return res.status(400).json({ error: 'Image data required' });

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: image },
          },
          {
            type: 'text',
            text: `Scan this fridge or pantry photo and list every visible food item with approximate quantity and unit. Be thorough. Return a JSON array only, no other text:
[
  { "name": "eggs", "quantity": 12, "unit": "count", "category": "dairy" },
  { "name": "whole milk", "quantity": 0.5, "unit": "gallon", "category": "dairy" },
  { "name": "chicken breast", "quantity": 1.5, "unit": "lbs", "category": "meat" },
  { "name": "cheddar cheese", "quantity": 8, "unit": "oz", "category": "dairy" }
]

Valid categories: produce, meat, seafood, dairy, grains, canned, condiments, frozen, snacks, beverages, other
If quantity is unclear, estimate conservatively.
Return ONLY the JSON array.`,
          },
        ],
      }],
    });

    const text = response.content[0].text.trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(422).json({ error: 'Could not parse items from image' });

    let items;
    try { items = JSON.parse(match[0]); } catch {
      return res.status(422).json({ error: 'Invalid JSON from vision model' });
    }

    // Upsert each detected item
    const saved = [];
    for (const item of items) {
      if (!item.name) continue;
      const [existing] = await sql`
        SELECT id FROM pantry_items
        WHERE user_id = ${userId} AND LOWER(name) = LOWER(${item.name})
      `;
      if (existing) {
        const [updated] = await sql`
          UPDATE pantry_items
          SET quantity = ${item.quantity || null}, unit = ${item.unit || null}, updated_at = NOW()
          WHERE id = ${existing.id}
          RETURNING *
        `;
        saved.push(updated);
      } else {
        const [created] = await sql`
          INSERT INTO pantry_items (user_id, name, quantity, unit, category)
          VALUES (${userId}, ${item.name}, ${item.quantity || null}, ${item.unit || null}, ${item.category || 'other'})
          RETURNING *
        `;
        saved.push(created);
      }
    }

    res.json({ items: saved, count: saved.length });
  } catch (err) {
    console.error('Pantry scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pantry/cook — deduct ingredients after cooking a meal
router.post('/cook', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { ingredients = [] } = req.body;
    for (const ing of ingredients) {
      if (!ing.name) continue;
      const [existing] = await sql`
        SELECT id, quantity FROM pantry_items
        WHERE user_id = ${userId} AND LOWER(name) = LOWER(${ing.name})
      `;
      if (!existing) continue;

      if (existing.quantity != null && ing.quantity != null) {
        const remaining = Number(existing.quantity) - Number(ing.quantity);
        if (remaining <= 0) {
          await sql`DELETE FROM pantry_items WHERE id = ${existing.id}`;
        } else {
          await sql`UPDATE pantry_items SET quantity = ${remaining}, updated_at = NOW() WHERE id = ${existing.id}`;
        }
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pantry/check?planId=xxx — check which grocery items are already in pantry
router.get('/check', requireAuth, async (req, res) => {
  try {
    const userId = await getUserId(req.userId);
    if (!userId) return res.status(404).json({ error: 'User not found' });

    const { planId } = req.query;
    if (!planId) return res.status(400).json({ error: 'planId required' });

    const [grocery] = await sql`SELECT items FROM grocery_lists WHERE plan_id = ${planId}`;
    if (!grocery) return res.json({ covered: [] });

    const pantry = await sql`SELECT name, quantity, unit FROM pantry_items WHERE user_id = ${userId}`;
    const pantryNames = pantry.map(p => p.name.toLowerCase());

    const items = grocery.items || [];
    const covered = items
      .filter(item => pantryNames.some(p => p.includes(item.name?.toLowerCase()) || item.name?.toLowerCase().includes(p)))
      .map(item => item.name);

    res.json({ covered, pantry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
