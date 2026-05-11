import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, Download, Image, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getPlan } from '../lib/api.js';
import { exportAsImage, exportAsPDF } from '../lib/export.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { getMealImageUrl } from '../lib/imageUrl.js';
import RecipeCardViewer from '../components/RecipeCardViewer.jsx';
import { detectCuisine } from '../lib/detectCuisine.js';

function RecipeDetail({ meal, id }) {
  const imageUrl = meal.imageUrl || getMealImageUrl(meal.name);

  return (
    <div id={id} className="recipe-card-print mx-5" style={{ background: '#FEFEF6' }}>
      {/* Image with gradient overlay */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
        <img
          src={imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(255,254,246,1) 0%, rgba(255,254,246,0.2) 50%, transparent 100%)',
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px' }}>
          <h2
            className="text-[24px] leading-tight"
            style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            {meal.name}
          </h2>
        </div>
        {/* Brand badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--accent)' }}
          >
            🍽️ MAKE ME MEALS
          </span>
        </div>
      </div>

      <div style={{ padding: '20px 24px 24px' }}>
        {/* Meta chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}>
            {meal.prep_minutes} min
          </span>
          <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}>
            Serves {meal.servings || 4}
          </span>
          <span className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}>
            {meal.difficulty}
          </span>
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '16px' }} />

        {/* Ingredients */}
        <div className="section-label">What you need</div>
        <div className="flex flex-col gap-1.5 mb-5">
          {(meal.ingredients || []).map((ing, i) => (
            <div key={i} className="flex gap-2 text-[13px]" style={{ color: 'var(--text)' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
              <span>
                <span className="font-semibold">{ing.quantity} {ing.unit}</span> {ing.name}
              </span>
            </div>
          ))}
        </div>

        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '16px' }} />

        {/* Steps */}
        <div className="section-label">How to make it</div>
        <div className="flex flex-col gap-3 mb-5">
          {(meal.steps || []).map((step, i) => (
            <div key={i} className="flex gap-3 text-[13px]" style={{ color: 'var(--text)' }}>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Cost callout */}
        <div
          style={{
            background: 'var(--bg-warm)',
            borderLeft: '3px solid var(--accent)',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <p className="text-[12px] italic" style={{ color: 'var(--text-mid)' }}>
            Est. ~${meal.estimated_cost} for {meal.servings || 4} people · May be cheaper with store sales 🎉
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Recipes() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showCardViewer, setShowCardViewer] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const plan = await getPlan(planId);
      const sorted = (plan.meals || [])
        .map(m => ({
          ...m,
          ingredients: typeof m.ingredients === 'string' ? JSON.parse(m.ingredients) : (m.ingredients || []),
          steps: typeof m.steps === 'string' ? JSON.parse(m.steps) : (m.steps || []),
        }))
        .sort((a, b) => a.day_number - b.day_number);
      setMeals(sorted);
    } catch (err) {
      console.error('Recipe load error:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [planId, getToken]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingScreen type="meals" />;

  if (error) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">😕</div>
          <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>Couldn't load recipes</p>
          <p className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-mid)' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button className="pill-button ghost text-[14px]" onClick={() => navigate(`/week/${planId}`)}>Back</button>
            <button className="pill-button text-[14px]" onClick={load}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>No recipes yet</p>
          <p className="text-[14px] mt-2" style={{ color: 'var(--text-mid)' }}>Create a meal plan to see recipes.</p>
          <button className="pill-button mt-6" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  const meal = meals[currentIdx];
  if (!meal) return null;
  const cardId = `recipe-card-${currentIdx}`;

  async function handleSaveImage() {
    setExporting(true);
    try {
      await exportAsImage(cardId, meal.name.replace(/\s+/g, '-').toLowerCase());
      toast.success('Image saved!');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  }

  async function handleSavePDF() {
    setExporting(true);
    try {
      await exportAsPDF(meal);
      toast.success('PDF saved!');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => navigate(`/week/${planId}`)}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Recipe Cards</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-mid)' }}>{currentIdx + 1} of {meals.length}</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-5 mb-3">
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', opacity: currentIdx === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={18} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex gap-1.5">
          {meals.map((_, i) => (
            <button
              key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === currentIdx ? 'var(--accent)' : 'var(--border-mid)', transform: i === currentIdx ? 'scale(1.3)' : 'scale(1)' }}
              onClick={() => setCurrentIdx(i)}
            />
          ))}
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => setCurrentIdx(i => Math.min(meals.length - 1, i + 1))}
          disabled={currentIdx === meals.length - 1}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', opacity: currentIdx === meals.length - 1 ? 0.3 : 1 }}
        >
          <ChevronRight size={18} style={{ color: 'var(--text-mid)' }} />
        </button>
      </div>

      {/* Recipe card */}
      <div className="overflow-y-auto">
        <RecipeDetail meal={meal} id={cardId} />
      </div>

      {/* Export */}
      <div className="page-pad flex gap-2 mt-5 pb-10">
        <button className="pill-button outline flex-1 justify-center text-[13px] min-w-0" onClick={handleSaveImage} disabled={exporting}>
          <Image size={14} /> Image
        </button>
        <button className="pill-button outline flex-1 justify-center text-[13px] min-w-0" onClick={handleSavePDF} disabled={exporting}>
          <Download size={14} /> PDF
        </button>
        <button
          className="pill-button flex-1 justify-center text-[13px] min-w-0"
          onClick={() => setShowCardViewer(true)}
          style={{ background: 'var(--accent)' }}
        >
          <Sparkles size={14} /> Art Card
        </button>
      </div>

      {showCardViewer && (
        <RecipeCardViewer
          meal={{
            ...meal,
            imageUrl: meal.imageUrl || getMealImageUrl(meal.name, meal.pexels_query),
            cuisine: meal.cuisine || detectCuisine(meal.name, meal.ingredients),
          }}
          onClose={() => setShowCardViewer(false)}
        />
      )}
    </div>
  );
}
