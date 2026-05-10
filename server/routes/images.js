import { Router } from 'express';

const router = Router();

// Curated Unsplash CDN fallbacks by food category (no API key needed)
const FALLBACKS = {
  chicken:    'https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=800&h=600&fit=crop&q=80',
  beef:       'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&q=80',
  pork:       'https://images.unsplash.com/photo-1544025162-d76538bc7c35?w=800&h=600&fit=crop&q=80',
  salmon:     'https://images.unsplash.com/photo-1519708227418-a8b31ab1e865?w=800&h=600&fit=crop&q=80',
  fish:       'https://images.unsplash.com/photo-1485921325833-c519793a4f62?w=800&h=600&fit=crop&q=80',
  shrimp:     'https://images.unsplash.com/photo-1559181567-c3190bde1197?w=800&h=600&fit=crop&q=80',
  pasta:      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&fit=crop&q=80',
  noodle:     'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80',
  rice:       'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&h=600&fit=crop&q=80',
  soup:       'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&q=80',
  curry:      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80',
  taco:       'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop&q=80',
  burger:     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=80',
  pizza:      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop&q=80',
  salad:      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80',
  stir:       'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&h=600&fit=crop&q=80',
  bowl:       'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80',
  egg:        'https://images.unsplash.com/photo-1484723091739-30990a08abf8?w=800&h=600&fit=crop&q=80',
  default:    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
};

const KEYWORD_MAP = [
  ['salmon', 'salmon'], ['shrimp', 'shrimp'], ['prawn', 'shrimp'],
  ['fish', 'fish'],     ['tuna', 'fish'],      ['cod', 'fish'],    ['tilapia', 'fish'],
  ['chicken', 'chicken'], ['turkey', 'chicken'],
  ['beef', 'beef'],     ['steak', 'beef'],     ['brisket', 'beef'], ['meatball', 'beef'],
  ['pork', 'pork'],     ['bacon', 'pork'],     ['sausage', 'pork'], ['chorizo', 'pork'],
  ['pasta', 'pasta'],   ['spaghetti', 'pasta'], ['linguine', 'pasta'], ['lasagna', 'pasta'],
  ['noodle', 'noodle'], ['ramen', 'noodle'],   ['pho', 'noodle'],  ['udon', 'noodle'],
  ['rice', 'rice'],     ['risotto', 'rice'],   ['fried rice', 'rice'],
  ['curry', 'curry'],   ['tikka', 'curry'],    ['masala', 'curry'],
  ['taco', 'taco'],     ['burrito', 'taco'],   ['quesadilla', 'taco'],
  ['burger', 'burger'], ['pizza', 'pizza'],    ['flatbread', 'pizza'],
  ['salad', 'salad'],   ['slaw', 'salad'],
  ['soup', 'soup'],     ['stew', 'soup'],      ['bisque', 'soup'],  ['chowder', 'soup'],
  ['stir', 'stir'],     ['wok', 'stir'],
  ['bowl', 'bowl'],
  ['egg', 'egg'],       ['frittata', 'egg'],   ['omelette', 'egg'],
];

const STOP_WORDS = new Set([
  'with', 'and', 'in', 'the', 'a', 'an', 'on', 'of', 'for',
  'glazed', 'roasted', 'baked', 'grilled', 'braised', 'seared',
  'creamy', 'crispy', 'spicy', 'smoky', 'sweet', 'savory',
  'garlic', 'lemon', 'herb', 'homemade', 'classic', 'style',
  'pan', 'slow', 'cooked', 'easy', 'quick', 'fresh',
]);

function getCuratedFallback(q) {
  if (!q) return FALLBACKS.default;
  const lower = q.toLowerCase();
  for (const [kw, cat] of KEYWORD_MAP) {
    if (lower.includes(kw)) return FALLBACKS[cat];
  }
  return FALLBACKS.default;
}

function extractFoodKeywords(mealName) {
  const words = mealName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 2);
  const base = words.length ? words.join(' ') : 'food';
  return `${base} food dish`;
}

function hashIndex(str, len) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i) | 0;
  return Math.abs(h) % len;
}

// GET /api/images/food?q=honey+garlic+chicken
router.get('/food', async (req, res) => {
  const { q = '' } = req.query;
  const fallback = getCuratedFallback(q);

  if (!process.env.PEXELS_API_KEY) {
    console.log(`[Image] No Pexels key — fallback for: "${q}"`);
    return res.redirect(302, fallback);
  }

  try {
    const keywords = extractFoodKeywords(q);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=15&orientation=landscape&size=large`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    );

    const data = await response.json();
    const photos = data.photos || [];
    console.log(`[Image] "${keywords}" (from "${q}") → ${photos.length} results`);

    if (photos.length < 3) {
      console.log(`[Image] Low results — using fallback for: "${q}"`);
      return res.redirect(302, fallback);
    }

    const idx = hashIndex(q, photos.length);
    const url = photos[idx]?.src?.large || fallback;
    res.redirect(302, url);
  } catch (err) {
    console.error(`[Image Error] "${q}": ${err.message}`);
    res.redirect(302, fallback);
  }
});

export default router;
