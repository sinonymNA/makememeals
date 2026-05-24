import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import sql from '../db.js';

const router = Router();

// GET /api/coupons?store=kroger
router.get('/', requireAuth, async (req, res) => {
  try {
    const { store, search } = req.query;

    let coupons;
    if (store && store !== 'all') {
      coupons = await sql`
        SELECT * FROM coupons
        WHERE (store = ${store} OR store = 'all')
          AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
        ORDER BY valid_until ASC
      `;
    } else {
      coupons = await sql`
        SELECT * FROM coupons
        WHERE valid_until IS NULL OR valid_until >= CURRENT_DATE
        ORDER BY store, valid_until ASC
      `;
    }

    if (search) {
      const q = search.toLowerCase();
      coupons = coupons.filter(c =>
        `${c.product} ${c.description} ${c.brand} ${(c.keywords || []).join(' ')}`
          .toLowerCase().includes(q)
      );
    }

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/coupons/match?planId=xxx&store=kroger — match grocery list to coupons
router.get('/match', requireAuth, async (req, res) => {
  try {
    const { planId, store } = req.query;
    if (!planId) return res.status(400).json({ error: 'planId required' });

    const [grocery] = await sql`SELECT items FROM grocery_lists WHERE plan_id = ${planId}`;
    if (!grocery) return res.status(404).json({ error: 'Build grocery list first' });

    const items = grocery.items || [];
    const ingredientNames = items.map(i => (i.name || '').toLowerCase());

    let coupons;
    if (store && store !== 'all') {
      coupons = await sql`
        SELECT * FROM coupons
        WHERE (store = ${store} OR store = 'all')
          AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
      `;
    } else {
      coupons = await sql`
        SELECT * FROM coupons
        WHERE valid_until IS NULL OR valid_until >= CURRENT_DATE
      `;
    }

    const matched = coupons
      .map(c => {
        const kws = [
          ...(c.keywords || []),
          (c.product || '').toLowerCase(),
          (c.brand || '').toLowerCase(),
          (c.description || '').toLowerCase(),
        ].filter(Boolean);

        const score = ingredientNames.reduce((acc, name) => {
          const hit = kws.some(kw => name.includes(kw) || kw.includes(name.split(' ')[0]));
          return acc + (hit ? 1 : 0);
        }, 0);

        return { ...c, matchScore: score };
      })
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
