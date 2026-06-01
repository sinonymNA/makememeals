import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { selectCardsForPlan } from '../services/cardSelection.js';
import sql from '../db.js';

const router = Router();

// POST /api/meals/generate
// Selects meals from the approved recipe card library.
// Falls back to AI generation only if the card library has no approved cards at all.
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { days, servings, preferences, previousMeals = [] } = req.body;

    const [user] = await sql`
      SELECT id, subscription, free_plans_used FROM users WHERE clerk_id = ${req.userId}
    `;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const freePlansUsed = user.free_plans_used ?? 0;
    const isActive = user.subscription === 'active';

    if (!isActive && freePlansUsed >= 1) {
      return res.status(402).json({
        error: 'Subscription required',
        code: 'subscription_required',
        paywall: true,
      });
    }

    // Fetch recently seen meal names so we don't repeat them
    const recentMeals = await sql`
      SELECT m.name FROM meals m
      JOIN meal_plans mp ON mp.id = m.plan_id
      WHERE mp.user_id = ${user.id}
      ORDER BY mp.created_at DESC
      LIMIT 75
    `;
    const exclude = [...new Set([...previousMeals, ...recentMeals.map(m => m.name)])];

    const { meals } = await selectCardsForPlan({
      sql,
      count: days,
      servings,
      prefs: preferences,
      exclude,
    });

    if (meals.length === 0) {
      return res.status(503).json({
        error: 'No recipes available yet. Add recipe cards in the admin panel.',
        code: 'no_cards',
      });
    }

    const [plan] = await sql`
      INSERT INTO meal_plans (user_id, days, week_of)
      VALUES (${user.id}, ${days}, CURRENT_DATE)
      RETURNING id
    `;

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
// Called by Swipe when the card queue runs low — pulls more from library.
router.post('/generate-more', requireAuth, async (req, res) => {
  try {
    const { preferences, excludeNames = [] } = req.body;
    const servings = preferences?.servings || 2;

    const { meals } = await selectCardsForPlan({
      sql,
      count: 6,
      servings,
      prefs: preferences,
      exclude: excludeNames,
    });

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
    const { planId, meals, servings } = req.body;
    await sql`DELETE FROM meals WHERE plan_id = ${planId}`;

    if (servings) {
      await sql`UPDATE meal_plans SET servings = ${servings} WHERE id = ${planId}`;
    }

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
      image_url:      m.imageUrl ?? null,
    }));

    const saved = await sql`INSERT INTO meals ${sql(rows)} RETURNING *`;
    res.json(saved);
  } catch (err) {
    console.error('Save meals error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meals/:mealId/swap
// Swaps one meal in a saved plan with another from the card library.
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
        inspired_by    = ${newMeal.inspired_by ?? null},
        image_url      = ${newMeal.imageUrl ?? null}
      WHERE id = ${req.params.mealId}
      RETURNING *
    `;
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meals/library — browse the full card library (for swap picker UI)
router.get('/library', requireAuth, async (req, res) => {
  try {
    const cards = await sql`
      SELECT * FROM recipe_cards WHERE approved = TRUE ORDER BY cuisine, name
    `;
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
