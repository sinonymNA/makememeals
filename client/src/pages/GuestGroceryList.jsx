import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, Printer } from 'lucide-react';
import { SignUpButton } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { guestBuildGrocery } from '../lib/api.js';
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

export default function GuestGroceryList() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestBuildGrocery(planId)
      .then(data => {
        const withChecked = restoreChecked(data.items || [], planId);
        setItems(withChecked);
        setEstimatedTotal(data.estimatedTotal || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [planId]);

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

  if (loading) return <LoadingScreen type="grocery" />;

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Sign up banner */}
      <div style={{ background: 'var(--accent)', padding: '12px 20px' }} className="text-center">
        <p className="text-white font-semibold text-[13px] mb-1">Want more plans? Sign up for $10/month 🍽️</p>
        <SignUpButton mode="modal">
          <button className="font-semibold text-[12px] px-3 py-1 rounded-full" style={{ background: 'white', color: 'var(--accent)' }}>
            Sign up →
          </button>
        </SignUpButton>
      </div>

      {/* Header */}
      <div className="page-pad pt-6 pb-4 flex items-center gap-3 no-print">
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => navigate(`/guest/week/${planId}`)}
          style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
          {checkedCount > 0 && (
            <p className="text-[13px]" style={{ color: 'var(--text-mid)' }}>
              {checkedCount} of {items.length} checked off
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="px-5 mb-4 no-print">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ background: 'var(--accent)', width: `${(checkedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 mx-5 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>No items yet</p>
        </div>
      ) : (
        <GroceryPaper items={items} estimatedTotal={estimatedTotal} onToggle={handleToggle} />
      )}

      <div className="page-pad flex gap-3 mt-6 pb-10 no-print">
        <button className="pill-button outline flex-1 justify-center text-[14px]" onClick={() => window.print()}>
          <Printer size={15} /> Print
        </button>
        <button className="pill-button flex-1 justify-center text-[14px]" onClick={async () => {
          const text = items.filter(i => !i.checked).map(i => `• ${i.quantity} ${i.unit} ${i.name}`.trim()).join('\n');
          if (navigator.share) await navigator.share({ title: 'Grocery List', text });
          else { await navigator.clipboard.writeText(text); toast.success('Copied!'); }
        }}>
          <Share2 size={15} /> Share
        </button>
      </div>
    </div>
  );
}
