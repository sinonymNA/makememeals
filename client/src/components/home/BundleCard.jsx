import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProductById } from '../../data/products.js';
import { addToCart } from '../../lib/cart.js';

export default function BundleCard({ bundle }) {
  const navigate = useNavigate();
  const products = bundle.includedProductIds.map(getProductById).filter(Boolean);

  function handleAddKit() {
    products.forEach(p => addToCart({ slug: p.id, name: p.name, price_cents: Math.round(p.price * 100), emoji: p.image }, 1));
    toast.success('Kit added to cart');
    navigate('/shop/cart');
  }

  return (
    <div className="mmm-bundle-card">
      <span className="mmm-bundle-badge">MMM Approved</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--mmm-orange-dark)', margin: '8px 0 4px' }}>
          {bundle.name}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--mmm-text-mid)', margin: 0 }}>{bundle.description}</p>

        <div className="mmm-bundle-icons">
          {products.map(p => (
            <div key={p.id} className="mmm-bundle-icon" title={p.name}>
              <img src={p.image} alt={p.name} />
            </div>
          ))}
        </div>

        <div className="mmm-bundle-bullets">
          {bundle.bullets.map(b => (
            <div key={b} className="mmm-bundle-bullet">
              <Check size={15} style={{ color: 'var(--mmm-orange)', flexShrink: 0, marginTop: '1px' }} />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ minWidth: '220px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mmm-text-mid)' }}>Bundle Price</div>
        <div className="mmm-bundle-price-row">
          <span className="mmm-bundle-price">${bundle.price.toFixed(2)}</span>
          <span className="mmm-bundle-compare">Normally ${bundle.compareAtPrice.toFixed(2)}</span>
        </div>
        <div className="mmm-bundle-savings">{bundle.savingsText}</div>
        <button className="mmm-btn mmm-btn-orange" onClick={handleAddKit}>Add Kit to Cart</button>
      </div>
    </div>
  );
}
