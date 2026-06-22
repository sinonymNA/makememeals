// Transactional emails via Resend. No-ops (with a console log) when
// RESEND_API_KEY isn't configured, so the app keeps working without it.
import { Resend } from 'resend';

const FROM = 'Make Me Meals <orders@makememeals.app>';

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function send({ to, subject, html }) {
  const resend = getResend();
  if (!resend) {
    console.log(`[Email] (no RESEND_API_KEY, skipped) → ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
  }
}

export function sendDiscountUnlockedFreeEmail(to) {
  return send({
    to,
    subject: 'You unlocked 10% off the MMM Shop 🎉',
    html: `
      <p>Nice — you just generated your first free meal plan, and that unlocks
      <strong>10% off</strong> everything in the MMM Shop.</p>
      <p>Your code <strong>MMMFREE10</strong> is already saved to your account —
      it'll auto-apply at checkout.</p>
      <p><a href="https://makememeals.app/shop">Check out the kitchen tools →</a></p>
    `,
  });
}

export function sendDiscountUnlockedProEmail(to) {
  return send({
    to,
    subject: 'You unlocked 25% off the MMM Shop 🎉',
    html: `
      <p>Thanks for subscribing! As a Pro member you now get
      <strong>25% off</strong> everything in the MMM Shop, for as long as
      you're subscribed.</p>
      <p>Your code <strong>MMMFREE25</strong> is already saved to your account —
      it'll auto-apply at checkout.</p>
      <p><a href="https://makememeals.app/shop">Check out the kitchen tools →</a></p>
    `,
  });
}

export function sendOrderConfirmationEmail(to, order, items) {
  const itemRows = items.map(i =>
    `<li>${i.quantity} × ${i.product_name} — $${(i.line_total_cents / 100).toFixed(2)}</li>`
  ).join('');
  return send({
    to,
    subject: `Order confirmed — #${order.id.slice(0, 8)}`,
    html: `
      <p>Thanks for your order! Here's what's coming:</p>
      <ul>${itemRows}</ul>
      <p>Total: <strong>$${(order.total_cents / 100).toFixed(2)}</strong></p>
      <p>Shipping is free. We'll email you when it ships.</p>
    `,
  });
}

export function sendOrderShippedEmail(to, order) {
  return send({
    to,
    subject: `Your order has shipped — #${order.id.slice(0, 8)}`,
    html: `
      <p>Good news — your MMM Shop order is on its way!</p>
      <p>Order total: <strong>$${(order.total_cents / 100).toFixed(2)}</strong></p>
      <p><a href="https://makememeals.app/shop/order/${order.id}">Track your order →</a></p>
    `,
  });
}
