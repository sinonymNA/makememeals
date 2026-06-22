import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import { assignProDiscount, revertToFreeDiscount } from '../services/discounts.js';
import sql from '../db.js';

const router = Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
}

// POST /api/payments/validate-promo
router.post('/validate-promo', requireAuth, async (req, res) => {
  try {
    const { promoCode } = req.body;
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (promoCode === 'AZALEA') {
      await sql`
        UPDATE users
        SET subscription = 'active', promo_code = ${promoCode}, promo_redeemed_at = NOW()
        WHERE clerk_id = ${req.userId}
      `;
      return res.json({ valid: true, message: 'Promo code applied! Full access unlocked.' });
    }
    res.json({ valid: false, message: 'Invalid promo code' });
  } catch (err) {
    console.error('Promo validation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/create-checkout
// plan: 'monthly' | 'annual'
router.post('/create-checkout', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const { plan = 'monthly' } = req.body;

    const priceId = plan === 'annual'
      ? process.env.STRIPE_PRICE_ID_ANNUAL
      : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return res.status(500).json({ error: `STRIPE_PRICE_ID_${plan.toUpperCase()} not configured` });
    }

    const [user] = await sql`SELECT id, email FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Strip trailing slash to prevent //dashboard double-slash redirect
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/dashboard?subscribed=1`,
      cancel_url:  `${clientUrl}/dashboard`,
      client_reference_id: req.userId,
      customer_email: user.email,
      subscription_data: {
        metadata: { clerk_id: req.userId },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/create-portal
router.post('/create-portal', requireAuth, async (req, res) => {
  try {
    const stripe = getStripe();
    const [user] = await sql`SELECT stripe_customer_id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${clientUrl}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT subscription, free_plans_used FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ subscription: user.subscription, free_plans_used: user.free_plans_used ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/payments/subscription — fresh DB check, never cached
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT subscription, free_plans_used FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log(`[Sub] clerk_id: ${req.userId} → ${user.subscription}`);
    res.json({ subscription: user.subscription, free_plans_used: user.free_plans_used ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const bodyLen = Buffer.isBuffer(req.body) ? req.body.length : 0;
  console.log(`[Webhook] Received — sig: ${!!sig}, bytes: ${bodyLen}, secret: ${!!process.env.STRIPE_WEBHOOK_SECRET}`);

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET env var');
    return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`[Webhook] Verified — type: ${event.type}, id: ${event.id}`);
  } catch (err) {
    console.error('[Webhook] Signature failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session      = event.data.object;
      const clerkId      = session.client_reference_id;
      const customerId   = session.customer;
      const subId        = session.subscription;
      console.log(`[Webhook] checkout.session.completed — clerk_id: ${clerkId}, customer: ${customerId}`);

      if (!clerkId) {
        console.error('[Webhook] No client_reference_id — cannot activate subscription');
      } else {
        const rows = await sql`
          UPDATE users
          SET subscription           = 'active',
              stripe_customer_id     = ${customerId},
              stripe_subscription_id = ${subId}
          WHERE clerk_id = ${clerkId}
          RETURNING id, email, subscription
        `;
        console.log(`[Webhook] Activated — rows: ${rows.length}, status: ${rows[0]?.subscription}`);
        if (rows[0]) {
          await assignProDiscount(rows[0].id, rows[0].email).catch(err => console.error('Discount assign error:', err.message));
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      console.log(`[Webhook] subscription.deleted — customer: ${sub.customer}`);
      const rows = await sql`UPDATE users SET subscription = 'cancelled' WHERE stripe_customer_id = ${sub.customer} RETURNING id`;
      if (rows[0]) {
        await revertToFreeDiscount(rows[0].id).catch(err => console.error('Discount revert error:', err.message));
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub    = event.data.object;
      const status = sub.status === 'active' ? 'active' : 'cancelled';
      console.log(`[Webhook] subscription.updated — customer: ${sub.customer}, status: ${status}`);
      await sql`UPDATE users SET subscription = ${status} WHERE stripe_customer_id = ${sub.customer}`;
    }

    if (event.type === 'invoice.payment_failed') {
      console.log(`[Webhook] invoice.payment_failed — customer: ${event.data.object.customer}`);
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
});

export default router;
