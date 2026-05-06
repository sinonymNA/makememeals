import { useUser } from '@clerk/clerk-react';
import { createCheckout } from '../lib/api.js';
import { useState } from 'react';

export default function PaywallModal({ onClose }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { url } = await createCheckout(user?.primaryEmailAddress?.emailAddress);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(44, 24, 16, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="raised w-full max-w-sm p-8 flex flex-col items-center gap-5">
        <div className="text-5xl">🍽️</div>

        <div className="text-center">
          <h2 className="text-[24px] font-black mb-2" style={{ color: 'var(--text)' }}>
            Ready for another week?
          </h2>
          <p className="text-[15px] font-semibold leading-relaxed" style={{ color: 'var(--text-mid)' }}>
            Get unlimited meal plans, recipe cards, and grocery lists for $10/month.
          </p>
        </div>

        <div
          className="text-[13px] font-bold text-center py-2 px-4 rounded-full"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          Cancel anytime. No weird fees.
        </div>

        <button
          className="pill-button w-full justify-center text-[17px]"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Redirecting...' : 'Start for $10/month ✨'}
        </button>

        <button
          className="text-[14px] font-bold"
          style={{ color: 'var(--text-light)' }}
          onClick={onClose}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
