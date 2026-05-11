import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
You are a creative home cooking expert who generates meal plans
for real families. Your meals are genuinely delicious and
interesting — never generic.

NEVER suggest: plain chicken stir fry, basic pasta with tomato
sauce, generic tacos, or anything that sounds like diet food.

Every meal should have ONE interesting element that makes it
feel special — an unexpected spice, a sauce, a technique,
a flavor combo — while still being achievable for a home cook.

Always return valid JSON only. No explanation. No markdown.
No preamble. Just the JSON array.`;

const STORES = {
  'Walmart':      'budget-friendly, widely available ingredients',
  'Aldi':         'simple, affordable staples with minimal brand variety',
  'Kroger':       'standard American grocery selection',
  'Costco':       'bulk quantities, family-sized portions',
  'Trader Joe\'s': 'interesting, globally-inspired ingredients',
  'Whole Foods':  'premium, organic, specialty ingredients',
  'Target':       'everyday ingredients, mid-range pricing',
  'Any':          'standard grocery store ingredients',
};

const CUISINE_ROTATIONS = [
  'Mediterranean (Greek, Turkish, Lebanese)',
  'East Asian (Japanese, Korean, Chinese)',
  'Latin American (Mexican, Peruvian, Cuban)',
  'South Asian (Indian, Thai, Vietnamese)',
  'American comfort food with a twist',
  'Italian and French bistro-style',
  'Middle Eastern (Moroccan, Persian, Israeli)',
  'Modern fusion and globally-inspired',
];

function buildRestrictions(prefs) {
  if (!prefs) return 'None';
  const restrictions = [];
  if (prefs.picky_eaters)   restrictions.push('family-friendly, no adventurous ingredients');
  if (prefs.keep_mild)      restrictions.push('no spicy dishes');
  if (prefs.meat_free)      restrictions.push('vegetarian only, no meat or seafood');
  if (prefs.gluten_free)    restrictions.push('strictly gluten-free');
  if (prefs.dairy_free)     restrictions.push('strictly dairy-free');
  if (prefs.thirty_min_max) restrictions.push('30 minutes or less total cook time');
  if (prefs.high_protein)   restrictions.push('high-protein meals, prioritize lean meats, legumes, eggs');
  if (prefs.low_waste)      restrictions.push('minimal ingredients, use whole items, minimal food waste');
  return restrictions.length ? restrictions.join(', ') : 'None';
}

function buildUserPrompt(count, servings, prefs, exclude, prefPrompt = '') {
  const store     = prefs?.store   || 'Any';
  const budget    = prefs?.budget  || 100;
  const storeDesc = STORES[store] || STORES['Any'];
  const perMealBudget = Math.round(budget / Math.max(count - 1, 1));

  const excludeText = exclude.length ? `NEVER suggest: ${exclude.join(', ')}` : 'None (no restrictions)';

  // Rotate cuisine focus for variety across generations (unless inspiration provided)
  const cuisineFocus = prefs?.inspirationPrompt ? 'inspired by user request' : CUISINE_ROTATIONS[Math.floor(Math.random() * CUISINE_ROTATIONS.length)];
  const inspirationLine = prefs?.inspirationPrompt ? `User inspiration: Create a meal inspired by: "${prefs.inspirationPrompt}". Capture similar flavors, techniques, and spirit.` : '';

  return `Generate exactly ${count} dinner recipes. Be concise.
Servings: ${servings}
Store: ${store} (${storeDesc})
Weekly budget: $${budget} total (roughly $${perMealBudget} per meal)
Dietary restrictions: ${buildRestrictions(prefs)}
${excludeText}
${inspirationLine}
Cuisine direction this week: lean toward ${cuisineFocus} — mix in 1-2 other styles for variety. Each meal must be distinct.
CRITICAL: The excluded meals above have been made recently. Do NOT generate any of them again, even with slight variations.

Return a JSON array. Each item:
{
  "name": "string (max 5 words)",
  "description": "string (one punchy sentence, make it delicious)",
  "emoji": "string (one emoji)",
  "prep_minutes": number,
  "difficulty": "Easy" | "Medium" | "Confident Cook",
  "estimated_cost": number (total USD for ${servings} servings),
  "cuisine": "string (one of: asian | italian | latin | american | mediterranean | indian | steakhouse | healthy)",
  "inspired_by": "string (city, region, or culinary tradition this dish draws from, e.g. 'Sichuan street food' or 'New Orleans Cajun')",
  "pexels_query": "string (2-4 words for a Pexels food photo search, e.g. 'tonkotsu ramen bowl' or 'miso glazed salmon')",
  "chef_tip": "string (one insider tip that elevates this dish — technique, swap, or secret ingredient)",
  "ingredients": [
    {
      "name": "string (product name as sold at ${store}, e.g. 'chicken thighs', 'basmati rice', 'crushed tomatoes')",
      "quantity": "string (how many units to buy, e.g. '1', '2', '0.5')",
      "unit": "string (what you buy: 'lb', 'bag', 'bunch', 'can', 'bottle', 'head', 'oz', 'pack', 'jar', 'box', 'loaf' — NOT recipe measures like tbsp/cup/tsp)",
      "category": "string",
      "estimated_price": number (USD price for this purchasable item at ${store})
    }
  ],
  "steps": ["string"] (max 6 steps)
}

