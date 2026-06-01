// Server proxies to Pexels API (with curated Unsplash CDN fallbacks).
// Prefers pexels_query from Claude seed over raw meal name for better photo accuracy.
export function getMealImageUrl(mealName, pexelsQuery) {
  const q = pexelsQuery || mealName || 'food';
  return `/api/images/food?q=${encodeURIComponent(q)}`;
}

export function attachImageUrls(meals) {
  return (meals || []).map(m => ({
    ...m,
    imageUrl: m.imageUrl || m.image_url || getMealImageUrl(m.name, m.pexels_query),
  }));
}
