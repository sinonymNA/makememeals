import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

const HERO_URL = 'https://source.unsplash.com/430x380/?food,meal,cooking,dinner';

const FEATURES = [
  { emoji: '👈👉', title: 'Swipe to pick', desc: 'Tinder-style for dinner' },
  { emoji: '🛒', title: 'Smart grocery list', desc: 'Organized by aisle' },
  { emoji: '📋', title: 'Recipe cards', desc: 'Save & print anytime' },
];

const TESTIMONIALS = [
  { quote: '"Finally stopped the 5pm \'what\'s for dinner\' panic."', name: 'Sarah M.' },
  { quote: '"Grocery list + recipes in one place. Game changer."', name: 'James T.' },
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
    <div className="app-shell flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Hero image with gradient overlay */}
      <div style={{ position: 'relative', height: '360px', overflow: 'hidden' }}>
        <img
          src={HERO_URL}
          alt="Delicious meal"
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #FFFFFF 0%, rgba(255,255,255,0.3) 55%, transparent 100%)',
          }}
        />
        {/* Text overlay at bottom of image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 24px' }}>
          <div
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--accent)' }}
          >
            MEAL PLANNING, REIMAGINED
          </div>
          <h1
            className="text-[42px] leading-tight"
            style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
          >
            What's for dinner?
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col page-pad gap-7 pt-4">

        {/* Subline */}
        <p className="text-[17px] leading-relaxed" style={{ color: 'var(--text-mid)' }}>
          AI-generated meal plans + smart grocery lists. Less stress, more flavor.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-stretch gap-3">
          <SignUpButton mode="modal">
            <button className="pill-button w-full justify-center text-[16px]">
              Start for $10/month ✨
            </button>
          </SignUpButton>

          {guestUsed ? (
            <button className="pill-button outline w-full justify-center text-[15px]" onClick={viewGuestPlan}>
              View my guest plan →
            </button>
          ) : (
            <button className="pill-button outline w-full justify-center text-[15px]" onClick={() => navigate('/guest-setup')}>
              Try one free — no sign up
            </button>
          )}

          <div className="text-center">
            <span className="text-[13px]" style={{ color: 'var(--text-light)' }}>
              Already have an account?{' '}
            </span>
            <SignInButton mode="modal">
              <button
                className="text-[13px] font-semibold"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Feature cards */}
        <div>
          <div className="section-label mb-4">How it works</div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card flex-shrink-0 p-4 text-center"
                style={{ minWidth: '140px', flex: '1' }}
              >
                <div className="text-[28px] mb-2">{f.emoji}</div>
                <div className="font-semibold text-[14px] mb-1" style={{ color: 'var(--text)' }}>{f.title}</div>
                <div className="text-[12px]" style={{ color: 'var(--text-light)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card px-4 py-4 flex-shrink-0" style={{ minWidth: '220px', flex: '1' }}>
              <div className="text-[14px] mb-1">⭐⭐⭐⭐⭐</div>
              <p className="text-[13px] italic leading-snug mb-2" style={{ color: 'var(--text-mid)' }}>{t.quote}</p>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>— {t.name}</p>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-center pb-6" style={{ color: 'var(--text-light)' }}>
          $10/month · Cancel anytime
        </p>
      </div>
    </div>
  );
}
