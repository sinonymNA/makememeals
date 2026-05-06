import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateMeals } from '../services/claude.js';
import sql from '../db.js';

const router = Router();

// POST /api/meals/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { days, servings, preferences, previousMeals = [] } = req.body;

    const [user] = await sql`
      SELECT id, subscription, free_weeks FROM users WHERE clerk_id = ${req.userId}
    `;

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Paywall: free tier = 1 plan
    if (user.subscription === 'free' && user.free_weeks >= 1) {
      return res.status(402).json({ error: 'paywall' });
    }

    const meals = await generateMeals(days, servings, preferences, previousMeals);

    const [plan] = await sql`
      INSERT INTO meal_plans (user_id, days, week_of)
      VALUES (${user.id}, ${days}, CURRENT_DATE)
      RETURNING id
    `;

    if (user.subscription === 'free') {
      await sql`UPDATE users SET free_weeks = free_weeks + 1 WHERE id = ${user.id}`;
    }

    res.json({ planId: plan.id, meals });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals/generate-more
router.post('/generate-more', requireAuth, async (req, res) => {
  try {
    const { preferences, excludeNames = [] } = req.body;
    const meals = await generateMeals(3, preferences?.servings || 4, preferences, excludeNames);
    res.json({ meals });
  } catch (err) {
    console.error('Generate-more error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/plan/:planId
router.get('/plan/:planId', requireAuth, async (req, res) => {
  try {
    const [plan] = await sql`
      SELECT * FROM meal_plans WHERE id = ${req.params.planId}
    `;
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const meals = await sql`
      SELECT * FROM meals WHERE plan_id = ${req.params.planId} ORDER BY day_number
    `;

    res.json({ ...plan, meals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals/save
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { planId, meals } = req.body;

    // Delete any existing meals for this plan (handles swap scenario)
    await sql`DELETE FROM meals WHERE plan_id = ${planId}`;

    const rows = meals.map((m, i) => ({
      plan_id: planId,
      day_number: i + 1,
      name: m.name,
      description: m.description,
      prep_minutes: m.prep_minutes,
      difficulty: m.difficulty,
      ingredients: JSON.stringify(m.ingredients),
      steps: JSON.stringify(m.steps),
      estimated_cost: m.estimated_cost,
      emoji: m.emoji,
    }));

    const saved = await sql`INSERT INTO meals ${sql(rows)} RETURNING *`;
    res.json(saved);
  } catch (err) {
    console.error('Save meals error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meals/:mealId/swap
router.patch('/:mealId/swap', requireAuth, async (req, res) => {
  try {
    const { newMeal } = req.body;
    const [meal] = await sql`
      UPDATE meals SET
        name = ${newMeal.name},
        description = ${newMeal.description},
        prep_minutes = ${newMeal.prep_minutes},
        difficulty = ${newMeal.difficulty},
        ingredients = ${JSON.stringify(newMeal.ingredients)},
        steps = ${JSON.stringify(newMeal.steps)},
        estimated_cost = ${newMeal.estimated_cost},
        emoji = ${newMeal.emoji}
      WHERE id = ${req.params.mealId}
      RETURNING *
    `;
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
