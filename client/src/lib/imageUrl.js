// Curated food photo IDs from Unsplash CDN — no API key required
// Format: https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop&q=80
const FOOD_PHOTOS = {
  chicken: [
    '1604908176997-125f25cc6f3d', '1598103442097-8b74394b95c7',
    '1551183053-bf91798d765e', '1569050467447-ce54b3bbc37d',
  ],
  beef: [
    '1546833999-b9f581a1996d', '1529193591184-b1d58069ecdd',
    '1558618666-fcd25c85cd64', '1544025162-d76538bc7c35',
  ],
  pork: [
    '1544025162-d76538bc7c35', '1529193591184-b1d58069ecdd',
    '1514190051997-0f6f39ca5cde', '1546833999-b9f581a1996d',
  ],
  salmon: [
    '1519708227418-a8b31ab1e865', '1485921325833-c519793a4f62',
    '1546069901-ba9599a7e63c', '1559181567-c3190bde1197',
  ],
  fish: [
    '1519708227418-a8b31ab1e865', '1485921325833-c519793a4f62',
    '1559181567-c3190bde1197', '1467003909585-2f8a72700288',
  ],
  shrimp: [
    '1559181567-c3190bde1197', '1467003909585-2f8a72700288',
    '1485921325833-c519793a4f62', '1519708227418-a8b31ab1e865',
  ],
  pasta: [
    '1563379926898-05f4575a45d8', '1473093226795-af9932fe5856',
    '1555949258-eb67b1ef0ceb', '1621996346565-ead8cc3bda29',
  ],
  rice: [
    '1604908176997-125f25cc6f3d', '1546069901-ba9599a7e63c',
    '1603133872878-684f208fb84b', '1512058554646-c4da40fba323',
  ],
  noodle: [
    '1569718212165-3a8278d5f624', '1547592166-23ac45744acd',
    '1608039829572-338a0534b956', '1569718212165-3a8278d5f624',
  ],
  soup: [
    '1547592166-23ac45744acd', '1608039829572-338a0534b956',
    '1603105037880-880cd4edfb0d', '1560684187-a32a2c8a26e5',
  ],
  stew: [
    '1547592166-23ac45744acd', '1560684187-a32a2c8a26e5',
    '1603105037880-880cd4edfb0d', '1608039829572-338a0534b956',
  ],
  curry: [
    '1585937421612-70a008356fbe', '1574484284602-3fded4f93bc2',
    '1631452180519-a7aa3fdca1ae', '1565557623262-b51206a3d55e',
  ],
  taco: [
    '1565299585323-38d6b0865b47', '1599974579688-8dbdd335c77f',
    '1551504734-5da7e163f003', '1552332386-f8dd00dc2f85',
  ],
  burger: [
    '1568901346375-23c9450c58cd', '1561758033-d89a2a3f960e',
    '1553979459-d5fb374b4843', '1549078642-b2ba4bda0cdb',
  ],
  pizza: [
    '1574071318508-1cdbab80d002', '1565299624946-b28f40a0ae38',
    '1513104890138-7c749659a591', '1571407970349-bc81e71f52b7',
  ],
  salad: [
    '1512621776951-a57141f2eefd', '1540420773420-3366772f4999',
    '1543339308-43e59d6b73a6', '1546793665-c74683f339c1',
  ],
  bowl: [
    '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd',
    '1604908176997-125f25cc6f3d', '1567620905732-2d1ec7ab7445',
  ],
  stir: [
    '1541014741259-de529411b96a', '1512058554646-c4da40fba323',
    '1603105037880-880cd4edfb0d', '1569718212165-3a8278d5f624',
  ],
  fried: [
    '1571091718767-18b5b1457add', '1604908176997-125f25cc6f3d',
    '1551504734-5da7e163f003', '1569050467447-ce54b3bbc37d',
  ],
  egg: [
    '1484723091739-30990a08abf8', '1525351484163-7529414344d8',
    '1567620905732-2d1ec7ab7445', '1493770348161-369560ae357d',
  ],
  default: [
    '1504674900247-0877df9cc836', '1493770348161-369560ae357d',
    '1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd',
    '1567620905732-2d1ec7ab7445', '1476224203421-9ac39bcb3327',
    '1547592166-23ac45744acd', '1564834724105-918082eac9be',
  ],
};

const KEYWORD_MAP = [
  ['salmon',   'salmon'],  ['shrimp', 'shrimp'],  ['prawn',  'shrimp'],
  ['fish',     'fish'],    ['tuna',   'fish'],     ['cod',    'fish'],
  ['tilapia',  'fish'],    ['halibut','fish'],
  ['chicken',  'chicken'], ['turkey', 'chicken'],  ['poultry','chicken'],
  ['beef',     'beef'],    ['steak',  'beef'],     ['brisket','beef'],
  ['ground',   'beef'],    ['meatball','beef'],
  ['pork',     'pork'],    ['bacon',  'pork'],     ['sausage','pork'],
  ['ham',      'pork'],    ['chorizo','pork'],
  ['pasta',    'pasta'],   ['spaghetti','pasta'],  ['fettuccine','pasta'],
  ['linguine', 'pasta'],   ['penne',  'pasta'],    ['macaroni','pasta'],
  ['lasagna',  'pasta'],   ['ravioli','pasta'],
  ['noodle',   'noodle'],  ['ramen',  'noodle'],   ['udon',   'noodle'],
  ['pho',      'noodle'],  ['lo mein','noodle'],   ['pad thai','noodle'],
  ['rice',     'rice'],    ['risotto','rice'],      ['fried rice','rice'],
  ['curry',    'curry'],   ['tikka',  'curry'],    ['masala', 'curry'],
  ['korma',    'curry'],   ['dal',    'curry'],    ['saag',   'curry'],
  ['taco',     'taco'],    ['burrito','taco'],     ['quesadilla','taco'],
  ['enchilada','taco'],    ['fajita', 'taco'],
  ['burger',   'burger'],  ['cheeseburger','burger'],
  ['pizza',    'pizza'],   ['flatbread','pizza'],
  ['salad',    'salad'],   ['slaw',   'salad'],    ['caesar', 'salad'],
  ['soup',     'soup'],    ['bisque', 'soup'],     ['chowder','soup'],
  ['stew',     'stew'],    ['braised','stew'],     ['braise', 'stew'],
  ['stir',     'stir'],    ['wok',    'stir'],
  ['fried',    'fried'],   ['crispy', 'fried'],
  ['egg',      'egg'],     ['frittata','egg'],     ['omelette','egg'],
  ['bowl',     'bowl'],    ['grain',  'bowl'],
];

function hashIndex(str, len) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h) % len;
}

export function getMealImageUrl(mealName) {
  const base = 'https://images.unsplash.com/photo-';
  const params = '?w=800&h=600&fit=crop&q=80&auto=format';

  if (!mealName) {
    const pool = FOOD_PHOTOS.default;
    return `${base}${pool[0]}${params}`;
  }

  const lower = mealName.toLowerCase();
  let category = 'default';
  for (const [kw, cat] of KEYWORD_MAP) {
    if (lower.includes(kw)) { category = cat; break; }
  }

  const pool = FOOD_PHOTOS[category] || FOOD_PHOTOS.default;
  const id = pool[hashIndex(mealName, pool.length)];
  return `${base}${id}${params}`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || getMealImageUrl(m.name),
  }));
}
