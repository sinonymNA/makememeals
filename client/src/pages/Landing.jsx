import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const STEPS = [
  { icon: '⚙️', title: 'Set your preferences', desc: 'Budget, store, dietary needs' },
  { icon: '👈👉', title: 'Swipe to choose', desc: 'Like Tinder — for dinner' },
  { icon: '🛒', title: 'Shop smarter', desc: 'Auto-generated grocery list' },
  { icon: '👨‍🍳', title: 'Cook like a pro', desc: 'Restaurant-inspired recipes' },
];

const REVIEWS = [
  { q: '"Saves me $300 a month vs. HelloFresh. No contest."', n: 'Emily R.' },
  { q: '"Finally know what\'s for dinner without the panic."', n: 'Marcus D.' },
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
    <div style={{ background: '#FAFAF8', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", color: '#1a1a1a' }}>

      {/* Nav */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0ede8' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1px', color: '#FF6B47' }}>
          🍽️ MAKE ME MEALS
        </div>
        <SignInButton mode="modal">
          <button style={{ fontSize: '13px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Sign in
          </button>
        </SignInButton>
      </div>

      {/* Hero */}
      <div style={{ padding: '40px 24px 44px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,107,71,0.08)',
          border: '1px solid rgba(255,107,71,0.25)',
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
          color: '#1a1a1a',
        }}>
          Swipe. Cook.<br />
          <span style={{ color: '#FF6B47' }}>Save hundreds.</span>
        </h1>

        <p style={{ fontSize: '16px', color: '#777', lineHeight: 1.6, margin: '0 0 32px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
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
              boxShadow: '0 8px 28px rgba(255,107,71,0.35)',
              letterSpacing: '0.3px',
            }}>
              Start for $10/month ✨
            </button>
          </SignUpButton>

          {guestUsed ? (
            <button
              style={{ width: '100%', padding: '16px', background: '#fff', color: '#1a1a1a', border: '1.5px solid #e8e0d8', borderRadius: '16px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              onClick={viewGuestPlan}
            >
              View my free plan →
            </button>
          ) : (
            <button
              style={{ width: '100%', padding: '16px', background: '#fff', color: '#1a1a1a', border: '1.5px solid #e8e0d8', borderRadius: '16px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate('/guest-setup')}
            >
              Try free — no account needed
            </button>
          )}
        </div>

        <p style={{ fontSize: '12px', color: '#bbb', marginTop: '14px' }}>Cancel anytime · No credit card for free trial</p>
      </div>

      {/* Cuisine chip scroll */}
      <div style={{ paddingBottom: '40px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '10px', paddingLeft: '24px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
          {CUISINES.map((c, i) => (
            <div key={i} style={{
              flexShrink: 0,
              padding: '8px 16px',
              background: '#fff',
              border: '1.5px solid #f0ede8',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#555',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
              background: '#fff',
              border: '1.5px solid #f0ede8',
              borderRadius: '16px',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#FF6B47', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb', marginBottom: '20px' }}>
          How it works
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                background: i === 0 ? 'rgba(255,107,71,0.10)' : '#fff',
                border: i === 0 ? '1.5px solid rgba(255,107,71,0.3)' : '1.5px solid #f0ede8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}>
                {step.icon}
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: '#999' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The math */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ background: '#fff', border: '1.5px solid #f0ede8', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f0ea', fontSize: '11px', fontWeight: 700, color: '#bbb', letterSpacing: '2px', textTransform: 'uppercase' }}>
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
              borderBottom: i < 2 ? '1px solid #f5f0ea' : 'none',
              background: !row.bad ? 'rgba(255,107,71,0.04)' : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>{row.bad ? '❌' : '✅'}</span>
                <span style={{ fontSize: '14px', color: row.bad ? '#aaa' : '#1a1a1a', fontWeight: row.bad ? 400 : 700 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: row.bad ? '#ccc' : '#FF6B47' }}>{row.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '0 24px 40px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb', marginBottom: '16px' }}>
          What people say
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1.5px solid #f0ede8',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ color: '#FF6B47', fontSize: '13px', marginBottom: '8px' }}>★★★★★</div>
              <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.5, margin: '0 0 10px', fontStyle: 'italic' }}>{r.q}</p>
              <p style={{ fontSize: '12px', color: '#bbb', margin: 0 }}>— {r.n}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '0 24px 60px', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, #fff5f2 0%, #fff 100%)',
          border: '2px solid rgba(255,107,71,0.2)',
          borderRadius: '24px',
          padding: '36px 24px',
          boxShadow: '0 4px 24px rgba(255,107,71,0.08)',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a1a', marginBottom: '8px' }}>Ready to eat better?</div>
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
              boxShadow: '0 8px 28px rgba(255,107,71,0.35)',
            }}>
              Get started — $10/month
            </button>
          </SignUpButton>
          <p style={{ fontSize: '12px', color: '#ccc', marginTop: '12px' }}>Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
