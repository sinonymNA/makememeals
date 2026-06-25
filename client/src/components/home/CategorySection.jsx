import { Clock, DollarSign, CookingPot, Dumbbell, Soup, Users } from 'lucide-react';
import { DINNER_CATEGORIES } from '../../data/categories.js';

const ICONS = { Clock, DollarSign, CookingPot, Dumbbell, Soup, Users };

export default function CategorySection() {
  function goToRecipes() {
    document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Find your dinner</h2>
      <p className="mmm-section-sub">Pick what fits tonight — every category becomes its own recipe collection.</p>
      <div className="mmm-category-grid">
        {DINNER_CATEGORIES.map(c => {
          const Icon = ICONS[c.icon];
          return (
            <button key={c.id} className="mmm-category-card" onClick={goToRecipes}>
              <div className="mmm-category-icon"><Icon size={20} /></div>
              <span className="mmm-category-title">{c.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
