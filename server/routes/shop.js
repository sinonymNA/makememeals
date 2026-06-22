import { Router } from 'express';
import Stripe from 'stripe';
import { verifyToken } from '@clerk/backend';
import { requireAuth } from '../middleware/auth.js';
import { PRODUCTS, getProductBySlug } from '../services/shopProducts.js';
import { getUserDiscount, validateDiscountCode } from '../services/discounts.js';
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '../services/email.js';
import sql from '../db.js';

const router = Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
}

// Best-effort auth — checkout/order lookups work for guests too.
async function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const [user] = await sql`SELECT id, email, is_admin FROM users WHERE clerk_id = ${payload.sub}`;
    return user || null;
  } catch {
    return null;
  }
}

async function requireAdmin(req, res, next) {
  const user = await getOptionalUser(req);
  if (!user?.is_admin) return res.status(403).json({ error: 'Admin access required' });
  req.adminUser = user;
  next();
}

// GET /api/shop/products
router.get('/products', (req, res) => {
  res.json(PRODUCTS.map(({ cj_sku, ...p }) => p));
});

// GET /api/shop/products/:slug
router.get('/products/:slug', (req, res) => {
  const product = getProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { cj_sku, ...p } = product;
  res.json(p);
});

// POST /api/shop/cart/validate-discount
router.post('/cart/validate-discount', async (req, res) => {
  try {
    const code = await validateDiscountCode(req.body.code);
    if (!code) return res.json({ valid: false });
    res.json({ valid: true, code: code.code, percent_off: code.percent_off });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/user/discount
router.get('/user/discount', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${req.userId}`;
    if (!user) return res.status(404).json({ error: 'User not found' });
    const discount = await getUserDiscount(user.id);
    res.json(discount || { code: null, percent_off: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function priceCart(items) {
  let subtotal_cents = 0;
  const lineItems = [];
  for (const { slug, quantity } of items) {
    const product = getProductBySlug(slug);
    if (!product) throw new Error(`Unknown product: ${slug}`);
    const qty = Math.max(1, Math.min(10, Number(quantity) || 1));
    const line_total_cents = product.price_cents * qty;
    subtotal_cents += line_total_cents;
    lineItems.push({
      product_slug: product.slug,
      product_name: product.name,
      unit_price_cents: product.price_cents,
      quantity: qty,
      line_total_cents,
    });
  }
  return { subtotal_cents, lineItems };
}

// POST /api/shop/checkout/create-intent
// body: { items: [{slug, quantity}], discountCode, email, shippingName, shippingAddress }
router.post('/checkout/create-intent', async (req, res) => {
  try {
    const { items, discountCode, email, shippingName, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { subtotal_cents, lineItems } = priceCart(items);

    const user = await getOptionalUser(req);
    let appliedCode = null;
    let percentOff = 0;

    if (discountCode) {
      const validated = await validateDiscountCode(discountCode);
      if (validated) {
        appliedCode = validated.code;
        percentOff = validated.percent_off;
      }
    } else if (user) {
      const userDiscount = await getUserDiscount(user.id);
      if (userDiscount) {
        appliedCode = userDiscount.code;
        percentOff = userDiscount.percent_off;
      }
    }

    const discount_cents = Math.round(subtotal_cents * percentOff / 100);
    const shipping_cents = 0; // free shipping everywhere
    const total_cents = Math.max(0, subtotal_cents - discount_cents + shipping_cents);

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: { app: 'mmm-shop' },
    });

    const [order] = await sql`
      INSERT INTO orders (
        user_id, status, email, shipping_name, shipping_address,
        subtotal_cents, discount_code, discount_cents, shipping_cents, total_cents,
        stripe_payment_intent_id
      ) VALUES (
        ${user?.id || null}, 'pending', ${email}, ${shippingName || null}, ${sql.json(shippingAddress || {})},
        ${subtotal_cents}, ${appliedCode}, ${discount_cents}, ${shipping_cents}, ${total_cents},
        ${intent.id}
      )
      RETURNING id
    `;

    const rows = lineItems.map(li => ({ order_id: order.id, ...li }));
    await sql`INSERT INTO order_items ${sql(rows)}`;

    res.json({ clientSecret: intent.client_secret, orderId: order.id, total_cents, discount_cents, subtotal_cents });
  } catch (err) {
    console.error('Create intent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

async function markOrderPaid(orderId) {
  const [order] = await sql`
    UPDATE orders SET status = 'processing', updated_at = NOW()
    WHERE id = ${orderId} AND status = 'pending'
    RETURNING *
  `;
  if (!order) return; // already processed or doesn't exist
  const items = await sql`SELECT * FROM order_items WHERE order_id = ${orderId}`;
  await sendOrderConfirmationEmail(order.email, order, items).catch(err => console.error('Order email error:', err.message));
}

// POST /api/shop/checkout/confirm — client-side fallback right after Stripe confirms payment
router.post('/checkout/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;
    const [order] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
    if (intent.status === 'succeeded') {
      await markOrderPaid(order.id);
    }

    const [updated] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shop/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const [order] = await sql`SELECT * FROM orders WHERE id = ${req.params.id}`;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop/webhooks/stripe
router.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const [order] = await sql`SELECT id FROM orders WHERE stripe_payment_intent_id = ${intent.id}`;
      if (order) await markOrderPaid(order.id);
    }
  } catch (err) {
    console.error('[Shop Webhook] Handler error:', err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
});

// GET /api/shop/admin/orders
router.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shop/admin/orders/:id
router.patch('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [order] = await sql`
      UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${req.params.id} RETURNING *
    `;
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (status === 'shipped') {
      await sendOrderShippedEmail(order.email, order).catch(err => console.error('Shipped email error:', err.message));
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
