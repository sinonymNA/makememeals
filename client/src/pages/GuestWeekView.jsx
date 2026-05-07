import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ShoppingCart, BookOpen } from 'lucide-react';
import { guestGetPlan } from '../lib/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { SignUpButton } from '@clerk/clerk-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function GuestWeekView() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestGetPlan(planId).then(setPlan).catch(console.error).finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <LoadingScreen type="meals" />;
  if (!plan) return null;

  const meals = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Sign up banner */}
      <div style={{ background: 'var(--accent)', padding: '12px 20px' }} className="text-center">
        <p className="text-white font-bold text-[14px] mb-2">Love it? Get unlimited plans for $10/month 🍽️</p>
        <SignUpButton mode="modal">
          <button
            className="font-black text-[13px] px-4 py-1.5 rounded-full"
            style={{ background: 'white', color: 'var(--accent)' }}
          >
            Sign up free →
          </button>
        </SignUpButton>
      </div>

      <div className="page-pad pt-6 pb-2">
        <div className="text-[13px] font-extrabold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
          🍽️ Your guest plan
        </div>
        <h1 className="text-[26px] font-black" style={{ color: 'var(--text)' }}>This week's lineup</h1>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {meals.map(meal => (
          <div key={meal.id} className="raised p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--accent-light)' }}>
                {meal.emoji || '🍽️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-extrabold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-light)' }}>
                  {DAYS[meal.day_number - 1] || `Day ${meal.day_number}`}
                </div>
                <div className="text-[16px] font-extrabold leading-tight truncate" style={{ color: 'var(--text)' }}>
                  {meal.name}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1" style={{ color: 'var(--text-light)' }}>
                    <Clock size={12} />
                    <span className="text-[12px] font-bold">{meal.prep_minutes} min</span>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text-light)' }}>~${meal.estimated_cost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="page-pad flex gap-3 mt-6 pb-10">
        <button
          className="pill-button ghost flex-1 justify-center text-[14px]"
          onClick={() => navigate(`/guest/recipes/${planId}`)}
        >
          <BookOpen size={16} /> Recipes
        </button>
        <button
          className="pill-button flex-1 justify-center text-[14px]"
          onClick={() => navigate(`/guest/grocery/${planId}`)}
        >
          <ShoppingCart size={16} /> Grocery List
        </button>
      </div>
    </div>
  );
}
