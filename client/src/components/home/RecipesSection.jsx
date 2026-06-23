import { RECIPES } from '../../data/recipes.js';
import RecipeCard from './RecipeCard.jsx';

export default function RecipesSection() {
  return (
    <section id="recipes" className="mmm-section mmm-container">
      <h2 className="mmm-section-title">Recipes That Use These Tools</h2>
      <p className="mmm-section-sub">See the meal first. Then grab the tools that make it easier.</p>
      <div className="mmm-recipe-grid">
        {RECIPES.map(r => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </section>
  );
}
