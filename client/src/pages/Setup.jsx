import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import PillSelector from '../components/PillSelector.jsx';
import ToggleCard from '../components/ToggleCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import toast from 'react-hot-toast';
import { setAuthToken, generateMeals, getPreferences, savePreferences } from '../lib/api.js';
import { ChevronLeft } from 'lucide-react';

const DAY_OPTIONS = ['3', '4', '5', '6', '7'];
const PEOPLE_OPTIONS = ['1', '2', '3', '4', '5', '6+'];
const STORES = ['Any', 'Walmart', 'Aldi', 'Kroger', 'Target', 'Costco', "Trader Joe's", 'Whole Foods'];

const TOGGLES = [
  { key: 'picky_eaters',   emoji: '🥦', label: 'Picky eaters?',       description: 'Hides adventurous ingredients' },
  { key: 'keep_mild',      emoji: '🌶️', label: 'Keep it mild?',        description: 'No spicy dishes' },
  { key: 'meat_free',      emoji: '🥩', label: 'Meat-free meals?',     description: 'Vegetarian only' },
  { key: 'gluten_free',    emoji: '🌾', label: 'Gluten-free?',         description: 'No gluten ingredients' },
  { key: 'dairy_free',     emoji: '🥛', label: 'Dairy-free?',          description: 'No dairy ingredients' },
  { key: 'thirty_min_max', emoji: '⏱️', label: '30 minutes or less?',  description: 'Quick weeknight meals' },
  { key: 'high_protein',   emoji: '💪', label: 'High protein?',        description: 'Lean meats, legumes, eggs' },
  { key: 'low_waste',      emoji: '♻️', label: 'Low waste?',           description: 'Minimal ingredients, less waste' },
];

function ProgressDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i < step ? '24px' : '8px',
            height: '8px',
            background: i < step ? 'var(--accent)' : 'var(--border-mid)',
          }}
        />
      ))}
    </div>
  );
}

