// Extract preferences from meals they've liked/disliked
export function analyzePreferences(likedMeals, dislikedMeals) {
  const prefs = {
    preferredDifficulty: null,
    preferredPrepTime: null,
    avoidDifficulty: null,
    avoidedPrepTime: null,
    commonIngredients: {},
    avoidedIngredients: {},
  };

  // Analyze liked meals
  if (likedMeals.length > 0) {
    const difficulties = likedMeals.map(m => m.difficulty);
    const prepTimes = likedMeals.map(m => m.prep_minutes || 30);
    const avgPrepTime = Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length);

    // Most common difficulty in likes
    const diffCount = {};
    difficulties.forEach(d => { diffCount[d] = (diffCount[d] || 0) + 1; });
    prefs.preferredDifficulty = Object.entries(diffCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    prefs.preferredPrepTime = avgPrepTime;

    // Common ingredients they like
    likedMeals.forEach(m => {
      (m.ingredients || []).forEach(ing => {
        const key = ing.category || ing.name;
        prefs.commonIngredients[key] = (prefs.commonIngredients[key] || 0) + 1;
      });
    });
  }

  // Analyze disliked meals
  if (dislikedMeals.length > 0) {
    const difficulties = dislikedMeals.map(m => m.difficulty);
    const prepTimes = dislikedMeals.map(m => m.prep_minutes || 30);
    const avgPrepTime = Math.round(prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length);

    const diffCount = {};
    difficulties.forEach(d => { diffCount[d] = (diffCount[d] || 0) + 1; });
    prefs.avoidDifficulty = Object.entries(diffCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    prefs.avoidedPrepTime = avgPrepTime;

    // Ingredients they're avoiding
    dislikedMeals.forEach(m => {
      (m.ingredients || []).forEach(ing => {
        const key = ing.category || ing.name;
        prefs.avoidedIngredients[key] = (prefs.avoidedIngredients[key] || 0) + 1;
      });
    });
  }

  return prefs;
}

// Build a prompt addendum based on learned preferences
export function buildPreferencePrompt(preferences) {
  if (!preferences || Object.keys(preferences).length === 0) return '';

  const parts = [];

  if (preferences.preferredDifficulty) {
    parts.push(`They seem to prefer ${preferences.preferredDifficulty} difficulty meals.`);
  }

  if (preferences.preferredPrepTime && preferences.preferredPrepTime < 40) {
    parts.push('They prefer quicker meals.');
  } else if (preferences.preferredPrepTime && preferences.preferredPrepTime > 45) {
    parts.push('They don\'t mind spending more time on meals.');
  }

  const topLikedCategories = Object.entries(preferences.commonIngredients || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  if (topLikedCategories.length > 0) {
    parts.push(`Focus on meals featuring: ${topLikedCategories.join(', ')}.`);
  }

  const topAvoidedCategories = Object.entries(preferences.avoidedIngredients || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  if (topAvoidedCategories.length > 0) {
    parts.push(`Avoid or minimize: ${topAvoidedCategories.join(', ')}.`);
  }

  return parts.length > 0 ? '\n\nUser preferences based on past swipes:\n' + parts.join('\n') : '';
}
