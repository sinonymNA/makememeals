import { Router } from 'express';

const router = Router();

// Payments coming soon — Stripe integration not yet wired
router.post('/create-checkout', (req, res) => {
  res.status(501).json({ error: 'Payments not yet configured' });
});

router.post('/webhook', (req, res) => {
  res.json({ received: true });
});

export default router;
