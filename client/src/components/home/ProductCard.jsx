import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../lib/cart.js';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  function handleAdd() {
    addToCart({ slug: product.id, name: product.name, price_cents: Math.round(product.price * 100), emoji: product.image }, 1);
    toast.success(`${product.name} added to cart`);
  }

  return (
    <div className="mmm-product-card">
      <span className="mmm-approved">MMM Approved</span>
      <div className="mmm-product-image">{product.image}</div>
      <div className="mmm-product-name">{product.name}</div>
      <div className="mmm-product-desc">{product.benefit}</div>
      <div className="mmm-rating">★★★★★ <span className="mmm-rating-num">{product.rating}</span></div>
      <div className="mmm-product-price-row">
        <span className="mmm-product-price">${product.price.toFixed(2)}</span>
        <span className="mmm-product-compare">${product.compareAtPrice.toFixed(2)}</span>
      </div>
      <button className="mmm-btn mmm-btn-primary mmm-btn-sm" onClick={handleAdd}>Add to Cart</button>
      <button className="mmm-btn mmm-btn-secondary mmm-btn-sm" onClick={() => navigate(`/shop/${product.id}`)}>View Tool</button>
    </div>
  );
}
