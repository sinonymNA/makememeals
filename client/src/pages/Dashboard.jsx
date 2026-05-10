import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Plus, ChevronRight, ExternalLink } from 'lucide-react';
import { setAuthToken, registerUser, getPlans, createCheckout, createPortal, getSubscriptionStatus } from '../lib/api.js';

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
      setSubscription(statusData.subscription);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => { load(); }, [load]);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const { url } = await createCheckout();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
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

  const subscribed = searchParams.get('subscribed');
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
        <div className="px-5 mb-5">
          <div
            className="rounded-3xl p-5"
            style={{ background: 'var(--bg-warm)', border: '1.5px solid var(--accent)' }}
          >
            <p className="font-semibold text-[16px] mb-1" style={{ color: 'var(--text)' }}>
              Start generating meal plans ✨
            </p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-mid)' }}>
              $10/month · Unlimited plans · Cancel anytime
            </p>
            <button
              className="pill-button w-full justify-center"
              onClick={handleUpgrade}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Redirecting…' : 'Upgrade — $10/month'}
            </button>
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
                <button
                  key={plan.id}
                  className="card p-4 flex items-center justify-between w-full text-left"
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
              );
            })}
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
