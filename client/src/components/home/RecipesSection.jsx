import { RECIPES } from '../../data/recipes.js';
import RecipeCard from './RecipeCard.jsx';

export default function RecipesSection() {
  return (
    <section id="recipes" className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Recipes People Are Making Right Now</h2>
      <p className="mmm-section-sub">Easy weeknight dinners, picked for busy nights.</p>
      <div className="mmm-recipe-grid">
        {RECIPES.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </section>
  );
}
