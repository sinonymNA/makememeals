import { BUNDLES } from '../../data/bundles.js';
import BundleCard from './BundleCard.jsx';

export default function BundleSection() {
  const bundle = BUNDLES[0];
  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Make These Dinners Easier</h2>
      <p className="mmm-section-sub">The 4 tools used across our most popular weeknight recipes.</p>
      <BundleCard bundle={bundle} />
    </section>
  );
}
