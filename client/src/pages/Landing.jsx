import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const STEPS = [
  { n: '1', icon: '⚙️', title: 'Set your preferences', desc: 'Budget, store, dietary needs' },
  { n: '2', icon: '👈👉', title: 'Swipe to choose', desc: 'Like Tinder — for dinner' },
  { n: '3', icon: '🛒', title: 'Shop smarter', desc: 'Auto-generated grocery list' },
  { n: '4', icon: '👨‍🍳', title: 'Cook like a pro', desc: 'Restaurant-inspired recipes' },
];

const REVIEWS = [
  { q: '"Saves me $300 a month vs. HelloFresh. No contest."', n: 'Emily R.' },
  { q: '"Finally know what’s for dinner without the panic."', n: 'Marcus D.' },
  { q: '"Best $10/month I spend. The recipes are actually fire."', n: 'Sarah M.' },
];

const CUISINES = ['🍜 Asian', '🍝 Italian', '🌮 Latin', '🍔 American', '🥙 Mediterranean', '🍛 Indian', '🥩 Steakhouse', '🥗 Healthy'];

export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [guestUsed, setGuestUsed] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard');
    setGuestUsed(!!localStorage.getItem('guestPlanId'));
  }, [isSignedIn, isLoaded, navigate]);

  function viewGuestPlan() {
    const planId = localStorage.getItem('guestPlanId');
    if (planId) navigate(`/guest/week/${planId}`);
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#fff' }}>

      {/* Nav */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', color: '#FF6B47' }}>
          🍽️ MAKE ME MEALS
        </div>
        <SignInButton mode="modal">
          <button style={{ fontSize: '13px', fontWeight: 600, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign in
          </button>
        </SignInButton>
      </div>

      {/* Hero */}
      <div style={{ padding: '32px 24px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,107,71,0.12)',
          border: '1px solid rgba(255,107,71,0.3)',
          borderRadius: '100px',
          padding: '6px 16px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#FF6B47',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}>
          Restaurant-inspired meals, home prices
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: 900,
          lineHeight: 1.1,
          margin: '0 0 16px',
          background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Swipe. Cook.<br />Save hundreds.
        </h1>

        <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.6, margin: '0 0 32px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
          AI-powered meal plans inspired by your favorite restaurants. Smart grocery lists. $10/month.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
          <SignUpButton mode="modal">
            <button style={{
              width: '100%',
              padding: '18px',
              background: '#FF6B47',
              color: '#fff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,107,71,0.4)',
              letterSpacing: '0.3px',
            }}>
              Start for $10/month ✨
            </button>
          </SignUpButton>

          {guestUsed ? (
            <button
              style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              onClick={viewGuestPlan}
            >
              View my free plan →
            </button>
          ) : (
            <button
              style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate('/guest-setup')}
            >
              Try free — no account needed
            </button>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#555', marginTop: '14px' }}>Cancel anytime · No credit card for free trial</p>
      </div>

      {/* Cuisine carousel */}
      <div style={{ padding: '0 0 40px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', paddingLeft: '24px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
          {CUISINES.map((c, i) => (
            <div key={i} style={{
              flexShrink: 0,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ccc',
              whiteSpace: 'nowrap',
            }}>
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Social proof numbers */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { val: '200+', label: 'Restaurant-inspired recipes' },
            { val: '$3–5', label: 'Per person per meal' },
            { val: '5 min', label: 'To plan your whole week' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '16px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FF6B47', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '20px' }}>
          How it works
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: i === 0 ? 'rgba(255,107,71,0.15)' : 'rgba(255,255,255,0.05)',
                border: i === 0 ? '1px solid rgba(255,107,71,0.3)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
              }}>
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#eee', marginBottom: '2px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* vs comparison */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '2px', textTransform: 'uppercase' }}>
            The math
          </div>
          {[
            { label: 'Eating out', cost: '$300–500/mo', bad: true },
            { label: 'HelloFresh', cost: '$480+/mo', bad: true },
            { label: 'Make Me Meals', cost: '~$50–80/mo', bad: false },
          ].map((row, i) => (
            <div key={i} style={{
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: !row.bad ? 'rgba(255,107,71,0.05)' : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>{row.bad ? '❌' : '✅'}</span>
                <span style={{ fontSize: '14px', color: row.bad ? '#666' : '#fff', fontWeight: row.bad ? 400 : 700 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: row.bad ? '#555' : '#FF6B47' }}>{row.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '16px' }}>
          What people say
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '18px',
            }}>
              <div style={{ color: '#FF6B47', fontSize: '13px', marginBottom: '8px' }}>★★★★★</div>
              <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.5, margin: '0 0 10px', fontStyle: 'italic' }}>{r.q}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>— {r.n}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '0 24px 60px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,71,0.15) 0%, rgba(255,107,71,0.05) 100%)',
          border: '1px solid rgba(255,107,71,0.2)',
          borderRadius: '24px',
          padding: '32px 24px',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>Ready to eat better?</div>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px' }}>Join thousands cooking restaurant-quality meals at home.</p>
          <SignUpButton mode="modal">
            <button style={{
              width: '100%',
              padding: '18px',
              background: '#FF6B47',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(255,107,71,0.35)',
            }}>
              Get started — $10/month
            </button>
          </SignUpButton>
          <p style={{ fontSize: '12px', color: '#444', marginTop: '12px' }}>Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
