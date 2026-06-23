import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { getShopProducts } from '../../lib/api.js';
import { getCart, cartCount } from '../../lib/cart.js';

export default function ShopHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(cartCount(getCart()));

  useEffect(() => {
    getShopProducts().then(setProducts).finally(() => setLoading(false));
    const onUpdate = () => setCount(cartCount(getCart()));
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, []);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            MMM Shop
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>Kitchen tools, free shipping</p>
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl relative"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/shop/cart')}
        >
          <ShoppingBag size={18} style={{ color: 'var(--text-mid)' }} />
          {count > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ width: '18px', height: '18px', background: 'var(--accent)' }}
            >
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="page-pad pt-0">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text-light)' }}>
            <p className="text-[14px]">Loading…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map(p => (
              <button
                key={p.slug}
                className="card p-4 flex items-center gap-4 text-left w-full"
                onClick={() => navigate(`/shop/${p.slug}`)}
              >
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: 'var(--bg-warm)' }}
                >
                  <img src={p.emoji} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{p.name}</div>
                  <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-mid)' }}>{p.tagline}</div>
                  <div className="font-semibold text-[14px] mt-1.5" style={{ color: 'var(--accent)' }}>
                    ${(p.price_cents / 100).toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
