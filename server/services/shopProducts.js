// Hardcoded product catalog — kitchen tools sold via the MMM Shop.
// CJDropshipping SKUs are filled in once sourcing is finalized.
// `emoji` holds a product photo URL (placeholder for now — swap in real photos).
export const PRODUCTS = [
  {
    slug: 'cheese-grater',
    name: 'Rotary Cheese Grater',
    tagline: 'Fresh-grated cheese in 10 seconds, zero knuckle skin lost',
    price_cents: 2499,
    emoji: '/images/products/cheese-grater.png',
    bullets: [
      'Crank handle grates a block in seconds',
      'Dishwasher-safe stainless drum',
      'Suction base keeps it locked to the counter',
    ],
    cj_sku: '[to be added]',
  },
  {
    slug: 'oil-sprayer',
    name: 'Olive Oil Mister Sprayer',
    tagline: 'Lighter cooking with a fine, even mist instead of a glug',
    price_cents: 1999,
    emoji: '/images/products/oil-sprayer.png',
    bullets: [
      'Refillable glass bottle, BPA-free pump',
      'Fine mist for sautéing, salads, air fryer prep',
      'Cuts oil usage way down vs. pouring',
    ],
    cj_sku: '[to be added]',
  },
  {
    slug: 'vegetable-chopper',
    name: '5-Blade Vegetable Chopper',
    tagline: 'Dice a whole onion without touching a knife',
    price_cents: 1999,
    emoji: '/images/products/vegetable-chopper.png',
    bullets: [
      'Interchangeable blades for dice, slice, julienne',
      'Built-in catch container',
      'Dishwasher-safe parts',
    ],
    cj_sku: '[to be added]',
  },
  {
    slug: 'chicken-shredder',
    name: 'Chicken Shredder Tool',
    tagline: 'Two claws, perfectly shredded chicken in seconds',
    price_cents: 1499,
    emoji: '/images/products/chicken-shredder.png',
    bullets: [
      'Heat-resistant claws double as serving tongs',
      'Works on chicken, pork, beef — shred straight from the pot',
      'Dishwasher-safe',
    ],
    cj_sku: '[to be added]',
  },
  {
    slug: 'salad-spinner',
    name: 'Salad Spinner',
    tagline: 'Bone-dry greens for crisp salads, no soggy paper towels',
    price_cents: 2299,
    emoji: '/images/products/salad-spinner.png',
    bullets: [
      'Pump mechanism spins greens dry in one motion',
      'Bowl doubles as a serving bowl',
      'Non-slip base, easy-grip lid',
    ],
    cj_sku: '[to be added]',
  },
];

export function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || null;
}
