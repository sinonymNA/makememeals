import sql from '../db.js';
import { sendDiscountUnlockedFreeEmail, sendDiscountUnlockedProEmail } from './email.js';

const FREE_CODE = process.env.SHOP_DISCOUNT_FREE_CODE || 'MMMFREE10';
const PRO_CODE = process.env.SHOP_DISCOUNT_PRO_CODE || 'MMMFREE25';

// Assigns the free-tier discount the first time a user generates a free plan.
// No-ops if they already have a discount on file (e.g. already pro).
export async function assignFreeDiscount(userId, email) {
  const [existing] = await sql`SELECT id FROM user_discount_codes WHERE user_id = ${userId}`;
  if (existing) return;
  await sql`INSERT INTO user_discount_codes (user_id, code, tier) VALUES (${userId}, ${FREE_CODE}, 'free')`;
  if (email) await sendDiscountUnlockedFreeEmail(email);
}

// Assigns the pro-tier discount when a subscription activates.
export async function assignProDiscount(userId, email) {
  const [existing] = await sql`SELECT tier FROM user_discount_codes WHERE user_id = ${userId}`;
  if (existing?.tier === 'pro') return;
  await sql`
    INSERT INTO user_discount_codes (user_id, code, tier) VALUES (${userId}, ${PRO_CODE}, 'pro')
    ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code, tier = EXCLUDED.tier
  `;
  if (email) await sendDiscountUnlockedProEmail(email);
}

// Reverts a cancelled pro subscriber back to the free-tier discount.
export async function revertToFreeDiscount(userId) {
  await sql`
    INSERT INTO user_discount_codes (user_id, code, tier) VALUES (${userId}, ${FREE_CODE}, 'free')
    ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code, tier = EXCLUDED.tier
    WHERE user_discount_codes.tier = 'pro'
  `;
}

export async function getUserDiscount(userId) {
  if (!userId) return null;
  const [row] = await sql`SELECT code, tier FROM user_discount_codes WHERE user_id = ${userId}`;
  if (!row) return null;
  const [code] = await sql`SELECT percent_off FROM discount_codes WHERE code = ${row.code} AND active = TRUE`;
  if (!code) return null;
  return { code: row.code, tier: row.tier, percent_off: code.percent_off };
}

export async function validateDiscountCode(rawCode) {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  const [row] = await sql`SELECT code, percent_off FROM discount_codes WHERE code = ${code} AND active = TRUE`;
  return row || null;
}
