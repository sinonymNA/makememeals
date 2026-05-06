import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import PillSelector from '../components/PillSelector.jsx';
import ToggleCard from '../components/ToggleCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import PaywallModal from '../components/PaywallModal.jsx';
import { setAuthToken, generateMeals, getPreferences } from '../lib/api.js';
import { ChevronLeft } from 'lucide-react';

const DAY_OPTIONS = ['3', '4', '5', '6', '7'];
const PEOPLE_OPTIONS = ['1', '2', '3', '4', '5', '6+'];

const TOGGLES = [
  { key: 'picky_eaters', emoji: '🥦', label: 'Picky eaters?', description: 'Hides adventurous ingredients' },
  { key: 'keep_mild', emoji: '🌶️', label: 'Keep it mild?', description: 'No spicy dishes' },
  { key: 'meat_free', emoji: '🥩', label: 'Meat-free meals?', description: 'Vegetarian only' },
  { key: 'gluten_free', emoji: '🌾', label: 'Gluten-free?', description: 'No gluten ingredients' },
  { key: 'dairy_free', emoji: '🥛', label: 'Dairy-free?', description: 'No dairy ingredients' },
  { key: 'thirty_min_max', emoji: '⏱️', label: '30 minutes or less?', description: 'Quick weeknight meals' },
];

export default function Setup() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [days, setDays] = useState('5');
  const [people, setPeople] = useState('4');
  const [prefs, setPrefs] = useState({
    picky_eaters: false,
    keep_mild: false,
    meat_free: false,
    gluten_free: false,
    dairy_free: false,
    thirty_min_max: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    async function loadSavedPrefs() {
      try {
        const token = await getToken();
        setAuthToken(token);
        const saved = await getPreferences();
        if (saved && saved.servings) {
          setPeople(String(saved.servings));
          setPrefs({
            picky_eaters: saved.picky_eaters,
            keep_mild: saved.keep_mild,
            meat_free: saved.meat_free,
            gluten_free: saved.gluten_free,
            dairy_free: saved.dairy_free,
            thirty_min_max: saved.thirty_min_max,
          });
        }
      } catch {
        // Silently ignore — user might not have prefs saved yet
      }
    }
    loadSavedPrefs();
  }, [getToken]);

  async function handleGenerate() {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);

      const servings = people === '6+' ? 6 : parseInt(people);
      const numDays = parseInt(days);

      const result = await generateMeals(numDays, servings, prefs, []);

      if (result.error === 'paywall') {
        setShowPaywall(true);
        setLoading(false);
        return;
      }

      // Store in sessionStorage for the swipe screen
      sessionStorage.setItem('swipeData', JSON.stringify({
        planId: result.planId,
        meals: result.meals,
        days: numDays,
        servings,
        prefs,
        confirmed: [],
        excluded: [],
      }));

      navigate('/swipe');
    } catch (err) {
      if (err?.response?.status === 402) {
        setShowPaywall(true);
      } else {
        console.error(err);
        alert('Something went wrong generating meals. Please try again.');
      }
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen type="meals" />;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Header */}
      <div className="page-pad pb-0 flex items-center gap-3 pt-6">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => navigate('/dashboard')}
          style={{ borderRadius: '12px' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[26px] font-black" style={{ color: 'var(--text)' }}>
            Let's plan your week
          </h1>
          <p className="text-[14px] font-semibold" style={{ color: 'var(--text-mid)' }}>
            Takes 30 seconds.
          </p>
        </div>
      </div>

      <div className="page-pad flex flex-col gap-7">
        {/* Days */}
        <div>
          <div className="section-label">How many days?</div>
          <PillSelector options={DAY_OPTIONS} value={days} onChange={setDays} />
        </div>

        {/* People */}
        <div>
          <div className="section-label">How many people?</div>
          <PillSelector options={PEOPLE_OPTIONS} value={people} onChange={setPeople} />
        </div>

        {/* Dietary preferences */}
        <div>
          <div className="section-label">Tell us what to skip 👇</div>
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

        {/* Generate button */}
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
