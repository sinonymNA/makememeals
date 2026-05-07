import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildGroceryList } from '../services/grocery.js';
import sql from '../db.js';

const router = Router();

// POST /api/grocery/build
router.post('/build', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;

    const meals = await sql`
      SELECT ingredients, estimated_cost FROM meals WHERE plan_id = ${planId}
    `;

    if (!meals.length) return res.status(404).json({ error: 'No meals found for this plan' });

    const allIngredients = meals.flatMap(m => {
      const ing = m.ingredients;
      if (!ing) return [];
      if (typeof ing === 'string') {
        try { return JSON.parse(ing); } catch { return []; }
      }
      return Array.isArray(ing) ? ing : [];
    });
    const totalCost = meals.reduce((sum, m) => sum + Number(m.estimated_cost || 0), 0);
    const { items, estimatedTotal } = buildGroceryList(allIngredients, totalCost);

    // Upsert grocery list
    await sql`
      INSERT INTO grocery_lists (plan_id, items, estimated_total)
      VALUES (${planId}, ${JSON.stringify(items)}, ${estimatedTotal})
      ON CONFLICT (plan_id) DO UPDATE SET items = EXCLUDED.items, estimated_total = EXCLUDED.estimated_total
    `;

    res.json({ items, estimatedTotal });
  } catch (err) {
    console.error('Grocery build error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
