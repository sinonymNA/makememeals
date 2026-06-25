// Mock recipe data — every recipe links back to the tools that make it easier.
// `image` is a placeholder URL — swap in a real recipe photo when available.
export const RECIPES = [
  {
    id: 'creamy-chicken-pasta',
    title: 'Creamy Chicken Pasta',
    time: '25 min',
    servings: 4,
    difficulty: 'Easy',
    cost: '$12',
    description: 'A weeknight classic with fresh-grated cheese and a light, crispy finish.',
    image: '/images/recipes/creamy-chicken-pasta.png',
    toolsUsed: ['cheese-grater', 'oil-sprayer'],
    cta: 'View Recipe',
    ingredients: [
      '2 boneless chicken breasts, cubed',
      '12 oz pasta',
      '1 cup heavy cream',
      '2 cloves garlic, minced',
      '1 cup parmesan, freshly grated',
      'Olive oil, for searing',
      'Salt and pepper, to taste',
    ],
    instructions: [
      { text: 'Bring a large pot of salted water to a boil and cook pasta until al dente. Drain and set aside.' },
      {
        text: 'Mist a pan lightly with olive oil and sear the chicken cubes until golden and cooked through.',
        callout: { toolId: 'oil-sprayer', text: 'Make this step easier: a fine mist of oil sears the chicken without making the pan greasy.' },
      },
      { text: 'Add garlic to the pan and cook for 30 seconds, then pour in the cream and simmer until slightly thickened.' },
      {
        text: 'Grate the parmesan fresh and stir it into the sauce until melted and smooth.',
        callout: { toolId: 'cheese-grater', text: 'Make this step easier: fresh-grated cheese melts smoother than pre-shredded bags and takes seconds with a rotary grater.' },
      },
      { text: 'Toss the pasta in the sauce, season to taste, and serve hot.' },
    ],
  },
  {
    id: 'chicken-taco-bowls',
    title: 'Chicken Taco Bowls',
    time: '20 min',
    servings: 4,
    difficulty: 'Easy',
    cost: '$14',
    description: 'Shredded chicken, fresh veggies, and all your favorite toppings.',
    image: '/images/recipes/chicken-taco-bowls.png',
    toolsUsed: ['chicken-shredder', 'vegetable-chopper'],
    cta: 'View Recipe',
    ingredients: [
      '1 lb cooked chicken breast or rotisserie chicken',
      '1 bell pepper',
      '1/2 red onion',
      '2 cups cooked rice',
      'Shredded lettuce, salsa, and cheese, for topping',
      'Taco seasoning, to taste',
    ],
    instructions: [
      {
        text: 'Shred the warm chicken into bite-sized pieces and toss with taco seasoning.',
        callout: { toolId: 'chicken-shredder', text: 'Make this step easier: the chicken shredder saves time if you make bowls, wraps, tacos, or pasta often.' },
      },
      {
        text: 'Dice the bell pepper and onion.',
        callout: { toolId: 'vegetable-chopper', text: 'Make this step easier: one pull of the chopper dices a whole pepper without dragging out a cutting board.' },
      },
      { text: 'Divide rice between bowls and top with chicken, chopped veggies, and your favorite toppings.' },
    ],
  },
  {
    id: 'sheet-pan-sausage-veggies',
    title: 'Sheet Pan Sausage & Veggies',
    time: '30 min',
    servings: 4,
    difficulty: 'Easy',
    cost: '$13',
    description: 'One pan, minimal cleanup, big flavor — the easiest dinner in the rotation.',
    image: '/images/recipes/sheet-pan-sausage-veggies.png',
    toolsUsed: ['vegetable-chopper', 'oil-sprayer'],
    cta: 'View Recipe',
    ingredients: [
      '1 lb sausage links, sliced',
      '2 bell peppers',
      '1 zucchini',
      '1 red onion',
      'Olive oil',
      'Italian seasoning, salt, and pepper',
    ],
    instructions: [
      { text: 'Preheat oven to 425°F and line a sheet pan with foil.' },
      {
        text: 'Chop the peppers, zucchini, and onion into even pieces.',
        callout: { toolId: 'vegetable-chopper', text: 'Make this step easier: even-sized pieces cook evenly, and the chopper gets you there in one motion.' },
      },
      {
        text: 'Spread veggies and sausage on the pan and mist lightly with olive oil and seasoning.',
        callout: { toolId: 'oil-sprayer', text: 'Make this step easier: a light mist crisps the veggies instead of steaming them in a pool of oil.' },
      },
      { text: 'Roast for 20–25 minutes, tossing once, until veggies are tender and sausage is browned.' },
    ],
  },
  {
    id: 'crispy-chicken-caesar-wraps',
    title: 'Crispy Chicken Caesar Wraps',
    time: '15 min',
    servings: 2,
    difficulty: 'Easy',
    cost: '$10',
    description: 'Quick, hand-held, and packed with flavor — perfect for busy nights.',
    image: '/images/recipes/crispy-chicken-caesar-wraps.png',
    toolsUsed: ['chicken-shredder', 'cheese-grater'],
    cta: 'View Recipe',
    ingredients: [
      '2 cooked chicken breasts',
      '2 large tortillas',
      'Romaine lettuce, chopped',
      '1/4 cup parmesan, freshly grated',
      'Caesar dressing',
    ],
    instructions: [
      {
        text: 'Shred the chicken into bite-sized strips.',
        callout: { toolId: 'chicken-shredder', text: 'Make this step easier: shredding straight from the cutting board takes seconds and the claws double as serving tongs.' },
      },
      {
        text: 'Grate fresh parmesan over the lettuce.',
        callout: { toolId: 'cheese-grater', text: 'Make this step easier: a quick crank gets you fresh-grated cheese without a bag of pre-shredded going stale in the fridge.' },
      },
      { text: 'Toss chicken, lettuce, parmesan, and dressing together, then wrap tightly in tortillas and slice in half.' },
    ],
  },
];

export function getRecipeById(id) {
  return RECIPES.find(r => r.id === id) || null;
}
