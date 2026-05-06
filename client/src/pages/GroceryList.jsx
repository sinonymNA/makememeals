import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Share2, Printer } from 'lucide-react';
import { setAuthToken, buildGroceryList } from '../lib/api.js';
import GroceryPaper from '../components/GroceryPaper.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function GroceryList() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [items, setItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        setAuthToken(token);
        const data = await buildGroceryList(planId);
        setItems(data.items || []);
        setEstimatedTotal(data.estimatedTotal || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, getToken]);

  function handleToggle(item) {
    setItems(prev =>
      prev.map(i =>
        i.name === item.name && i.category === item.category
          ? { ...i, checked: !i.checked }
          : i
      )
    );
  }

  async function handleShare() {
    const text = items
      .filter(i => !i.checked)
      .map(i => `• ${i.quantity} ${i.unit} ${i.name}`.trim())
      .join('\n');

    const shareText = `🛒 Grocery List\n\n${text}\n\nEstimated total: ~$${estimatedTotal?.toFixed(2)}\n\nMade with MakeMeMeals.com`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Grocery List', text: shareText });
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Grocery list copied to clipboard!');
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) return <LoadingScreen type="grocery" />;

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-4 flex items-center gap-3 no-print">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          onClick={() => navigate(`/week/${planId}`)}
          style={{ borderRadius: '12px' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div>
          <h1 className="text-[22px] font-black" style={{ color: 'var(--text)' }}>Grocery List 🛒</h1>
          {checkedCount > 0 && (
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-mid)' }}>
              {checkedCount} of {items.length} checked off
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="px-5 mb-4 no-print">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                background: 'var(--green)',
                width: `${(checkedCount / items.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Grocery paper */}
      <GroceryPaper
        items={items}
        estimatedTotal={estimatedTotal}
        onToggle={handleToggle}
      />

      {/* Action buttons */}
      <div className="page-pad flex gap-3 mt-6 pb-10 no-print">
        <button
          className="pill-button ghost flex-1 justify-center text-[14px]"
          onClick={handleShare}
        >
          <Share2 size={15} /> Share List
        </button>
        <button
          className="pill-button flex-1 justify-center text-[14px]"
          onClick={handlePrint}
        >
          <Printer size={15} /> Print List
        </button>
      </div>
    </div>
  );
}
