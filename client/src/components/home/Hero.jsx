import { useNavigate } from 'react-router-dom';

const BADGES = ['Free easy recipes', 'Curated kitchen tools', 'New dinners every week'];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="mmm-hero mmm-container">
      <div className="mmm-hero-visual">
        <img src="/images/hero/hero-dinner.png" alt="A home-cooked weeknight dinner" />
      </div>
      <h1 className="mmm-h1">What are you making tonight?</h1>
      <p className="mmm-subhead">
        Find easy dinners for busy nights — then shop the tools that make them faster.
      </p>
      <div className="mmm-hero-ctas">
        <button
          className="mmm-btn mmm-btn-primary"
          onClick={() => document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Find a Recipe
        </button>
        <button className="mmm-btn mmm-btn-secondary" onClick={() => navigate('/shop')}>
          Shop Kitchen Tools
        </button>
      </div>
      <div className="mmm-trust-badges">
        {BADGES.map(b => <span key={b} className="mmm-trust-badge">{b}</span>)}
      </div>
    </section>
  );
}
