const CATEGORY_ORDER = [
  'Meat & Seafood',
  'Produce',
  'Dairy',
  'Pantry',
  'Bakery',
  'Frozen',
  'Other',
];

// Normalize ingredient names for deduplication
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

// Try to sum quantities when units match
function mergeQuantity(existing, incoming) {
  const a = parseFloat(existing.quantity);
  const b = parseFloat(incoming.quantity);
  if (!isNaN(a) && !isNaN(b) && existing.unit === incoming.unit) {
    return { quantity: String(a + b), unit: existing.unit };
  }
  // Can't merge — just note multiple
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

    if (map.has(key)) {
      const existing = map.get(key);
      const merged = mergeQuantity(existing, ing);
      map.set(key, { ...existing, ...merged });
    } else {
      map.set(key, {
        name: ing.name,
        quantity: String(ing.quantity || ''),
        unit: ing.unit || '',
        category: ing.category || 'Other',
        checked: false,
      });
    }
  }

  // Sort by category order, then alphabetically
  const items = Array.from(map.values()).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name);
  });

  return {
    items,
    estimatedTotal: Math.round(totalCost * 100) / 100,
  };
}
