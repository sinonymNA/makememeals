const STOP = new Set([
  'with','and','the','in','of','a','an','style','pan','sauce','gravy','glaze',
  'fried','baked','roasted','grilled','braised','seared','slow','cooked',
  'crispy','spicy','creamy','fresh','easy','quick','simple','homemade','classic',
]);

export function getMealImageUrl(mealName) {
  if (!mealName) return 'https://images.unsplash.com/photo-1495631066927-456aa3753d27?w=800&h=600&fit=crop&q=80';

  const words = mealName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .slice(0, 3);

  const query = words.length > 0 ? words.join(' ') : 'food';
  return `https://images.unsplash.com/photos?query=${encodeURIComponent(query)}&w=800&h=600&fit=crop&q=80&count=1`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || getMealImageUrl(m.name),
  }));
}
