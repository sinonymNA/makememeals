import { useNavigate } from 'react-router-dom';
import { getProductById } from '../../data/products.js';

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const tools = recipe.toolsUsed.map(getProductById).filter(Boolean);

  return (
    <div className="mmm-recipe-card">
      <div className="mmm-recipe-image">{recipe.image}</div>
      <div className="mmm-recipe-body">
        <div className="mmm-recipe-top">
          <span className="mmm-recipe-title">{recipe.title}</span>
          <span className="mmm-recipe-time">{recipe.time}</span>
        </div>
        <p className="mmm-recipe-desc">{recipe.description}</p>
        <div className="mmm-tools-row">
          {tools.map(t => <span key={t.id} className="mmm-tool-chip">{t.image} {t.name}</span>)}
        </div>
        <div className="mmm-recipe-actions">
          <button className="mmm-btn mmm-btn-primary mmm-btn-sm" onClick={() => navigate('/guest-setup')}>{recipe.cta}</button>
          <button className="mmm-btn mmm-btn-secondary mmm-btn-sm" onClick={() => navigate(`/shop/${tools[0]?.id}`)}>Shop Tools</button>
        </div>
      </div>
    </div>
  );
}
