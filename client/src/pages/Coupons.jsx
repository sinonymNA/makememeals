import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Search, Tag, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getCoupons, matchCoupons, getPlans } from '../lib/api.js';

const STORES = [
  { key: 'all',     label: 'All Stores',  emoji: '🛒', color: '#FF6B47' },
  { key: 'kroger',  label: 'Kroger',      emoji: '🏪', color: '#0066CC' },
  { key: 'publix',  label: 'Publix',      emoji: '🏬', color: '#007A40' },
  { key: 'walmart', label: 'Walmart',     emoji: '🏢', color: '#0071CE' },
];

const CATEGORY_COLORS = {
  produce:    '#2ECC71',
  meat:       '#E74C3C',
  seafood:    '#3498DB',
  dairy:      '#F39C12',
  grains:     '#D4A017',
  canned:     '#E67E22',
  condiments: '#9B59B6',
  frozen:     '#1ABC9C',
  snacks:     '#E91E63',
  beverages:  '#00BCD4',
  other:      '#95A5A6',
};

function CouponCard({ coupon, matched }) {
  const daysLeft = coupon.valid_until
    ? Math.ceil((new Date(coupon.valid_until) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  const catColor = CATEGORY_COLORS[coupon.category] || '#95A5A6';

  return (
    <div
      className="card"
      style={{
        padding: '0',
        overflow: 'hidden',
        border: matched ? '2px solid var(--accent)' : '1px solid var(--border)',
        position: 'relative',
      }}
    >
      {matched && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--accent)', color: 'white',
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.05em',
          padding: '3px 8px', borderRadius: '0 0 0 8px',
        }}>
          ON YOUR LIST
        </div>
      )}

      {/* Color bar */}
      <div style={{ height: '4px', background: catColor }} />

      <div style={{ padding: '14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px',
            background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>
            {coupon.image_emoji || '🏷️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {coupon.brand && (
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', margin: '0 0 2px' }}>
                {coupon.brand}
              </p>
            )}
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
              {coupon.product}
            </p>
          </div>
        </div>

        {/* Discount badge */}
        <div style={{
          background: 'var(--bg-warm)', border: '1.5px solid var(--accent)',
          borderRadius: '8px', padding: '8px 12px', marginBottom: '10px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Tag size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>
            {coupon.discount}
          </span>
        </div>

        {/* Description */}
        {coupon.description && (
          <p style={{ fontSize: '12px', color: 'var(--text-mid)', margin: '0 0 10px', lineHeight: 1.4 }}>
            {coupon.description}
          </p>
        )}

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: 'white', background: CATEGORY_COLORS[coupon.category] || '#95A5A6',
            padding: '3px 8px', borderRadius: '6px',
          }}>
            {coupon.category}
          </span>
          {daysLeft !== null && (
            <span style={{ fontSize: '11px', color: daysLeft <= 3 ? '#E74C3C' : 'var(--text-light)' }}>
              {daysLeft <= 0 ? 'Expired' : daysLeft === 1 ? 'Expires tomorrow' : `${daysLeft} days left`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Coupons() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState('all');
  const [search, setSearch] = useState('');
  const [matchMode, setMatchMode] = useState(false);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const [couponData, planData] = await Promise.all([
        getCoupons(store),
        getPlans(),
      ]);
      setCoupons(couponData);
      setPlans(planData);
      if (planData.length > 0 && !selectedPlan) setSelectedPlan(planData[0].id);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [getToken, store]);

  useEffect(() => { load(); }, [load]);

  async function handleMatch() {
    if (!selectedPlan) { toast.error('No meal plan selected'); return; }
    setMatchLoading(true);
    try {
      const matched = await matchCoupons(selectedPlan, store);
      setCoupons(prev => {
        const matchedSet = new Set(matched.map(m => m.id));
        setMatchedIds(matchedSet);
        // Put matched first
        const matchedItems = matched;
        const rest = prev.filter(c => !matchedSet.has(c.id));
        return [...matchedItems, ...rest];
      });
      setMatchMode(true);
      toast.success(`Found ${matched.length} coupon${matched.length !== 1 ? 's' : ''} matching your grocery list!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Build a grocery list first');
    } finally {
      setMatchLoading(false);
    }
  }

  function clearMatch() {
    setMatchMode(false);
    setMatchedIds(new Set());
    load();
  }

  const filtered = coupons.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.product} ${c.description} ${c.brand}`.toLowerCase().includes(q);
  });

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-pad pt-10 pb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)', flexShrink: 0 }}
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Coupons & Deals
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>
              {filtered.length} deals available
              {matchMode && <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>· {matchedIds.size} match your list</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Smart match banner */}
      {!matchMode ? (
        <div className="mx-5 mb-4 p-4 rounded-2xl" style={{ background: 'var(--bg-warm)', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
                Smart Coupon Match
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-mid)', margin: 0 }}>
                Find coupons that match your grocery list
              </p>
            </div>
            <button
              onClick={handleMatch}
              disabled={matchLoading || !selectedPlan}
              className="pill-button"
              style={{ padding: '8px 16px', fontSize: '13px', flexShrink: 0 }}
            >
              {matchLoading ? '…' : 'Match'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-5 mb-4 p-3 rounded-2xl" style={{ background: '#2ECC7118', border: '1.5px solid #2ECC71' }}>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#27AE60', flex: 1 }}>
              ✓ Showing {matchedIds.size} matched coupon{matchedIds.size !== 1 ? 's' : ''} first
            </span>
            <button
              onClick={clearMatch}
              style={{ fontSize: '12px', color: 'var(--text-mid)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              Show all
            </button>
          </div>
        </div>
      )}

      {/* Store selector */}
      <div className="px-5 mb-3">
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {STORES.map(s => (
            <button
              key={s.key}
              onClick={() => { setStore(s.key); setMatchMode(false); setMatchedIds(new Set()); }}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                border: store === s.key ? 'none' : '1px solid var(--border)',
                background: store === s.key ? s.color : 'var(--card)',
                color: store === s.key ? 'white' : 'var(--text-mid)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search coupons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '9999px', border: '1px solid var(--border)', background: 'var(--card)', fontSize: '13px', color: 'var(--text)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Coupon grid */}
      <div className="px-5 pb-16">
        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-light)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
            <p style={{ fontSize: '14px' }}>Loading deals…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
              No coupons found
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)' }}>
              {search ? 'Try a different search term' : 'Check back soon for new deals'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filtered.map(coupon => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                matched={matchedIds.has(coupon.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note about real coupon integration */}
      <div className="px-5 pb-8 text-center">
        <p style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: 1.5 }}>
          Deals are curated weekly. Verify availability in-store.
        </p>
      </div>
    </div>
  );
}
