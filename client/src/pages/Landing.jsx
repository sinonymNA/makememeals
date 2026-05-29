import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import logo from '../components/MMMlogolong.png';

// ── Design tokens ──────────────────────────────────────────
const C = {
  cream:       '#FDFAF6',
  creamDark:   '#F5F0E8',
  white:       '#FFFFFF',
  ink:         '#1A1410',
  inkMid:      '#4A3F35',
  inkLight:    '#8B7B6E',
  coral:       '#E8553A',
  coralDark:   '#C4432A',
  coralSoft:   '#FDF0ED',
  gold:        '#C9922A',
  sage:        '#5C7A5C',
  border:      'rgba(26,20,16,0.08)',
  shadowSm:    '0 2px 8px rgba(26,20,16,0.06)',
  shadowMd:    '0 8px 32px rgba(26,20,16,0.10)',
  shadowLg:    '0 24px 64px rgba(26,20,16,0.12)',
  shadowCoral: '0 8px 32px rgba(232,85,58,0.22)',
};
const PF = "'Playfair Display', Georgia, serif";
const NU = "'Nunito', system-ui, sans-serif";

// ── Fade-in on scroll ───────────────────────────────────────
function FadeIn({ children, delay = 0, y = 40, style = {} }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children, color = C.coral, center = false }) {
  return (
    <div style={{
      fontFamily: NU, fontSize: 11, fontWeight: 700,
      color, letterSpacing: '0.18em', textTransform: 'uppercase',
      marginBottom: 20, textAlign: center ? 'center' : 'left',
    }}>{children}</div>
  );
}

// ── Mobile detection ────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

