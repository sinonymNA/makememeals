const CATEGORY_ORDER = [
  'Meat & Seafood',
  'Produce',
  'Dairy',
  'Pantry',
  'Bakery',
  'Frozen',
  'Other',
];

function normalize(name) {
  return name.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
}

function mergeQuantity(existing, incoming) {
  const a = parseFloat(existing.quantity);
  const b = parseFloat(incoming.quantity);
  if (!isNaN(a) && !isNaN(b) && existing.unit === incoming.unit) {
    return { quantity: String(Math.round((a + b) * 100) / 100), unit: existing.unit };
  }
  if (existing.unit === incoming.unit) {
    return { quantity: `${existing.quantity} + ${incoming.quantity}`, unit: existing.unit };
  }
  return { quantity: `${existing.quantity} ${existing.unit} + ${incoming.quantity} ${incoming.unit}`, unit: '' };
}

export function buildGroceryList(ingredients, totalCost) {
  const map = new Map();

  for (const ing of ingredients) {
    if (!ing?.name) continue;
    const key = normalize(ing.name);
    const price = ing.estimated_price ? Number(ing.estimated_price) : null;

    if (map.has(key)) {
      const existing = map.get(key);
      const merged = mergeQuantity(existing, ing);
      // Sum prices if both have them
      const mergedPrice = (existing.estimated_price != null && price != null)
        ? Math.round((existing.estimated_price + price) * 100) / 100
        : (existing.estimated_price ?? price);
      map.set(key, { ...existing, ...merged, estimated_price: mergedPrice });
    } else {
      map.set(key, {
        name: ing.name,
        quantity: String(ing.quantity || ''),
        unit: ing.unit || '',
        category: ing.category || 'Other',
        estimated_price: price,
        checked: false,
      });
    }
  }

  const items = Array.from(map.values()).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  });

  // Use sum of item prices when available, fall back to meal cost estimate
  const itemPriceTotal = items.reduce((s, i) => s + (i.estimated_price || 0), 0);
  const estimatedTotal = itemPriceTotal > 0
    ? Math.round(itemPriceTotal * 100) / 100
    : Math.round(totalCost * 100) / 100;

  return { items, estimatedTotal };
}
