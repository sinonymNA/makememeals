import { useNavigate } from 'react-router-dom';

const BADGES = ['Easy weeknight recipes', 'Curated kitchen tools', 'Free dinner ideas'];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="mmm-hero mmm-container">
      <div className="mmm-hero-visual">
        <img src="/images/hero/hero-dinner.png" alt="A home-cooked weeknight dinner" />
      </div>
      <h1 className="mmm-h1">Cook easier dinners this week.</h1>
      <p className="mmm-subhead">
        Simple recipes, smart kitchen tools, and meal ideas that make home cooking less stressful.
      </p>
      <div className="mmm-hero-ctas">
        <button className="mmm-btn mmm-btn-primary" onClick={() => navigate('/shop')}>
          Shop Best Sellers
        </button>
        <button
          className="mmm-btn mmm-btn-secondary"
          onClick={() => document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Find Dinner Ideas
        </button>
      </div>
      <div className="mmm-trust-badges">
        {BADGES.map(b => <span key={b} className="mmm-trust-badge">{b}</span>)}
      </div>
    </section>
  );
}
