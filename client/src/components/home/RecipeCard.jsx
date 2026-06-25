import { useNavigate } from 'react-router-dom';
import { getProductById } from '../../data/products.js';

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const tools = recipe.toolsUsed.map(getProductById).filter(Boolean);

  return (
    <div className="mmm-recipe-card">
      <div className="mmm-recipe-image">
        <img src={recipe.image} alt={recipe.title} />
      </div>
      <div className="mmm-recipe-body">
        <div className="mmm-recipe-top">
          <span className="mmm-recipe-title">{recipe.title}</span>
          <span className="mmm-recipe-time">{recipe.time}</span>
        </div>
        <div className="mmm-recipe-meta">
          <span>{recipe.servings} servings</span>
          <span>·</span>
          <span>{recipe.difficulty}</span>
          {recipe.cost && <><span>·</span><span>{recipe.cost}</span></>}
        </div>
        <p className="mmm-recipe-desc">{recipe.description}</p>
        {tools.length > 0 && (
          <p className="mmm-recipe-tools-note">Uses {tools.length} MMM tool{tools.length > 1 ? 's' : ''}</p>
        )}
        <div className="mmm-recipe-actions">
          <button className="mmm-btn mmm-btn-primary mmm-btn-sm" onClick={() => navigate(`/recipe/${recipe.id}`)}>{recipe.cta}</button>
          <button className="mmm-btn mmm-btn-secondary mmm-btn-sm" onClick={() => navigate(`/shop/${tools[0]?.id}`)}>Shop Tools</button>
        </div>
      </div>
    </div>
  );
}
