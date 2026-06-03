import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Check, Volume2, VolumeX } from 'lucide-react';
import DemoSwipeCard from './DemoSwipeCard.jsx';
import OdometerNumber from './OdometerNumber.jsx';
import { DEMO } from './palette.js';
import logo from '../MMMlogolong.png';

const TARGET = 5;

// Screen 2 — the swipe deck. Header shows progress + a live grocery-bill
// counter; cards fly off; the bill ticks up with every meal added.
export default function DemoSwipe({ meals, onComplete, sound }) {
  const [queue, setQueue] = useState(() => meals.slice());
  const [skipped, setSkipped] = useState([]);
  const [selected, setSelected] = useState([]);
  const [done, setDone] = useState(false);

  const total = useMemo(
    () => selected.reduce((s, m) => s + Number(m.estimated_cost || 0), 0),
    [selected]
  );

  function finish(finalSelected) {
    setDone(true);
    confetti({ particleCount: 200, spread: 160, origin: { y: 0.4 }, colors: [DEMO.coral, DEMO.green, DEMO.gold] });
    setTimeout(() => confetti({ particleCount: 150, spread: 180, origin: { y: 0.5 }, colors: [DEMO.coral, DEMO.green] }), 500);
    sound.playWin?.();
    setTimeout(() => onComplete(finalSelected), 1500);
  }

  function handleAdd() {
    if (done) return;
    const meal = queue[0];
    if (!meal) return;
    const nextSelected = [...selected, meal];
    let rest = queue.slice(1);
    // Recycle skipped cards if the deck empties before they've picked enough.
    if (rest.length === 0 && nextSelected.length < TARGET && skipped.length > 0) {
      rest = [...skipped].sort(() => Math.random() - 0.5);
      setSkipped([]);
    }
    setSelected(nextSelected);
    setQueue(rest);
    confetti({ particleCount: 36, spread: 55, origin: { y: 0.65 }, colors: [DEMO.coral, DEMO.green] });
    sound.playAdd?.();
    if (nextSelected.length >= TARGET) finish(nextSelected);
  }

  function handleSkip() {
    if (done) return;
    const meal = queue[0];
    if (!meal) return;
    let rest = queue.slice(1);
    const nextSkipped = [...skipped, meal];
    if (rest.length === 0 && selected.length < TARGET) {
      rest = [...nextSkipped].sort(() => Math.random() - 0.5);
      setSkipped([]);
    } else {
      setSkipped(nextSkipped);
    }
    setQueue(rest);
    sound.playSkip?.();
  }

  const visible = queue.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: DEMO.cream, display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div style={{ padding: '14px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <img src={logo} alt="Make Me Meals" style={{ height: 22, objectFit: 'contain' }} />

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '7px', flex: 1, justifyContent: 'center' }}>
          {Array.from({ length: TARGET }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i < selected.length ? '22px' : '9px',
                background: i < selected.length ? DEMO.coral : 'rgba(0,0,0,0.12)',
              }}
              style={{ height: '9px', borderRadius: '999px' }}
            />
          ))}
        </div>

        {/* Bill counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={sound.toggle}
            aria-label="Toggle sound"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DEMO.inkLight, padding: 0, display: 'flex' }}
          >
            {sound.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: DEMO.sans, fontWeight: 900, fontSize: '17px', color: DEMO.coral }}>
            <span style={{ fontSize: '15px' }}>🛒</span>
            <OdometerNumber value={total} decimals={0} />
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontFamily: DEMO.sans, fontSize: '13px', color: DEMO.inkLight, margin: '2px 0 0' }}>
        Pick {TARGET} dinners · {selected.length}/{TARGET} added
      </p>

      {/* Card stack */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 22px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px', aspectRatio: '3 / 4' }}>
          <AnimatePresence>
            {visible.length === 0 && !done && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: DEMO.inkMid, fontFamily: DEMO.sans }}
              >
                That's the menu! Add a few to continue.
              </motion.div>
            )}
          </AnimatePresence>

          {visible
            .map((meal, i) => ({ meal, i }))
            .reverse()
            .map(({ meal, i }) => (
              <DemoSwipeCard
                key={meal.card_id || meal.name}
                meal={meal}
                isTop={i === 0}
                stackIndex={i}
                onSwipeRight={handleAdd}
                onSwipeLeft={handleSkip}
              />
            ))}

          {/* Completion flash */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 30, borderRadius: '24px',
                  background: 'rgba(253,250,246,0.96)', backdropFilter: 'blur(2px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px',
                }}
              >
                <div style={{ fontSize: '52px' }}>🎉</div>
                <h2 style={{ fontFamily: DEMO.serif, fontSize: '28px', color: DEMO.ink, margin: '12px 0 0' }}>Your plan is set!</h2>
                <p style={{ fontFamily: DEMO.sans, color: DEMO.inkMid, marginTop: '6px' }}>Crunching your savings…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', padding: '12px 0 30px' }}>
        <ActionButton onClick={handleSkip} disabled={done || visible.length === 0} color={DEMO.coral} ring="#E05A5A">
          <X size={28} strokeWidth={3} color="#E05A5A" />
        </ActionButton>
        <ActionButton onClick={handleAdd} disabled={done || visible.length === 0} color={DEMO.green} ring={DEMO.green}>
          <Check size={28} strokeWidth={3} color={DEMO.green} />
        </ActionButton>
      </div>
    </div>
  );
}

function ActionButton({ onClick, disabled, ring, children }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.88 }}
      style={{
        width: '64px', height: '64px', borderRadius: '999px',
        background: '#fff', border: `2.5px solid ${ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </motion.button>
  );
}
