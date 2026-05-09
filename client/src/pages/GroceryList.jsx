import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Share2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, buildGroceryList } from '../lib/api.js';
import GroceryPaper from '../components/GroceryPaper.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

function checkedKey(planId) { return `grocery-checked-${planId}`; }

function restoreChecked(items, planId) {
  try {
    const saved = JSON.parse(localStorage.getItem(checkedKey(planId)) || '[]');
    const set = new Set(saved);
    return items.map(i => ({ ...i, checked: set.has(i.name) }));
  } catch { return items; }
}

function persistChecked(items, planId) {
  const checked = items.filter(i => i.checked).map(i => i.name);
  localStorage.setItem(checkedKey(planId), JSON.stringify(checked));
}

export default function GroceryList() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [items, setItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await buildGroceryList(planId);
      const withChecked = restoreChecked(data.items || [], planId);
      setItems(withChecked);
      setEstimatedTotal(data.estimatedTotal || 0);
    } catch (err) {
      console.error('Grocery load error:', err);
      setError(err.message || 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  }, [planId, getToken]);

  useEffect(() => { load(); }, [load]);

  function handleToggle(item) {
    setItems(prev => {
      const next = prev.map(i =>
        i.name === item.name && i.category === item.category
          ? { ...i, checked: !i.checked }
          : i
      );
      persistChecked(next, planId);
      return next;
    });
  }

  async function handleShare() {
    const text = items
      .filter(i => !i.checked)
      .map(i => `• ${i.quantity} ${i.unit} ${i.name}`.trim())
      .join('\n');

    const shareText = `🛒 Grocery List\n\n${text}\n\nEstimated total: ~$${estimatedTotal?.toFixed(2)}\n\nMade with MakeMeMeals.com`;

    if (navigator.share) {
      try { await navigator.share({ title: 'My Grocery List', text: shareText }); }
      catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Grocery list copied!');
    }
  }

  if (loading) return <LoadingScreen type="grocery" />;

  if (error) {
    return (
      <div className="app-shell" style={{ background: 'var(--bg)' }}>
        <div className="page-pad pt-8 pb-4 flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center" onClick={() => navigate(`/week/${planId}`)} style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
          </button>
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
        </div>
        <div className="card p-6 mx-5 text-center">
          <div className="text-4xl mb-3">😕</div>
          <p className="font-bold text-[15px]" style={{ color: 'var(--text)' }}>Couldn't load grocery list</p>
          <p className="text-[13px] font-semibold mt-1 mb-4" style={{ color: 'var(--text-mid)' }}>{error}</p>
          <button className="pill-button text-[14px]" onClick={load}>Try again</button>
        </div>
      </div>
    );
  }

  const checkedCount = items.filter(i => i.checked).length;

  if (items.length === 0) {
    return (
      <div className="app-shell" style={{ background: 'var(--bg)' }}>
        <div className="page-pad pt-8 pb-4 flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center" onClick={() => navigate(`/week/${planId}`)} style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
          </button>
          <div>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
          </div>
        </div>
        <div className="card p-8 mx-5 text-center mt-8">
          <div className="text-4xl mb-3">🛒</div>
          <p className="font-bold text-[16px]" style={{ color: 'var(--text)' }}>No items yet</p>
          <p className="text-[14px] font-semibold mt-2" style={{ color: 'var(--text-mid)' }}>Complete your meal plan to build a grocery list.</p>
          <button className="pill-button mt-6" onClick={() => navigate(`/week/${planId}`)}>Back to week view</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-4 flex items-center gap-3 no-print">
        <button className="w-10 h-10 flex items-center justify-center" onClick={() => navigate(`/week/${planId}`)} style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
          {checkedCount > 0 && (
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-mid)' }}>
              {checkedCount} of {items.length} checked off
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-4 no-print">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ background: 'var(--accent-green)', width: `${(checkedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      <GroceryPaper items={items} estimatedTotal={estimatedTotal} onToggle={handleToggle} />

      {/* Action buttons */}
      <div className="page-pad flex gap-3 mt-6 pb-10 no-print">
        <button className="pill-button ghost flex-1 justify-center text-[14px]" onClick={handleShare}>
          <Share2 size={15} /> Share List
        </button>
        <button className="pill-button flex-1 justify-center text-[14px]" onClick={() => window.print()}>
          <Printer size={15} /> Print List
        </button>
      </div>
    </div>
  );
}
