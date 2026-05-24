import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Search, Upload, X, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getPlans, getPlan, getRecipeCards, uploadRecipeCard, deleteRecipeCard } from '../lib/api.js';
import RecipeCardViewer from '../components/RecipeCardViewer.jsx';
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

function MealCard({ meal, onClick, onDelete, showDelete }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', position: 'relative', width: '100%' }}
    >
      {showDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 2, background: 'rgba(231,76,60,0.9)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Trash2 size={11} color="white" />
        </button>
      )}
      {meal.source === 'admin' && (
        <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 2, background: 'var(--accent)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>
          FEATURED
        </div>
      )}
      <div style={{ height: '110px', overflow: 'hidden', position: 'relative', background: 'var(--bg-warm)' }}>
        {meal.imageUrl || meal.image_url ? (
          <img
            src={meal.imageUrl || meal.image_url}
            alt={meal.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:38px">${meal.emoji || '🍽️'}</div>`;
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px' }}>
            {meal.emoji || '🍽️'}
          </div>
        )}
        {meal.cuisine && CUISINE_LABELS[meal.cuisine] && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '8px 8px 4px', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '14px' }}>{CUISINE_LABELS[meal.cuisine].emoji}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', margin: '0 0 2px', fontFamily: "'Playfair Display', serif" }}>
          {meal.name}
        </p>
        {(meal.prep_minutes) && (
          <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: 0 }}>
            ⏱ {meal.prep_minutes} min
          </p>
        )}
      </div>
    </button>
  );
}

export default function RecipeCardCollection() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [tab, setTab] = useState('mine');  // 'mine' | 'upload'
  const [meals, setMeals] = useState([]);
  const [uploadedCards, setUploadedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);

      // Load AI-generated meals from past plans
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

      // Load uploaded recipe cards
      const cards = await getRecipeCards();
      setUploadedCards(cards);
    } catch (err) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  // Combine meals + uploaded cards for "browse" view
  const allItems = [
    ...uploadedCards.map(c => ({ ...c, imageUrl: c.image_url, isUploaded: true })),
    ...meals.map(m => ({ ...m, isUploaded: false })),
  ];

  const cuisines = ['all', ...Object.keys(CUISINE_LABELS)];
  const filtered = allItems.filter(m => {
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.cuisine === filter;
    return matchSearch && matchFilter;
  });

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!previewFile) { toast.error('Choose an image first'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', previewFile);
      const card = await uploadRecipeCard(formData);
      setUploadedCards(prev => [card, ...prev]);
      setPreviewFile(null);
      setPreviewUrl(null);
      toast.success(`"${card.name}" extracted and saved!`);
      setTab('mine');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRecipeCard(id);
      setUploadedCards(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Recipe card removed');
    } catch {
      toast.error('Failed to delete card');
    }
  }

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
        <div className="flex-1">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Recipe Cards
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>{allItems.length} recipes</p>
        </div>
        <button
          onClick={() => setTab('upload')}
          className="pill-button"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Upload size={14} /> Upload
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div style={{ display: 'flex', background: 'var(--bg-soft)', borderRadius: '12px', padding: '4px' }}>
          {[
            { key: 'mine', label: 'Browse All' },
            { key: 'upload', label: 'Upload Card' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                background: tab === t.key ? 'var(--card)' : 'transparent',
                color: tab === t.key ? 'var(--text)' : 'var(--text-light)',
                boxShadow: tab === t.key ? 'var(--shadow)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'mine' ? (
        <>
          {/* Search */}
          <div className="px-5 mb-4">
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search recipes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '9999px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '13px', color: 'var(--text)', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Cuisine filter */}
          <div className="px-5 mb-5 overflow-x-auto">
            <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
              {cuisines.map(c => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{
                    padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
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
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🃏</div>
                <p style={{ fontSize: '14px' }}>Loading recipe cards…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{search ? '🔍' : '🍽️'}</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
                  {search ? 'No recipes found' : 'No recipe cards yet'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', margin: '0 0 16px' }}>
                  {search ? 'Try a different search' : 'Generate a meal plan or upload a recipe card'}
                </p>
                {!search && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="pill-button" onClick={() => navigate('/setup')}>
                      ✨ Create Meal Plan
                    </button>
                    <button className="pill-button outline" onClick={() => setTab('upload')}>
                      <Upload size={14} /> Upload Card
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '12px' }}>
                {filtered.map(meal => (
                  <MealCard
                    key={`${meal.id}-${meal.name}`}
                    meal={meal}
                    onClick={() => setSelectedMeal(meal)}
                    showDelete={meal.isUploaded}
                    onDelete={() => setDeleteConfirm(meal.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Upload tab */
        <div className="px-5 pb-12">
          <div className="card p-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
              Upload a Recipe Card
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Photograph any recipe card — handwritten, printed, or from a cookbook. Our AI will extract the ingredients and steps automatically.
            </p>

            {/* Image drop zone */}
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: '2px dashed var(--border-mid)', borderRadius: '16px', padding: '32px', textAlign: 'center', cursor: 'pointer',
                background: previewUrl ? 'transparent' : 'var(--bg-soft)',
                marginBottom: '16px', overflow: 'hidden', position: 'relative', minHeight: '160px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '12px', objectFit: 'contain' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setPreviewFile(null); setPreviewUrl(null); }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} color="white" />
                  </button>
                </>
              ) : (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📸</div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>Tap to choose a photo</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>JPG, PNG, or HEIC · Max 15MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {previewUrl && (
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-warm)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-mid)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🤖</span>
                  AI will read the recipe name, ingredients, steps, and cooking tips from this image.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="pill-button outline flex-1 justify-center"
                onClick={() => { setTab('mine'); setPreviewFile(null); setPreviewUrl(null); }}
              >
                Cancel
              </button>
              <button
                className="pill-button flex-1 justify-center"
                onClick={handleUpload}
                disabled={uploading || !previewFile}
              >
                {uploading ? (
                  <>🔍 Extracting recipe…</>
                ) : (
                  <><Check size={16} /> Save Recipe Card</>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-4 mt-4">
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>📷 Tips for best results</p>
            <ul style={{ fontSize: '12px', color: 'var(--text-mid)', margin: 0, paddingLeft: '16px', lineHeight: 1.8 }}>
              <li>Lay the card flat with good lighting</li>
              <li>Make sure all text is in focus</li>
              <li>Handwritten cards work great too</li>
              <li>Use the camera in landscape for full-page recipes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Recipe card viewer */}
      {selectedMeal && (
        <RecipeCardViewer meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card p-6 mx-5 max-w-sm text-center">
            <p style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>Remove recipe card?</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '20px' }}>This will delete your uploaded card permanently.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="pill-button outline flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="pill-button flex-1" style={{ background: '#E74C3C' }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
