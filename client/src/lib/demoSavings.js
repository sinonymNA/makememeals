// Computes the "savings reveal" numbers for the landing demo from the meals the
// visitor actually picked — so the story feels specific and true, not random.
//
//  • baseTotal       — sum of each meal's estimated_cost (the starting grocery bill)
//  • coupons[]       — realistic per-item coupon discounts on branded staples
//  • consolidations[]— REAL overlaps: ingredients used by 2+ of their meals, where
//                      buying once instead of per-recipe saves money
//  • finalTotal      — baseTotal − coupons − consolidation
//
// Amounts are derived from each ingredient's estimated_price where available, and
// a deterministic seed (from the meal names) keeps them stable across re-renders.

function seededRand(seed) {
  // Mulberry32 — tiny deterministic PRNG so numbers don't jump on every render.
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Normalize an ingredient name down to its "core" so "boneless chicken thighs"
// and "chicken thighs" count as the same shoppable item.
const CORE_PATTERNS = [
  'chicken thigh', 'chicken breast', 'chicken', 'ground beef', 'beef', 'bacon',
  'salmon', 'shredded cheese', 'mozzarella', 'cheddar', 'parmesan', 'cheese',
  'heavy cream', 'cream', 'milk', 'butter', 'rice', 'pasta', 'flour', 'tortilla',
  'onion', 'garlic', 'bell pepper', 'broccoli', 'potato', 'corn', 'black bean',
  'ranch', 'bbq sauce', 'soy sauce', 'honey', 'olive oil', 'egg',
];

function coreName(name) {
  const n = (name || '').toLowerCase();
  for (const p of CORE_PATTERNS) {
    if (n.includes(p)) return p;
  }
  return n.replace(/[^a-z ]/g, '').trim();
}

function titleCase(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

// Branded staples that believably have a store coupon this week.
const COUPONABLE = {
  'shredded cheese': 'Sargento Shredded Cheese',
  mozzarella: 'Sargento Mozzarella',
  cheddar: 'Sargento Cheddar',
  parmesan: 'Kraft Parmesan',
  bacon: 'Oscar Mayer Bacon',
  'bbq sauce': "Sweet Baby Ray's BBQ Sauce",
  ranch: 'Hidden Valley Ranch',
  'heavy cream': 'Land O Lakes Heavy Cream',
  butter: 'Land O Lakes Butter',
  'chicken thigh': 'Perdue Chicken Thighs',
  'chicken breast': 'Perdue Chicken Breast',
  salmon: 'Fresh Atlantic Salmon',
  rice: 'Ben’s Original Rice',
  'soy sauce': 'Kikkoman Soy Sauce',
};

export function computeDemoSavings(meals = []) {
  const baseTotal = round2(meals.reduce((s, m) => s + Number(m.estimated_cost || 0), 0));
  const seed = hashString(meals.map(m => m.name).join('|'));
  const rand = seededRand(seed);

  // ---- Build an index of which meals use which core ingredient ----
  const usage = new Map(); // core -> { meals:Set<idx>, price:number, label:string }
  meals.forEach((meal, idx) => {
    for (const ing of meal.ingredients || []) {
      const core = coreName(ing.name);
      if (!core) continue;
      const price = Number(ing.estimated_price) || 0;
      if (!usage.has(core)) usage.set(core, { meals: new Set(), price: 0, label: ing.name });
      const u = usage.get(core);
      u.meals.add(idx);
      u.price = Math.max(u.price, price);
    }
  });

  // ---- Consolidation: ingredients shared by 2+ meals (REAL overlap) ----
  const consolidations = [];
  for (const [core, u] of usage) {
    if (u.meals.size < 2) continue;
    const idxs = [...u.meals];
    // Buying one shared package instead of per-recipe saves ~ one duplicate's worth.
    const unit = u.price > 0 ? u.price : 2 + rand() * 3;
    const save = round2(Math.min(6, unit * (0.5 + rand() * 0.4) * (u.meals.size - 1)));
    if (save < 0.75) continue;
    consolidations.push({
      core,
      label: titleCase(core),
      mealNames: idxs.map(i => meals[i].name),
      mealIdxs: idxs,
      save,
    });
  }
  consolidations.sort((a, b) => b.save - a.save);
  // Keep the most compelling few, clamp total to a believable $5–$12.
  let topConsolidations = consolidations.slice(0, 4);
  let consolidationTotal = round2(topConsolidations.reduce((s, c) => s + c.save, 0));
  if (consolidationTotal > 12) {
    const scale = 12 / consolidationTotal;
    topConsolidations = topConsolidations.map(c => ({ ...c, save: round2(c.save * scale) }));
    consolidationTotal = round2(topConsolidations.reduce((s, c) => s + c.save, 0));
  }

  // ---- Coupons: branded staples in their cart, up to 5 ----
  const couponCandidates = [];
  for (const [core, u] of usage) {
    if (!COUPONABLE[core]) continue;
    const base = u.price > 0 ? u.price : 3 + rand() * 3;
    const save = round2(Math.max(1, Math.min(5, base * (0.3 + rand() * 0.3))));
    couponCandidates.push({ core, product: COUPONABLE[core], save });
  }
  couponCandidates.sort((a, b) => b.save - a.save);
  const coupons = couponCandidates.slice(0, 5);
  const couponTotal = round2(coupons.reduce((s, c) => s + c.save, 0));

  const totalSaved = round2(couponTotal + consolidationTotal);
  const finalTotal = round2(Math.max(0, baseTotal - totalSaved));

  return {
    baseTotal,
    coupons,
    couponTotal,
    consolidations: topConsolidations,
    consolidationTotal,
    totalSaved,
    finalTotal,
  };
}
