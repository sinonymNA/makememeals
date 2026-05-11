import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import logo from '../components/MMMlogolong.png';

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

const MATH_ROWS = [
  { label: 'Eating out', cost: '$300–500/mo', bad: true },
  { label: 'HelloFresh', cost: '$480+/mo', bad: true },
  { label: 'Make Me Meals', cost: '~$50–80/mo', bad: false },
];

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
    <div className="landing-root">

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <img src={logo} alt="Make Me Meals" className="landing-logo" />
          <SignInButton mode="modal">
            <button className="landing-signin-btn">Sign in</button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-badge">Restaurant-inspired meals, home prices</div>

          <h1 className="landing-h1">
            Swipe. Cook.<br />
            <span style={{ color: '#FF6B47' }}>Save hundreds.</span>
          </h1>

          <p className="landing-subhead">
            AI-powered meal plans inspired by your favorite restaurants. Smart grocery lists. $10/month.
          </p>

          <div className="landing-ctas">
            <SignUpButton mode="modal">
              <button className="landing-btn-primary">Start for $10/month ✨</button>
            </SignUpButton>

            {guestUsed ? (
              <button className="landing-btn-secondary" onClick={viewGuestPlan}>
                View my free plan →
              </button>
            ) : (
              <button className="landing-btn-secondary" onClick={() => navigate('/guest-setup')}>
                Try free — no account needed
              </button>
            )}
          </div>

          <p className="landing-fine">Cancel anytime · No credit card for free trial</p>
        </div>
      </section>

      {/* Cuisine chips */}
      <div className="landing-chips-wrap">
        <div className="landing-container">
          <div className="landing-chips">
            {CUISINES.map((c, i) => (
              <div key={i} className="landing-chip">{c}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="landing-stats-wrap">
        <div className="landing-container">
          <div className="landing-stats">
            {[
              { val: '200+', label: 'Restaurant-inspired recipes' },
              { val: '$3–5', label: 'Per person per meal' },
              { val: '5 min', label: 'To plan your whole week' },
            ].map((s, i) => (
              <div key={i} className="landing-stat-card">
                <div className="landing-stat-val">{s.val}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works + The math (side by side on desktop) */}
      <div className="landing-mid-wrap">
        <div className="landing-container landing-mid-grid">

          {/* How it works */}
          <div>
            <div className="landing-section-label">How it works</div>
            <div className="landing-steps">
              {STEPS.map((step, i) => (
                <div key={i} className="landing-step">
                  <div className={`landing-step-icon${i === 0 ? ' landing-step-icon--active' : ''}`}>
                    {step.icon}
                  </div>
                  <div>
                    <div className="landing-step-title">{step.title}</div>
                    <div className="landing-step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The math */}
          <div>
            <div className="landing-section-label">The math</div>
            <div className="landing-math-card">
              {MATH_ROWS.map((row, i) => (
                <div key={i} className={`landing-math-row${!row.bad ? ' landing-math-row--highlight' : ''}${i < 2 ? ' landing-math-row--border' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px' }}>{row.bad ? '❌' : '✅'}</span>
                    <span className={`landing-math-label${row.bad ? '' : ' landing-math-label--strong'}`}>{row.label}</span>
                  </div>
                  <span className={`landing-math-cost${row.bad ? ' landing-math-cost--dim' : ' landing-math-cost--accent'}`}>{row.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="landing-reviews-wrap">
        <div className="landing-container">
          <div className="landing-section-label">What people say</div>
          <div className="landing-reviews">
            {REVIEWS.map((r, i) => (
              <div key={i} className="landing-review-card">
                <div className="landing-stars">★★★★★</div>
                <p className="landing-review-quote">{r.q}</p>
                <p className="landing-review-name">— {r.n}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="landing-bottom-wrap">
        <div className="landing-container">
          <div className="landing-bottom-card">
            <div className="landing-bottom-title">Ready to eat better?</div>
            <p className="landing-bottom-sub">Join thousands cooking restaurant-quality meals at home.</p>
            <SignUpButton mode="modal">
              <button className="landing-btn-primary landing-btn-full">Get started — $10/month</button>
            </SignUpButton>
            <p className="landing-fine" style={{ marginTop: '12px' }}>Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
