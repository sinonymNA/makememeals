import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildGroceryList } from '../services/grocery.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// POST /api/grocery/build
router.post('/build', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const db = supabase();

    const { data: meals } = await db
      .from('meals')
      .select('ingredients, estimated_cost')
      .eq('plan_id', planId);

    if (!meals?.length) {
      return res.status(404).json({ error: 'No meals found for this plan' });
    }

    const allIngredients = meals.flatMap(m => m.ingredients || []);
    const totalCost = meals.reduce((sum, m) => sum + (m.estimated_cost || 0), 0);
    const { items, estimatedTotal } = buildGroceryList(allIngredients, totalCost);

    // Upsert grocery list
    const existing = await db.from('grocery_lists').select('id').eq('plan_id', planId).single();
    if (existing.data) {
      await db.from('grocery_lists').update({ items, estimated_total: estimatedTotal }).eq('plan_id', planId);
    } else {
      await db.from('grocery_lists').insert({ plan_id: planId, items, estimated_total: estimatedTotal });
    }

    res.json({ items, estimatedTotal });
  } catch (err) {
    console.error('Grocery build error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
