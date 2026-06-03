import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Brain, ArrowRight } from 'lucide-react';
import { getMealImageUrl } from '../../lib/imageUrl.js';
import OdometerNumber from './OdometerNumber.jsx';
import { DEMO } from './palette.js';

// Screen 3 — Savings reveal. The bill rolls DOWN in two staged beats:
// coupons, then ingredient consolidation, landing on a lower final number.
// The ORIGINAL price stays visible, crossed-out, so the contrast is obvious.
export default function DemoSavings({ selected, savings, onContinue, sound }) {
  const [stage, setStage] = useState(1);
  const [bill, setBill] = useState(savings.baseTotal);
  const [pulseBg, setPulseBg] = useState(false);

  function triggerPulse() {
    setPulseBg(true);
    setTimeout(() => setPulseBg(false), 600);
  }

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => {
      setStage(2);
      setBill(savings.finalTotal + savings.consolidationTotal);
      triggerPulse();
      savings.coupons.forEach((_, i) => timers.push(setTimeout(() => sound.playCoupon?.(), 250 + i * 220)));
    }, 1400));
    timers.push(setTimeout(() => {
      setStage(3);
      setBill(savings.finalTotal);
      triggerPulse();
      sound.playSave?.();
    }, 3800));
    timers.push(setTimeout(() => { setStage(4); sound.playWin?.(); }, 5200));
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
          Your meal plan is ready! 🎉
        </motion.p>

        {/* Price comparison block — original crossed-out, current rolling */}
        <motion.div
          animate={{ background: pulseBg ? 'rgba(46,204,113,0.08)' : 'transparent' }}
          transition={{ duration: 0.25 }}
          style={{ borderRadius: '20px', padding: '12px 20px 10px', marginTop: '6px', width: '100%' }}
        >
          {/* Original price — always visible once stage >= 2 */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}
              >
                <span style={{
                  fontFamily: DEMO.serif, fontWeight: 700,
                  fontSize: 'clamp(22px, 6vw, 30px)', color: DEMO.inkLight,
                  textDecoration: 'line-through',
                  textDecorationThickness: '3px',
                }}>
                  ${savings.baseTotal.toFixed(2)}
                </span>
                <span style={{ fontFamily: DEMO.sans, fontSize: '13px', color: DEMO.inkLight, fontWeight: 700 }}>
                  before savings
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current bill — the big rolling number */}
          <OdometerNumber
            value={bill}
            decimals={2}
            duration={1.0}
            style={{
              fontFamily: DEMO.serif, fontWeight: 700,
              fontSize: 'clamp(58px, 18vw, 82px)', lineHeight: 1.0,
              color: stage >= 3 ? DEMO.coral : DEMO.ink,
              transition: 'color 0.5s', display: 'block',
            }}
          />

          {/* Savings badge — appears after first drop */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                key={`badge-${stage}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: DEMO.green, color: '#fff',
                  fontFamily: DEMO.sans, fontWeight: 900, fontSize: '15px',
                  borderRadius: '999px', padding: '5px 14px', marginTop: '8px',
                }}
              >
                You're saving ${(savings.baseTotal - bill).toFixed(2)} so far 🎉
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ fontFamily: DEMO.sans, fontSize: '14px', color: DEMO.inkMid, margin: '8px 0 0' }}>
            for your whole week · 5 dinners · 4 people
          </p>
        </motion.div>

        {/* Stage 2 — coupons */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '18px', width: '100%' }}
            >
              <Row icon={<Scissors size={16} color={DEMO.coral} />} text={`${savings.coupons.length} coupons matched to your list`} amount={savings.couponTotal} />
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
              style={{ marginTop: '16px', width: '100%' }}
            >
              <Row icon={<Brain size={16} color={DEMO.green} />} text="Ingredients consolidated" amount={savings.consolidationTotal} green />
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

        {/* Stage 4 — final total saved + continue */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ marginTop: '22px', width: '100%' }}
            >
              <div style={{
                fontFamily: DEMO.sans, fontWeight: 900, fontSize: '22px', color: DEMO.green,
                background: '#F0FAF2', borderRadius: '14px', padding: '12px',
              }}>
                Total saved: ${savings.totalSaved.toFixed(2)} 🎉
              </div>
              <motion.button
                onClick={onContinue}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: '14px', width: '100%',
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
