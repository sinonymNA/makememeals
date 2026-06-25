import { BookOpen } from 'lucide-react';
import { COLLECTIONS } from '../../data/collections.js';

export default function CollectionsSection() {
  function goToEmail() {
    document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Explore the Make Me 50 Collections</h2>
      <p className="mmm-section-sub">The free recipes here are previews of upcoming "Make Me 50" digital cookbooks.</p>
      <div className="mmm-collection-grid">
        {COLLECTIONS.map(c => (
          <button key={c.id} className="mmm-collection-card" onClick={goToEmail}>
            <BookOpen size={18} />
            <span className="mmm-collection-title">{c.title}</span>
            <span className="mmm-collection-badge">Coming soon</span>
          </button>
        ))}
      </div>
    </section>
  );
}
