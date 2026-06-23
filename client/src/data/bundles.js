// Mock bundle data — the Weeknight Dinner Kit is the primary monetization offer.
export const BUNDLES = [
  {
    id: 'weeknight-dinner-kit',
    name: 'Weeknight Dinner Kit',
    description: 'Four tools that make cooking faster, easier, and less annoying.',
    includedProductIds: ['vegetable-chopper', 'oil-sprayer', 'chicken-shredder', 'cheese-grater'],
    price: 49.99,
    compareAtPrice: 74.96,
    savingsText: 'Save 33%',
    bullets: [
      'Chop vegetables faster',
      'Shred chicken in seconds',
      'Use less oil while cooking',
      'Make pasta night feel restaurant-quality',
    ],
  },
];

export function getBundleById(id) {
  return BUNDLES.find(b => b.id === id) || null;
}
