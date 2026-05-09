const STOP = new Set([
  'with','and','the','in','of','a','an','style','pan','fried','baked',
  'roasted','grilled','braised','seared','slow','cooked','crispy','spicy',
  'creamy','fresh','easy','quick','simple','homemade','classic',
]);

export function getMealImageUrl(mealName) {
  if (!mealName) return 'https://source.unsplash.com/800x600/?food,dinner,meal';
  const words = mealName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w))
    .slice(0, 3);
  if (!words.length) words.push('food');
  return `https://source.unsplash.com/800x600/?${[...words, 'food'].join(',')}`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || getMealImageUrl(m.name),
  }));
}
