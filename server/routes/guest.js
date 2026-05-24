import { Router } from 'express';
import { selectCardsForPlan } from '../services/cardSelection.js';
import sql from '../db.js';

const router = Router();

// POST /api/guest/generate
// One free plan per session key (stored in localStorage, tracked in DB)
router.post('/generate', async (req, res) => {
  try {
    const { sessionKey, days = 3, servings = 4, preferences = {} } = req.body;

    if (!sessionKey) return res.status(400).json({ error: 'sessionKey required' });

    // Check if this session has already been used
    const [existing] = await sql`
      SELECT id, used FROM guest_sessions WHERE session_key = ${sessionKey}
    `;

    if (existing?.used) {
      return res.status(402).json({ error: 'guest_used', message: 'Guest plan already used. Sign up for unlimited!' });
    }

    // Generate meals from card library
    const { meals } = await selectCardsForPlan({ sql, count: days, servings, prefs: preferences, exclude: [] });
    if (meals.length === 0) {
      return res.status(503).json({ error: 'No recipes available yet.' });
    }

    // Create a guest meal plan (no user_id)
    const [plan] = await sql`
      INSERT INTO meal_plans (days, week_of, is_guest)
      VALUES (${days}, CURRENT_DATE, TRUE)
      RETURNING id
    `;

    // Mark session as used (upsert)
    if (existing) {
      await sql`UPDATE guest_sessions SET used = TRUE WHERE session_key = ${sessionKey}`;
    } else {
      await sql`INSERT INTO guest_sessions (session_key, used) VALUES (${sessionKey}, TRUE)`;
    }

    res.json({ planId: plan.id, meals });
  } catch (err) {
    if (err.error === 'guest_used') return res.status(402).json(err);
    console.error('Guest generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guest/save
router.post('/save', async (req, res) => {
  try {
    const { planId, meals } = req.body;

    await sql`DELETE FROM meals WHERE plan_id = ${planId}`;

    const rows = meals.map((m, i) => ({
      plan_id: planId,
      day_number: i + 1,
      name: m.name,
      description: m.description,
      prep_minutes: m.prep_minutes,
      difficulty: m.difficulty,
      ingredients: sql.json(m.ingredients ?? []),
      steps: sql.json(m.steps ?? []),
      estimated_cost: m.estimated_cost,
      emoji: m.emoji,
    }));

    const saved = await sql`INSERT INTO meals ${sql(rows)} RETURNING *`;
    res.json(saved);
  } catch (err) {
    console.error('Guest save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/guest/plan/:planId
router.get('/plan/:planId', async (req, res) => {
  try {
    const [plan] = await sql`SELECT * FROM meal_plans WHERE id = ${req.params.planId} AND is_guest = TRUE`;
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const meals = await sql`SELECT * FROM meals WHERE plan_id = ${req.params.planId} ORDER BY day_number`;
    res.json({ ...plan, meals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/guest/grocery
router.post('/grocery', async (req, res) => {
  try {
    const { planId } = req.body;
    const meals = await sql`SELECT ingredients, estimated_cost FROM meals WHERE plan_id = ${planId}`;

    const { buildGroceryList } = await import('../services/grocery.js');
    const allIngredients = meals.flatMap(m => {
      const ing = m.ingredients;
      if (!ing) return [];
      if (typeof ing === 'string') { try { return JSON.parse(ing); } catch { return []; } }
      return Array.isArray(ing) ? ing : [];
    });
    const totalCost = meals.reduce((sum, m) => sum + Number(m.estimated_cost || 0), 0);
    const result = buildGroceryList(allIngredients, totalCost);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
