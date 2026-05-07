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

function buildRestrictions(prefs) {
  if (!prefs) return 'None';
  const restrictions = [];
  if (prefs.picky_eaters)  restrictions.push('family-friendly, no adventurous ingredients');
  if (prefs.keep_mild)     restrictions.push('no spicy dishes');
  if (prefs.meat_free)     restrictions.push('vegetarian only, no meat or seafood');
  if (prefs.gluten_free)   restrictions.push('strictly gluten-free');
  if (prefs.dairy_free)    restrictions.push('strictly dairy-free');
  if (prefs.thirty_min_max) restrictions.push('30 minutes or less total cook time');
  if (prefs.high_protein)  restrictions.push('high-protein meals, prioritize lean meats, legumes, eggs');
  if (prefs.low_waste)     restrictions.push('minimal ingredients, use whole items, minimal food waste');
  return restrictions.length ? restrictions.join(', ') : 'None';
}

function buildUserPrompt(count, servings, prefs, exclude, prefPrompt = '') {
  const store     = prefs?.store   || 'Any';
  const budget    = prefs?.budget  || 100;
  const storeDesc = STORES[store] || STORES['Any'];
  const perMealBudget = Math.round(budget / (count - 2));  // rough per-meal budget

  const excludeText = exclude.length ? exclude.join(', ') : 'nothing';

  return `Generate exactly ${count} dinner recipes. Be concise.
Servings: ${servings}
Store: ${store} (${storeDesc})
Weekly budget: $${budget} total (roughly $${perMealBudget} per meal)
Dietary restrictions: ${buildRestrictions(prefs)}
Do NOT include: ${excludeText}

Return a JSON array. Each item:
{
  "name": "string (max 5 words)",
  "description": "string (one punchy sentence, make it delicious)",
  "emoji": "string (one emoji)",
  "prep_minutes": number,
  "difficulty": "Easy" | "Medium" | "Confident Cook",
  "estimated_cost": number (total USD for ${servings} servings),
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "unit": "string",
      "category": "string",
      "estimated_price": number (USD for this item at ${store})
    }
  ],
  "steps": ["string"] (max 6 steps)
}

Categories: "Meat & Seafood" | "Produce" | "Dairy" | "Pantry" | "Bakery" | "Frozen" | "Other"${prefPrompt}`;
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

export async function generateMeals(count, servings, prefs, excludeNames = [], prefPrompt = '') {
  const maxTokens = Math.min(count * 750, 4500);

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
