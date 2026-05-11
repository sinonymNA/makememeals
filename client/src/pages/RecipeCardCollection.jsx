import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Search } from 'lucide-react';
import { setAuthToken, getPlans, getPlan } from '../lib/api.js';
import RecipeCardViewer from '../components/RecipeCardViewer.jsx';
import RecipeCardRenderer from '../components/cards/RecipeCardRenderer.jsx';
import { detectCuisine } from '../lib/detectCuisine.js';

const CUISINE_LABELS = {
  asian:         { label: 'Asian Kitchen',      emoji: '🥢' },
  italian:       { label: 'Italian Trattoria',  emoji: '🍝' },
  latin:         { label: 'Latin Flavors',      emoji: '🌶️' },
  american:      { label: 'American Comfort',   emoji: '🍔' },
  mediterranean: { label: 'Mediterranean',      emoji: '🫒' },
  indian:        { label: 'Indian Spice',        emoji: '🌿' },
  steakhouse:    { label: 'Steakhouse',          emoji: '🥩' },
  healthy:       { label: 'Nourish + Thrive',   emoji: '🌱' },
};

export default function RecipeCardCollection() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const plans = await getPlans();
      const allMeals = [];
      await Promise.all(plans.slice(0, 10).map(async (plan) => {
        try {
          const data = await getPlan(plan.id);
          for (const meal of (data.meals || [])) {
            if (!allMeals.find(m => m.name === meal.name)) {
              allMeals.push({
                ...meal,
                cuisine: meal.cuisine || detectCuisine(meal.name, meal.ingredients),
                planId: plan.id,
              });
            }
          }
        } catch {}
      }));
      setMeals(allMeals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const cuisines = ['all', ...Object.keys(CUISINE_LABELS)];

  const filtered = meals.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.cuisine === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif" }}>
            Recipe Cards
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--text-light)' }}>{meals.length} recipes collected</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search your recipes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full text-[13px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Cuisine filter chips */}
      <div className="px-5 mb-5 overflow-x-auto">
        <div className="flex gap-2" style={{ width: 'max-content' }}>
          {cuisines.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
              style={{
                background: filter === c ? 'var(--accent)' : 'var(--card)',
                color: filter === c ? 'white' : 'var(--text-mid)',
                border: filter === c ? 'none' : '1px solid var(--border)',
              }}
            >
              {c === 'all' ? '✨ All' : `${CUISINE_LABELS[c].emoji} ${CUISINE_LABELS[c].label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-12">
        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--text-light)' }}>
            <div className="text-4xl mb-3">🃏</div>
            <p className="text-[14px]">Loading your recipe cards…</p>
          </div>
        ) : error ? (
          <div className="card p-6 text-center">
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Couldn't load recipes</p>
            <p className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-mid)' }}>{error}</p>
            <button className="pill-button text-[14px]" onClick={load}>Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{search ? '🔍' : '🍽️'}</div>
            <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>
              {search ? 'No recipes found' : 'No recipe cards yet'}
            </p>
            <p className="text-[13px] mt-1 mb-5" style={{ color: 'var(--text-mid)' }}>
              {search ? 'Try a different search' : 'Generate a meal plan to start your collection'}
            </p>
            {!search && (
              <button className="pill-button" onClick={() => navigate('/setup')}>
                Create a Meal Plan ✨
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filtered.map(meal => (
              <button
                key={`${meal.id}-${meal.name}`}
                onClick={() => setSelectedMeal(meal)}
                className="text-left rounded-2xl overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {/* Thumbnail */}
                <div style={{ height: '100px', overflow: 'hidden', position: 'relative', background: 'var(--bg-warm)' }}>
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px">${meal.emoji || '🍽️'}</div>`;
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                      {meal.emoji || '🍽️'}
                    </div>
                  )}
                  {/* Cuisine badge */}
                  {meal.cuisine && CUISINE_LABELS[meal.cuisine] && (
                    <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                      {CUISINE_LABELS[meal.cuisine].emoji}
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[12px] font-semibold leading-tight" style={{ color: 'var(--text)' }}>
                    {meal.name}
                  </p>
                  {meal.prep_minutes && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-light)' }}>
                      {meal.prep_minutes} min
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen card viewer */}
      {selectedMeal && (
        <RecipeCardViewer meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  );
}
