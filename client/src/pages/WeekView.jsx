import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Clock, RefreshCw, ShoppingCart, BookOpen, ChevronLeft } from 'lucide-react';
import { setAuthToken, getPlan } from '../lib/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeekView() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await getPlan(planId);
        setPlan(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, getToken]);

  if (loading) return <LoadingScreen type="meals" />;

  if (!plan) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="raised p-8 text-center">
          <p className="font-bold text-[17px]" style={{ color: 'var(--text)' }}>Plan not found.</p>
          <button className="pill-button mt-4" onClick={() => navigate('/dashboard')}>Go home</button>
        </div>
      </div>
    );
  }

  const meals = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);
  const totalCost = meals.reduce((s, m) => s + Number(m.estimated_cost || 0), 0);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-5 flex items-center gap-3">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center flex-shrink-0"
          onClick={() => navigate('/dashboard')}
          style={{ borderRadius: '12px' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <div className="text-[12px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            🍽️ Make Me Meals
          </div>
          <h1 className="text-[24px] font-black leading-tight" style={{ color: 'var(--text)' }}>
            This week's lineup
          </h1>
        </div>
        {totalCost > 0 && (
          <div
            className="flex-shrink-0 text-center px-3 py-2 rounded-2xl"
            style={{ background: 'var(--accent-light)' }}
          >
            <div className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>Est. total</div>
            <div className="text-[16px] font-black" style={{ color: 'var(--accent)' }}>~${totalCost.toFixed(0)}</div>
          </div>
        )}
      </div>

      {/* Meal cards */}
      <div className="px-5 flex flex-col gap-3">
        {meals.map((meal) => (
          <div key={meal.id} className="raised p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] flex-shrink-0"
                style={{ background: 'var(--accent-light)' }}
              >
                {meal.emoji || '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--text-light)' }}>
                  {DAYS[meal.day_number - 1] || `Day ${meal.day_number}`}
                </div>
                <div className="text-[15px] font-extrabold leading-tight" style={{ color: 'var(--text)' }}>
                  {meal.name}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}
                  >
                    {meal.difficulty}
                  </span>
                  <span className="flex items-center gap-0.5 text-[12px] font-bold" style={{ color: 'var(--text-light)' }}>
                    <Clock size={11} /> {meal.prep_minutes}m
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-light)' }}>
                    ~${meal.estimated_cost}
                  </span>
                </div>
              </div>
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-light)' }}
                onClick={() => {
                  const swipeData = JSON.parse(sessionStorage.getItem('swipeData') || '{}');
                  sessionStorage.setItem('swipeData', JSON.stringify({
                    ...swipeData, planId, days: 1, confirmed: [],
                    swapMealId: meal.id, swapDayNumber: meal.day_number,
                    excluded: meals.map(m => m.name),
                  }));
                  navigate('/swipe');
                }}
                title="Swap this meal"
              >
                <RefreshCw size={14} style={{ color: 'var(--accent)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="page-pad flex gap-3 mt-6 pb-10">
        <button
          className="pill-button ghost flex-1 justify-center text-[14px]"
          onClick={() => navigate(`/recipes/${planId}`)}
        >
          <BookOpen size={16} /> Recipes
        </button>
        <button
          className="pill-button flex-1 justify-center text-[14px]"
          onClick={() => navigate(`/grocery/${planId}`)}
        >
          <ShoppingCart size={16} /> Grocery List
        </button>
      </div>
    </div>
  );
}
