import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, Printer, Home } from 'lucide-react';
import { SignUpButton } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { guestBuildGrocery } from '../lib/api.js';
import GroceryPaper from '../components/GroceryPaper.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

function checkedKey(planId) { return `grocery-checked-${planId}`; }
function pantryKey(planId)  { return `grocery-pantry-${planId}`; }

function restoreChecked(items, planId) {
  try {
    const saved = JSON.parse(localStorage.getItem(checkedKey(planId)) || '[]');
    const set = new Set(saved);
    return items.map(i => ({ ...i, checked: set.has(i.name) }));
  } catch { return items; }
}
function persistChecked(items, planId) {
  localStorage.setItem(checkedKey(planId), JSON.stringify(items.filter(i => i.checked).map(i => i.name)));
}
function restorePantry(planId) {
  try { return new Set(JSON.parse(localStorage.getItem(pantryKey(planId)) || '[]')); } catch { return new Set(); }
}
function persistPantry(names, planId) {
  localStorage.setItem(pantryKey(planId), JSON.stringify([...names]));
}

function PantryModal({ items, pantryNames, onSave, onClose }) {
  const [selected, setSelected] = useState(new Set(pantryNames));
  function toggle(name) {
    setSelected(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[430px] overflow-y-auto" style={{ maxHeight: '80vh', borderRadius: '24px 24px 0 0', background: 'var(--card)' }}>
        <div className="p-6">
          <div className="w-12 h-1.5 rounded-full mx-auto mb-5" style={{ background: 'var(--border-mid)' }} />
          <h2 className="text-[18px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Already have some? 🏠</h2>
          <p className="text-[13px] mb-5" style={{ color: 'var(--text-mid)' }}>Select items you already have at home.</p>
          <div className="flex flex-col">
            {items.map(item => (
              <label key={item.name} className="flex items-center gap-3 py-3 cursor-pointer" style={{ borderBottom: '1px solid var(--border)' }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ border: '2px solid', borderColor: selected.has(item.name) ? 'var(--accent)' : 'var(--border-mid)', background: selected.has(item.name) ? 'var(--accent)' : 'transparent' }}
                  onClick={() => toggle(item.name)}
                >
                  {selected.has(item.name) && (
                    <svg viewBox="0 0 12 10" fill="none" width={10} height={10}>
                      <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px]" style={{ color: 'var(--text)' }}>{item.quantity} {item.unit} {item.name}</span>
                </div>
                {item.estimated_price != null && (
                  <span className="text-[13px] flex-shrink-0" style={{ color: 'var(--text-light)' }}>${Number(item.estimated_price).toFixed(2)}</span>
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button className="pill-button outline flex-1 justify-center" onClick={onClose}>Cancel</button>
            <button className="pill-button flex-1 justify-center" onClick={() => onSave(selected)}>Done ({selected.size})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestGroceryList() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pantryNames, setPantryNames] = useState(() => restorePantry(planId));
  const [showPantryModal, setShowPantryModal] = useState(false);

  useEffect(() => {
    guestBuildGrocery(planId)
      .then(data => {
        setItems(restoreChecked(data.items || [], planId));
        setEstimatedTotal(data.estimatedTotal || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [planId]);

  function handleToggle(item) {
    setItems(prev => {
      const next = prev.map(i => i.name === item.name && i.category === item.category ? { ...i, checked: !i.checked } : i);
      persistChecked(next, planId);
      return next;
    });
  }

  function handlePantrySave(selected) {
    setPantryNames(selected);
    persistPantry(selected, planId);
    setShowPantryModal(false);
  }

  if (loading) return <LoadingScreen type="grocery" />;

  const visibleItems  = items.filter(i => !pantryNames.has(i.name));
  const pantryTotal   = items.filter(i => pantryNames.has(i.name)).reduce((s, i) => s + Number(i.estimated_price || 0), 0);
  const adjustedTotal = Math.max(0, estimatedTotal - pantryTotal);
  const checkedCount  = visibleItems.filter(i => i.checked).length;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {showPantryModal && <PantryModal items={items} pantryNames={pantryNames} onSave={handlePantrySave} onClose={() => setShowPantryModal(false)} />}

      <div style={{ background: 'var(--accent)', padding: '12px 20px' }} className="text-center">
        <p className="text-white font-semibold text-[13px] mb-1">Want more plans? Sign up for $10/month 🍽️</p>
        <SignUpButton mode="modal">
          <button className="font-semibold text-[12px] px-3 py-1 rounded-full" style={{ background: 'white', color: 'var(--accent)' }}>Sign up →</button>
        </SignUpButton>
      </div>

      <div className="page-pad pt-6 pb-4 flex items-center gap-3 no-print">
        <button className="w-10 h-10 flex items-center justify-center" onClick={() => navigate(`/guest/week/${planId}`)} style={{ borderRadius: '12px', border: '1px solid var(--border-mid)', background: 'var(--bg)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
          {checkedCount > 0 && <p className="text-[13px]" style={{ color: 'var(--text-mid)' }}>{checkedCount} of {visibleItems.length} checked off</p>}
        </div>
      </div>

      {visibleItems.length > 0 && (
        <div className="px-5 mb-3 no-print">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ background: 'var(--accent)', width: `${(checkedCount / visibleItems.length) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="px-5 mb-4 no-print flex items-center gap-2 flex-wrap">
        <button className="pill-button outline text-[13px]" style={{ padding: '8px 16px' }} onClick={() => setShowPantryModal(true)}>
          <Home size={13} /> Already have some?
        </button>
        {pantryNames.size > 0 && (
          <span className="text-[12px] px-3 py-1 rounded-full cursor-pointer" style={{ background: 'var(--bg-warm)', color: 'var(--accent)' }} onClick={() => setShowPantryModal(true)}>
            {pantryNames.size} hidden · ${pantryTotal.toFixed(2)} saved
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-8 mx-5 text-center"><div className="text-4xl mb-3">🛒</div><p className="font-semibold" style={{ color: 'var(--text)' }}>No items yet</p></div>
      ) : (
        <GroceryPaper items={visibleItems} estimatedTotal={adjustedTotal} onToggle={handleToggle} />
      )}

      <div className="page-pad flex gap-3 mt-6 pb-10 no-print">
        <button className="pill-button outline flex-1 justify-center text-[14px]" onClick={() => window.print()}><Printer size={15} /> Print</button>
        <button className="pill-button flex-1 justify-center text-[14px]" onClick={async () => {
          const text = visibleItems.filter(i => !i.checked).map(i => `• ${i.quantity} ${i.unit} ${i.name}`.trim()).join('\n');
          if (navigator.share) await navigator.share({ title: 'Grocery List', text });
          else { await navigator.clipboard.writeText(text); toast.success('Copied!'); }
        }}><Share2 size={15} /> Share</button>
      </div>
    </div>
  );
}
