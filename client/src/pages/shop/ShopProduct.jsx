import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getShopProduct } from '../../lib/api.js';
import { addToCart } from '../../lib/cart.js';

export default function ShopProduct() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getShopProduct(slug)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleAddToCart() {
    addToCart(product);
    toast.success('Added to cart');
    navigate('/shop/cart');
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/shop')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Product
        </h1>
      </div>

      <div className="page-pad pt-0">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text-light)' }}>Loading…</div>
        ) : error || !product ? (
          <div className="card p-6 text-center">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Product not found</p>
          </div>
        ) : (
          <>
            <div
              className="w-full rounded-3xl flex items-center justify-center mb-5"
              style={{ height: '220px', background: 'var(--bg-warm)', fontSize: '88px' }}
            >
              {product.emoji}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {product.name}
            </h2>
            <p className="text-[14px] mt-1.5" style={{ color: 'var(--text-mid)' }}>{product.tagline}</p>
            <div className="font-bold text-[26px] mt-3" style={{ color: 'var(--accent)' }}>
              ${(product.price_cents / 100).toFixed(2)}
            </div>

            <div className="card p-4 mt-5">
              {product.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <Check size={15} style={{ color: 'var(--accent-green)', marginTop: '2px', flexShrink: 0 }} />
                  <span className="text-[13px]" style={{ color: 'var(--text)' }}>{b}</span>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-center mt-4" style={{ color: 'var(--text-light)' }}>Free shipping · Ships within 1–2 weeks</p>

            <button className="pill-button w-full justify-center mt-3" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
