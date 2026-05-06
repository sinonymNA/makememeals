import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import { Plus, ChevronRight } from 'lucide-react';
import { setAuthToken, registerUser, getPlans } from '../lib/api.js';

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

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken();
        setAuthToken(token);

        // Register user on first load
        if (user?.primaryEmailAddress?.emailAddress) {
          await registerUser(user.primaryEmailAddress.emailAddress).catch(() => {});
        }

        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [getToken, user]);

  const subscribed = searchParams.get('subscribed');

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-pad pt-8 pb-4 flex items-center justify-between">
        <div>
          <div
            className="text-[13px] font-extrabold uppercase tracking-widest mb-0.5"
            style={{ color: 'var(--accent)' }}
          >
            🍽️ Make Me Meals
          </div>
          <h1 className="text-[24px] font-black" style={{ color: 'var(--text)' }}>
            Hey {user?.firstName || 'there'}! 👋
          </h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Subscription success banner */}
      {subscribed && (
        <div
          className="mx-5 mb-4 p-4 rounded-2xl text-center"
          style={{ background: 'var(--green)', color: 'white' }}
        >
          <p className="font-extrabold text-[15px]">🎉 Welcome to Make Me Meals!</p>
          <p className="text-[13px] font-semibold opacity-90">Unlimited meal plans unlocked.</p>
        </div>
      )}

      {/* New plan CTA */}
      <div className="px-5 mb-6">
        <button
          className="raised w-full p-5 flex items-center justify-between"
          onClick={() => navigate('/setup')}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--accent)' }}
            >
              ✨
            </div>
            <div className="text-left">
              <div className="font-extrabold text-[16px]" style={{ color: 'var(--text)' }}>
                New Meal Plan
              </div>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text-mid)' }}>
                Pick your meals for the week
              </div>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={16} color="white" strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* Past plans */}
      <div className="page-pad pt-0">
        <div className="section-label">Your plans</div>

        {loading ? (
          <div className="text-center py-8" style={{ color: 'var(--text-light)' }}>
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold text-[14px]">Loading your plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="raised p-8 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="font-bold text-[16px]" style={{ color: 'var(--text)' }}>
              No plans yet!
            </p>
            <p className="text-[14px] font-semibold mt-1" style={{ color: 'var(--text-mid)' }}>
              Create your first meal plan above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {plans.map(plan => (
              <button
                key={plan.id}
                className="raised-sm p-4 flex items-center justify-between w-full text-left"
                onClick={() => navigate(`/week/${plan.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                    style={{ background: 'var(--accent-light)' }}
                  >
                    🗓️
                  </div>
                  <div>
                    <div className="font-extrabold text-[15px]" style={{ color: 'var(--text)' }}>
                      {plan.days}-day plan
                    </div>
                    <div className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>
                      {formatDate(plan.created_at)}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-light)' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pb-16" />
    </div>
  );
}
