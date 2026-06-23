// Mock product catalog for the Make Me Meals storefront.
// `image` is a placeholder URL — replace each one with a real product photo
// URL when you have it (see PRODUCT_IMAGE_GUIDE.md / chat for the full list).
export const PRODUCTS = [
  {
    id: 'vegetable-chopper',
    name: 'Vegetable Chopper',
    shortDescription: 'Dice onions, peppers, and veggies without dragging out a cutting board.',
    benefit: 'Chop vegetables faster',
    price: 19.99,
    compareAtPrice: 24.99,
    rating: 4.8,
    image: 'https://placehold.co/600x450/FCE3D2/B5502A?text=Vegetable+Chopper',
    category: 'prep',
    tags: ['chopping', 'prep', 'vegetables'],
  },
  {
    id: 'oil-sprayer',
    name: 'Olive Oil Mister',
    shortDescription: 'Use less oil and get crispier sheet-pan dinners.',
    benefit: 'Use less oil while cooking',
    price: 14.99,
    compareAtPrice: 18.99,
    rating: 4.7,
    image: 'https://placehold.co/600x450/FCE3D2/B5502A?text=Olive+Oil+Mister',
    category: 'cooking',
    tags: ['oil', 'sheet-pan', 'healthy'],
  },
  {
    id: 'chicken-shredder',
    name: 'Chicken Shredder',
    shortDescription: 'Shred chicken in seconds without burning your hands.',
    benefit: 'Shred chicken in seconds',
    price: 17.99,
    compareAtPrice: 21.99,
    rating: 4.9,
    image: 'https://placehold.co/600x450/FCE3D2/B5502A?text=Chicken+Shredder',
    category: 'protein',
    tags: ['chicken', 'protein', 'shredding'],
  },
  {
    id: 'cheese-grater',
    name: 'Rotary Cheese Grater',
    shortDescription: 'Fresh-grated cheese for pasta, tacos, and salads.',
    benefit: 'Make pasta night feel restaurant-quality',
    price: 24.99,
    compareAtPrice: 29.99,
    rating: 4.8,
    image: 'https://placehold.co/600x450/FCE3D2/B5502A?text=Rotary+Cheese+Grater',
    category: 'pasta',
    tags: ['cheese', 'pasta', 'grating'],
  },
];

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}
