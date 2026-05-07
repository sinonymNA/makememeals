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

    const {
      servings, picky_eaters, keep_mild, meat_free, gluten_free,
      dairy_free, thirty_min_max, high_protein, low_waste, budget, store,
    } = req.body;

    const [prefs] = await sql`
      INSERT INTO preferences
        (user_id, servings, picky_eaters, keep_mild, meat_free, gluten_free,
         dairy_free, thirty_min_max, high_protein, low_waste, budget, store)
      VALUES
        (${user.id}, ${servings}, ${picky_eaters}, ${keep_mild}, ${meat_free}, ${gluten_free},
         ${dairy_free}, ${thirty_min_max}, ${high_protein ?? false}, ${low_waste ?? false},
         ${budget ?? 100}, ${store ?? 'Any'})
      ON CONFLICT (user_id) DO UPDATE SET
        servings       = EXCLUDED.servings,
        picky_eaters   = EXCLUDED.picky_eaters,
        keep_mild      = EXCLUDED.keep_mild,
        meat_free      = EXCLUDED.meat_free,
        gluten_free    = EXCLUDED.gluten_free,
        dairy_free     = EXCLUDED.dairy_free,
        thirty_min_max = EXCLUDED.thirty_min_max,
        high_protein   = EXCLUDED.high_protein,
        low_waste      = EXCLUDED.low_waste,
        budget         = EXCLUDED.budget,
        store          = EXCLUDED.store
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
      SELECT
        mp.*,
        COALESCE(
          (SELECT json_agg(m.emoji ORDER BY m.day_number)
           FROM meals m WHERE m.plan_id = mp.id AND m.emoji IS NOT NULL),
          '[]'::json
        ) AS meal_emojis,
        COALESCE(
          (SELECT SUM(m.estimated_cost) FROM meals m WHERE m.plan_id = mp.id),
          0
        ) AS estimated_total
      FROM meal_plans mp
      WHERE mp.user_id = ${user.id}
      ORDER BY mp.created_at DESC
    `;
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
