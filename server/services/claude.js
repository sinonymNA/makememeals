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

function buildRestrictions(prefs) {
  if (!prefs) return 'None';
  const restrictions = [];
  if (prefs.picky_eaters) restrictions.push('family-friendly, no adventurous ingredients');
  if (prefs.keep_mild) restrictions.push('no spicy dishes');
  if (prefs.meat_free) restrictions.push('vegetarian only, no meat or seafood');
  if (prefs.gluten_free) restrictions.push('strictly gluten-free');
  if (prefs.dairy_free) restrictions.push('strictly dairy-free');
  if (prefs.thirty_min_max) restrictions.push('30 minutes or less total prep + cook time');
  return restrictions.length ? restrictions.join(', ') : 'None';
}

function buildUserPrompt(count, servings, prefs, exclude) {
  const excludeText = exclude.length ? exclude.join(', ') : 'nothing';
  return `Generate ${count} dinner recipes.
Servings: ${servings}
Restrictions: ${buildRestrictions(prefs)}
Do NOT include any of these: ${excludeText}

Return a JSON array where each item is:
{
  "name": "string (max 5 words, appetizing)",
  "description": "string (one punchy sentence, make it sound delicious)",
  "emoji": "string (one food emoji that represents the dish)",
  "prep_minutes": number,
  "difficulty": "Easy" or "Medium" or "Confident Cook",
  "estimated_cost": number (USD, for ${servings} servings),
  "ingredients": [{ "name": "string", "quantity": "string", "unit": "string", "category": "string" }],
  "steps": ["string"] (clear, max 8 steps)
}

Categories for ingredients must be exactly one of:
"Meat & Seafood" | "Produce" | "Dairy" | "Pantry" | "Bakery" | "Frozen" | "Other"`;
}

export async function generateMeals(days, servings, prefs, excludeNames = []) {
  const count = Number(days) + 3;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(count, servings, prefs, excludeNames) }
    ],
  });

  const raw = message.content[0].text.trim();

  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let meals;
  try {
    meals = JSON.parse(cleaned);
  } catch {
    // Try extracting JSON array from response
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      meals = JSON.parse(match[0]);
    } else {
      throw new Error('Claude returned invalid JSON');
    }
  }

  return Array.isArray(meals) ? meals : [meals];
}
