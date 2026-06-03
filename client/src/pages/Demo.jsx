import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  setAuthToken, getDemoMeals, generateMeals, saveMeals, registerUser,
} from '../lib/api.js';
import { computeDemoSavings } from '../lib/demoSavings.js';
import useDemoSound from '../components/demo/useDemoSound.js';
import DemoEntry from '../components/demo/DemoEntry.jsx';
import DemoSwipe from '../components/demo/DemoSwipe.jsx';
import DemoSavings from '../components/demo/DemoSavings.jsx';
import DemoGate from '../components/demo/DemoGate.jsx';
import { DEMO } from '../components/demo/palette.js';

const DEMO_SERVINGS = 4;
const DEMO_BUDGET = 100;
const STORAGE_KEY = 'demoSelected';

// Interactive demo funnel that replaces the old landing page.
// entry → swipe → savings → gate → (signup) → real plan on /week/:planId
export default function Demo() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const sound = useDemoSound();

  const [screen, setScreen] = useState('entry');
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState([]);
  const [savings, setSavings] = useState(null);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);

  const startedRef = useRef(false);
  const buildStartedRef = useRef(false);

  // Restore in-progress picks (covers any auth flow that remounts the page).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.selected?.length) {
        startedRef.current = true;
        setSelected(saved.selected);
        setSavings(saved.savings || computeDemoSavings(saved.selected));
        setScreen('gate');
      }
    } catch { /* ignore */ }
  }, []);

  // Already-signed-in visitor with no demo in progress → straight to dashboard.
  useEffect(() => {
    if (isLoaded && isSignedIn && !startedRef.current) navigate('/dashboard', { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  // Preload the meal deck so the swipe is instant.
  useEffect(() => {
    let alive = true;
    getDemoMeals(DEMO_SERVINGS)
      .then((d) => { if (alive) setDeck(d.meals || []); })
      .catch(() => { if (alive) setDeck([]); });
    return () => { alive = false; };
  }, []);

  const buildRealPlan = useCallback(async (picks) => {
    setBuilding(true);
    setBuildError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const email = user?.primaryEmailAddress?.emailAddress;
      if (email) await registerUser(email).catch(() => {});

      const prefs = { servings: DEMO_SERVINGS, budget: DEMO_BUDGET, store: 'Any' };
      // generateMeals mints an empty plan (its random meals are ignored); we then
      // overwrite it with exactly the meals they picked in the demo.
      const { planId } = await generateMeals(picks.length, DEMO_SERVINGS, prefs, []);
      await saveMeals(planId, picks, DEMO_SERVINGS);

      localStorage.setItem(`plan-budget-${planId}`, String(DEMO_BUDGET));
      localStorage.setItem(`plan-store-${planId}`, 'Any');
      sessionStorage.removeItem(STORAGE_KEY);

      navigate(`/week/${planId}`, { replace: true });
    } catch (err) {
      console.error('Demo build error:', err);
      if (err?.response?.status === 402) {
        // Returning user out of free plans — drop them in the dashboard instead.
        sessionStorage.removeItem(STORAGE_KEY);
        navigate('/dashboard', { replace: true });
        return;
      }
      setBuildError('We couldn’t finish building your plan. Please try again.');
      setBuilding(false);
    }
  }, [getToken, user, navigate]);

  // The magic moment: as soon as they're authenticated at the gate, turn their
  // demo picks into a real saved plan.
  useEffect(() => {
    if (isSignedIn && screen === 'gate' && selected.length > 0 && !buildStartedRef.current) {
      buildStartedRef.current = true;
      buildRealPlan(selected);
    }
  }, [isSignedIn, screen, selected, buildRealPlan]);

  const handleStart = () => { startedRef.current = true; setScreen('swipe'); };

  const handleSwipeComplete = (finalSelected) => {
    const sv = computeDemoSavings(finalSelected);
    setSelected(finalSelected);
    setSavings(sv);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selected: finalSelected, savings: sv })); } catch { /* ignore */ }
    setScreen('savings');
  };

  const retryBuild = () => { buildStartedRef.current = false; setBuildError(null); buildRealPlan(selected); };

  // Don't flash the entry screen while Clerk decides if they're already in.
  if (!isLoaded && screen === 'entry') {
    return <div style={{ minHeight: '100vh', background: DEMO.cream }} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={building || buildError ? 'building' : screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {building || buildError ? (
          <DemoGate selected={selected} savings={savings} building={building} buildError={buildError} onRetry={retryBuild} />
        ) : screen === 'entry' ? (
          <DemoEntry onStart={handleStart} ready={deck.length > 0} />
        ) : screen === 'swipe' ? (
          <DemoSwipe meals={deck} onComplete={handleSwipeComplete} sound={sound} />
        ) : screen === 'savings' ? (
          <DemoSavings selected={selected} savings={savings} onContinue={() => setScreen('gate')} sound={sound} />
        ) : (
          <DemoGate selected={selected} savings={savings} building={false} buildError={null} onRetry={retryBuild} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
