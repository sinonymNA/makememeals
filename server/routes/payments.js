import { Router } from 'express';
import Stripe from 'stripe';
import { requireAuth } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function stripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function supabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// POST /api/payments/create-checkout
router.post('/create-checkout', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const s = stripe();

    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Make Me Meals — Monthly', description: 'Unlimited meal plans, recipes & grocery lists' },
          unit_amount: 1000, // $10.00
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      customer_email: email,
      metadata: { clerk_id: req.userId },
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?cancelled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const db = supabase();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clerkId = session.metadata?.clerk_id;
    if (clerkId) {
      await db.from('users').update({ subscription: 'active' }).eq('clerk_id', clerkId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    // Look up customer email to find user
    const customer = await stripe().customers.retrieve(sub.customer);
    if (customer.email) {
      await db.from('users').update({ subscription: 'cancelled' }).eq('email', customer.email);
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object;
    if (sub.status === 'active') {
      const customer = await stripe().customers.retrieve(sub.customer);
      if (customer.metadata?.clerk_id) {
        await db.from('users').update({ subscription: 'active' }).eq('clerk_id', customer.metadata.clerk_id);
      }
    }
  }

  res.json({ received: true });
});

export default router;
