import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [guestUsed, setGuestUsed] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard');
    setGuestUsed(!!localStorage.getItem('guestPlanId'));
  }, [isSignedIn, isLoaded, navigate]);

  function handleGuest() {
    navigate('/guest-setup');
  }

  function viewGuestPlan() {
    const planId = localStorage.getItem('guestPlanId');
    if (planId) navigate(`/guest/week/${planId}`);
  }

  return (
    <div className="app-shell flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 flex flex-col items-center justify-center page-pad text-center gap-7">

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

          {/* Guest CTA */}
          {guestUsed ? (
            <button
              className="pill-button ghost w-full justify-center text-[15px]"
              onClick={viewGuestPlan}
            >
              View my guest plan →
            </button>
          ) : (
            <button
              className="pill-button ghost w-full justify-center text-[15px]"
              onClick={handleGuest}
            >
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

        {/* Social proof */}
        <div className="raised-sm px-6 py-4 text-center max-w-xs">
          <div className="text-[22px] mb-1">⭐⭐⭐⭐⭐</div>
          <p className="text-[13px] font-semibold italic" style={{ color: 'var(--text-mid)' }}>
            "Finally stopped the 5pm 'what's for dinner' panic."
          </p>
          <p className="text-[12px] font-bold mt-1" style={{ color: 'var(--text-light)' }}>— Sarah M.</p>
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
