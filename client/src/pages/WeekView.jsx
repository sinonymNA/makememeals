import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, ShoppingCart, BookOpen, ChevronLeft } from 'lucide-react';
import { setAuthToken, getPlan } from '../lib/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { DAYS } from '../lib/constants.js';
import { attachImageUrls, getMealImageUrl } from '../lib/imageUrl.js';

export default function WeekView() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swapModal, setSwapModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await getPlan(planId);
      data.meals = attachImageUrls(data.meals || []);
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load plan');
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
          <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>Couldn't load this plan</p>
          <p className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-mid)' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button className="pill-button ghost text-[14px]" onClick={() => navigate('/dashboard')}>Go home</button>
            <button className="pill-button text-[14px]" onClick={load}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="card p-8 text-center">
          <p className="font-semibold text-[17px]" style={{ color: 'var(--text)' }}>Plan not found.</p>
          <button className="pill-button mt-4" onClick={() => navigate('/dashboard')}>Go home</button>
        </div>
      </div>
    );
  }

  const meals = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);
  const totalCost = meals.reduce((s, m) => s + Number(m.estimated_cost || 0), 0);

  function confirmSwap(meal) {
    const swipeData = JSON.parse(sessionStorage.getItem('swipeData') || '{}');
    sessionStorage.setItem('swipeData', JSON.stringify({
      ...swipeData, planId, days: 1, confirmed: [],
      swapMealId: meal.id, swapDayNumber: meal.day_number,
      excluded: meals.map(m => m.name),
    }));
    navigate('/swipe');
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Swap confirmation modal */}
      {swapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card p-6 mx-5 max-w-sm text-center">
            <div className="text-3xl mb-3">🔄</div>
            <p className="font-semibold text-[16px] mb-2" style={{ color: 'var(--text)' }}>Swap this meal?</p>
            <p className="text-[14px] mb-5" style={{ color: 'var(--text-mid)' }}>
              We'll find a replacement for <strong>{swapModal.name}</strong>. You can keep swiping until you find one you love.
            </p>
            <div className="flex gap-3">
              <button className="pill-button outline flex-1" onClick={() => setSwapModal(null)}>Keep it</button>
              <button className="pill-button flex-1" onClick={() => confirmSwap(swapModal)}>Find a swap →</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="page-pad pt-10 pb-5 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          onClick={() => navigate('/dashboard')}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <h1
            className="text-[26px] leading-tight"
            style={{ color: 'var(--text)', fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}
          >
            This week 🍽️
          </h1>
        </div>
        {totalCost > 0 && (
          <div
            className="flex-shrink-0 text-center px-3 py-2 rounded-2xl"
            style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)' }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Est.</div>
            <div className="text-[16px] font-semibold" style={{ color: 'var(--accent)' }}>~${totalCost.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Meal cards */}
      <div className="px-5 flex flex-col gap-3">
        {meals.map((meal, i) => (
          <motion.div
            key={meal.id}
            className="card p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              {/* Food thumbnail */}
              <div
                className="flex-shrink-0"
                style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-soft)' }}
              >
                <img
                  src={meal.imageUrl || getMealImageUrl(meal.name)}
                  alt={meal.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'var(--bg-warm)'; e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px">${meal.emoji||'🍽️'}</div>`; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-light)' }}>
                  {DAYS[meal.day_number - 1] || `Day ${meal.day_number}`}
                </div>
                <div className="text-[15px] font-semibold leading-tight" style={{ color: 'var(--text)' }}>
                  {meal.name}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[12px]" style={{ color: 'var(--text-light)' }}>
                    <Clock size={11} /> {meal.prep_minutes}m
                  </span>
                  <span className="text-[12px]" style={{ color: 'var(--text-light)' }}>
                    ~${meal.estimated_cost} · {plan.servings || meal.servings || '?'} servings
                  </span>
                </div>
              </div>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
                onClick={() => setSwapModal(meal)}
                title="Swap this meal"
              >
                <RefreshCw size={14} style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="page-pad flex gap-3 mt-6 pb-10">
        <button className="pill-button outline flex-1 justify-center text-[14px]" onClick={() => navigate(`/recipes/${planId}`)}>
          <BookOpen size={16} /> Recipes
        </button>
        <button className="pill-button flex-1 justify-center text-[14px]" onClick={() => navigate(`/grocery/${planId}`)}>
          <ShoppingCart size={16} /> Grocery List
        </button>
      </div>
    </div>
  );
}
