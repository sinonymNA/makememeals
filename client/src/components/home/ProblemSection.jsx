import { useNavigate } from 'react-router-dom';
import { PROBLEM_CATEGORIES } from '../../data/problems.js';

export default function ProblemSection() {
  const navigate = useNavigate();

  return (
    <section className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Shop by what annoys you</h2>
      <div className="mmm-problem-grid">
        {PROBLEM_CATEGORIES.map(p => (
          <button key={p.id} className="mmm-problem-card" onClick={() => navigate(`/shop/${p.productId}`)}>
            <div className="mmm-problem-emoji">
              <img src={p.icon} alt={p.title} />
            </div>
            <div className="mmm-problem-title">{p.title}</div>
            <span className="mmm-problem-link">Fix it →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