Categories: "Meat & Seafood" | "Produce" | "Dairy" | "Pantry" | "Bakery" | "Frozen" | "Other"
Ingredients rule: List what goes in the shopping cart, not what you measure at the stove. Skip everyday pantry staples (salt, pepper, basic oil, common spices) unless they are a key/unusual ingredient in this dish. Price each item as the full purchasable unit at ${store}.${prefPrompt}`;
}

function parseResponse(raw) {
  if (!raw || !raw.trim()) throw new Error('Claude returned empty response');
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error(`Invalid JSON: ${err.message} — Raw: ${cleaned.slice(0, 200)}`);
  }
}

const SEED_SYSTEM_PROMPT = `You are a professional chef writing home-cook-friendly recipes for a meal planning app.
You will receive a list of dishes from our curated restaurant-inspired library.
Your job: write full recipes — ingredients with exact shopping quantities, clear step-by-step instructions, and one insider chef tip per dish.

Rules:
- Ingredients are what you buy at the store (lbs, bags, cans, bunches) — NOT recipe measures (tbsp, cup)
- Skip everyday pantry staples (salt, pepper, olive oil, basic spices) unless a specific quantity/brand matters
- Steps should be clear, technique-forward, and specific (temperatures, times, visual cues)
- The chef tip must be a genuine technique or secret that elevates the dish — not generic advice
- Write as if the dish came from the restaurant it was inspired by
- Always return valid JSON array only. No explanation, no markdown, no preamble.`;

export async function generateMealsFromSeeds(seeds, servings, store = 'Any') {
  const storeDesc = STORES[store] || STORES['Any'];
  const maxTokens = Math.min(seeds.length * 900, 7000);

  const userPrompt = `Write full recipes for these ${seeds.length} restaurant-inspired dishes.
Servings: ${servings} people. Shopping at: ${store} (${storeDesc}).

${seeds.map((s, i) => `${i + 1}. ${s.name} — Inspired by: ${s.inspiredBy}`).join('\n')}

Return a JSON array (same order as above). Each item:
{
  "ingredients": [
    {
      "name": "string (product name as sold at ${store})",
      "quantity": "string (e.g. '1', '2', '0.5')",
      "unit": "string (lb, bag, bunch, can, bottle, head, oz, pack, jar, box — NOT tbsp/cup/tsp)",
      "category": "Meat & Seafood" | "Produce" | "Dairy" | "Pantry" | "Bakery" | "Frozen" | "Other",
      "estimated_price": number (USD for this purchasable unit at ${store})
    }
  ],
  "steps": ["string (max 6 clear, specific steps)"],
  "chef_tip": "string (one genuine insider technique that makes this dish restaurant-quality)"
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: SEED_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (!message.content?.[0]?.text) {
      throw new Error(`No content in Claude response: ${JSON.stringify(message)}`);
    }

    const results = parseResponse(message.content[0].text);
    // Merge seed metadata with Claude's recipe details
    return seeds.map((seed, i) => {
      const ings = results[i]?.ingredients ?? [];
      const ingTotal = ings.reduce((s, ing) => s + Number(ing.estimated_price || 0), 0);
      return {
        name:           seed.name,
        description:    seed.description,
        emoji:          seed.emoji,
        prep_minutes:   seed.prepTime,
        difficulty:     seed.difficulty === 1 ? 'Easy' : seed.difficulty === 2 ? 'Medium' : 'Confident Cook',
        estimated_cost: ingTotal > 0 ? Math.round(ingTotal) : seed.avgCost,
        cuisine:        seed.cuisine,
        inspired_by:    seed.inspiredBy,
        pexels_query:   seed.pexelsQuery,
        ingredients:    ings,
        steps:          results[i]?.steps ?? [],
        chef_tip:       results[i]?.chef_tip ?? '',
      };
    });
  } catch (err) {
    console.error('Claude seed generation error:', err.message);
    throw err;
  }
}

export async function generateMeals(count, servings, prefs, excludeNames = [], prefPrompt = '') {
  const maxTokens = Math.min(count * 900, 5500);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(count, servings, prefs, excludeNames, prefPrompt) }],
    });

    if (!message.content?.[0]?.text) {
      throw new Error(`No content in Claude response: ${JSON.stringify(message)}`);
    }

    return parseResponse(message.content[0].text);
  } catch (err) {
    console.error('Claude API error:', err.message);
    throw err;
  }
}
