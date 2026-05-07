import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, Printer } from 'lucide-react';
import { SignUpButton } from '@clerk/clerk-react';
import { guestBuildGrocery } from '../lib/api.js';
import GroceryPaper from '../components/GroceryPaper.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function GuestGroceryList() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestBuildGrocery(planId)
      .then(data => { setItems(data.items || []); setEstimatedTotal(data.estimatedTotal || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [planId]);

  function handleToggle(item) {
    setItems(prev => prev.map(i => i.name === item.name && i.category === item.category ? { ...i, checked: !i.checked } : i));
  }

  if (loading) return <LoadingScreen type="grocery" />;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      <div style={{ background: 'var(--accent)', padding: '12px 20px' }} className="text-center">
        <p className="text-white font-bold text-[13px] mb-1">Want more plans? Sign up for $10/month 🍽️</p>
        <SignUpButton mode="modal">
          <button className="font-black text-[12px] px-3 py-1 rounded-full" style={{ background: 'white', color: 'var(--accent)' }}>
            Sign up →
          </button>
        </SignUpButton>
      </div>

      <div className="page-pad pt-6 pb-4 flex items-center gap-3 no-print">
        <button className="w-10 h-10 raised-sm flex items-center justify-center" onClick={() => navigate(`/guest/week/${planId}`)} style={{ borderRadius: '12px' }}>
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
      </div>

      {items.length === 0 ? (
        <div className="raised p-8 mx-5 text-center"><div className="text-4xl mb-3">🛒</div><p className="font-bold">No items yet</p></div>
      ) : (
        <GroceryPaper items={items} estimatedTotal={estimatedTotal} onToggle={handleToggle} />
      )}

      <div className="page-pad flex gap-3 mt-6 pb-10 no-print">
        <button className="pill-button ghost flex-1 justify-center text-[14px]" onClick={() => window.print()}>
          <Printer size={15} /> Print
        </button>
        <button className="pill-button flex-1 justify-center text-[14px]" onClick={async () => {
          const text = items.filter(i => !i.checked).map(i => `• ${i.quantity} ${i.unit} ${i.name}`.trim()).join('\n');
          if (navigator.share) await navigator.share({ title: 'Grocery List', text });
          else { await navigator.clipboard.writeText(text); alert('Copied!'); }
        }}>
          <Share2 size={15} /> Share
        </button>
      </div>
    </div>
  );
}
