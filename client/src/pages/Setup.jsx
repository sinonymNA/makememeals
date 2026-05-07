import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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
  { key: 'picky_eaters',  emoji: '🥦', label: 'Picky eaters?',        description: 'Hides adventurous ingredients' },
  { key: 'keep_mild',     emoji: '🌶️', label: 'Keep it mild?',         description: 'No spicy dishes' },
  { key: 'meat_free',     emoji: '🥩', label: 'Meat-free meals?',      description: 'Vegetarian only' },
  { key: 'gluten_free',   emoji: '🌾', label: 'Gluten-free?',          description: 'No gluten ingredients' },
  { key: 'dairy_free',    emoji: '🥛', label: 'Dairy-free?',           description: 'No dairy ingredients' },
  { key: 'thirty_min_max',emoji: '⏱️', label: '30 minutes or less?',   description: 'Quick weeknight meals' },
  { key: 'high_protein',  emoji: '💪', label: 'High protein?',         description: 'Lean meats, legumes, eggs' },
  { key: 'low_waste',     emoji: '♻️', label: 'Low waste?',            description: 'Minimal ingredients, less waste' },
];

function BudgetSlider({ value, onChange }) {
  return (
    <div className="raised-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-[15px]" style={{ color: 'var(--text)' }}>
          💰 Weekly budget
        </span>
        <span
          className="font-black text-[18px] px-3 py-1 rounded-full"
          style={{ background: 'var(--accent)', color: 'white' }}
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
        <span className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>$30</span>
        <span className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>$250</span>
      </div>
    </div>
  );
}

function StorePicker({ value, onChange }) {
  return (
    <div className="raised-sm p-4">
      <div className="font-bold text-[15px] mb-3" style={{ color: 'var(--text)' }}>
        🛒 Where do you shop?
      </div>
      <div className="flex flex-wrap gap-2">
        {STORES.map(s => (
          <button
            key={s}
            type="button"
            className={`pill-option text-[13px] ${value === s ? 'selected' : ''}`}
            style={{ padding: '8px 14px' }}
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
      const numDays   = parseInt(days);
      const fullPrefs = { ...prefs, budget, store, servings };

      let planId, meals;

      if (isGuest) {
        const sessionKey = localStorage.getItem('guestSessionKey') ||
          (() => { const k = crypto.randomUUID(); localStorage.setItem('guestSessionKey', k); return k; })();

        const { default: api } = await import('../lib/api.js');
        const result = await import('../lib/api.js').then(m => m.guestGenerate(sessionKey, numDays, servings, fullPrefs));
        planId = result.planId;
        meals  = result.meals;
        localStorage.setItem('guestPlanId', planId);
      } else {
        const token = await getToken();
        setAuthToken(token);
        // Save preferences silently so they reload next time
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

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pb-0 flex items-center gap-3 pt-6">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => navigate(isGuest ? '/' : '/dashboard')}
          style={{ borderRadius: '12px' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[26px] font-black" style={{ color: 'var(--text)' }}>
            Let's plan your week
          </h1>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--text-mid)' }}>
            {isGuest ? '🎉 One free plan — no sign up needed!' : 'Takes 30 seconds.'}
          </p>
        </div>
      </div>

      <div className="page-pad flex flex-col gap-6">
        {/* Days */}
        <div>
          <div className="section-label">How many days?</div>
          <PillSelector options={isGuest ? ['3'] : DAY_OPTIONS} value={isGuest ? '3' : days} onChange={setDays} />
        </div>

        {/* People */}
        <div>
          <div className="section-label">How many people?</div>
          <PillSelector options={PEOPLE_OPTIONS} value={people} onChange={setPeople} />
        </div>

        {/* Budget */}
        <BudgetSlider value={budget} onChange={setBudget} />

        {/* Store */}
        <StorePicker value={store} onChange={setStore} />

        {/* Dietary preferences */}
        <div>
          <div className="section-label">Dietary preferences 👇</div>
          <div className="flex flex-col gap-3">
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

        <button
          className="pill-button w-full justify-center text-[17px]"
          onClick={handleGenerate}
          style={{ paddingTop: '16px', paddingBottom: '16px' }}
        >
          Generate My Meals ✨
        </button>

        <div className="pb-8" />
      </div>
    </div>
  );
}
