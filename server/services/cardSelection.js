// Card-based meal selection — replaces Claude random generation.
// Pulls approved recipe cards from the DB, filters by user preferences,
// scales ingredients to the requested serving count, and returns meals
// in the same shape the rest of the app expects.

const CUISINE_EMOJI = {
  italian: '🍝', asian: '🥢', latin: '🌶️', american: '🍔',
  mediterranean: '🫒', indian: '🌿', steakhouse: '🥩', healthy: '🌱',
};

function cuisineEmoji(cuisine) {
  return CUISINE_EMOJI[cuisine] || '🍽️';
}

// Detect dietary conflicts from ingredient text
function meetsPreferences(card, prefs) {
  if (!prefs) return true;
  const ingredients = card.ingredients || [];
  const ingText = ingredients.map(i => (i.name || '').toLowerCase()).join(' ');

  if (prefs.meat_free) {
    const hasMeat = /\b(beef|pork|chicken|turkey|lamb|steak|ribeye|sausage|bacon|ham|veal|brisket)\b/.test(ingText);
    const hasSeafood = /\b(shrimp|prawn|fish|salmon|tuna|cod|tilapia|lobster|crab|scallop|clam|mussel)\b/.test(ingText);
    if (hasMeat || hasSeafood) return false;
  }
  if (prefs.gluten_free) {
    const hasGluten = /\b(pasta|linguine|spaghetti|fettuccine|penne|rigatoni|flour|bread|wheat|breading|tortilla|pita|panko)\b/.test(ingText);
    if (hasGluten) return false;
  }
  if (prefs.dairy_free) {
    const hasDairy = /\b(milk|cheese|butter|cream|yogurt|mozzarella|parmesan|ricotta|cheddar|brie|ghee)\b/.test(ingText);
    if (hasDairy) return false;
  }
  if (prefs.picky_eaters || prefs.keep_mild) {
    const hasSpicy = /\b(red pepper flakes|jalapeño|habanero|sriracha|chili paste|cayenne|ghost pepper)\b/.test(ingText);
    if (hasSpicy) return false;
  }
  return true;
}

// Scale numeric ingredient quantities from one serving count to another
function scaleIngredients(ingredients, fromServings, toServings) {
  if (!fromServings || !toServings || fromServings === toServings) return ingredients;
  const factor = toServings / fromServings;
  return (ingredients || []).map(ing => {
    const qty = parseFloat(ing.quantity);
    if (isNaN(qty)) return ing; // keep text like "to taste" unchanged
    const scaled = Math.round(qty * factor * 4) / 4; // round to nearest ¼
    return { ...ing, quantity: String(scaled) };
  });
}

function scaleSteps(steps, fromServings, toServings) {
  // Steps are text — servings count is embedded in text rarely enough that we
  // return them as-is and let the user interpret. No string rewriting.
  return steps || [];
}

// Convert a recipe_cards row into the meal shape the app expects
function cardToMeal(card, servings) {
  const scaledIngredients = scaleIngredients(card.ingredients || [], card.servings, servings);
  const scaledCost = card.estimated_cost && card.servings
    ? Math.round(Number(card.estimated_cost) * (servings / card.servings) * 100) / 100
    : card.estimated_cost;

  return {
    name:           card.name,
    description:    card.description,
    prep_minutes:   card.prep_minutes,
    servings,
    difficulty:     'medium',
    ingredients:    scaledIngredients,
    steps:          scaleSteps(card.steps, card.servings, servings),
    estimated_cost: scaledCost,
    emoji:          cuisineEmoji(card.cuisine),
    cuisine:        card.cuisine,
    pexels_query:   card.name,          // Pexels image fallback
    imageUrl:       card.image_url || null, // Use uploaded card photo if present
    chef_tip:       card.chef_tip,
    inspired_by:    card.inspired_by,
    card_id:        card.id,
  };
}

// Shuffle an array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Main selection function
// Returns { meals, usedCards } where meals is ready to send to client.
// count     — how many meals to return
// servings  — user's serving preference
// prefs     — user preference object from DB
// exclude   — array of meal names already in the queue / recently seen
export async function selectCardsForPlan({ sql, count, servings, prefs, exclude = [] }) {
  const allCards = await sql`
    SELECT * FROM recipe_cards WHERE approved = TRUE
  `;

  if (allCards.length === 0) return { meals: [], shortage: count };

  // Filter and shuffle
  const excludeLower = exclude.map(n => n.toLowerCase());
  const eligible = shuffle(allCards).filter(card => {
    if (excludeLower.includes((card.name || '').toLowerCase())) return false;
    if (!meetsPreferences(card, prefs)) return false;
    return true;
  });

  // Budget filter — per-meal budget = total / days
  let budgetEligible = eligible;
  if (prefs?.budget && count) {
    const perMeal = Number(prefs.budget) / count;
    const withinBudget = eligible.filter(card => {
      if (!card.estimated_cost || !card.servings) return true;
      const scaledCost = Number(card.estimated_cost) * (servings / card.servings);
      return scaledCost <= perMeal;
    });
    if (withinBudget.length > 0) budgetEligible = withinBudget;
  }

  // Pick `count` cards; if not enough, cycle through (repeat is better than empty)
  const selected = [];
  const pool = budgetEligible.length > 0 ? budgetEligible : eligible;
  for (let i = 0; i < count && pool.length > 0; i++) {
    selected.push(pool[i % pool.length]);
  }

  const meals = selected.map(card => cardToMeal(card, servings));
  const shortage = Math.max(0, count - meals.length);
  return { meals, shortage };
}
