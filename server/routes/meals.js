import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateMeals, generateMealsFromSeeds } from '../services/claude.js';
import { selectSeeds } from '../data/seeds.js';
import sql from '../db.js';

const router = Router();

// POST /api/meals/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { days, servings, preferences, previousMeals = [] } = req.body;

    const [user] = await sql`
      SELECT id, subscription, free_plans_used FROM users WHERE clerk_id = ${req.userId}
    `;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const freePlansUsed = user.free_plans_used ?? 0;
    const isActive = user.subscription === 'active';

    // Allow 1 free plan; require subscription after that
    if (!isActive && freePlansUsed >= 1) {
      return res.status(402).json({
        error: 'Subscription required',
        code: 'subscription_required',
        paywall: true,
      });
    }

    // Fetch recent meal names so Claude avoids repeating them
    const recentMeals = await sql`
      SELECT m.name FROM meals m
      JOIN meal_plans mp ON mp.id = m.plan_id
      WHERE mp.user_id = ${user.id}
      ORDER BY mp.created_at DESC
      LIMIT 75
    `;
    const excludeAll = [...new Set([
      ...previousMeals,
      ...recentMeals.map(m => m.name),
    ])];

    const seeds = selectSeeds({ count: 3, prefs: preferences, excludeNames: excludeAll });
    const meals = await generateMealsFromSeeds(seeds, servings, preferences?.store || 'Any', preferences?.budget || null);

    const [plan] = await sql`
      INSERT INTO meal_plans (user_id, days, week_of)
      VALUES (${user.id}, ${days}, CURRENT_DATE)
      RETURNING id
    `;

    // Increment free plan counter if not subscribed
    if (!isActive) {
      await sql`UPDATE users SET free_plans_used = ${freePlansUsed + 1} WHERE id = ${user.id}`;
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
    const seeds = selectSeeds({ count: 3, prefs: preferences, excludeNames });
    const meals = await generateMealsFromSeeds(seeds, preferences?.servings || 4, preferences?.store || 'Any', preferences?.budget || null);
    res.json({ meals });
  } catch (err) {
    console.error('Generate-more error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/plan/:planId
router.get('/plan/:planId', requireAuth, async (req, res) => {
  try {
    const [plan] = await sql`SELECT * FROM meal_plans WHERE id = ${req.params.planId}`;
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const meals = await sql`SELECT * FROM meals WHERE plan_id = ${req.params.planId} ORDER BY day_number`;
    res.json({ ...plan, meals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals/save
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { planId, meals } = req.body;
    await sql`DELETE FROM meals WHERE plan_id = ${planId}`;

    const rows = meals.map((m, i) => ({
      plan_id:        planId,
      day_number:     i + 1,
      name:           m.name,
      description:    m.description,
      prep_minutes:   m.prep_minutes,
      difficulty:     m.difficulty,
      ingredients:    sql.json(m.ingredients ?? []),
      steps:          sql.json(m.steps ?? []),
      estimated_cost: m.estimated_cost,
      emoji:          m.emoji,
      cuisine:        m.cuisine ?? null,
      pexels_query:   m.pexels_query ?? null,
      chef_tip:       m.chef_tip ?? null,
      inspired_by:    m.inspired_by ?? null,
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
        name           = ${newMeal.name},
        description    = ${newMeal.description},
        prep_minutes   = ${newMeal.prep_minutes},
        difficulty     = ${newMeal.difficulty},
        ingredients    = ${JSON.stringify(newMeal.ingredients)},
        steps          = ${JSON.stringify(newMeal.steps)},
        estimated_cost = ${newMeal.estimated_cost},
        emoji          = ${newMeal.emoji},
        cuisine        = ${newMeal.cuisine ?? null},
        pexels_query   = ${newMeal.pexels_query ?? null},
        chef_tip       = ${newMeal.chef_tip ?? null},
        inspired_by    = ${newMeal.inspired_by ?? null}
      WHERE id = ${req.params.mealId}
      RETURNING *
    `;
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
