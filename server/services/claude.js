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

function buildUserPrompt(count, servings, prefs, exclude, prefPrompt = '') {
  const excludeText = exclude.length ? exclude.join(', ') : 'nothing';
  return `Generate exactly ${count} dinner recipes. Be concise.
Servings: ${servings}
Restrictions: ${buildRestrictions(prefs)}
Do NOT include: ${excludeText}

Return a JSON array. Each item:
{
  "name": "string (max 5 words)",
  "description": "string (one punchy sentence)",
  "emoji": "string (one emoji)",
  "prep_minutes": number,
  "difficulty": "Easy" | "Medium" | "Confident Cook",
  "estimated_cost": number,
  "ingredients": [{"name":"string","quantity":"string","unit":"string","category":"string"}],
  "steps": ["string"] (max 6 steps)
}

Categories: "Meat & Seafood" | "Produce" | "Dairy" | "Pantry" | "Bakery" | "Frozen" | "Other"${prefPrompt}`;
}

function parseResponse(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Claude returned invalid JSON');
  }
}

export async function generateMeals(count, servings, prefs, excludeNames = [], prefPrompt = '') {
  // Token budget: ~600 tokens per meal (tighter prompt = faster)
  const maxTokens = Math.min(count * 650, 4000);

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(count, servings, prefs, excludeNames, prefPrompt) }
    ],
  });

  return parseResponse(message.content[0].text);
}
