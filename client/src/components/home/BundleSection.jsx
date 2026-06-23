import { BUNDLES } from '../../data/bundles.js';
import BundleCard from './BundleCard.jsx';

export default function BundleSection() {
  const bundle = BUNDLES[0];
  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Start with the Weeknight Dinner Kit</h2>
      <p className="mmm-section-sub">Our most-loved bundle, picked to make the busiest nights easier.</p>
      <BundleCard bundle={bundle} />
    </section>
  );
}
