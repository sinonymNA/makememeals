// Maps ingredient names to real store products with brand names and package units.
// Each entry defines how a cooking ingredient translates to something you actually buy.
//
// perPackage / cookingUnit: how many of the cooking unit fits in one package
//   e.g. shredded cheese: 1 bag (8oz) = 2 cups → perPackage: 2, cookingUnit: 'cup'
// brands: store key → brand name (use 'any' as fallback)

const PRODUCTS = [
  // ── MEAT & SEAFOOD ────────────────────────────────────────────────────────
  {
    keywords: ['boneless skinless chicken breast', 'chicken breast'],
    name: 'Boneless Skinless Chicken Breasts', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
  },
  {
    keywords: ['boneless skinless chicken thigh', 'chicken thigh'],
    name: 'Boneless Skinless Chicken Thighs', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
  },
  {
    keywords: ['ground beef'],
    name: 'Ground Beef (80/20)', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
  },
  {
    keywords: ['bacon'],
    name: 'Bacon', category: 'Meat & Seafood',
    unit: 'pack', size: '12 oz', perPackage: 12, cookingUnit: 'slice',
    brands: { any: 'Oscar Mayer', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Appleton Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['salmon fillet', 'salmon'],
    name: 'Salmon Fillets', category: 'Meat & Seafood',
    unit: 'pack', size: '~24 oz', perPackage: 4, cookingUnit: 'each',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['cooked chicken shredded', 'rotisserie chicken', 'shredded chicken'],
    name: 'Rotisserie Chicken (shredded)', category: 'Meat & Seafood',
    unit: 'each', size: '2 lb', perPackage: 4, cookingUnit: 'cup',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },

  // ── DAIRY ─────────────────────────────────────────────────────────────────
  {
    keywords: ['shredded mozzarella', 'mozzarella cheese'],
    name: 'Shredded Mozzarella Cheese', category: 'Dairy',
    unit: 'bag', size: '8 oz', perPackage: 2, cookingUnit: 'cup',
    brands: { any: 'Sargento', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['shredded cheddar cheese', 'cheddar cheese'],
    name: 'Shredded Cheddar Cheese', category: 'Dairy',
    unit: 'bag', size: '8 oz', perPackage: 2, cookingUnit: 'cup',
    brands: { any: 'Sargento', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['grated parmesan', 'parmesan cheese'],
    name: 'Grated Parmesan Cheese', category: 'Dairy',
    unit: 'container', size: '5 oz', perPackage: 1.5, cookingUnit: 'cup',
    brands: { any: 'Kraft', walmart: 'Kraft', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Kraft', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['heavy cream', 'heavy whipping cream'],
    name: 'Heavy Whipping Cream', category: 'Dairy',
    unit: 'carton', size: '1 pint', perPackage: 2, cookingUnit: 'cup',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['whole milk', 'milk'],
    name: 'Whole Milk', category: 'Dairy',
    unit: 'jug', size: '½ gallon', perPackage: 8, cookingUnit: 'cup',
    brands: { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['unsalted butter', 'butter'],
    name: 'Unsalted Butter', category: 'Dairy',
    unit: 'box', size: '1 lb (4 sticks)', perPackage: 8, cookingUnit: 'tbsp',
    brands: { any: 'Land O Lakes', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Countryside Creamery', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['sour cream'],
    name: 'Sour Cream', category: 'Dairy',
    unit: 'container', size: '16 oz', perPackage: 2, cookingUnit: 'cup',
    brands: { any: 'Daisy', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['provolone cheese'],
    name: 'Provolone Cheese Slices', category: 'Dairy',
    unit: 'pack', size: '8 slices', perPackage: 8, cookingUnit: 'slice',
    brands: { any: 'Sargento', walmart: 'Sargento', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },

  // ── PRODUCE ───────────────────────────────────────────────────────────────
  {
    keywords: ['garlic cloves minced', 'garlic cloves', 'garlic'],
    name: 'Garlic', category: 'Produce',
    unit: 'head', size: null, perPackage: 10, cookingUnit: 'clove',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['cherry tomatoes'],
    name: 'Cherry Tomatoes', category: 'Produce',
    unit: 'pint', size: '10 oz', perPackage: 1.5, cookingUnit: 'cup',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['baby red potatoes'],
    name: 'Baby Red Potatoes', category: 'Produce',
    unit: 'bag', size: '1.5 lb', perPackage: 1.5, cookingUnit: 'lb',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['russet potatoes peeled', 'russet potatoes', 'potatoes'],
    name: 'Russet Potatoes', category: 'Produce',
    unit: 'bag', size: '5 lb', perPackage: 5, cookingUnit: 'lb',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['broccoli florets', 'broccoli'],
    name: 'Broccoli Florets', category: 'Produce',
    unit: 'bag', size: '12 oz', perPackage: 3, cookingUnit: 'cup',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['red bell pepper'],
    name: 'Red Bell Pepper', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['red onion'],
    name: 'Red Onion', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['small onion', 'yellow onion', 'onion'],
    name: 'Yellow Onion', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['avocado'],
    name: 'Avocado', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['fresh cilantro chopped optional', 'fresh cilantro chopped', 'fresh cilantro', 'cilantro'],
    name: 'Fresh Cilantro', category: 'Produce',
    unit: 'bunch', size: null, perPackage: 0.75, cookingUnit: 'cup',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['green onions for garnish', 'green onions sliced', 'green onions', 'green onion'],
    name: 'Green Onions', category: 'Produce',
    unit: 'bunch', size: null, perPackage: 6, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['lime'],
    name: 'Limes', category: 'Produce',
    unit: 'bag', size: '1 lb', perPackage: 8, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['lemon juice', 'lemon'],
    name: 'Lemon', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },
  {
    keywords: ['fresh ginger grated', 'fresh ginger', 'ginger'],
    name: 'Fresh Ginger Root', category: 'Produce',
    unit: 'piece', size: '~4 oz', perPackage: 8, cookingUnit: 'tsp',
    brands: { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
  },

  // ── PANTRY ────────────────────────────────────────────────────────────────
  {
    keywords: ['olive oil'],
    name: 'Olive Oil', category: 'Pantry',
    unit: 'bottle', size: '16.9 oz', perPackage: 33, cookingUnit: 'tbsp',
    brands: { any: 'Bertolli', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Carlini', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['long grain white rice cooked', 'long grain white rice', 'white rice', 'rice'],
    name: 'Long Grain White Rice', category: 'Pantry',
    unit: 'bag', size: '2 lb', perPackage: 5, cookingUnit: 'cup',
    brands: { any: 'Mahatma', walmart: 'Great Value', kroger: 'Kroger', aldi: "Chef's Cupboard", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['penne pasta', 'pasta'],
    name: 'Penne Pasta', category: 'Pantry',
    unit: 'box', size: '1 lb', perPackage: 16, cookingUnit: 'oz',
    brands: { any: 'Barilla', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['marinara sauce'],
    name: 'Marinara Sauce', category: 'Pantry',
    unit: 'jar', size: '24 oz', perPackage: 24, cookingUnit: 'oz',
    brands: { any: "Rao's", walmart: 'Prego', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": "Rao's" },
  },
  {
    keywords: ['chicken broth'],
    name: 'Chicken Broth', category: 'Pantry',
    unit: 'carton', size: '32 oz', perPackage: 4, cookingUnit: 'cup',
    brands: { any: 'Swanson', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fit & Active', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['beef broth'],
    name: 'Beef Broth', category: 'Pantry',
    unit: 'carton', size: '32 oz', perPackage: 4, cookingUnit: 'cup',
    brands: { any: 'Swanson', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fit & Active', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['low-sodium soy sauce', 'soy sauce'],
    name: 'Soy Sauce', category: 'Pantry',
    unit: 'bottle', size: '10 oz', perPackage: 20, cookingUnit: 'tbsp',
    brands: { any: 'Kikkoman', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fusia', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Kikkoman' },
  },
  {
    keywords: ['honey'],
    name: 'Honey', category: 'Pantry',
    unit: 'bottle', size: '12 oz', perPackage: 24, cookingUnit: 'tbsp',
    brands: { any: 'Sue Bee', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Simply Nature', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['sesame oil'],
    name: 'Sesame Oil', category: 'Pantry',
    unit: 'bottle', size: '8 oz', perPackage: 16, cookingUnit: 'tbsp',
    brands: { any: 'Kadoya', walmart: 'Ottogi', kroger: 'Kroger', aldi: 'Fusia', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['ketchup'],
    name: 'Ketchup', category: 'Pantry',
    unit: 'bottle', size: '20 oz', perPackage: 40, cookingUnit: 'tbsp',
    brands: { any: 'Heinz', walmart: 'Great Value', kroger: 'Kroger', aldi: "Burman's", target: 'Market Pantry', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['worcestershire sauce'],
    name: 'Worcestershire Sauce', category: 'Pantry',
    unit: 'bottle', size: '10 oz', perPackage: 20, cookingUnit: 'tbsp',
    brands: { any: 'Lea & Perrins', walmart: 'Lea & Perrins', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": '', "whole foods": 'Lea & Perrins' },
  },
  {
    keywords: ['ranch seasoning mix', 'ranch seasoning'],
    name: 'Ranch Seasoning Mix', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands: { any: 'Hidden Valley', walmart: 'Hidden Valley', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Hidden Valley' },
  },
  {
    keywords: ['taco seasoning'],
    name: 'Taco Seasoning', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands: { any: 'Old El Paso', walmart: 'Great Value', kroger: 'Kroger', aldi: "Burman's", target: 'Market Pantry', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['au jus gravy mix', 'au jus'],
    name: 'Au Jus Gravy Mix', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: '', target: 'Market Pantry', "trader joe's": '', "whole foods": 'McCormick' },
  },
  {
    keywords: ['bbq sauce'],
    name: 'BBQ Sauce', category: 'Pantry',
    unit: 'bottle', size: '18 oz', perPackage: 36, cookingUnit: 'tbsp',
    brands: { any: "Sweet Baby Ray's", walmart: "Sweet Baby Ray's", kroger: 'Kroger', aldi: "Burman's", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": "Sweet Baby Ray's" },
  },
  {
    keywords: ['cornstarch'],
    name: 'Cornstarch', category: 'Pantry',
    unit: 'box', size: '1 lb', perPackage: 48, cookingUnit: 'tbsp',
    brands: { any: 'Argo', walmart: 'Argo', kroger: 'Kroger', aldi: '', target: 'Market Pantry', "trader joe's": '', "whole foods": '365' },
  },
  {
    keywords: ['all-purpose flour', 'flour'],
    name: 'All-Purpose Flour', category: 'Pantry',
    unit: 'bag', size: '5 lb', perPackage: 80, cookingUnit: 'tbsp',
    brands: { any: 'Gold Medal', walmart: 'Great Value', kroger: 'Kroger', aldi: "Baker's Corner", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['italian seasoning'],
    name: 'Italian Seasoning', category: 'Pantry',
    unit: 'jar', size: '0.75 oz', perPackage: 20, cookingUnit: 'tsp',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['garlic powder'],
    name: 'Garlic Powder', category: 'Pantry',
    unit: 'jar', size: '3 oz', perPackage: 30, cookingUnit: 'tsp',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['onion powder'],
    name: 'Onion Powder', category: 'Pantry',
    unit: 'jar', size: '2.5 oz', perPackage: 25, cookingUnit: 'tsp',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['smoked paprika', 'paprika'],
    name: 'Smoked Paprika', category: 'Pantry',
    unit: 'jar', size: '2 oz', perPackage: 20, cookingUnit: 'tsp',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['black beans rinsed and drained', 'canned black beans', 'black beans'],
    name: 'Black Beans', category: 'Pantry',
    unit: 'can', size: '15 oz', perPackage: 1, cookingUnit: 'can',
    brands: { any: "Bush's", walmart: 'Great Value', kroger: 'Kroger', aldi: "Dakota's Pride", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['diced pickles', 'pickles'],
    name: 'Dill Pickles', category: 'Pantry',
    unit: 'jar', size: '24 oz', perPackage: 3, cookingUnit: 'cup',
    brands: { any: 'Vlasic', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Savoritz', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
  {
    keywords: ['pepperoncini peppers', 'pepperoncini'],
    name: 'Pepperoncini Peppers', category: 'Pantry',
    unit: 'jar', size: '12 oz', perPackage: 15, cookingUnit: 'each',
    brands: { any: 'Mezzetta', walmart: 'Mezzetta', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Mezzetta' },
  },
  {
    keywords: ['sesame seeds for garnish', 'sesame seeds optional', 'sesame seeds'],
    name: 'Sesame Seeds', category: 'Pantry',
    unit: 'jar', size: '2 oz', perPackage: 12, cookingUnit: 'tbsp',
    brands: { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },

  // ── BAKERY ────────────────────────────────────────────────────────────────
  {
    keywords: ['flatbread store-bought', 'flatbread'],
    name: 'Flatbread', category: 'Bakery',
    unit: 'pack', size: '2-count', perPackage: 2, cookingUnit: 'each',
    brands: { any: 'Stonefire', walmart: 'Stonefire', kroger: 'Stonefire', aldi: "L'oven Fresh", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Stonefire' },
  },
  {
    keywords: ['sandwich buns'],
    name: 'Sandwich Buns', category: 'Bakery',
    unit: 'pack', size: '8-count', perPackage: 8, cookingUnit: 'each',
    brands: { any: "Nature's Own", walmart: 'Great Value', kroger: 'Kroger', aldi: "L'oven Fresh", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },

  // ── FROZEN ────────────────────────────────────────────────────────────────
  {
    keywords: ['frozen corn thawed', 'frozen corn', 'corn'],
    name: 'Frozen Corn', category: 'Frozen',
    unit: 'bag', size: '12 oz', perPackage: 2.25, cookingUnit: 'cup',
    brands: { any: 'Birds Eye', walmart: 'Great Value', kroger: 'Kroger', aldi: "Season's Choice", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
  },
];

// Unit conversion to tbsp (for normalizing cooking quantities to a common unit)
const TO_TBSP = {
  tbsp: 1, tsp: 1 / 3, cup: 16, oz: 2,
};

function toTbsp(qty, unit) {
  const factor = TO_TBSP[unit];
  return factor ? qty * factor : null;
}

// Look up a product by normalized ingredient name (longest match wins)
export function lookupProduct(ingredientName) {
  const norm = ingredientName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  let best = null;
  let bestLen = 0;
  for (const p of PRODUCTS) {
    for (const kw of p.keywords) {
      if (norm.includes(kw) && kw.length > bestLen) {
        best = p;
        bestLen = kw.length;
      }
    }
  }
  return best;
}

// Convert a cooked quantity + unit into a shopping label
// Returns { shoppingLabel, packagesNeeded } or null if can't convert
export function toShoppingLabel(qty, unit, product, store) {
  const normUnit = unit?.toLowerCase().trim().replace(/s$/, ''); // crude singular
  const cookingUnit = product.cookingUnit.replace(/s$/, '');

  let packages = 1;

  // Try direct conversion
  if (!isNaN(qty) && normUnit === cookingUnit) {
    packages = Math.ceil(qty / product.perPackage);
  } else {
    // Try converting both to tbsp
    const qtyTbsp = toTbsp(qty, normUnit);
    const pkgTbsp = toTbsp(product.perPackage, cookingUnit);
    if (qtyTbsp && pkgTbsp) {
      packages = Math.ceil(qtyTbsp / pkgTbsp);
    }
  }

  packages = Math.max(1, packages);

  const storeKey = (store || 'any').toLowerCase();
  const brand = product.brands[storeKey] || product.brands.any || '';
  const name = [brand, product.name].filter(Boolean).join(' ');
  const sizeStr = product.size ? ` (${product.size})` : '';
  const label = packages === 1
    ? `1 ${product.unit} ${name}${sizeStr}`
    : `${packages} ${product.unit}s ${name}${sizeStr}`;

  return { label, packages };
}
