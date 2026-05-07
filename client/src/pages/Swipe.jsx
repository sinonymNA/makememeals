import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import SwipeCard from '../components/SwipeCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { setAuthToken, generateMore, saveMeals } from '../lib/api.js';
import { analyzePreferences, buildPreferencePrompt } from '../lib/preferences.js';

function ProgressDots({ total, confirmed }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-all duration-300"
          style={{
            background: i < confirmed ? 'var(--accent)' : 'var(--border)',
            transform: i < confirmed ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

export default function Swipe() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [swipeData, setSwipeData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('swipeData');
    if (!raw) { navigate('/setup'); return; }
    const data = JSON.parse(raw);
    setSwipeData({
      ...data,
      liked: data.liked || [],
      disliked: data.disliked || [],
    });
    setQueue(data.meals || []);
    setConfirmed(data.confirmed || []);
    setCurrentDayIndex(data.confirmed?.length || 0);
  }, [navigate]);

  const fetchMore = useCallback(async () => {
    if (isFetchingMore || !swipeData) return;
    setIsFetchingMore(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const excluded = [
        ...(swipeData.excluded || []),
        ...queue.map(m => m.name),
        ...confirmed.map(m => m.name),
      ];

      // Analyze preferences from what they've liked/disliked
      const prefs = analyzePreferences(swipeData.liked || [], swipeData.disliked || []);
      const prefPrompt = buildPreferencePrompt(prefs);

      const result = await generateMore(
        { servings: swipeData.servings, ...swipeData.prefs, prefPrompt },
        excluded
      );
      setQueue(q => [...q, ...(result.meals || [])]);
    } catch (err) {
      console.error('Failed to fetch more meals:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, swipeData, queue, confirmed, getToken]);

  // Pre-fetch immediately on load so the queue is always full,
  // and again whenever the buffer drops below 3
  useEffect(() => {
    if (!isFetchingMore && swipeData && queue.length < 5) {
      fetchMore();
    }
  }, [queue.length, isFetchingMore, swipeData, fetchMore]);

  async function handleSwipeRight() {
    if (!queue.length) return;

    const meal = queue[0];
    const newConfirmed = [...confirmed, meal];
    const newQueue = queue.slice(1);

    // Track as liked
    setSwipeData(d => ({ ...d, liked: [...(d.liked || []), meal] }));

    // Small burst confetti on card confirm
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#FF6B47', '#7DB87A', '#FAF7F2'],
    });

    setConfirmed(newConfirmed);
    setQueue(newQueue);
    setCurrentDayIndex(newConfirmed.length);

    // All days filled!
    if (newConfirmed.length >= swipeData.days) {
      // Big confetti
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.4 },
        colors: ['#FF6B47', '#7DB87A', '#FAF7F2', '#2C1810', '#FFD700'],
      });
      setTimeout(() => confetti({ particleCount: 150, spread: 180, origin: { y: 0.5 }, colors: ['#FF6B47', '#7DB87A', '#FAF7F2'] }), 600);

      // Save meals and navigate
      setIsSaving(true);
      try {
        const token = await getToken();
        setAuthToken(token);
        console.log('Saving meals:', { planId: swipeData.planId, mealCount: newConfirmed.length, meals: newConfirmed });
        const result = await saveMeals(swipeData.planId, newConfirmed);
        console.log('Save result:', result);
        setTimeout(() => navigate(`/week/${swipeData.planId}`), 2500);
      } catch (err) {
        console.error('Save failed:', err);
        alert(`Failed to save meals: ${err.message}`);
        navigate(`/week/${swipeData.planId}`);
      }
      return;
    }
  }

  function handleSwipeLeft() {
    if (!queue.length) return;
    const meal = queue[0];
    setSwipeData(d => ({
      ...d,
      excluded: [...(d.excluded || []), meal.name],
      disliked: [...(d.disliked || []), meal],
    }));
    setQueue(q => q.slice(1));
  }

  if (!swipeData) return <LoadingScreen type="meals" />;
  if (isSaving) return <LoadingScreen type="meals" />;

  if (!queue.length) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="raised p-8 text-center">
          <div className="text-4xl mb-4">👨‍🍳</div>
          <p className="font-bold text-[17px]" style={{ color: 'var(--text)' }}>
            Loading more options...
          </p>
        </div>
      </div>
    );
  }

  const visibleCards = queue.slice(0, 3);

  return (
    <div
      className="app-shell min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Cartoon mural background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        style={{ mixBlendMode: 'multiply' }}
        viewBox="0 0 430 800"
        preserveAspectRatio="none"
      >
        {/* Playful kitchen elements */}
        <circle cx="50" cy="100" r="40" fill="#FF6B47" opacity="0.3" />
        <circle cx="380" cy="150" r="35" fill="#FFD700" opacity="0.25" />
        <circle cx="100" cy="650" r="50" fill="#7DB87A" opacity="0.2" />
        <circle cx="380" cy="700" r="30" fill="#FF6B47" opacity="0.15" />
        <path d="M 0 200 Q 215 150 430 200 T 430 300 Q 215 350 0 300 Z" fill="#7DB87A" opacity="0.08" />
        <path d="M 0 500 Q 215 480 430 520 T 430 620 Q 215 650 0 600 Z" fill="#FFD700" opacity="0.1" />
        <rect x="30" y="350" width="60" height="80" rx="10" fill="#FF6B47" opacity="0.1" transform="rotate(-15 60 390)" />
        <rect x="340" y="400" width="70" height="60" rx="10" fill="#7DB87A" opacity="0.1" transform="rotate(25 375 430)" />
      </svg>
      {/* Recipe detail modal */}
      <AnimatePresence>
        {expandedMeal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(44,24,16,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setExpandedMeal(null)}
          >
            <motion.div
              className="w-full max-w-[430px] raised overflow-y-auto"
              style={{ maxHeight: '85vh', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: '24px 24px 0 0' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="w-12 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'var(--border)' }} />

                <div className="text-[64px] text-center mb-3">{expandedMeal.emoji}</div>
                <h2 className="text-[22px] font-black text-center mb-1" style={{ color: 'var(--text)' }}>
                  {expandedMeal.name}
                </h2>
                <p className="text-center italic mb-4 text-[14px]" style={{ color: 'var(--text-mid)' }}>
                  {expandedMeal.description}
                </p>

                <div className="section-label">Ingredients</div>
                <div className="flex flex-col gap-1 mb-5">
                  {(expandedMeal.ingredients || []).map((ing, i) => (
                    <div key={i} className="flex gap-2 text-[14px]" style={{ color: 'var(--text)' }}>
                      <span>•</span>
                      <span>{ing.quantity} {ing.unit} {ing.name}</span>
                    </div>
                  ))}
                </div>

                <div className="section-label">Steps</div>
                <div className="flex flex-col gap-3 mb-6">
                  {(expandedMeal.steps || []).map((step, i) => (
                    <div key={i} className="flex gap-3 text-[14px]" style={{ color: 'var(--text)' }}>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="pill-button w-full justify-center mb-2"
                  onClick={() => { setExpandedMeal(null); handleSwipeRight(); }}
                >
                  💚 Love It!
                </button>
                <button
                  className="pill-button red w-full justify-center"
                  onClick={() => { setExpandedMeal(null); handleSwipeLeft(); }}
                >
                  ❌ Not this one
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="page-pad pb-0 pt-8">
        <ProgressDots total={swipeData.days} confirmed={currentDayIndex} />
        <p
          className="text-center text-[14px] font-bold mt-3"
          style={{ color: 'var(--text-mid)' }}
        >
          Day {Math.min(currentDayIndex + 1, swipeData.days)} of {swipeData.days} — pick your dinner
        </p>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center justify-center page-pad py-6">
        <div className="relative w-full" style={{ height: '420px' }}>
          <AnimatePresence>
            {visibleCards.map((meal, i) => (
              <SwipeCard
                key={meal.name + i}
                meal={meal}
                isTop={i === 0}
                stackIndex={i}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onCardClick={() => queue[0] && setExpandedMeal(queue[0])}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Tap hint */}
        <p className="text-[12px] font-semibold mt-2 mb-4" style={{ color: 'var(--text-light)' }}>
          Tap card to see full recipe
        </p>

        {/* Action buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <button
            className="pill-button red flex-1 justify-center"
            onClick={handleSwipeLeft}
          >
            <X size={18} /> NOPE
          </button>
          <button
            className="pill-button green flex-1 justify-center"
            onClick={handleSwipeRight}
          >
            <Heart size={18} fill="white" /> LOVE IT
          </button>
        </div>

        {isFetchingMore && (
          <p className="text-[12px] font-semibold mt-3" style={{ color: 'var(--text-light)' }}>
            Finding more options... 🔍
          </p>
        )}
      </div>
    </div>
  );
}
