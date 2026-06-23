import { useNavigate } from 'react-router-dom';

export default function PlannerSection() {
  const navigate = useNavigate();

  return (
    <section className="mmm-section mmm-container">
      <div className="mmm-planner-card">
        <h3 className="mmm-section-title" style={{ fontSize: '20px' }}>Still not sure what to cook?</h3>
        <p className="mmm-section-sub">Answer a few quick questions and get a free weekly meal plan built around easy recipes.</p>
        <button className="mmm-btn mmm-btn-secondary" onClick={() => navigate('/guest-setup')}>Build My Free Meal Plan</button>
      </div>
    </section>
  );
}
