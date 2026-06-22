const KEY = 'mmm_shop_cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function save(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  return cart;
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.slug === product.slug);
  if (existing) {
    existing.quantity = Math.min(10, existing.quantity + quantity);
  } else {
    cart.push({
      slug: product.slug,
      name: product.name,
      price_cents: product.price_cents,
      emoji: product.emoji,
      quantity,
    });
  }
  return save(cart);
}

export function updateQuantity(slug, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.slug === slug);
  if (!item) return cart;
  if (quantity <= 0) return removeFromCart(slug);
  item.quantity = Math.min(10, quantity);
  return save(cart);
}

export function removeFromCart(slug) {
  return save(getCart().filter(i => i.slug !== slug));
}

export function clearCart() {
  return save([]);
}

export function cartCount(cart = getCart()) {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotalCents(cart = getCart()) {
  return cart.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
}

const DISCOUNT_KEY = 'mmm_shop_discount';

export function getAppliedDiscount() {
  try {
    return JSON.parse(sessionStorage.getItem(DISCOUNT_KEY)) || null;
  } catch {
    return null;
  }
}

export function setAppliedDiscount(discount) {
  if (discount) sessionStorage.setItem(DISCOUNT_KEY, JSON.stringify(discount));
  else sessionStorage.removeItem(DISCOUNT_KEY);
}
