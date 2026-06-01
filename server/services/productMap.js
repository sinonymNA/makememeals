// Maps ingredient names → real store products with brand names, package units, and shelf prices.
// prices: per-package shelf price per store (used instead of prorated ingredient prices)
// perPackage/cookingUnit: how many cooking-unit servings fit in one package for quantity math

const PRODUCTS = [
  // ── MEAT & SEAFOOD ──────────────────────────────────────────────────────
  {
    keywords: ['boneless skinless chicken breast', 'chicken breast'],
    name: 'Boneless Skinless Chicken Breasts', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
    prices:  { any: 4.99, walmart: 3.98, kroger: 4.49, aldi: 2.89, target: 4.49, "trader joe's": 4.49, "whole foods": 5.99 },
  },
  {
    keywords: ['boneless skinless chicken thigh', 'chicken thigh'],
    name: 'Boneless Skinless Chicken Thighs', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
    prices:  { any: 3.99, walmart: 3.28, kroger: 3.99, aldi: 2.49, target: 3.99, "trader joe's": 3.99, "whole foods": 5.49 },
  },
  {
    keywords: ['ground beef'],
    name: 'Ground Beef (80/20)', category: 'Meat & Seafood',
    unit: 'lb', size: null, perPackage: 1, cookingUnit: 'lb',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Never Any!', target: 'Good & Gather', "trader joe's": '', "whole foods": '365' },
    prices:  { any: 5.49, walmart: 4.98, kroger: 5.29, aldi: 3.99, target: 5.29, "trader joe's": 5.49, "whole foods": 6.99 },
  },
  {
    keywords: ['bacon cooked and crumbled', 'bacon'],
    name: 'Bacon', category: 'Meat & Seafood',
    unit: 'pack', size: '12 oz', perPackage: 12, cookingUnit: 'slice',
    brands:  { any: 'Oscar Mayer', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Appleton Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 5.99, walmart: 4.98, kroger: 5.49, aldi: 3.99, target: 5.29, "trader joe's": 5.99, "whole foods": 6.99 },
  },
  {
    keywords: ['salmon fillet', 'salmon'],
    name: 'Salmon Fillets', category: 'Meat & Seafood',
    unit: 'pack', size: '~24 oz (4 fillets)', perPackage: 4, cookingUnit: 'each',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 12.99, walmart: 10.98, kroger: 11.99, aldi: 8.99, target: 11.99, "trader joe's": 10.99, "whole foods": 14.99 },
  },
  {
    keywords: ['cooked chicken shredded', 'rotisserie chicken', 'shredded chicken'],
    name: 'Rotisserie Chicken', category: 'Meat & Seafood',
    unit: 'each', size: '~2 lb', perPackage: 4, cookingUnit: 'cup',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 7.99, walmart: 4.98, kroger: 6.99, aldi: 5.99, target: 6.99, "trader joe's": 7.99, "whole foods": 9.99 },
  },

  // ── DAIRY ────────────────────────────────────────────────────────────────
  {
    keywords: ['shredded mozzarella cheese', 'mozzarella cheese'],
    name: 'Shredded Mozzarella Cheese', category: 'Dairy',
    unit: 'bag', size: '8 oz', perPackage: 2, cookingUnit: 'cup',
    brands:  { any: 'Sargento', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.99, walmart: 2.28, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['shredded cheddar cheese', 'cheddar cheese'],
    name: 'Shredded Cheddar Cheese', category: 'Dairy',
    unit: 'bag', size: '8 oz', perPackage: 2, cookingUnit: 'cup',
    brands:  { any: 'Sargento', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.99, walmart: 2.28, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['grated parmesan', 'parmesan cheese'],
    name: 'Grated Parmesan Cheese', category: 'Dairy',
    unit: 'container', size: '5 oz', perPackage: 1.5, cookingUnit: 'cup',
    brands:  { any: 'Kraft', walmart: 'Kraft', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Kraft', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 3.49, walmart: 2.98, kroger: 3.29, aldi: 2.79, target: 3.29, "trader joe's": 3.49, "whole foods": 3.99 },
  },
  {
    keywords: ['heavy cream', 'heavy whipping cream'],
    name: 'Heavy Whipping Cream', category: 'Dairy',
    unit: 'carton', size: '1 pint', perPackage: 2, cookingUnit: 'cup',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.99, walmart: 2.28, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['whole milk', 'milk'],
    name: 'Whole Milk', category: 'Dairy',
    unit: 'jug', size: '½ gallon', perPackage: 8, cookingUnit: 'cup',
    brands:  { any: '', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.49, walmart: 1.98, kroger: 2.29, aldi: 1.59, target: 2.29, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['unsalted butter', 'butter'],
    name: 'Unsalted Butter', category: 'Dairy',
    unit: 'box', size: '1 lb (4 sticks)', perPackage: 32, cookingUnit: 'tbsp',
    brands:  { any: 'Land O Lakes', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Countryside Creamery', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 4.99, walmart: 3.98, kroger: 4.49, aldi: 3.49, target: 4.49, "trader joe's": 4.99, "whole foods": 5.99 },
  },
  {
    keywords: ['sour cream for topping', 'sour cream'],
    name: 'Sour Cream', category: 'Dairy',
    unit: 'container', size: '16 oz', perPackage: 2, cookingUnit: 'cup',
    brands:  { any: 'Daisy', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Friendly Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.48, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.49 },
  },
  {
    keywords: ['provolone cheese slices optional', 'provolone cheese'],
    name: 'Provolone Cheese Slices', category: 'Dairy',
    unit: 'pack', size: '8 slices', perPackage: 8, cookingUnit: 'slice',
    brands:  { any: 'Sargento', walmart: 'Sargento', kroger: 'Kroger', aldi: 'Happy Farms', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 3.29, walmart: 2.98, kroger: 3.19, aldi: 2.49, target: 3.09, "trader joe's": 3.29, "whole foods": 3.99 },
  },

  // ── PRODUCE ──────────────────────────────────────────────────────────────
  {
    keywords: ['garlic cloves minced', 'garlic cloves', 'garlic'],
    name: 'Garlic', category: 'Produce',
    unit: 'head', size: null, perPackage: 10, cookingUnit: 'clove',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.79, walmart: 0.59, kroger: 0.69, aldi: 0.49, target: 0.69, "trader joe's": 0.79, "whole foods": 0.99 },
  },
  {
    keywords: ['cherry tomatoes halved', 'cherry tomatoes'],
    name: 'Cherry Tomatoes', category: 'Produce',
    unit: 'pint', size: '10 oz', perPackage: 1.5, cookingUnit: 'cup',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 2.99, walmart: 2.48, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['baby red potatoes halved', 'baby red potatoes'],
    name: 'Baby Red Potatoes', category: 'Produce',
    unit: 'bag', size: '1.5 lb', perPackage: 1.5, cookingUnit: 'lb',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 2.99, walmart: 2.48, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['russet potatoes peeled and diced', 'russet potatoes', 'potatoes'],
    name: 'Russet Potatoes', category: 'Produce',
    unit: 'bag', size: '5 lb', perPackage: 5, cookingUnit: 'lb',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 3.99, walmart: 2.98, kroger: 3.49, aldi: 2.49, target: 3.49, "trader joe's": 3.99, "whole foods": 4.99 },
  },
  {
    keywords: ['broccoli florets', 'broccoli'],
    name: 'Broccoli Florets', category: 'Produce',
    unit: 'bag', size: '12 oz', perPackage: 3, cookingUnit: 'cup',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 2.49, walmart: 1.98, kroger: 2.29, aldi: 1.69, target: 2.29, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['red bell pepper sliced', 'red bell pepper'],
    name: 'Red Bell Pepper', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 1.29, walmart: 0.98, kroger: 1.19, aldi: 0.89, target: 1.19, "trader joe's": 1.29, "whole foods": 1.49 },
  },
  {
    keywords: ['red onion diced', 'red onion sliced', 'red onion thinly sliced', 'red onion'],
    name: 'Red Onion', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.99, walmart: 0.79, kroger: 0.89, aldi: 0.69, target: 0.89, "trader joe's": 0.99, "whole foods": 1.19 },
  },
  {
    keywords: ['small onion diced', 'small onion', 'yellow onion', 'onion'],
    name: 'Yellow Onion', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.89, walmart: 0.69, kroger: 0.79, aldi: 0.59, target: 0.79, "trader joe's": 0.89, "whole foods": 0.99 },
  },
  {
    keywords: ['avocado diced', 'avocado'],
    name: 'Avocado', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 1.29, walmart: 0.98, kroger: 1.19, aldi: 0.89, target: 1.19, "trader joe's": 0.99, "whole foods": 1.49 },
  },
  {
    keywords: ['fresh cilantro chopped optional', 'fresh cilantro chopped', 'fresh cilantro', 'cilantro'],
    name: 'Fresh Cilantro', category: 'Produce',
    unit: 'bunch', size: null, perPackage: 0.75, cookingUnit: 'cup',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.79, walmart: 0.59, kroger: 0.69, aldi: 0.49, target: 0.69, "trader joe's": 0.79, "whole foods": 0.99 },
  },
  {
    keywords: ['green onions for garnish', 'green onions sliced', 'green onions', 'green onion'],
    name: 'Green Onions', category: 'Produce',
    unit: 'bunch', size: null, perPackage: 6, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.99, walmart: 0.79, kroger: 0.89, aldi: 0.69, target: 0.89, "trader joe's": 0.99, "whole foods": 1.19 },
  },
  {
    keywords: ['lime'],
    name: 'Limes', category: 'Produce',
    unit: 'bag', size: '1 lb', perPackage: 8, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 1.99, walmart: 1.48, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },
  {
    keywords: ['lemon juice', 'lemon'],
    name: 'Lemon', category: 'Produce',
    unit: 'each', size: null, perPackage: 1, cookingUnit: 'each',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 0.69, walmart: 0.49, kroger: 0.59, aldi: 0.39, target: 0.59, "trader joe's": 0.69, "whole foods": 0.79 },
  },
  {
    keywords: ['fresh ginger grated', 'fresh ginger', 'ginger'],
    name: 'Fresh Ginger Root', category: 'Produce',
    unit: 'piece', size: '~4 oz', perPackage: 8, cookingUnit: 'tsp',
    brands:  { any: '', walmart: '', kroger: '', aldi: '', target: '', "trader joe's": '', "whole foods": '' },
    prices:  { any: 1.29, walmart: 0.98, kroger: 1.19, aldi: 0.99, target: 1.19, "trader joe's": 1.29, "whole foods": 1.49 },
  },

  // ── PANTRY ────────────────────────────────────────────────────────────────
  {
    keywords: ['olive oil'],
    name: 'Olive Oil', category: 'Pantry',
    unit: 'bottle', size: '16.9 oz', perPackage: 33, cookingUnit: 'tbsp',
    brands:  { any: 'Bertolli', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Carlini', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 5.99, walmart: 4.98, kroger: 5.49, aldi: 3.99, target: 5.29, "trader joe's": 5.99, "whole foods": 6.99 },
  },
  {
    keywords: ['long grain white rice cooked', 'long grain white rice', 'white rice', 'rice'],
    name: 'Long Grain White Rice', category: 'Pantry',
    unit: 'bag', size: '2 lb', perPackage: 5, cookingUnit: 'cup',
    brands:  { any: 'Mahatma', walmart: 'Great Value', kroger: 'Kroger', aldi: "Chef's Cupboard", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.49, walmart: 1.98, kroger: 2.29, aldi: 1.49, target: 2.29, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['penne pasta', 'pasta'],
    name: 'Penne Pasta', category: 'Pantry',
    unit: 'box', size: '1 lb', perPackage: 16, cookingUnit: 'oz',
    brands:  { any: 'Barilla', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.49, walmart: 0.98, kroger: 1.29, aldi: 0.99, target: 1.29, "trader joe's": 1.49, "whole foods": 1.99 },
  },
  {
    keywords: ['marinara sauce'],
    name: 'Marinara Sauce', category: 'Pantry',
    unit: 'jar', size: '24 oz', perPackage: 24, cookingUnit: 'oz',
    brands:  { any: "Rao's", walmart: 'Prego', kroger: 'Kroger', aldi: 'Specially Selected', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": "Rao's" },
    prices:  { any: 4.99, walmart: 2.98, kroger: 2.79, aldi: 2.49, target: 2.79, "trader joe's": 3.49, "whole foods": 7.99 },
  },
  {
    keywords: ['chicken broth'],
    name: 'Chicken Broth', category: 'Pantry',
    unit: 'carton', size: '32 oz', perPackage: 4, cookingUnit: 'cup',
    brands:  { any: 'Swanson', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fit & Active', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.49, walmart: 1.78, kroger: 2.19, aldi: 1.49, target: 2.19, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['beef broth'],
    name: 'Beef Broth', category: 'Pantry',
    unit: 'carton', size: '32 oz', perPackage: 4, cookingUnit: 'cup',
    brands:  { any: 'Swanson', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fit & Active', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.49, walmart: 1.78, kroger: 2.19, aldi: 1.49, target: 2.19, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['low-sodium soy sauce', 'soy sauce'],
    name: 'Soy Sauce', category: 'Pantry',
    unit: 'bottle', size: '10 oz', perPackage: 20, cookingUnit: 'tbsp',
    brands:  { any: 'Kikkoman', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Fusia', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Kikkoman' },
    prices:  { any: 2.49, walmart: 1.78, kroger: 2.29, aldi: 1.49, target: 2.29, "trader joe's": 2.49, "whole foods": 2.99 },
  },
  {
    keywords: ['honey'],
    name: 'Honey', category: 'Pantry',
    unit: 'bottle', size: '12 oz', perPackage: 24, cookingUnit: 'tbsp',
    brands:  { any: 'Sue Bee', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Simply Nature', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 3.99, walmart: 2.98, kroger: 3.49, aldi: 2.79, target: 3.49, "trader joe's": 3.99, "whole foods": 4.99 },
  },
  {
    keywords: ['sesame oil'],
    name: 'Sesame Oil', category: 'Pantry',
    unit: 'bottle', size: '8 oz', perPackage: 16, cookingUnit: 'tbsp',
    brands:  { any: 'Kadoya', walmart: 'Ottogi', kroger: 'Kroger', aldi: 'Fusia', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 3.49, walmart: 2.98, kroger: 3.29, aldi: 2.49, target: 3.29, "trader joe's": 3.49, "whole foods": 3.99 },
  },
  {
    keywords: ['ketchup'],
    name: 'Ketchup', category: 'Pantry',
    unit: 'bottle', size: '20 oz', perPackage: 40, cookingUnit: 'tbsp',
    brands:  { any: 'Heinz', walmart: 'Great Value', kroger: 'Kroger', aldi: "Burman's", target: 'Market Pantry', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.99, walmart: 1.98, kroger: 2.49, aldi: 1.49, target: 2.49, "trader joe's": 2.99, "whole foods": 3.29 },
  },
  {
    keywords: ['worcestershire sauce'],
    name: 'Worcestershire Sauce', category: 'Pantry',
    unit: 'bottle', size: '10 oz', perPackage: 20, cookingUnit: 'tbsp',
    brands:  { any: 'Lea & Perrins', walmart: 'Lea & Perrins', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": '', "whole foods": 'Lea & Perrins' },
    prices:  { any: 2.99, walmart: 2.48, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.29 },
  },
  {
    keywords: ['ranch seasoning mix', 'ranch seasoning'],
    name: 'Ranch Seasoning Mix', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands:  { any: 'Hidden Valley', walmart: 'Hidden Valley', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Hidden Valley' },
    prices:  { any: 0.99, walmart: 0.79, kroger: 0.89, aldi: 0.79, target: 0.89, "trader joe's": 0.99, "whole foods": 1.19 },
  },
  {
    keywords: ['taco seasoning'],
    name: 'Taco Seasoning', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands:  { any: 'Old El Paso', walmart: 'Great Value', kroger: 'Kroger', aldi: "Burman's", target: 'Market Pantry', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 0.99, walmart: 0.69, kroger: 0.89, aldi: 0.69, target: 0.89, "trader joe's": 0.99, "whole foods": 1.19 },
  },
  {
    keywords: ['au jus gravy mix', 'au jus'],
    name: 'Au Jus Gravy Mix', category: 'Pantry',
    unit: 'packet', size: '1 oz', perPackage: 1, cookingUnit: 'packet',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: '', target: 'Market Pantry', "trader joe's": '', "whole foods": 'McCormick' },
    prices:  { any: 1.29, walmart: 0.89, kroger: 1.19, aldi: 0.99, target: 1.19, "trader joe's": 1.29, "whole foods": 1.49 },
  },
  {
    keywords: ['bbq sauce'],
    name: 'BBQ Sauce', category: 'Pantry',
    unit: 'bottle', size: '18 oz', perPackage: 36, cookingUnit: 'tbsp',
    brands:  { any: "Sweet Baby Ray's", walmart: "Sweet Baby Ray's", kroger: 'Kroger', aldi: "Burman's", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": "Sweet Baby Ray's" },
    prices:  { any: 2.99, walmart: 2.48, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.49 },
  },
  {
    keywords: ['cornstarch'],
    name: 'Cornstarch', category: 'Pantry',
    unit: 'box', size: '1 lb', perPackage: 48, cookingUnit: 'tbsp',
    brands:  { any: 'Argo', walmart: 'Argo', kroger: 'Kroger', aldi: '', target: 'Market Pantry', "trader joe's": '', "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.48, kroger: 1.79, aldi: 1.19, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },
  {
    keywords: ['all-purpose flour', 'flour'],
    name: 'All-Purpose Flour', category: 'Pantry',
    unit: 'bag', size: '5 lb', perPackage: 80, cookingUnit: 'tbsp',
    brands:  { any: 'Gold Medal', walmart: 'Great Value', kroger: 'Kroger', aldi: "Baker's Corner", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 3.99, walmart: 2.98, kroger: 3.49, aldi: 2.49, target: 3.49, "trader joe's": 3.99, "whole foods": 4.99 },
  },
  {
    keywords: ['italian seasoning'],
    name: 'Italian Seasoning', category: 'Pantry',
    unit: 'jar', size: '0.75 oz', perPackage: 20, cookingUnit: 'tsp',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.49, walmart: 0.98, kroger: 1.29, aldi: 0.99, target: 1.29, "trader joe's": 1.49, "whole foods": 1.79 },
  },
  {
    keywords: ['garlic powder'],
    name: 'Garlic Powder', category: 'Pantry',
    unit: 'jar', size: '3 oz', perPackage: 30, cookingUnit: 'tsp',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.28, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },
  {
    keywords: ['onion powder'],
    name: 'Onion Powder', category: 'Pantry',
    unit: 'jar', size: '2.5 oz', perPackage: 25, cookingUnit: 'tsp',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.28, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },
  {
    keywords: ['smoked paprika', 'paprika'],
    name: 'Smoked Paprika', category: 'Pantry',
    unit: 'jar', size: '2 oz', perPackage: 20, cookingUnit: 'tsp',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.28, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },
  {
    keywords: ['black beans rinsed and drained', 'canned black beans', 'black beans'],
    name: 'Black Beans', category: 'Pantry',
    unit: 'can', size: '15 oz', perPackage: 1, cookingUnit: 'can',
    brands:  { any: "Bush's", walmart: 'Great Value', kroger: 'Kroger', aldi: "Dakota's Pride", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.29, walmart: 0.88, kroger: 1.09, aldi: 0.79, target: 1.09, "trader joe's": 1.29, "whole foods": 1.49 },
  },
  {
    keywords: ['diced pickles', 'pickles'],
    name: 'Dill Pickles', category: 'Pantry',
    unit: 'jar', size: '24 oz', perPackage: 3, cookingUnit: 'cup',
    brands:  { any: 'Vlasic', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Savoritz', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.99, walmart: 2.28, kroger: 2.79, aldi: 1.99, target: 2.79, "trader joe's": 2.99, "whole foods": 3.29 },
  },
  {
    keywords: ['pepperoncini peppers', 'pepperoncini'],
    name: 'Pepperoncini Peppers', category: 'Pantry',
    unit: 'jar', size: '12 oz', perPackage: 15, cookingUnit: 'each',
    brands:  { any: 'Mezzetta', walmart: 'Mezzetta', kroger: 'Kroger', aldi: '', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Mezzetta' },
    prices:  { any: 3.49, walmart: 2.98, kroger: 3.19, aldi: 2.49, target: 3.19, "trader joe's": 3.49, "whole foods": 3.99 },
  },
  {
    keywords: ['sesame seeds for garnish', 'sesame seeds optional', 'sesame seeds'],
    name: 'Sesame Seeds', category: 'Pantry',
    unit: 'jar', size: '2 oz', perPackage: 12, cookingUnit: 'tbsp',
    brands:  { any: 'McCormick', walmart: 'Great Value', kroger: 'Kroger', aldi: 'Stonemill', target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.99, walmart: 1.48, kroger: 1.79, aldi: 1.29, target: 1.79, "trader joe's": 1.99, "whole foods": 2.29 },
  },

  // ── BAKERY ────────────────────────────────────────────────────────────────
  {
    keywords: ['flatbread store-bought', 'flatbread'],
    name: 'Flatbread', category: 'Bakery',
    unit: 'pack', size: '2-count', perPackage: 2, cookingUnit: 'each',
    brands:  { any: 'Stonefire', walmart: 'Stonefire', kroger: 'Stonefire', aldi: "L'oven Fresh", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": 'Stonefire' },
    prices:  { any: 3.49, walmart: 2.98, kroger: 3.29, aldi: 2.49, target: 3.29, "trader joe's": 3.49, "whole foods": 3.99 },
  },
  {
    keywords: ['sandwich buns'],
    name: 'Sandwich Buns', category: 'Bakery',
    unit: 'pack', size: '8-count', perPackage: 8, cookingUnit: 'each',
    brands:  { any: "Nature's Own", walmart: 'Great Value', kroger: 'Kroger', aldi: "L'oven Fresh", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 2.49, walmart: 1.78, kroger: 2.19, aldi: 1.79, target: 2.19, "trader joe's": 2.49, "whole foods": 2.99 },
  },

  // ── FROZEN ────────────────────────────────────────────────────────────────
  {
    keywords: ['frozen corn thawed', 'frozen corn', 'corn'],
    name: 'Frozen Corn', category: 'Frozen',
    unit: 'bag', size: '12 oz', perPackage: 2.25, cookingUnit: 'cup',
    brands:  { any: 'Birds Eye', walmart: 'Great Value', kroger: 'Kroger', aldi: "Season's Choice", target: 'Good & Gather', "trader joe's": "Trader Joe's", "whole foods": '365' },
    prices:  { any: 1.79, walmart: 1.18, kroger: 1.59, aldi: 1.19, target: 1.59, "trader joe's": 1.79, "whole foods": 1.99 },
  },
];

const TO_TBSP = { tbsp: 1, tsp: 1 / 3, cup: 16, oz: 2 };

const IRREGULAR_PLURALS = { box: 'boxes', bunch: 'bunches', loaf: 'loaves', leaf: 'leaves', half: 'halves' };
function pluralizeUnit(unit, n) {
  if (n === 1) return unit;
  return IRREGULAR_PLURALS[unit] || `${unit}s`;
}

function toTbsp(qty, unit) {
  const factor = TO_TBSP[unit];
  return factor ? qty * factor : null;
}

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

export function getStorePrice(product, store) {
  if (!product.prices) return null;
  const key = (store || 'any').toLowerCase();
  return product.prices[key] ?? product.prices.any ?? null;
}

export function toShoppingLabel(qty, unit, product, store) {
  const normUnit = (unit || '').toLowerCase().trim().replace(/s$/, '');
  const cookingUnit = product.cookingUnit.replace(/s$/, '');

  let packages = 1;
  if (!isNaN(qty)) {
    if (normUnit === cookingUnit) {
      packages = Math.ceil(qty / product.perPackage);
    } else {
      const qtyTbsp = toTbsp(qty, normUnit);
      const pkgTbsp = toTbsp(product.perPackage, cookingUnit);
      if (qtyTbsp && pkgTbsp) {
        packages = Math.ceil(qtyTbsp / pkgTbsp);
      }
    }
  }
  packages = Math.max(1, packages);

  const storeKey = (store || 'any').toLowerCase();
  const brand = product.brands[storeKey] || product.brands.any || '';
  const name = [brand, product.name].filter(Boolean).join(' ');
  const sizeStr = product.size ? ` (${product.size})` : '';
  const unitLabel = pluralizeUnit(product.unit, packages);
  const label = `${packages} ${unitLabel} ${name}${sizeStr}`;

  return { label, packages };
}