// ── Phone screens for sticky section ───────────────────────
function Screen1() {
  const meals = [
    { emoji: '🍗', name: 'Honey Garlic Chicken', cost: '$11', time: '25 min' },
    { emoji: '🍝', name: 'Tuscan Pasta', cost: '$13', time: '20 min' },
    { emoji: '🥩', name: 'Ribeye & Potatoes', cost: '$18', time: '30 min' },
    { emoji: '🌮', name: 'Street Tacos', cost: '$9', time: '15 min' },
  ];
  return (
    <div style={{ padding: '12px 14px', height: '100%', background: C.cream }}>
      <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: '0.12em', marginBottom: 10 }}>THIS WEEK</div>
      {meals.map((m, i) => (
        <div key={i} style={{
          background: C.white, borderRadius: 12, padding: '10px 12px', marginBottom: 8,
          boxShadow: C.shadowSm, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 22 }}>{m.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PF, fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{m.name}</div>
            <div style={{ fontFamily: NU, fontSize: 10, color: C.inkLight, marginTop: 2 }}>{m.cost} · {m.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Screen2() {
  const items = [
    { section: 'PRODUCE', items: ['Garlic (4 cloves)', 'Asparagus (1 lb)', 'Cherry tomatoes'] },
    { section: 'MEAT', items: ['Chicken thighs (2 lb)', 'Ribeye steaks (2)'] },
    { section: 'PANTRY', items: ['Olive oil', 'Pasta (16 oz)', 'Honey'] },
  ];
  return (
    <div style={{ padding: '12px 14px', height: '100%', background: C.cream, overflowY: 'auto' }}>
      <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: '0.12em', marginBottom: 12 }}>GROCERY LIST</div>
      {items.map((s, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: NU, fontSize: 9, fontWeight: 700, color: C.inkLight, letterSpacing: '0.1em', marginBottom: 4 }}>{s.section}</div>
          {s.items.map((item, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${C.coral}`, flexShrink: 0 }} />
              <div style={{ fontFamily: NU, fontSize: 11, color: C.inkMid }}>{item}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Screen3() {
  const deals = [
    { store: 'KROGER', item: 'Asparagus', deal: '$2.99/lb', save: 'Save $2', emoji: '🌿' },
    { store: 'PUBLIX', item: 'Chicken Breasts', deal: 'BOGO', save: 'Save $8', emoji: '🍗' },
    { store: 'KROGER', item: 'Shrimp Ring', deal: '$8.99', save: 'Save $4', emoji: '🦐' },
  ];
  return (
    <div style={{ padding: '12px 14px', height: '100%', background: C.cream }}>
      <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: '0.12em', marginBottom: 12 }}>THIS WEEK'S DEALS</div>
      {deals.map((d, i) => (
        <div key={i} style={{
          background: C.white, borderRadius: 12, padding: '10px 12px', marginBottom: 8,
          boxShadow: C.shadowSm, border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{d.emoji}</span>
              <div>
                <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 700, color: C.ink }}>{d.item}</div>
                <div style={{ fontFamily: NU, fontSize: 9, color: C.inkLight, marginTop: 1 }}>{d.store}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: PF, fontSize: 13, fontWeight: 700, color: C.coral }}>{d.deal}</div>
              <div style={{ fontFamily: NU, fontSize: 9, color: C.sage, fontWeight: 700 }}>{d.save}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Screen4() {
  const pantry = [
    { emoji: '🥚', name: 'Eggs (8)', status: 'Good', color: C.sage },
    { emoji: '🧀', name: 'Cheddar', status: 'Exp in 3 days', color: C.gold },
    { emoji: '🥛', name: 'Milk', status: 'Exp tomorrow', color: C.coral },
    { emoji: '🌿', name: 'Parsley', status: 'Good', color: C.sage },
    { emoji: '🧄', name: 'Garlic', status: 'Good', color: C.sage },
  ];
  return (
    <div style={{ padding: '12px 14px', height: '100%', background: C.cream }}>
      <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: '0.12em', marginBottom: 12 }}>MY FRIDGE</div>
      {pantry.map((p, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderBottom: i < pantry.length - 1 ? `1px solid ${C.border}` : 'none',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>{p.emoji}</span>
            <div style={{ fontFamily: NU, fontSize: 11, color: C.ink }}>{p.name}</div>
          </div>
          <div style={{ fontFamily: NU, fontSize: 10, fontWeight: 700, color: p.color }}>{p.status}</div>
        </div>
      ))}
    </div>
  );
}

function Screen5() {
  return (
    <div style={{ padding: '12px 14px', height: '100%', background: C.cream }}>
      <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: '0.12em', marginBottom: 12 }}>WEEKLY COST</div>
      <div style={{ background: C.white, borderRadius: 12, padding: 14, boxShadow: C.shadowSm, marginBottom: 10 }}>
        <div style={{ fontFamily: PF, fontSize: 32, fontWeight: 700, color: C.ink }}>$74</div>
        <div style={{ fontFamily: NU, fontSize: 11, color: C.inkLight }}>estimated this week</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Eating out', val: '$350', bad: true },
            { label: 'HelloFresh', val: '$180', bad: true },
            { label: 'Make Me Meals', val: '$74', bad: false },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: NU, fontSize: 10, color: r.bad ? C.inkLight : C.ink, fontWeight: r.bad ? 400 : 700 }}>
                {!r.bad && '✓ '}{r.label}
              </div>
              <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 700, color: r.bad ? C.inkLight : C.coral }}>{r.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: NU, fontSize: 11, color: C.sage, fontWeight: 700, textAlign: 'center' }}>
        You save ~$276 vs eating out 🎉
      </div>
    </div>
  );
}

const SCREENS = [Screen1, Screen2, Screen3, Screen4, Screen5];

function PhoneMockup({ activeFeature }) {
  const Screen = SCREENS[activeFeature] || Screen1;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -40,
        background: `radial-gradient(circle, rgba(232,85,58,0.18) 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      {/* Frame */}
      <div style={{
        width: 240, height: 480, borderRadius: 36,
        background: '#111', border: '7px solid #2A2420',
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 40px 80px rgba(26,20,16,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 72, height: 18, background: '#111', borderRadius: 9, zIndex: 10,
        }} />
        {/* Status bar dots */}
        <div style={{
          position: 'absolute', top: 10, right: 16, zIndex: 11,
          display: 'flex', gap: 3, alignItems: 'center',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A4040' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A4040' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A4040' }} />
        </div>
        {/* Screen */}
        <div style={{ height: '100%', background: C.cream, paddingTop: 32, overflowY: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Home bar */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2,
      }} />
    </div>
  );
}

// ── Feature data ────────────────────────────────────────────
const FEATURES = [
  {
    num: '01', label: 'MEAL PLANNING',
    headline: 'A full week of dinners in 30 seconds.',
    body: 'Tell us your family size, budget, and what you don\'t like. We build restaurant-quality meal plans around you — not the other way around.',
    detail: 'Inspired by real restaurants like Chuy\'s, Olive Garden, Hattie B\'s, and Shake Shack. Home prices. Restaurant quality.',
  },
  {
    num: '02', label: 'GROCERY LIST',
    headline: 'Your list is already built.',
    body: 'Every ingredient. Every quantity. Organized by store section. Copied to your phone in one tap. No more wandering the aisles.',
    detail: 'Works with Aldi, Kroger, Publix, Walmart — any store you shop at.',
  },
  {
    num: '03', label: 'WEEKLY DEALS',
    headline: 'We check the sales so you don\'t have to.',
    body: 'Every week we pull the latest deals from Kroger and Publix. Your meal plan is built around what\'s on sale — automatically.',
    detail: 'The average family saves $30–50 per week just from shopping the deals we find.',
  },
  {
    num: '04', label: 'MY FRIDGE',
    headline: 'Never waste food again.',
    body: 'Tell us what\'s in your fridge and pantry. We build meals around what you already have and remind you before things expire.',
    detail: 'Alerts when you\'re running low. Your grocery list only shows what you actually need to buy.',
  },
  {
    num: '05', label: 'COST CONTROL',
    headline: 'Know exactly what you\'ll spend.',
    body: 'Every meal comes with an estimated cost. Your whole week is costed out before you spend a dollar.',
    detail: 'HelloFresh charges $150–200 for the same week. Our families average $50–90 for the exact same quality.',
  },
];

// ── Sticky Features Section ─────────────────────────────────
function FeaturesSection({ isMobile }) {
  const [active, setActive] = useState(0);
  const featureRefs = FEATURES.map(() => useRef(null));

  useEffect(() => {
    const observers = featureRefs.map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.55 }
      );
      if (ref.current) obs.observe(ref.current);
      return obs;
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  if (isMobile) {
    return (
      <section style={{ background: C.creamDark, padding: '80px 24px' }}>
        {FEATURES.map((f, i) => (
          <FadeIn key={i} delay={0} style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <PhoneMockup activeFeature={i} />
            </div>
            <SectionLabel>{f.num} — {f.label}</SectionLabel>
            <h2 style={{ fontFamily: PF, fontSize: 28, fontWeight: 700, color: C.ink, margin: '0 0 16px', lineHeight: 1.3 }}>{f.headline}</h2>
            <p style={{ fontFamily: NU, fontSize: 15, color: C.inkMid, lineHeight: 1.7, margin: '0 0 12px' }}>{f.body}</p>
            <p style={{ fontFamily: NU, fontSize: 13, color: C.inkLight, lineHeight: 1.6, margin: 0 }}>{f.detail}</p>
          </FadeIn>
        ))}
      </section>
    );
  }

  return (
    <section style={{ background: C.creamDark, position: 'relative' }}>
      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', minHeight: `${FEATURES.length * 100}vh` }}>
        {/* Sticky left */}
        <div style={{
          width: '48%', position: 'sticky', top: 0, height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-start', flexShrink: 0,
        }}>
          <motion.div animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
            <PhoneMockup activeFeature={active} />
          </motion.div>
        </div>

        {/* Scrolling right */}
        <div style={{ flex: 1 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              ref={featureRefs[i]}
              style={{
                height: '100vh', display: 'flex', alignItems: 'center',
                padding: '0 40px 0 24px',
              }}
            >
              <motion.div
                animate={{ opacity: active === i ? 1 : 0.35 }}
                transition={{ duration: 0.4 }}
              >
                <SectionLabel color={active === i ? C.coral : C.inkLight}>{f.num} — {f.label}</SectionLabel>
                <h2 style={{
                  fontFamily: PF, fontSize: 38, fontWeight: 700, color: C.ink,
                  margin: '0 0 20px', lineHeight: 1.25, maxWidth: 440,
                }}>{f.headline}</h2>
                <p style={{ fontFamily: NU, fontSize: 17, color: C.inkMid, lineHeight: 1.75, margin: '0 0 16px', maxWidth: 400 }}>{f.body}</p>
                <p style={{ fontFamily: NU, fontSize: 14, color: C.inkLight, lineHeight: 1.65, margin: 0, maxWidth: 380 }}>{f.detail}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main component ──────────────────────────────────────────
export default function Landing() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard');
  }, [isSignedIn, isLoaded, navigate]);

  const CTAButton = ({ children, style = {} }) => (
    <SignUpButton mode="modal">
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: C.shadowCoral }}
        whileTap={{ scale: 0.98 }}
        style={{
          fontFamily: NU, fontSize: isMobile ? 15 : 17, fontWeight: 700,
          background: C.coral, color: C.white,
          border: 'none', borderRadius: 50, cursor: 'pointer',
          padding: isMobile ? '14px 28px' : '16px 36px',
          boxShadow: C.shadowCoral, transition: 'box-shadow 0.2s',
          ...style,
        }}
      >{children}</motion.button>
    </SignUpButton>
  );

  return (
    <div style={{ background: C.cream, color: C.ink, overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(253,250,246,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 60px)', height: 64,
      }}>
        <img src={logo} alt="Make Me Meals" style={{ height: 32, objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.02 }}
              style={{
                fontFamily: NU, fontSize: 14, fontWeight: 700,
                background: 'transparent', color: C.inkMid, border: `1.5px solid ${C.border}`,
                borderRadius: 50, padding: '8px 20px', cursor: 'pointer',
              }}
            >Sign in</motion.button>
          </SignInButton>
          <SignUpButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: C.shadowCoral }}
              style={{
                fontFamily: NU, fontSize: 14, fontWeight: 700,
                background: C.coral, color: C.white, border: 'none',
                borderRadius: 50, padding: '8px 20px', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(232,85,58,0.2)',
              }}
            >Get started free</motion.button>
          </SignUpButton>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', paddingTop: 64,
        display: 'flex', alignItems: 'center',
        padding: '64px clamp(20px, 5vw, 60px) 80px',
        background: `linear-gradient(135deg, ${C.cream} 0%, ${C.creamDark} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1100, margin: '0 auto', width: '100%',
          display: 'flex', alignItems: 'center', gap: 60,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          {/* Left copy */}
          <div style={{ flex: isMobile ? undefined : '0 0 55%' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div style={{
                fontFamily: NU, fontSize: 11, fontWeight: 700, color: C.coral,
                letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24,
              }}>MEAL PLANNING MADE SIMPLE</div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontFamily: PF, fontSize: isMobile ? 44 : 70, fontWeight: 900,
                color: C.ink, lineHeight: 1.1, margin: '0 0 24px',
              }}
            >
              Stop wondering<br />
              <span style={{ fontStyle: 'italic', color: C.coral }}>what's for dinner.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{
                fontFamily: NU, fontSize: isMobile ? 16 : 19, color: C.inkMid,
                lineHeight: 1.7, margin: '0 0 20px', maxWidth: 480,
              }}
            >
              Restaurant-quality meal plans built around your budget, your family, and your store.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              style={{ fontFamily: NU, fontSize: 14, color: C.inkLight, marginBottom: 36 }}
            >
              🍽️ Saved by 300+ families this week
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
            >
              <CTAButton style={{ fontSize: isMobile ? 16 : 18, padding: isMobile ? '15px 30px' : '17px 38px', width: isMobile ? '100%' : 'auto' }}>
                Get My Free Meal Plan →
              </CTAButton>
              <div style={{ fontFamily: NU, fontSize: 12, color: C.inkLight }}>
                First plan free · No card required · 30 seconds
              </div>
            </motion.div>
          </div>

          {/* Right phone */}
          {!isMobile && (
            <div style={{ flex: '0 0 45%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              >
                <PhoneMockup activeFeature={0} />
              </motion.div>

              {/* Floating cards */}
              {[
                { content: '🍗 Honey Garlic — $11', top: '18%', left: '-20%', delay: 0.7 },
                { content: '✓ Grocery list ready', top: '58%', right: '-12%', delay: 0.9 },
                { content: '⏱ 25 min · Easy', top: '80%', left: '-10%', delay: 1.1 },
              ].map((fc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  transition={{
                    opacity: { delay: fc.delay, duration: 0.5 },
                    scale: { delay: fc.delay, duration: 0.5 },
                    y: { delay: fc.delay + 0.5, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{
                    position: 'absolute',
                    top: fc.top, left: fc.left, right: fc.right,
                    background: C.white, borderRadius: 12, padding: '8px 14px',
                    boxShadow: C.shadowMd, border: `1px solid ${C.border}`,
                    fontFamily: NU, fontSize: 12, fontWeight: 600, color: C.ink,
                    whiteSpace: 'nowrap',
                  }}
                >{fc.content}</motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ background: C.white, padding: `${isMobile ? 80 : 120}px clamp(20px,5vw,60px)` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel center>SOUND FAMILIAR?</SectionLabel>
            <h2 style={{
              fontFamily: PF, fontSize: isMobile ? 32 : 46, fontWeight: 700,
              fontStyle: 'italic', color: C.ink, margin: '0 0 60px', lineHeight: 1.25,
            }}>
              It's 6pm. You're exhausted.<br />And nobody knows what's for dinner.
            </h2>
          </FadeIn>

          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: 24, marginBottom: 60,
          }}>
            {[
              { icon: '🔄', text: 'You make the same 5 meals on repeat' },
              { icon: '💸', text: 'HelloFresh costs $200+ a month for the same results' },
              { icon: '🤯', text: 'You spend 20 minutes on Pinterest and still can\'t decide' },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.15} style={{ flex: 1 }}>
                <div style={{
                  background: C.cream, borderRadius: 20, padding: '28px 24px',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                  <p style={{ fontFamily: NU, fontSize: 15, color: C.inkMid, lineHeight: 1.6, margin: 0 }}>{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div style={{ width: 60, height: 2, background: C.coral, margin: '0 auto 28px' }} />
            <h3 style={{
              fontFamily: PF, fontSize: isMobile ? 28 : 36, fontWeight: 700,
              color: C.coral, margin: 0,
            }}>There's a better way.</h3>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURES (STICKY SCROLL) ── */}
      <FeaturesSection isMobile={isMobile} />

      {/* ── SOCIAL PROOF ── */}
      <section style={{ background: C.white, padding: `${isMobile ? 80 : 100}px clamp(20px,5vw,60px)` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel center>REAL FAMILIES. REAL RESULTS.</SectionLabel>
            <h2 style={{
              fontFamily: PF, fontSize: isMobile ? 32 : 46, fontWeight: 700,
              color: C.ink, margin: '0 0 60px',
            }}>Saved by 300+ families this week</h2>
          </FadeIn>

          <div style={{
            display: 'flex', gap: 24, justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row', marginBottom: 60,
          }}>
            {[
              { val: '300+', label: 'families saved this week' },
              { val: '$60–90', label: 'average weekly spend' },
              { val: '30 sec', label: 'to plan your whole week' },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.12} style={{ flex: 1 }}>
                <div style={{
                  background: C.cream, borderRadius: 24, padding: '36px 24px',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontFamily: PF, fontSize: isMobile ? 44 : 52, fontWeight: 700, color: C.coral }}>{s.val}</div>
                  <div style={{ fontFamily: NU, fontSize: 14, color: C.inkMid, marginTop: 8 }}>{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* TikTok card */}
          <FadeIn>
            <div style={{
              display: 'inline-block', background: '#010101', borderRadius: 20,
              padding: '20px 24px', maxWidth: 340, width: '100%',
              boxShadow: C.shadowLg, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.coral}, ${C.gold})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>🍽️</div>
                <div>
                  <div style={{ fontFamily: NU, fontSize: 13, fontWeight: 700, color: '#fff' }}>make.me.meals</div>
                  <div style={{ fontFamily: NU, fontSize: 11, color: '#888' }}>@make.me.meals</div>
                </div>
              </div>
              <div style={{ fontFamily: NU, fontSize: 13, color: '#ccc', lineHeight: 1.6, marginBottom: 16 }}>
                Family of 5 full week of meals from Aldi 🛒 Total spend: $67. Every recipe included 👇
              </div>
              <div style={{
                background: '#1a1a1a', borderRadius: 12, padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontFamily: NU, fontSize: 12, color: '#fff' }}>❤️ 2.4k</span>
                  <span style={{ fontFamily: NU, fontSize: 12, color: '#fff' }}>💬 89</span>
                  <span style={{ fontFamily: NU, fontSize: 12, color: C.coral }}>↗️ 71 saves</span>
                </div>
              </div>
              <div style={{ fontFamily: NU, fontSize: 11, color: '#555', marginTop: 10, textAlign: 'center' }}>
                As seen on TikTok 🍽️
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.creamDark, padding: `${isMobile ? 80 : 120}px clamp(20px,5vw,60px)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel center>HOW IT WORKS</SectionLabel>
            <h2 style={{
              fontFamily: PF, fontSize: isMobile ? 32 : 46, fontWeight: 700,
              color: C.ink, margin: '0 0 60px',
            }}>Dinner sorted in three steps.</h2>
          </FadeIn>

          <div style={{
            display: 'flex', gap: 32, flexDirection: isMobile ? 'column' : 'row',
            marginBottom: 60,
          }}>
            {[
              { num: '01', icon: '🎯', title: 'Tell us about your family', body: 'How many people, your budget, your store, and anything you don\'t want to eat.' },
              { num: '02', icon: '✨', title: 'We build your meal plan', body: 'Restaurant-inspired dinners chosen for your budget. Grocery list included. Deals matched automatically.' },
              { num: '03', icon: '🛒', title: 'Shop and cook', body: 'Your list is ready. Your meals are planned. Your week is sorted. All in 30 seconds.' },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15} style={{ flex: 1 }}>
                <div style={{
                  background: C.white, borderRadius: 24, padding: '36px 28px',
                  position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}`,
                  boxShadow: C.shadowSm,
                }}>
                  <div style={{
                    position: 'absolute', top: -10, right: -4,
                    fontFamily: PF, fontSize: 80, fontWeight: 900,
                    color: C.coralSoft, lineHeight: 1, userSelect: 'none',
                  }}>{step.num}</div>
                  <div style={{ fontSize: 36, marginBottom: 16, position: 'relative' }}>{step.icon}</div>
                  <h3 style={{ fontFamily: PF, fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 12px', position: 'relative' }}>{step.title}</h3>
                  <p style={{ fontFamily: NU, fontSize: 14, color: C.inkMid, lineHeight: 1.7, margin: 0, position: 'relative' }}>{step.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <CTAButton style={{ width: isMobile ? '100%' : 'auto', fontSize: 17, padding: '17px 40px' }}>
              Try It Free — Takes 30 Seconds →
            </CTAButton>
            <div style={{ fontFamily: NU, fontSize: 12, color: C.inkLight, marginTop: 14 }}>No card required. First plan free.</div>
          </FadeIn>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section style={{ background: C.white, padding: `${isMobile ? 80 : 100}px clamp(20px,5vw,60px)` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel center>THE MATH IS SIMPLE</SectionLabel>
            <h2 style={{
              fontFamily: PF, fontSize: isMobile ? 28 : 44, fontWeight: 700,
              color: C.ink, margin: '0 0 48px',
            }}>Same quality. A fraction of the cost.</h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 20, marginBottom: 40,
            }}>
              {/* MMM card */}
              <div style={{
                background: C.coralSoft, borderRadius: 24, padding: '32px 28px',
                border: `2px solid ${C.coral}`, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: C.coral, color: C.white, borderRadius: 50,
                  fontFamily: NU, fontSize: 10, fontWeight: 700, padding: '4px 10px',
                  letterSpacing: '0.08em',
                }}>✓ BEST VALUE</div>
                <div style={{ fontFamily: PF, fontSize: 22, fontWeight: 700, color: C.coral, marginBottom: 20 }}>Make Me Meals</div>
                {[
                  { label: 'Weekly cost', val: '$60–90' },
                  { label: 'Setup time', val: '30 seconds' },
                  { label: 'Flexibility', val: 'Any store' },
                  { label: 'Recipes', val: 'Restaurant-inspired' },
                  { label: 'Price', val: 'First plan free' },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: i < 4 ? `1px solid rgba(232,85,58,0.15)` : 'none',
                  }}>
                    <span style={{ fontFamily: NU, fontSize: 13, color: C.inkMid }}>{r.label}</span>
                    <span style={{ fontFamily: NU, fontSize: 13, fontWeight: 700, color: C.coral }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* HelloFresh card */}
              <div style={{
                background: '#F8F8F8', borderRadius: 24, padding: '32px 28px',
                border: `1px solid #E0E0E0`,
              }}>
                <div style={{ fontFamily: PF, fontSize: 22, fontWeight: 700, color: '#999', marginBottom: 20 }}>HelloFresh</div>
                {[
                  { label: 'Weekly cost', val: '$150–200' },
                  { label: 'Setup time', val: '20 minutes' },
                  { label: 'Flexibility', val: 'Their boxes only' },
                  { label: 'Recipes', val: 'Generic templates' },
                  { label: 'Price', val: '$$$' },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: i < 4 ? '1px solid #E8E8E8' : 'none',
                  }}>
                    <span style={{ fontFamily: NU, fontSize: 13, color: '#aaa' }}>{r.label}</span>
                    <span style={{ fontFamily: NU, fontSize: 13, fontWeight: 700, color: '#bbb' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{
              fontFamily: PF, fontSize: isMobile ? 18 : 22, fontStyle: 'italic',
              color: C.inkMid, margin: 0, lineHeight: 1.5,
            }}>
              "The average Make Me Meals family saves $100+ every single week."
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        background: C.coral, padding: `${isMobile ? 100 : 140}px clamp(20px,5vw,60px)`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />

        <FadeIn>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🍽️</div>
          <h2 style={{
            fontFamily: PF, fontSize: isMobile ? 42 : 62, fontWeight: 900,
            color: C.white, margin: '0 0 20px', lineHeight: 1.15,
          }}>
            Your family deserves<br />good food.
          </h2>
          <p style={{
            fontFamily: NU, fontSize: isMobile ? 16 : 20,
            color: 'rgba(255,255,255,0.85)', margin: '0 0 40px',
          }}>
            And you deserve to stop stressing about it.
          </p>
          <SignUpButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 16px 40px rgba(26,20,16,0.25)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                fontFamily: NU, fontSize: isMobile ? 16 : 18, fontWeight: 700,
                background: C.white, color: C.coral, border: 'none',
                borderRadius: 50, padding: isMobile ? '15px 32px' : '18px 44px',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(26,20,16,0.15)',
                width: isMobile ? '100%' : 'auto',
              }}
            >Get My Free Meal Plan →</motion.button>
          </SignUpButton>
          <div style={{
            fontFamily: NU, fontSize: 13, color: 'rgba(255,255,255,0.65)',
            marginTop: 18, lineHeight: 1.6,
          }}>
            First plan free · No card required<br />Join 300+ families eating better
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: C.ink, color: C.cream,
        padding: `60px clamp(20px,5vw,60px) 40px`,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
            gap: 48, marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <img src={logo} alt="Make Me Meals" style={{ height: 28, opacity: 0.9, marginBottom: 16, filter: 'brightness(10)' }} />
              <p style={{ fontFamily: NU, fontSize: 14, color: C.inkLight, margin: '0 0 20px', lineHeight: 1.6, maxWidth: 280 }}>
                Real food. Real simple.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: NU, fontSize: 13, color: '#6B6060' }}>🎵 TikTok: @make.me.meals</div>
                <div style={{ fontFamily: NU, fontSize: 13, color: '#6B6060' }}>📸 Instagram: @make.me.meals</div>
              </div>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 700, color: C.coral, letterSpacing: '0.15em', marginBottom: 16 }}>PRODUCT</div>
              {['Meal Planning', 'Grocery Lists', 'Weekly Deals', 'My Fridge', 'Pricing'].map(l => (
                <div key={l} style={{ fontFamily: NU, fontSize: 14, color: '#6B6060', marginBottom: 10 }}>{l}</div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontFamily: NU, fontSize: 11, fontWeight: 700, color: C.coral, letterSpacing: '0.15em', marginBottom: 16 }}>COMPANY</div>
              {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map(l => (
                <div key={l} style={{ fontFamily: NU, fontSize: 14, color: '#6B6060', marginBottom: 10 }}>{l}</div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 24, textAlign: 'center',
            fontFamily: NU, fontSize: 12, color: '#4A4040',
          }}>
            © 2026 Make Me Meals. Built for real families.
          </div>
        </div>
      </footer>
    </div>
  );
}
