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
      'Chop onions, peppers, and veggies in seconds',
      'Shred chicken for tacos, bowls, wraps, and pasta',
      'Use less oil without losing crispiness',
      'Upgrade pasta night with fresh grated cheese',
    ],
  },
];

export function getBundleById(id) {
  return BUNDLES.find(b => b.id === id) || null;
}
