import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateMeals } from '../services/claude.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// POST /api/meals/generate
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { days, servings, preferences, previousMeals = [] } = req.body;
    const db = supabase();

    // Ensure user exists in our DB
    const { data: user } = await db
      .from('users')
      .select('id, subscription, free_weeks')
      .eq('clerk_id', req.userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check paywall: free tier allows 1 plan
    if (user.subscription === 'free' && user.free_weeks >= 1) {
      return res.status(402).json({ error: 'paywall', message: 'Subscribe to generate more meal plans' });
    }

    const meals = await generateMeals(days, servings, preferences, previousMeals);

    // Create meal plan in DB
    const { data: plan } = await db
      .from('meal_plans')
      .insert({ user_id: user.id, days, week_of: new Date().toISOString().split('T')[0] })
      .select()
      .single();

    // Increment free_weeks if free user
    if (user.subscription === 'free') {
      await db.from('users').update({ free_weeks: user.free_weeks + 1 }).eq('id', user.id);
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
    const db = supabase();
    const { data: plan } = await db
      .from('meal_plans')
      .select('*, meals(*)')
      .eq('id', req.params.planId)
      .single();

    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meals/:mealId/swap
router.patch('/:mealId/swap', requireAuth, async (req, res) => {
  try {
    const { newMeal } = req.body;
    const db = supabase();

    const { data: meal } = await db
      .from('meals')
      .update(newMeal)
      .eq('id', req.params.mealId)
      .select()
      .single();

    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meals/save — save confirmed meals to a plan
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { planId, meals } = req.body;
    const db = supabase();

    const rows = meals.map((m, i) => ({
      plan_id: planId,
      day_number: i + 1,
      name: m.name,
      description: m.description,
      prep_minutes: m.prep_minutes,
      difficulty: m.difficulty,
      ingredients: m.ingredients,
      steps: m.steps,
      estimated_cost: m.estimated_cost,
      emoji: m.emoji,
    }));

    const { data } = await db.from('meals').insert(rows).select();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