function BudgetSlider({ value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>
          💰 Weekly budget
        </div>
        <span
          className="font-semibold text-[16px] px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-warm)', color: 'var(--accent)' }}
        >
          ${value}
        </span>
      </div>
      <input
        type="range"
        min={30}
        max={250}
        step={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[12px]" style={{ color: 'var(--text-light)' }}>$30</span>
        <span className="text-[12px]" style={{ color: 'var(--text-light)' }}>$250</span>
      </div>
    </div>
  );
}

function StorePicker({ value, onChange }) {
  return (
    <div>
      <div className="font-semibold text-[15px] mb-3" style={{ color: 'var(--text)' }}>
        🛒 Where do you shop?
      </div>
      <div className="flex flex-wrap gap-2">
        {STORES.map(s => (
          <button
            key={s}
            type="button"
            className={`pill-option ${value === s ? 'selected' : ''}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Setup({ isGuest = false }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [step, setStep] = useState(1);
  const [days, setDays] = useState('5');
  const [people, setPeople] = useState('4');
  const [budget, setBudget] = useState(100);
  const [store, setStore] = useState('Any');
  const [prefs, setPrefs] = useState({
    picky_eaters: false, keep_mild: false, meat_free: false,
    gluten_free: false, dairy_free: false, thirty_min_max: false,
    high_protein: false, low_waste: false,
  });
  const [loading, setLoading] = useState(false);
  const [inspiration, setInspiration] = useState('');
  const [showInspiration, setShowInspiration] = useState(false);

  useEffect(() => {
    if (isGuest) return;
    async function loadSavedPrefs() {
      try {
        const token = await getToken();
        setAuthToken(token);
        const saved = await getPreferences();
        if (saved?.servings) {
          setPeople(String(saved.servings));
          setBudget(saved.budget ?? 100);
          setStore(saved.store ?? 'Any');
          setPrefs({
            picky_eaters: saved.picky_eaters,
            keep_mild: saved.keep_mild,
            meat_free: saved.meat_free,
            gluten_free: saved.gluten_free,
            dairy_free: saved.dairy_free,
            thirty_min_max: saved.thirty_min_max,
            high_protein: saved.high_protein ?? false,
            low_waste: saved.low_waste ?? false,
          });
        }
      } catch { /* No saved prefs yet */ }
    }
    loadSavedPrefs();
  }, [getToken, isGuest]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const servings  = people === '6+' ? 6 : parseInt(people);
      const numDays   = parseInt(isGuest ? '3' : days);
      const fullPrefs = { ...prefs, budget, store, servings, inspirationPrompt: inspiration };

      let planId, meals;

      if (isGuest) {
        const sessionKey = localStorage.getItem('guestSessionKey') ||
          (() => { const k = crypto.randomUUID(); localStorage.setItem('guestSessionKey', k); return k; })();

        const result = await import('../lib/api.js').then(m => m.guestGenerate(sessionKey, numDays, servings, fullPrefs));
        planId = result.planId;
        meals  = result.meals;
        localStorage.setItem('guestPlanId', planId);
      } else {
        const token = await getToken();
        setAuthToken(token);
        savePreferences(fullPrefs).catch(() => {});
        const result = await generateMeals(numDays, servings, fullPrefs, []);
        planId = result.planId;
        meals  = result.meals;
      }

      sessionStorage.setItem('swipeData', JSON.stringify({
        planId, meals, days: numDays, servings,
        prefs: fullPrefs, confirmed: [], excluded: [],
        liked: [], disliked: [], isGuest,
      }));

      navigate('/swipe');
    } catch (err) {
      if (err?.response?.status === 402) {
        toast.error("You've already used your free guest plan! Sign up to continue.");
        navigate('/');
      } else {
        console.error(err);
        toast.error('Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen type="meals" />;

  const TOTAL_STEPS = isGuest ? 2 : 3;

  function handleFinalGenerate() {
    setShowInspiration(false);
    handleGenerate();
  }

  return (
    <div className="app-shell min-h-screen" style={{ background: 'var(--bg)', paddingBottom: '100px' }}>
      {/* Recipe inspiration modal */}
      {showInspiration && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && setShowInspiration(false)}>
          <div className="w-full max-w-[430px] overflow-y-auto" style={{ maxHeight: '90vh', borderRadius: '24px 24px 0 0', background: 'var(--card)' }}>
            <div className="p-6">
              <div className="w-12 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'var(--border-mid)' }} />
              <h2 className="text-[20px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Inspired by a recipe? 🍳</h2>
              <p className="text-[13px] mb-4" style={{ color: 'var(--text-mid)' }}>Describe a dish you saw on TikTok, Instagram, or a blog and we'll create something similar.</p>
              <textarea
                placeholder="e.g., 'Crispy Korean fried chicken with honey butter' or 'creamy tuscan salmon pasta'"
                value={inspiration}
                onChange={(e) => setInspiration(e.target.value)}
                className="w-full p-3 rounded-xl text-[14px] mb-4"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', minHeight: '100px', resize: 'none' }}
              />
              <p className="text-[12px] mb-4" style={{ color: 'var(--text-light)' }}>Skip this if you want surprise meals →</p>
              <div className="flex gap-3">
                <button className="pill-button outline flex-1 justify-center text-[13px]" onClick={() => { setShowInspiration(false); handleGenerate(); }}>Skip</button>
                <button className="pill-button flex-1 justify-center text-[13px]" onClick={handleFinalGenerate}>Let's cook it →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-pad pt-8 pb-0 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => {
            if (step > 1) setStep(s => s - 1);
            else navigate(isGuest ? '/' : '/dashboard');
          }}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-light)' }}>
            {isGuest ? '🎉 One free plan — no sign up needed!' : 'Takes 30 seconds.'}
          </p>
        </div>
      </div>

      <div className="page-pad pt-6">
        <ProgressDots step={step} total={TOTAL_STEPS} />

        <AnimatePresence mode="wait">
          {/* Step 1 — People */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-[40px] text-center mb-3">👥</div>
              <h1
                className="text-[28px] text-center leading-tight mb-8"
                style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                How many people?
              </h1>
              <div className="pill-selector justify-center">
                <PillSelector options={PEOPLE_OPTIONS} value={people} onChange={setPeople} />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Days (auth only) or go straight to step 2 = days for guest */}
          {step === 2 && !isGuest && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-[40px] text-center mb-3">📅</div>
              <h1
                className="text-[28px] text-center leading-tight mb-8"
                style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                How many nights?
              </h1>
              <div className="pill-selector justify-center">
                <PillSelector options={DAY_OPTIONS} value={days} onChange={setDays} />
              </div>
            </motion.div>
          )}

          {/* Step 2 (guest) / Step 3 (auth) — Preferences */}
          {((step === 2 && isGuest) || (step === 3 && !isGuest)) && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-[40px] text-center mb-3">⚙️</div>
              <h1
                className="text-[28px] text-center leading-tight mb-8"
                style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
              >
                Your preferences
              </h1>

              <div className="flex flex-col gap-6">
                <BudgetSlider value={budget} onChange={setBudget} />
                <StorePicker value={store} onChange={setStore} />

                <div>
                  <div className="section-label">Dietary needs</div>
                  {TOGGLES.map(t => (
                    <ToggleCard
                      key={t.key}
                      emoji={t.emoji}
                      label={t.label}
                      description={t.description}
                      value={prefs[t.key]}
                      onChange={val => setPrefs(p => ({ ...p, [t.key]: val }))}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA */}
      <div
        className="fixed bottom-0 left-1/2"
        style={{
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '430px',
          padding: '16px 24px 32px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {step < TOTAL_STEPS ? (
          <button
            className="pill-button w-full justify-center text-[16px]"
            onClick={() => setStep(s => s + 1)}
            style={{ paddingTop: '16px', paddingBottom: '16px' }}
          >
            Continue →
          </button>
        ) : (
          <button
            className="pill-button w-full justify-center text-[16px]"
            onClick={() => !isGuest ? setShowInspiration(true) : handleGenerate()}
            style={{ paddingTop: '16px', paddingBottom: '16px' }}
          >
            Generate My Meals ✨
          </button>
        )}
      </div>
    </div>
  );
}
