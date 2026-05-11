import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Plus, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, registerUser, getPlans, createCheckout, createPortal, getSubscriptionStatus, validatePromo, deletePlan } from '../lib/api.js';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [swipeStart, setSwipeStart] = useState({});
  const touchRef = useRef({});

  const subscribed = searchParams.get('subscribed');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      setAuthToken(token);
      if (user?.primaryEmailAddress?.emailAddress) {
        await registerUser(user.primaryEmailAddress.emailAddress).catch(() => {});
      }
      const [data, statusData] = await Promise.all([getPlans(), getSubscriptionStatus()]);
      setPlans(data);
      // If ?subscribed=1 is in the URL, optimistically show as active even if
      // the webhook hasn't updated the DB yet — re-poll after 3s to confirm
      if (subscribed && statusData.subscription !== 'active') {
        setSubscription('active');
        setTimeout(async () => {
          try {
            const refreshed = await getSubscriptionStatus();
            setSubscription(refreshed.subscription);
          } catch {}
        }, 3000);
      } else {
        setSubscription(statusData.subscription);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [getToken, user, subscribed]);

  useEffect(() => { load(); }, [load]);

  async function handleUpgrade(plan = 'monthly') {
    setCheckoutLoading(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    try {
      const { url } = await createPortal();
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePromoCode() {
    if (!promoCode.trim()) {
      toast.error('Enter a promo code');
      return;
    }
    setPromoLoading(true);
    try {
      const result = await validatePromo(promoCode);
      if (result.valid) {
        toast.success(result.message);
        setPromoCode('');
        setSubscription('active');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Promo code validation failed');
      console.error(err);
    } finally {
      setPromoLoading(false);
    }
  }

  async function handleDeletePlan(planId) {
    try {
      await deletePlan(planId);
      setPlans(plans.filter(p => p.id !== planId));
      setDeleteModal(null);
      toast.success('Meal plan deleted');
    } catch (err) {
      toast.error('Failed to delete plan');
      console.error(err);
    }
  }

  function handleTouchStart(planId, e) {
    touchRef.current[planId] = e.touches[0].clientX;
    setSwipeStart({ [planId]: e.touches[0].clientX });
  }

  function handleTouchEnd(planId, e) {
    const start = touchRef.current[planId];
    const end = e.changedTouches[0].clientX;
    if (start - end > 80) setDeleteModal(planId);
    touchRef.current[planId] = null;
  }

  const isActive = subscription === 'active';

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-10 pb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>
            Make Me Meals
          </div>
          <h1
            className="text-[26px] leading-tight"
            style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            Hey {user?.firstName || 'there'}! 👋
          </h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Success banner */}
      {subscribed && (
        <div className="mx-5 mb-5 p-4 rounded-2xl text-center" style={{ background: 'var(--accent-green)', color: 'white' }}>
          <p className="font-semibold text-[15px]">🎉 Welcome to Make Me Meals!</p>
          <p className="text-[13px] opacity-90 mt-0.5">Unlimited meal plans unlocked.</p>
        </div>
      )}

      {/* Upgrade CTA for non-subscribers */}
      {!loading && subscription === 'free' && (
        <div className="px-5 mb-5 flex flex-col gap-3">
          <div
            className="rounded-3xl p-5"
            style={{ background: 'var(--bg-warm)', border: '1.5px solid var(--accent)' }}
          >
            <p className="font-semibold text-[16px] mb-1" style={{ color: 'var(--text)' }}>
              Unlock unlimited meal plans ✨
            </p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-mid)' }}>
              Cancel anytime · Way cheaper than HelloFresh
            </p>
            <button
              className="pill-button w-full justify-center mb-2"
              onClick={() => handleUpgrade('monthly')}
              disabled={checkoutLoading}
            >
              {checkoutLoading === 'monthly' ? 'Redirecting…' : 'Monthly — $9.99/mo'}
            </button>
            <button
              className="pill-button outline w-full justify-center relative"
              onClick={() => handleUpgrade('annual')}
              disabled={checkoutLoading}
            >
              {checkoutLoading === 'annual' ? 'Redirecting…' : 'Annual — $79.99/yr'}
              <span className="absolute -top-2 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'white' }}>Save 33%</span>
            </button>
          </div>
          <div className="px-0">
            <p className="text-[12px] text-center mb-2" style={{ color: 'var(--text-light)' }}>Have a promo code?</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handlePromoCode()}
                className="flex-1 px-3 py-2 rounded-full text-[13px]"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
              />
              <button
                className="pill-button outline text-[13px]"
                onClick={handlePromoCode}
                disabled={promoLoading}
              >
                {promoLoading ? '...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New plan CTA (only for subscribers) */}
      {isActive && (
        <div className="px-5 mb-6">
          <button
            className="w-full p-5 rounded-3xl flex items-center justify-between"
            onClick={() => navigate('/setup')}
            style={{ background: 'var(--accent)', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">✨</div>
              <div className="text-left">
                <div className="font-semibold text-[16px] text-white">New Meal Plan</div>
                <div className="text-[13px] text-white/80">Pick your meals for the week</div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
              <Plus size={16} color="white" strokeWidth={3} />
            </div>
          </button>
        </div>
      )}

      {/* Past plans */}
      <div className="page-pad pt-0">
        {isActive && <div className="section-label">Your plans</div>}

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text-light)' }}>
            <div className="text-3xl mb-2">📋</div>
            <p className="text-[14px]">Loading…</p>
          </div>
        ) : error ? (
          <div className="card p-6 text-center">
            <div className="text-4xl mb-3">😕</div>
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Couldn't load your plans</p>
            <p className="text-[13px] mt-1 mb-4" style={{ color: 'var(--text-mid)' }}>{error}</p>
            <button className="pill-button text-[14px]" onClick={load}>Try again</button>
          </div>
        ) : isActive && plans.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>No plans yet!</p>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-mid)' }}>Create your first meal plan above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map(plan => {
              const emojis = plan.meal_emojis || [];
              const total = Number(plan.estimated_total || 0);
              return (
                <div
                  key={plan.id}
                  className="card relative overflow-hidden"
                  onTouchStart={(e) => handleTouchStart(plan.id, e)}
                  onTouchEnd={(e) => handleTouchEnd(plan.id, e)}
                >
                  <button
                    className="p-4 flex items-center justify-between w-full text-left"
                    onClick={() => navigate(`/week/${plan.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'var(--bg-warm)' }}
                      >
                        🗓️
                      </div>
                      <div>
                        <div className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>
                          {plan.days}-day plan
                        </div>
                        <div className="text-[12px]" style={{ color: 'var(--text-light)' }}>
                          {formatDate(plan.created_at)}
                          {total > 0 && ` · ~$${total.toFixed(0)}`}
                        </div>
                        {emojis.length > 0 && (
                          <div className="flex gap-0.5 mt-1 text-[15px]">
                            {emojis.slice(0, 5).map((emoji, i) => <span key={i}>{emoji}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal(plan.id);
                    }}
                    title="Delete plan"
                  >
                    <Trash2 size={16} style={{ color: 'var(--text-light)' }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card p-6 mx-5 max-w-sm text-center">
            <p className="font-semibold text-[16px] mb-2" style={{ color: 'var(--text)' }}>Delete meal plan?</p>
            <p className="text-[13px] mb-6" style={{ color: 'var(--text-mid)' }}>This will remove all meals and recipes. This cannot be undone.</p>
            <div className="flex gap-3">
              <button className="pill-button outline flex-1" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="pill-button flex-1" style={{ background: '#ff6b6b', color: 'white' }} onClick={() => handleDeletePlan(deleteModal)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Manage billing link */}
      {isActive && (
        <div className="text-center pb-4 mt-2">
          <button
            className="text-[12px] flex items-center gap-1 mx-auto"
            style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleManageBilling}
          >
            <ExternalLink size={11} /> Manage billing
          </button>
        </div>
      )}

      <div className="pb-10" />
    </div>
  );
}
