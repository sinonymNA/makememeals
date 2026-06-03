import { motion } from 'framer-motion';
import { SignUpButton, SignInButton } from '@clerk/clerk-react';
import { getMealImageUrl } from '../../lib/imageUrl.js';
import { DEMO } from './palette.js';
import logo from '../MMMlogolong.png';

// Screen 4 — The Gate. They've already built the plan; signing up just finishes
// what they started. After auth, the parent turns these picks into a real plan.
export default function DemoGate({ selected, savings, building, buildError, onRetry }) {
  if (building || buildError) {
    return (
      <div style={{ minHeight: '100vh', background: DEMO.cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '46px' }}>{buildError ? '😕' : '🍽️'}</div>
        {buildError ? (
          <>
            <h2 style={{ fontFamily: DEMO.serif, fontSize: '24px', color: DEMO.ink, marginTop: '14px' }}>Almost there</h2>
            <p style={{ fontFamily: DEMO.sans, color: DEMO.inkMid, marginTop: '6px', maxWidth: '300px' }}>{buildError}</p>
            <button onClick={onRetry} style={primaryBtn}>Try again</button>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ width: '40px', height: '40px', borderRadius: '999px', border: `3px solid ${DEMO.coralSoft}`, borderTopColor: DEMO.coral, marginTop: '20px' }}
            />
            <h2 style={{ fontFamily: DEMO.serif, fontSize: '24px', color: DEMO.ink, marginTop: '20px' }}>Building your plan…</h2>
            <p style={{ fontFamily: DEMO.sans, color: DEMO.inkMid, marginTop: '6px' }}>Saving your 5 dinners, recipes & grocery list.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${DEMO.coralSoft} 0%, ${DEMO.cream} 38%)`, display: 'flex', flexDirection: 'column', padding: '24px' }}>
      {/* Their plan */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {selected.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.14)' }}
          >
            <img src={m.imageUrl || getMealImageUrl(m.name)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        ))}
      </div>

      {/* Middle */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <img src={logo} alt="Make Me Meals" style={{ height: 40, objectFit: 'contain', marginBottom: '4px' }} />
        <h1 style={{ fontFamily: DEMO.serif, fontWeight: 700, fontSize: 'clamp(30px, 8vw, 40px)', color: DEMO.ink, margin: '10px 0 0' }}>
          Your week is planned.
        </h1>
        <p style={{ fontFamily: DEMO.sans, fontSize: '19px', fontWeight: 800, color: DEMO.coral, marginTop: '10px' }}>
          ${savings.finalTotal.toFixed(2)} · 5 dinners · 4 people
        </p>
      </div>

      {/* Gate */}
      <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', flexShrink: 0 }}>
        <p style={{ fontFamily: DEMO.sans, fontSize: '15px', color: DEMO.inkMid, textAlign: 'center', marginBottom: '16px' }}>
          Get your full recipes, complete grocery list, and all your coupons — completely free.
        </p>

        <SignUpButton mode="modal">
          <button style={googleBtn}>
            <GoogleG /> Continue with Google
          </button>
        </SignUpButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
          <span style={{ fontFamily: DEMO.sans, fontSize: '12px', color: DEMO.inkLight }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }} />
        </div>

        <SignUpButton mode="modal">
          <button style={primaryBtn}>Get My Free Plan →</button>
        </SignUpButton>

        <p style={{ fontFamily: DEMO.sans, fontSize: '12px', color: DEMO.inkLight, textAlign: 'center', marginTop: '12px' }}>
          No card required. Cancel anytime.<br />Join thousands of families eating smarter.
        </p>

        <p style={{ fontFamily: DEMO.sans, fontSize: '14px', color: DEMO.inkMid, textAlign: 'center', marginTop: '14px' }}>
          Already have an account?{' '}
          <SignInButton mode="modal">
            <button style={{ background: 'none', border: 'none', color: DEMO.coral, fontWeight: 800, cursor: 'pointer', fontFamily: DEMO.sans, fontSize: '14px' }}>Sign in</button>
          </SignInButton>
        </p>
      </div>
    </div>
  );
}

const primaryBtn = {
  width: '100%', fontFamily: DEMO.sans, fontWeight: 800, fontSize: '17px', color: '#fff',
  background: DEMO.coral, border: 'none', borderRadius: '999px', padding: '16px',
  cursor: 'pointer', boxShadow: '0 10px 28px rgba(232,85,58,0.32)', marginTop: '8px',
};

const googleBtn = {
  width: '100%', fontFamily: DEMO.sans, fontWeight: 800, fontSize: '16px', color: DEMO.ink,
  background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: '999px', padding: '15px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
};

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
