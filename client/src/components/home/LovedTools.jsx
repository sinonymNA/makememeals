import { PRODUCTS } from '../../data/products.js';
import ProductCard from './ProductCard.jsx';

export default function LovedTools() {
  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Today's Most Loved Tools</h2>
      <p className="mmm-section-sub">The tools home cooks keep reaching for, week after week.</p>
      <div className="mmm-carousel">
        {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
