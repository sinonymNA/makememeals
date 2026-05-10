import { Router } from 'express';
import sql from '../db.js';

const router = Router();

function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/admin/stats
router.get('/stats', requireAdminKey, async (req, res) => {
  try {
    const [[users], [active], [today], [mrr]] = await Promise.all([
      sql`SELECT COUNT(*) FROM users`,
      sql`SELECT COUNT(*) FROM users WHERE subscription = 'active'`,
      sql`SELECT COUNT(*) FROM meal_plans WHERE created_at > NOW() - INTERVAL '24 hours'`,
      sql`SELECT COUNT(*) * 9.99 AS mrr FROM users WHERE subscription = 'active'`,
    ]);

    res.json({
      total_users:       Number(users.count),
      active_subscribers: Number(active.count),
      plans_today:       Number(today.count),
      mrr_estimate:      Number(mrr.mrr).toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
