import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import SwipeCard from '../components/SwipeCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { setAuthToken, generateMore, saveMeals, guestSave } from '../lib/api.js';
import { analyzePreferences, buildPreferencePrompt } from '../lib/preferences.js';
import { attachImageUrls } from '../lib/imageUrl.js';

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
  const [lastDiscarded, setLastDiscarded] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('swipeData');
    if (!raw) { navigate('/setup'); return; }
    const data = JSON.parse(raw);
    const mealsWithImages = attachImageUrls(data.meals || []);
    setSwipeData({ ...data, liked: data.liked || [], disliked: data.disliked || [] });
    setQueue(mealsWithImages);
    setConfirmed(data.confirmed || []);
    setCurrentDayIndex(data.confirmed?.length || 0);
  }, [navigate]);

  useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }, []);

  const fetchMore = useCallback(async () => {
    if (isFetchingMore || !swipeData) return;
    setIsFetchingMore(true);
    try {
      if (!swipeData.isGuest) {
        const token = await getToken();
        setAuthToken(token);
      }
      const excluded = [
        ...(swipeData.excluded || []),
        ...queue.map(m => m.name),
        ...confirmed.map(m => m.name),
      ];
      const prefs = analyzePreferences(swipeData.liked || [], swipeData.disliked || []);
      const prefPrompt = buildPreferencePrompt(prefs);
      const result = await generateMore(
        { servings: swipeData.servings, ...swipeData.prefs, prefPrompt },
        excluded
      );
      const newMeals = attachImageUrls(result.meals || []);
      setQueue(q => [...q, ...newMeals]);
    } catch (err) {
      console.error('Failed to fetch more meals:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, swipeData, queue, confirmed, getToken]);

  useEffect(() => {
    if (!isFetchingMore && swipeData && queue.length < 5) fetchMore();
  }, [queue.length, isFetchingMore, swipeData, fetchMore]);

  async function handleSwipeRight() {
    if (!queue.length) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    setLastDiscarded(null);

    const meal = queue[0];
    const newConfirmed = [...confirmed, meal];
    const newQueue = queue.slice(1);
    setSwipeData(d => ({ ...d, liked: [...(d.liked || []), meal] }));

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 }, colors: ['#FF6B47', '#2ECC71'] });
    setConfirmed(newConfirmed);
    setQueue(newQueue);
    setCurrentDayIndex(newConfirmed.length);

    if (newConfirmed.length >= swipeData.days) {
      confetti({ particleCount: 200, spread: 160, origin: { y: 0.4 }, colors: ['#FF6B47', '#2ECC71', '#FFB830'] });
      setTimeout(() => confetti({ particleCount: 150, spread: 180, origin: { y: 0.5 }, colors: ['#FF6B47', '#2ECC71'] }), 600);

      setIsSaving(true);
      try {
        const token = await getToken();
        setAuthToken(token);
        swipeData.isGuest
          ? await guestSave(swipeData.planId, newConfirmed)
          : await saveMeals(swipeData.planId, newConfirmed);
        const dest = swipeData.isGuest ? `/guest/week/${swipeData.planId}` : `/week/${swipeData.planId}`;
        setTimeout(() => navigate(dest), 2500);
      } catch (err) {
        console.error('Save failed:', err);
        toast.error(`Failed to save meals: ${err.message}`);
        navigate(`/week/${swipeData.planId}`);
      }
    }
  }

  function handleSwipeLeft() {
    if (!queue.length) return;
    const meal = queue[0];
    setLastDiscarded(meal);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => { setShowUndo(false); setLastDiscarded(null); }, 3000);
    setSwipeData(d => ({ ...d, excluded: [...(d.excluded || []), meal.name], disliked: [...(d.disliked || []), meal] }));
    setQueue(q => q.slice(1));
  }

  function handleUndo() {
    if (!lastDiscarded) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    setQueue(q => [lastDiscarded, ...q]);
    setSwipeData(d => ({
      ...d,
      excluded: (d.excluded || []).filter(n => n !== lastDiscarded.name),
      disliked: (d.disliked || []).filter(m => m.name !== lastDiscarded.name),
    }));
    setLastDiscarded(null);
  }

  if (!swipeData || isSaving) return <LoadingScreen type="meals" />;

  if (!queue.length) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen page-pad">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">👨‍🍳</div>
          <p className="font-semibold text-[17px]" style={{ color: 'var(--text)' }}>Loading more options...</p>
        </div>
      </div>
    );
  }

  const visibleCards = queue.slice(0, 3);

  return (
    <div className="app-shell min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Recipe detail modal */}
      <AnimatePresence>
        {expandedMeal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setExpandedMeal(null)}
          >
            <motion.div
              className="w-full max-w-[430px] overflow-y-auto"
              style={{ maxHeight: '85vh', borderRadius: '24px 24px 0 0', background: 'var(--card)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6">
                <div className="w-12 h-1.5 rounded-full mx-auto mb-6" style={{ background: 'var(--border-mid)' }} />
                <h2
                  className="text-[22px] text-center mb-1"
                  style={{ color: 'var(--text)', fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}
                >
                  {expandedMeal.name}
                </h2>
                <p className="text-center italic mb-5 text-[14px]" style={{ color: 'var(--text-mid)' }}>
                  {expandedMeal.description}
                </p>
                <div className="section-label">Ingredients</div>
                <div className="flex flex-col gap-1 mb-5">
                  {(expandedMeal.ingredients || []).map((ing, i) => (
                    <div key={i} className="flex gap-2 text-[14px]" style={{ color: 'var(--text)' }}>
                      <span style={{ color: 'var(--accent)' }}>•</span>
                      <span>{ing.quantity} {ing.unit} {ing.name}</span>
                    </div>
                  ))}
                </div>
                <div className="section-label">Steps</div>
                <div className="flex flex-col gap-3 mb-6">
                  {(expandedMeal.steps || []).map((step, i) => (
                    <div key={i} className="flex gap-3 text-[14px]" style={{ color: 'var(--text)' }}>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
                <button className="pill-button green w-full justify-center mb-3" onClick={() => { setExpandedMeal(null); handleSwipeRight(); }}>
                  <Heart size={16} fill="white" /> Love It!
                </button>
                <button className="pill-button red w-full justify-center" onClick={() => { setExpandedMeal(null); handleSwipeLeft(); }}>
                  <X size={16} /> Not this one
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with progress bar */}
      <div className="pt-10 px-6 pb-2">
        <p className="text-center text-[13px] mb-3" style={{ color: 'var(--text-mid)' }}>
          Day {Math.min(currentDayIndex + 1, swipeData.days)} of {swipeData.days}
        </p>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ background: 'var(--accent)', width: `${(currentDayIndex / swipeData.days) * 100}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <div className="relative w-full" style={{ height: '440px' }}>
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

        <p className="text-[12px] mt-2 mb-4" style={{ color: 'var(--text-light)' }}>
          Tap card to see full recipe
        </p>

        {/* Action buttons */}
        <div className="flex gap-4 w-full max-w-xs">
          <button
            className="flex-1 flex items-center justify-center gap-2 font-semibold text-[15px]"
            style={{
              padding: '16px',
              border: '1.5px solid var(--border-mid)',
              borderRadius: '9999px',
              background: 'var(--bg)',
              color: 'var(--text-mid)',
              cursor: 'pointer',
            }}
            onClick={handleSwipeLeft}
          >
            <X size={18} /> Skip
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 font-semibold text-[15px]"
            style={{
              padding: '16px',
              borderRadius: '9999px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255,107,71,0.4)',
            }}
            onClick={handleSwipeRight}
          >
            <Heart size={18} fill="white" /> Love It
          </button>
        </div>

        {/* Undo */}
        <AnimatePresence>
          {showUndo && (
            <motion.button
              className="pill-button ghost mt-3"
              style={{ fontSize: '14px', paddingTop: '10px', paddingBottom: '10px' }}
              onClick={handleUndo}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <RotateCcw size={15} /> Undo
            </motion.button>
          )}
        </AnimatePresence>

        <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence>
            {isFetchingMore && (
              <motion.p
                className="text-[12px]"
                style={{ color: 'var(--text-light)', margin: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Finding more options...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
