const STOP = new Set([
  'with','and','the','in','of','a','an','style','pan','fried','baked',
  'roasted','grilled','braised','seared','slow','cooked','crispy','spicy',
  'creamy','fresh','easy','quick','simple','homemade','classic',
]);

function hashLock(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h) % 9999 + 1;
}

export function getMealImageUrl(mealName) {
  if (!mealName) return 'https://loremflickr.com/800/600/food,dinner?lock=1';
  const words = mealName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .slice(0, 3);
  if (!words.length) words.push('food');
  const lock = hashLock(mealName);
  return `https://loremflickr.com/800/600/${[...words, 'food'].join(',')}?lock=${lock}`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || getMealImageUrl(m.name),
  }));
}
