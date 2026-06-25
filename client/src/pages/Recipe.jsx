import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeById, RECIPES } from '../data/recipes.js';
import { getProductById } from '../data/products.js';
import Header from '../components/home/Header.jsx';
import Footer from '../components/home/Footer.jsx';
import EmailCapture from '../components/home/EmailCapture.jsx';
import RecipeCard from '../components/home/RecipeCard.jsx';
import NotFound from './NotFound.jsx';

export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = getRecipeById(id);

  if (!recipe) return <NotFound />;

  const tools = recipe.toolsUsed.map(getProductById).filter(Boolean);
  const similar = RECIPES.filter(r => r.id !== recipe.id && r.toolsUsed.some(t => recipe.toolsUsed.includes(t))).slice(0, 3);

  function scrollTo(elId) {
    document.getElementById(elId)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="mmm-home">
      <Header />

      <section className="mmm-section mmm-container">
        <div className="mmm-recipe-detail-image">
          <img src={recipe.image} alt={recipe.title} />
        </div>
        <h1 className="mmm-h1" style={{ fontSize: '28px', textAlign: 'left' }}>{recipe.title}</h1>
        <div className="mmm-recipe-meta" style={{ marginBottom: '18px' }}>
          <span>{recipe.time}</span>
          <span>·</span>
          <span>{recipe.difficulty}</span>
          <span>·</span>
          <span>{recipe.servings} servings</span>
          {recipe.cost && <><span>·</span><span>{recipe.cost}</span></>}
        </div>
        <div className="mmm-hero-ctas" style={{ marginBottom: '8px' }}>
          <button className="mmm-btn mmm-btn-primary" onClick={() => scrollTo('instructions')}>Jump to Recipe</button>
          <button className="mmm-btn mmm-btn-secondary" onClick={() => scrollTo('tools-used')}>Shop Tools Used</button>
        </div>
      </section>

      <section id="tools-used" className="mmm-section mmm-container" style={{ paddingTop: 0 }}>
        <h2 className="mmm-section-title" style={{ fontSize: '20px' }}>Tools used in this recipe</h2>
        <div className="mmm-tools-row">
          {tools.map(t => (
            <button key={t.id} className="mmm-tool-chip" style={{ border: 'none', cursor: 'pointer' }} onClick={() => navigate(`/shop/${t.id}`)}>
              {t.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mmm-section mmm-container" style={{ paddingTop: 0 }}>
        <h2 className="mmm-section-title" style={{ fontSize: '20px' }}>Ingredients</h2>
        <ul className="mmm-ingredient-list">
          {recipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
        </ul>
      </section>

      <section id="instructions" className="mmm-section mmm-container" style={{ paddingTop: 0 }}>
        <h2 className="mmm-section-title" style={{ fontSize: '20px' }}>Instructions</h2>
        <ol className="mmm-instruction-list">
          {recipe.instructions.map((step, i) => {
            const calloutTool = step.callout ? getProductById(step.callout.toolId) : null;
            return (
              <li key={i}>
                <p>{step.text}</p>
                {step.callout && (
                  <div className="mmm-recipe-callout">
                    <span>{step.callout.text}</span>
                    {calloutTool && (
                      <button className="mmm-recipe-callout-link" onClick={() => navigate(`/shop/${calloutTool.id}`)}>
                        Shop the {calloutTool.name} →
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mmm-section mmm-container" style={{ paddingTop: 0 }}>
        <h2 className="mmm-section-title" style={{ fontSize: '20px' }}>Tools used in this recipe</h2>
        <div className="mmm-carousel">
          {tools.map(t => (
            <div key={t.id} className="mmm-product-card">
              <div className="mmm-product-image">
                <img src={t.image} alt={t.name} />
              </div>
              <div className="mmm-product-name">{t.name}</div>
              <div className="mmm-product-price-row">
                <span className="mmm-product-price">${t.price.toFixed(2)}</span>
              </div>
              <button className="mmm-btn mmm-btn-primary mmm-btn-sm" onClick={() => navigate(`/shop/${t.id}`)}>View Tool</button>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mmm-section mmm-container" style={{ paddingTop: 0 }}>
          <h2 className="mmm-section-title" style={{ fontSize: '20px' }}>Similar recipes</h2>
          <div className="mmm-recipe-grid">
            {similar.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}

      <EmailCapture />
      <Footer />
    </div>
  );
}
