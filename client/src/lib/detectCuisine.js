// Detect cuisine from meal name + ingredient list
// Returns one of: asian | italian | latin | american | mediterranean | indian | steakhouse | healthy

const CUISINE_SIGNALS = {
  asian: {
    words: ['gochujang', 'miso', 'teriyaki', 'bibimbap', 'sushi', 'ramen', 'tonkotsu', 'pad thai', 'pho', 'bulgogi',
      'dumpling', 'gyoza', 'banh mi', 'kimchi', 'tofu', 'tamari', 'edamame', 'nori', 'wakame', 'dashi',
      'mirin', 'sake', 'hoisin', 'oyster sauce', 'fish sauce', 'coconut milk', 'lemongrass', 'galangal',
      'thai basil', 'kaffir lime', 'sichuan', 'szechuan', 'char siu', 'japchae', 'dan dan', 'larb',
      'laos', 'cambodian', 'vietnamese', 'korean', 'japanese', 'chinese', 'thai', 'taiwanese', 'singaporean',
      'malay', 'indonesian', 'curry paste', 'tom kha', 'tom yum', 'wonton', 'spring roll'],
    ingredients: ['soy sauce', 'sesame oil', 'rice vinegar', 'ginger', 'scallion', 'bok choy', 'napa cabbage',
      'shiitake', 'enoki', 'daikon', 'panko', 'rice noodle', 'udon', 'soba'],
  },
  italian: {
    words: ['pasta', 'risotto', 'gnocchi', 'pizza', 'tiramisu', 'pappardelle', 'tagliatelle', 'fettuccine',
      'linguine', 'spaghetti', 'rigatoni', 'penne', 'orecchiette', 'cacio e pepe', 'carbonara', 'amatriciana',
      'bolognese', 'osso buco', 'saltimbocca', 'chicken piccata', 'marsala', 'parmesan', 'pecorino',
      'mozzarella', 'burrata', 'ricotta', 'prosciutto', 'pancetta', 'guanciale', 'porchetta', 'arancini',
      'caprese', 'bruschetta', 'ratatouille', 'ribollita', 'farinata', 'puttanesca', 'aglio e olio',
      'italian', 'sicilian', 'venetian', 'tuscan', 'roman', 'neapolitan', 'milanese', 'sorrentino'],
    ingredients: ['basil', 'oregano', 'san marzano', 'arborio', 'polenta', 'cannellini', 'borlotti'],
  },
  latin: {
    words: ['taco', 'burrito', 'enchilada', 'tamale', 'mole', 'chile', 'chili', 'pozole', 'carnitas', 'ceviche',
      'lomo saltado', 'birria', 'sofrito', 'achiote', 'chimichurri', 'empanada', 'arepa', 'pernil',
      'ropa vieja', 'feijoada', 'bandeja', 'anticucho', 'causa', 'tiradito', 'al pastor', 'cochinita',
      'churrasco', 'picanha', 'cevicherias', 'mexican', 'peruvian', 'cuban', 'colombian', 'argentinian',
      'chilean', 'ecuadorian', 'venezuelan', 'brazilian', 'guatemalan', 'latin', 'latinx'],
    ingredients: ['jalapeño', 'poblano', 'serrano', 'chipotle', 'ancho', 'guajillo', 'epazote', 'corn tortilla',
      'cotija', 'queso', 'salsa verde', 'tomatillo', 'plantain', 'yuca', 'hominy', 'black beans'],
  },
  american: {
    words: ['bbq', 'burger', 'hot dog', 'mac and cheese', 'grilled cheese', 'pot roast', 'pot pie',
      'meatloaf', 'buffalo', 'nashville hot', 'fried chicken', 'chicken and waffles', 'biscuits',
      'gravy', 'clam chowder', 'lobster roll', 'crab cake', 'shrimp and grits', 'reuben', 'philly cheesesteak',
      'sloppy joe', 'chowder', 'pulled pork', 'brisket', 'ribs', 'american', 'southern', 'cajun', 'creole',
      'tex-mex', 'kansas city', 'texas', 'carolina', 'new england', 'new york', 'midwest'],
    ingredients: ['cheddar', 'colby', 'american cheese', 'frank\'s', 'ranch', 'Old Bay', 'andouille',
      'corn bread', 'sweet tea', 'apple pie', 'coleslaw'],
  },
  mediterranean: {
    words: ['shakshuka', 'falafel', 'hummus', 'tahini', 'tzatziki', 'gyros', 'souvlaki', 'moussaka', 'spanakopita',
      'tagine', 'couscous', 'harissa', 'chermoula', 'paella', 'bouillabaisse', 'ratatouille', 'pistou',
      'fattoush', 'tabbouleh', 'labneh', 'za\'atar', 'sumac', 'dukkah', 'kofta', 'kebab', 'dolma',
      'baklava', 'halloumi', 'ras el hanout', 'preserved lemon', 'chermoula', 'caponata', 'romesco',
      'greek', 'turkish', 'lebanese', 'moroccan', 'tunisian', 'libyan', 'algerian', 'persian', 'iranian',
      'israeli', 'syrian', 'cypriot', 'spanish', 'provençal', 'catalan', 'sicilian'],
    ingredients: ['olives', 'feta', 'pomegranate', 'pine nuts', 'chickpeas', 'lentils', 'phyllo', 'eggplant'],
  },
  indian: {
    words: ['curry', 'masala', 'biryani', 'dal', 'naan', 'samosa', 'tikka', 'tandoor', 'korma', 'vindaloo',
      'butter chicken', 'saag', 'palak', 'paneer', 'chana', 'rajma', 'dosa', 'idli', 'sambar', 'rasam',
      'haleem', 'nihari', 'kofta', 'seekh', 'rogan josh', 'dhansak', 'balchão', 'koliwada',
      'indian', 'punjabi', 'bengali', 'gujarati', 'rajasthani', 'goan', 'kerala', 'kashmiri',
      'hyderabadi', 'mughlai', 'parsi', 'south indian', 'north indian'],
    ingredients: ['garam masala', 'cumin', 'coriander', 'turmeric', 'cardamom', 'fenugreek', 'asafoetida',
      'curry leaves', 'mustard seeds', 'ghee', 'paneer', 'yogurt marinade', 'basmati'],
  },
  steakhouse: {
    words: ['ribeye', 'filet mignon', 'new york strip', 'porterhouse', 't-bone', 'tomahawk', 'wagyu',
      'dry-aged', 'prime rib', 'wellington', 'béarnaise', 'au jus', 'steak tartare', 'surf and turf',
      'lobster thermidor', 'côte de boeuf', 'veal chop', 'rack of lamb', 'duck confit', 'bone marrow',
      'oxtail', 'chateaubriand', 'steak frites', 'creamed spinach', 'twice baked', 'wedge salad'],
    ingredients: ['truffle butter', 'compound butter', 'demi-glace', 'cabernet reduction', 'Bordelaise',
      'Yorkshire pudding', 'horseradish cream', 'foie gras'],
  },
  healthy: {
    words: ['grain bowl', 'nourish bowl', 'poke bowl', 'buddha bowl', 'superfood', 'plant-based', 'whole30',
      'keto', 'paleo', 'clean eating', 'macro', 'low-carb', 'gluten-free', 'dairy-free',
      'spiralized', 'zucchini noodles', 'zoodles', 'cauliflower rice', 'lettuce wrap',
      'green goddess', 'turmeric', 'gut health', 'anti-inflammatory', 'protein-packed'],
    ingredients: ['quinoa', 'farro', 'freekeh', 'teff', 'amaranth', 'chia seeds', 'hemp seeds',
      'spirulina', 'maca', 'kale', 'spinach', 'arugula', 'beet', 'avocado'],
  },
};

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

export function detectCuisine(mealName, ingredients = []) {
  const nameText = tokenize(mealName);
  const ingredientText = (ingredients || [])
    .map(i => tokenize(typeof i === 'string' ? i : i?.name || ''))
    .join(' ');
  const combined = `${nameText} ${ingredientText}`;

  const scores = {};

  for (const [cuisine, signals] of Object.entries(CUISINE_SIGNALS)) {
    let score = 0;

    for (const word of signals.words) {
      if (combined.includes(word)) score += 2;
    }
    for (const ing of signals.ingredients) {
      if (ingredientText.includes(ing)) score += 1;
    }

    scores[cuisine] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return best[0][1] > 0 ? best[0][0] : 'american';
}
