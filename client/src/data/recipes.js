// Mock recipe data — every recipe links back to the tools that make it easier.
// `image` is a placeholder URL — swap in a real recipe photo when available.
export const RECIPES = [
  {
    id: 'creamy-chicken-pasta',
    title: 'Creamy Chicken Pasta',
    time: '25 min',
    description: 'A weeknight classic with fresh-grated cheese and a light, crispy finish.',
    image: 'https://placehold.co/600x450/F3E7D6/B5502A?text=Creamy+Chicken+Pasta',
    toolsUsed: ['cheese-grater', 'oil-sprayer'],
    cta: 'View Recipe',
  },
  {
    id: 'chicken-taco-bowls',
    title: 'Chicken Taco Bowls',
    time: '20 min',
    description: 'Shredded chicken, fresh veggies, and all your favorite toppings.',
    image: 'https://placehold.co/600x450/F3E7D6/B5502A?text=Chicken+Taco+Bowls',
    toolsUsed: ['chicken-shredder', 'vegetable-chopper'],
    cta: 'View Recipe',
  },
  {
    id: 'sheet-pan-sausage-veggies',
    title: 'Sheet Pan Sausage & Veggies',
    time: '30 min',
    description: 'One pan, minimal cleanup, big flavor — the easiest dinner in the rotation.',
    image: 'https://placehold.co/600x450/F3E7D6/B5502A?text=Sheet+Pan+Sausage',
    toolsUsed: ['vegetable-chopper', 'oil-sprayer'],
    cta: 'View Recipe',
  },
  {
    id: 'crispy-chicken-caesar-wraps',
    title: 'Crispy Chicken Caesar Wraps',
    time: '15 min',
    description: 'Quick, hand-held, and packed with flavor — perfect for busy nights.',
    image: 'https://placehold.co/600x450/F3E7D6/B5502A?text=Caesar+Wraps',
    toolsUsed: ['chicken-shredder', 'cheese-grater'],
    cta: 'View Recipe',
  },
];

export function getRecipeById(id) {
  return RECIPES.find(r => r.id === id) || null;
}
