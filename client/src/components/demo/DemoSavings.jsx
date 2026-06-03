import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Brain, ArrowRight } from 'lucide-react';
import { getMealImageUrl } from '../../lib/imageUrl.js';
import OdometerNumber from './OdometerNumber.jsx';
import { DEMO } from './palette.js';

// Screen 3 — Savings reveal. The bill rolls DOWN in two staged beats:
// coupons, then ingredient consolidation, landing on a lower final number.
export default function DemoSavings({ selected, savings, onContinue, sound }) {
  const [stage, setStage] = useState(1);
  const [bill, setBill] = useState(savings.baseTotal);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => {
      setStage(2);
      setBill(savings.finalTotal + savings.consolidationTotal); // subtract coupons
      savings.coupons.forEach((_, i) => timers.push(setTimeout(() => sound.playCoupon?.(), 250 + i * 220)));
    }, 1400));
    timers.push(setTimeout(() => {
      setStage(3);
      setBill(savings.finalTotal); // subtract consolidation
      sound.playSave?.();
    }, 3400));
    timers.push(setTimeout(() => { setStage(4); sound.playWin?.(); }, 4700));
    return () => timers.forEach(clearTimeout);
  }, [savings, sound]);

  const overlap = savings.consolidations[0];

  return (
    <div style={{ minHeight: '100vh', background: DEMO.cream, display: 'flex', flexDirection: 'column' }}>
      {/* Selected meals strip */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '20px 18px 10px', flexShrink: 0 }}>
        {selected.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ flexShrink: 0, width: '64px' }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 3px 10px rgba(0,0,0,0.12)' }}>
              <img src={m.imageUrl || getMealImageUrl(m.name)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '12px 24px 24px', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontFamily: DEMO.sans, fontWeight: 800, fontSize: '17px', color: DEMO.ink, margin: 0 }}
        >
          {stage < 4 ? 'Your meal plan is ready! 🎉' : 'Here’s your smart grocery total 👇'}
        </motion.p>

        {/* The big rolling number */}
        <OdometerNumber
          value={bill}
          decimals={2}
          duration={1.1}
          style={{
            fontFamily: DEMO.serif, fontWeight: 700,
            fontSize: 'clamp(56px, 18vw, 80px)', lineHeight: 1.05,
            color: stage >= 3 ? DEMO.coral : DEMO.ink,
            margin: '10px 0 2px', transition: 'color 0.5s', display: 'block',
          }}
        />
        <p style={{ fontFamily: DEMO.sans, fontSize: '15px', color: DEMO.inkMid, margin: 0 }}>
          for your whole week · 5 dinners · 4 people
        </p>

        {/* Stage 2 — coupons */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '26px', width: '100%' }}
            >
              <Row icon={<Scissors size={16} color={DEMO.coral} />} text={`We found ${savings.coupons.length} coupons for your run`} amount={savings.couponTotal} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center', marginTop: '10px' }}>
                {savings.coupons.map((c, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: 40, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.22, type: 'spring', stiffness: 320, damping: 18 }}
                    style={chip}
                  >
                    ✂️ {c.product} <b style={{ color: DEMO.coral }}>−${c.save.toFixed(2)}</b>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 3 — consolidation */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '18px', width: '100%' }}
            >
              <Row icon={<Brain size={16} color={DEMO.green} />} text="We consolidated your ingredients" amount={savings.consolidationTotal} green />
              {overlap && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{ ...chip, marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FAF2', border: `1px solid ${DEMO.green}33` }}
                >
                  <span style={{ fontWeight: 700 }}>{shortName(overlap.mealNames[0])}</span>
                  <span style={{ color: DEMO.inkLight }}>+</span>
                  <span style={{ fontWeight: 700 }}>{shortName(overlap.mealNames[1])}</span>
                  <ArrowRight size={13} color={DEMO.inkLight} />
                  <span>one {overlap.label.toLowerCase()} purchase</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 4 — total saved + continue */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ marginTop: '24px', width: '100%' }}
            >
              <div style={{ fontFamily: DEMO.sans, fontWeight: 900, fontSize: '20px', color: DEMO.green }}>
                You saved ${savings.totalSaved.toFixed(2)} 🎉
              </div>
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: '18px', width: '100%',
                  fontFamily: DEMO.sans, fontWeight: 800, fontSize: '17px', color: '#fff',
                  background: DEMO.coral, border: 'none', borderRadius: '999px',
                  padding: '16px', cursor: 'pointer', boxShadow: '0 10px 28px rgba(232,85,58,0.32)',
                }}
              >
                Get my full plan & grocery list →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const chip = {
  fontFamily: DEMO.sans, fontSize: '13px', fontWeight: 600, color: DEMO.ink,
  background: '#fff', borderRadius: '999px', padding: '7px 12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
};

function Row({ icon, text, amount, green }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: DEMO.sans, fontSize: '15px', fontWeight: 700, color: DEMO.ink }}>
      {icon}
      <span>{text}</span>
      <span style={{ color: green ? DEMO.green : DEMO.coral, fontWeight: 900 }}>−${amount.toFixed(2)}</span>
    </div>
  );
}

function shortName(name = '') {
  const words = name.split(' ');
  return words.length > 2 ? words.slice(0, 2).join(' ') : name;
}
