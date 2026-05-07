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
  if (!raw || !raw.trim()) {
    throw new Error('Claude returned empty response');
  }
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        throw new Error(`Invalid JSON in response: ${err.message}`);
      }
    }
    throw new Error(`Claude returned invalid JSON: ${err.message}\nRaw: ${cleaned.slice(0, 200)}`);
  }
}

export async function generateMeals(count, servings, prefs, excludeNames = [], prefPrompt = '') {
  const maxTokens = Math.min(count * 650, 4000);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildUserPrompt(count, servings, prefs, excludeNames, prefPrompt) }
      ],
    });

    if (!message.content || !message.content[0]) {
      throw new Error(`No content in Claude response: ${JSON.stringify(message)}`);
    }

    const text = message.content[0].text;
    if (!text) {
      throw new Error('Claude returned empty text content');
    }

    return parseResponse(text);
  } catch (err) {
    console.error('Claude API error:', err.message);
    throw err;
  }
}
