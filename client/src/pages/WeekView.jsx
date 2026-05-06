import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Clock, RefreshCw, ShoppingCart, BookOpen } from 'lucide-react';
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
          <button className="pill-button mt-4" onClick={() => navigate('/dashboard')}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  const meals = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-4">
        <div
          className="text-[13px] font-extrabold uppercase tracking-widest mb-1"
          style={{ color: 'var(--accent)' }}
        >
          🍽️ Make Me Meals
        </div>
        <h1 className="text-[28px] font-black" style={{ color: 'var(--text)' }}>
          This week's lineup 🍽️
        </h1>
      </div>

      {/* Meal cards */}
      <div className="px-5 flex flex-col gap-4">
        {meals.map((meal, i) => (
          <div key={meal.id} className="raised p-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--accent-light)' }}
              >
                {meal.emoji || '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] font-extrabold uppercase tracking-wide mb-0.5"
                  style={{ color: 'var(--text-light)' }}
                >
                  {DAYS[meal.day_number - 1] || `Day ${meal.day_number}`}
                </div>
                <div
                  className="text-[16px] font-extrabold leading-tight truncate"
                  style={{ color: 'var(--text)' }}
                >
                  {meal.name}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1" style={{ color: 'var(--text-light)' }}>
                    <Clock size={12} />
                    <span className="text-[12px] font-bold">{meal.prep_minutes} min</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-light)' }}>
                    ~${meal.estimated_cost}
                  </span>
                </div>
              </div>
              <button
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
                onClick={() => {
                  // Store swap context and navigate to swipe for this day
                  const swipeData = JSON.parse(sessionStorage.getItem('swipeData') || '{}');
                  sessionStorage.setItem('swipeData', JSON.stringify({
                    ...swipeData,
                    planId,
                    days: 1,
                    confirmed: [],
                    swapMealId: meal.id,
                    swapDayNumber: meal.day_number,
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
