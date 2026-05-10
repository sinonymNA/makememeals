// Server proxies to Pexels API (with curated Unsplash CDN fallbacks).
// Same meal name always gets the same image via server-side hash.
export function getMealImageUrl(mealName) {
  if (!mealName) return '/api/images/food?q=food';
  return `/api/images/food?q=${encodeURIComponent(mealName)}`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || getMealImageUrl(m.name),
  }));
}
