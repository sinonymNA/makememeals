import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { SunMoon } from 'lucide-react';
import { toggleTheme, getTheme } from '../lib/theme.js';

const HOW_IT_WORKS = [
  { emoji: '🎛️', step: '1', label: 'Set your preferences', desc: 'Budget, diet, store & more' },
  { emoji: '👈👉', step: '2', label: 'Swipe to pick meals', desc: 'Tinder-style for dinner' },
  { emoji: '🛒', step: '3', label: 'Cook & shop', desc: 'Recipes + smart grocery list' },
];

const TESTIMONIALS = [
  { quote: '"Finally stopped the 5pm "what\'s for dinner" panic."', name: 'Sarah M.' },
  { quote: '"Grocery list + recipes in one place. Game changer."', name: 'James T.' },
];

export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [guestUsed, setGuestUsed] = useState(false);
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard');
    setGuestUsed(!!localStorage.getItem('guestPlanId'));
  }, [isSignedIn, isLoaded, navigate]);

  function handleThemeToggle() {
    const next = toggleTheme();
    setThemeState(next);
  }

  function viewGuestPlan() {
    const planId = localStorage.getItem('guestPlanId');
    if (planId) navigate(`/guest/week/${planId}`);
  }

  return (
    <div className="app-shell flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Theme toggle (top right) */}
      <div className="flex justify-end px-5 pt-5">
        <button
          className="w-10 h-10 raised-sm flex items-center justify-center"
          style={{ borderRadius: '12px' }}
          onClick={handleThemeToggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <SunMoon size={18} style={{ color: 'var(--text-mid)' }} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center page-pad text-center gap-6 pt-4">

        {/* Brand */}
        <div>
          <div className="text-[13px] font-extrabold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            🍽️ Make Me Meals
          </div>
          <h1 className="text-[38px] font-black leading-tight mb-4" style={{ color: 'var(--text)' }}>
            What's for dinner<br />this week?
          </h1>
          <p className="text-[17px] font-semibold leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-mid)' }}>
            AI-generated meal plans + smart grocery lists.<br />Less stress, more flavor.
          </p>
        </div>

        {/* Floating food emojis */}
        <div className="flex gap-4 text-[40px]">
          <span className="float-emoji">🍕</span>
          <span className="float-emoji">🍜</span>
          <span className="float-emoji">🥗</span>
          <span className="float-emoji">🍲</span>
          <span className="float-emoji">🥩</span>
        </div>

        {/* How it works */}
        <div className="w-full">
          <div className="section-label text-center mb-3">How it works</div>
          <div className="flex flex-col gap-3">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="raised-sm p-4 flex items-center gap-4 text-left">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-[15px] flex-shrink-0"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {item.step}
                </div>
                <div className="text-[28px] flex-shrink-0">{item.emoji}</div>
                <div>
                  <div className="font-extrabold text-[14px]" style={{ color: 'var(--text)' }}>{item.label}</div>
                  <div className="text-[12px] font-semibold" style={{ color: 'var(--text-mid)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Swipe to pick meals', 'Smart grocery list', 'Printable recipes', 'Learns your taste'].map(f => (
            <span key={f} className="text-[13px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              ✓ {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <SignUpButton mode="modal">
            <button className="pill-button w-full justify-center text-[17px]">
              Start for $10/month ✨
            </button>
          </SignUpButton>

          {guestUsed ? (
            <button className="pill-button ghost w-full justify-center text-[15px]" onClick={viewGuestPlan}>
              View my guest plan →
            </button>
          ) : (
            <button className="pill-button ghost w-full justify-center text-[15px]" onClick={() => navigate('/guest-setup')}>
              🎉 Try one free — no sign up
            </button>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text-light)' }}>
              Already have an account?
            </span>
            <SignInButton mode="modal">
              <button className="text-[14px] font-extrabold" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Testimonials */}
        <div className="flex gap-3 w-full overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="raised-sm px-5 py-4 text-center flex-shrink-0" style={{ minWidth: '200px', flex: '1' }}>
              <div className="text-[18px] mb-1">⭐⭐⭐⭐⭐</div>
              <p className="text-[12px] font-semibold italic" style={{ color: 'var(--text-mid)' }}>{t.quote}</p>
              <p className="text-[11px] font-bold mt-1" style={{ color: 'var(--text-light)' }}>— {t.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="page-pad text-center pb-8">
        <p className="text-[12px] font-semibold" style={{ color: 'var(--text-light)' }}>
          $10/month · Cancel anytime · MakeMeMeals.com
        </p>
      </div>
    </div>
  );
}
