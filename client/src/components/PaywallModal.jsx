import { useState } from 'react';
import { createCheckout } from '../lib/api.js';

export default function PaywallModal({ onClose }) {
  const [loading, setLoading] = useState(null);

  async function handleCheckout(plan) {
    setLoading(plan);
    try {
      const { url } = await createCheckout(plan);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-full max-w-[430px]"
        style={{ borderRadius: '28px 28px 0 0', background: 'var(--card)', overflow: 'hidden' }}
      >
        {/* Pull handle */}
        <div className="pt-4 pb-2 flex justify-center">
          <div className="w-10 h-1.5 rounded-full" style={{ background: 'var(--border-mid)' }} />
        </div>

        <div className="px-6 pb-10">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🍽️</div>
            <h2
              className="text-[24px] font-bold mb-2"
              style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif" }}
            >
              Ready for another week?
            </h2>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
              Get unlimited meal plans, recipe cards, and grocery lists.
              <br />Way cheaper than HelloFresh. No boxes. No waste.
            </p>
          </div>

          {/* Pricing comparison */}
          <div
            className="rounded-2xl p-4 mb-5 text-[13px]"
            style={{ background: 'var(--bg-warm)' }}
          >
            <div className="flex justify-between mb-1">
              <span style={{ color: 'var(--text-mid)' }}>🍕 Eating out (avg)</span>
              <span className="font-semibold" style={{ color: '#ff6b6b' }}>$300-500/mo</span>
            </div>
            <div className="flex justify-between mb-1">
              <span style={{ color: 'var(--text-mid)' }}>📦 HelloFresh</span>
              <span className="font-semibold" style={{ color: '#ff6b6b' }}>$120+/wk</span>
            </div>
            <div className="flex justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
              <span style={{ color: 'var(--text)' }}>✅ Make Me Meals</span>
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>$9.99/mo</span>
            </div>
          </div>

          {/* Monthly CTA */}
          <button
            className="pill-button w-full justify-center text-[16px] mb-3"
            style={{ paddingTop: '16px', paddingBottom: '16px' }}
            onClick={() => handleCheckout('monthly')}
            disabled={!!loading}
          >
            {loading === 'monthly' ? 'Redirecting…' : 'Start Monthly — $9.99/mo'}
          </button>

          <div className="text-center text-[12px] mb-3" style={{ color: 'var(--text-light)' }}>or</div>

          {/* Annual CTA */}
          <button
            className="pill-button outline w-full justify-center text-[15px] mb-3 relative"
            style={{ paddingTop: '14px', paddingBottom: '14px' }}
            onClick={() => handleCheckout('annual')}
            disabled={!!loading}
          >
            {loading === 'annual' ? 'Redirecting…' : 'Best Value — $79.99/yr'}
            <span
              className="absolute -top-2.5 right-4 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Save 33%
            </span>
          </button>

          <p className="text-[12px] text-center mb-4" style={{ color: 'var(--text-light)' }}>
            Cancel anytime · Takes 30 seconds
          </p>

          <button
            className="w-full text-center text-[13px]"
            style={{ color: 'var(--text-light)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
