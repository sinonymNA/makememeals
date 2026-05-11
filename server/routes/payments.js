import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
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

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const clerkId   = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      await sql`
        UPDATE users
        SET subscription = 'active',
            stripe_customer_id     = ${customerId},
            stripe_subscription_id = ${subscriptionId}
        WHERE clerk_id = ${clerkId}
      `;
      console.log(`[Stripe] Subscription activated — clerk_id: ${clerkId}`);
      // TODO: send welcome email via Resend when RESEND_API_KEY is set
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      await sql`
        UPDATE users SET subscription = 'cancelled'
        WHERE stripe_customer_id = ${sub.customer}
      `;
      console.log(`[Stripe] Subscription cancelled — customer: ${sub.customer}`);
      // TODO: send cancellation email
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const status = sub.status === 'active' ? 'active' : 'cancelled';
      await sql`
        UPDATE users SET subscription = ${status}
        WHERE stripe_customer_id = ${sub.customer}
      `;
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      // Grace period: keep active for 3 days — Stripe retries handle the actual cancellation
      console.log(`[Stripe] Payment failed — customer: ${invoice.customer}. Grace period active.`);
      // TODO: send payment failed email via Resend
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
});

export default router;
