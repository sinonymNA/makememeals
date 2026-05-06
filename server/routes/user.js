import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import sql from '../db.js';

const router = Router();

// POST /api/user/register — create user after Clerk signup
router.post('/register', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    const [existing] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (existing) return res.json({ id: existing.id, already_exists: true });

    const [user] = await sql`
      INSERT INTO users (clerk_id, email)
      VALUES (${req.userId}, ${email})
      RETURNING *
    `;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT * FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [prefs] = await sql`SELECT * FROM preferences WHERE user_id = ${user.id}`;
    res.json(prefs || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/preferences
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { servings, picky_eaters, keep_mild, meat_free, gluten_free, dairy_free, thirty_min_max } = req.body;

    const [prefs] = await sql`
      INSERT INTO preferences (user_id, servings, picky_eaters, keep_mild, meat_free, gluten_free, dairy_free, thirty_min_max)
      VALUES (${user.id}, ${servings}, ${picky_eaters}, ${keep_mild}, ${meat_free}, ${gluten_free}, ${dairy_free}, ${thirty_min_max})
      ON CONFLICT (user_id) DO UPDATE SET
        servings = EXCLUDED.servings,
        picky_eaters = EXCLUDED.picky_eaters,
        keep_mild = EXCLUDED.keep_mild,
        meat_free = EXCLUDED.meat_free,
        gluten_free = EXCLUDED.gluten_free,
        dairy_free = EXCLUDED.dairy_free,
        thirty_min_max = EXCLUDED.thirty_min_max
      RETURNING *
    `;
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/plans
router.get('/plans', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plans = await sql`
      SELECT * FROM meal_plans WHERE user_id = ${user.id} ORDER BY created_at DESC
    `;
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
