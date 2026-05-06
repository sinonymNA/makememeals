import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, ChevronRight, Download, Image } from 'lucide-react';
import { setAuthToken, getPlan } from '../lib/api.js';
import { exportAsImage, exportAsPDF } from '../lib/export.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

function PrintableRecipeCard({ meal, id }) {
  return (
    <div
      id={id}
      className="recipe-card-print mx-5"
      style={{
        padding: '24px',
        background: '#FEFEF6',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2 pb-3 mb-3"
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        <span className="text-[13px] font-extrabold" style={{ color: 'var(--accent)' }}>
          🍽️ MAKE ME MEALS
        </span>
      </div>

      {/* Title + emoji */}
      <div className="text-[40px] text-center mb-2">{meal.emoji}</div>
      <h2 className="text-[22px] font-black text-center leading-tight mb-1" style={{ color: 'var(--text)' }}>
        {meal.name}
      </h2>
      <p className="text-center text-[13px] font-semibold mb-3" style={{ color: 'var(--text-mid)' }}>
        Serves {meal.servings || 4} &nbsp;•&nbsp; {meal.prep_minutes} min &nbsp;•&nbsp; {meal.difficulty}
      </p>

      <div style={{ borderBottom: '1.5px solid var(--border)', marginBottom: '14px' }} />

      {/* Ingredients */}
      <div className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
        WHAT YOU NEED
      </div>
      <div className="flex flex-col gap-0.5 mb-4">
        {(meal.ingredients || []).map((ing, i) => (
          <div key={i} className="flex gap-2 text-[13px]" style={{ color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}>•</span>
            <span>{ing.quantity} {ing.unit} {ing.name}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1.5px solid var(--border)', marginBottom: '14px' }} />

      {/* Steps */}
      <div className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
        HOW TO MAKE IT
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {(meal.steps || []).map((step, i) => (
          <div key={i} className="flex gap-2 text-[13px]" style={{ color: 'var(--text)' }}>
            <span
              className="font-black flex-shrink-0"
              style={{ color: 'var(--accent)', minWidth: '16px' }}
            >
              {i + 1}.
            </span>
            <span className="leading-snug">{step}</span>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1.5px solid var(--border)', marginBottom: '10px' }} />

      <p className="text-[11px] italic text-center" style={{ color: 'var(--text-light)' }}>
        Est. ~${meal.estimated_cost} &nbsp;•&nbsp; May be cheaper with store sales 🎉
      </p>
    </div>
  );
}

export default function Recipes() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        setAuthToken(token);
        const plan = await getPlan(planId);
        const sorted = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);
        setMeals(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, getToken]);

  if (loading) return <LoadingScreen type="meals" />;

  const meal = meals[currentIdx];
  if (!meal) return null;

  const cardId = `recipe-card-${currentIdx}`;

  async function handleSaveImage() {
    setExporting(true);
    await exportAsImage(cardId, meal.name.replace(/\s+/g, '-').toLowerCase());
    setExporting(false);
  }

  async function handleSavePDF() {
    setExporting(true);
    await exportAsPDF(meal);
    setExporting(false);
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => navigate(`/week/${planId}`)}
          style={{ borderRadius: '12px' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Recipe Cards</h1>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-mid)' }}>
            {currentIdx + 1} of {meals.length}
          </p>
        </div>
      </div>

      {/* Nav arrows */}
      <div className="flex items-center justify-between px-5 mb-3">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          style={{ borderRadius: '12px', opacity: currentIdx === 0 ? 0.3 : 1 }}
        >
          <ChevronLeft size={18} style={{ color: 'var(--text-mid)' }} />
        </button>

        <div className="flex gap-1.5">
          {meals.map((_, i) => (
            <button
              key={i}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === currentIdx ? 'var(--accent)' : 'var(--border)',
                transform: i === currentIdx ? 'scale(1.3)' : 'scale(1)',
              }}
              onClick={() => setCurrentIdx(i)}
            />
          ))}
        </div>

        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => setCurrentIdx(i => Math.min(meals.length - 1, i + 1))}
          disabled={currentIdx === meals.length - 1}
          style={{ borderRadius: '12px', opacity: currentIdx === meals.length - 1 ? 0.3 : 1 }}
        >
          <ChevronRight size={18} style={{ color: 'var(--text-mid)' }} />
        </button>
      </div>

      {/* Recipe card */}
      <div className="overflow-y-auto">
        <PrintableRecipeCard meal={meal} id={cardId} />
      </div>

      {/* Export buttons */}
      <div className="page-pad flex gap-3 mt-5 pb-10">
        <button
          className="pill-button ghost flex-1 justify-center text-[14px]"
          onClick={handleSaveImage}
          disabled={exporting}
        >
          <Image size={15} /> Save Image
        </button>
        <button
          className="pill-button flex-1 justify-center text-[14px]"
          onClick={handleSavePDF}
          disabled={exporting}
        >
          <Download size={15} /> Save PDF
        </button>
      </div>
    </div>
  );
}
