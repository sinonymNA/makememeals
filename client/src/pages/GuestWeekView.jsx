import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart, BookOpen, ChevronLeft } from 'lucide-react';
import { guestGetPlan } from '../lib/api.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { SignUpButton } from '@clerk/clerk-react';
import { DAYS } from '../lib/constants.js';
import { attachImageUrls, getMealImageUrl } from '../lib/imageUrl.js';

export default function GuestWeekView() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestGetPlan(planId)
      .then(data => { data.meals = attachImageUrls(data.meals || []); setPlan(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [planId]);

  if (loading) return <LoadingScreen type="meals" />;
  if (!plan) return null;

  const meals = (plan.meals || []).sort((a, b) => a.day_number - b.day_number);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Sign up banner */}
      <div style={{ background: 'var(--accent)', padding: '12px 20px' }} className="text-center">
        <p className="text-white font-semibold text-[14px] mb-2">Love it? Get unlimited plans for $10/month 🍽️</p>
        <SignUpButton mode="modal">
          <button
            className="font-semibold text-[13px] px-4 py-1.5 rounded-full"
            style={{ background: 'white', color: 'var(--accent)' }}
          >
            Sign up free →
          </button>
        </SignUpButton>
      </div>

      {/* Header */}
      <div className="page-pad pt-6 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center flex-shrink-0"
          onClick={() => navigate('/')}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1
          className="text-[24px] leading-tight"
          style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          This week 🍽️
        </h1>
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
              <div
                className="flex-shrink-0"
                style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-soft)' }}
              >
                <img
                  src={meal.imageUrl || getMealImageUrl(meal.name)}
                  alt={meal.name}
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
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
                    ~${meal.estimated_cost}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="page-pad flex gap-3 mt-6 pb-10">
        <button
          className="pill-button outline flex-1 justify-center text-[14px]"
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
