import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, Check, Clock } from 'lucide-react';
import { getMealImageUrl } from '../../lib/imageUrl.js';

const SWIPE_THRESHOLD = 110;

// A Tinder-style demo card: full-bleed food photo with the dish name, the
// "Inspired by …" line, and cost / time badges overlaid on a bottom gradient.
export default function DemoSwipeCard({ meal, onSwipeLeft, onSwipeRight, onCardClick, isTop, stackIndex }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40, 0], [1, 0.4, 0]);
  const rightOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.4, 1]);
  const [dragging, setDragging] = useState(false);

  const stackStyles = {
    0: { scale: 1, y: 0, zIndex: 10 },
    1: { scale: 0.95, y: 18, zIndex: 9 },
    2: { scale: 0.9, y: 36, zIndex: 8 },
  };
  const stack = stackStyles[stackIndex] || stackStyles[2];

  const imgSrc = meal.imageUrl || getMealImageUrl(meal.name, meal.pexels_query);
  const cost = meal.estimated_cost != null ? `~$${Math.round(Number(meal.estimated_cost))}` : null;

  async function handleDragEnd(_, info) {
    setDragging(false);
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD) {
      await animate(x, -700, { type: 'spring', stiffness: 500, damping: 24 });
      onSwipeLeft();
    } else if (offset > SWIPE_THRESHOLD) {
      await animate(x, 700, { type: 'spring', stiffness: 500, damping: 24 });
      onSwipeRight();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 18 });
    }
  }

  const Inner = (
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: '24px', overflow: 'hidden',
        background: '#1a1410', boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
      }}
    >
      <img
        src={imgSrc}
        alt={meal.name}
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
        onError={(e) => { e.currentTarget.style.opacity = 0.4; }}
      />

      {/* Bottom gradient + text */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '60px 20px 22px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 12%, rgba(0,0,0,0.55) 50%, transparent)',
          color: '#fff',
        }}
      >
        {(meal.inspired_by) && (
          <p style={{ margin: 0, fontFamily: "'Nunito', sans-serif", fontStyle: 'italic', fontSize: '13px', color: '#FFB59E', fontWeight: 700 }}>
            Inspired by {meal.inspired_by.replace(/^Inspired by\s*/i, '')}
          </p>
        )}
        <h2 style={{ margin: '4px 0 0', fontFamily: "'Playfair Display', serif", fontSize: '25px', fontWeight: 700, lineHeight: 1.15 }}>
          {meal.name}
        </h2>
      </div>

      {/* Top badges row */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        {cost && (
          <span style={badgeStyle}>{cost} for 4</span>
        )}
        {meal.prep_minutes && (
          <span style={{ ...badgeStyle, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} strokeWidth={2.5} /> {meal.prep_minutes} min
          </span>
        )}
      </div>

      {/* Swipe overlays */}
      {isTop && (
        <>
          <motion.div style={{ position: 'absolute', top: '22px', left: '20px', opacity: rightOpacity }}>
            <Stamp color="#2ECC71" label="ADD" icon={<Check size={20} strokeWidth={3} color="#fff" />} />
          </motion.div>
          <motion.div style={{ position: 'absolute', top: '22px', right: '20px', opacity: leftOpacity }}>
            <Stamp color="#E05A5A" label="SKIP" icon={<X size={20} strokeWidth={3} color="#fff" />} />
          </motion.div>
        </>
      )}
    </div>
  );

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: stack.scale, y: stack.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ zIndex: stack.zIndex, pointerEvents: 'none' }}
      >
        {Inner}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, zIndex: stack.zIndex, cursor: 'grab', touchAction: 'pan-y' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={() => { if (!dragging) onCardClick?.(); }}
      whileTap={{ cursor: 'grabbing' }}
    >
      {Inner}
    </motion.div>
  );
}

const badgeStyle = {
  fontFamily: "'Nunito', sans-serif",
  fontSize: '12px',
  fontWeight: 800,
  color: '#1a1410',
  background: 'rgba(255,255,255,0.92)',
  padding: '5px 11px',
  borderRadius: '999px',
  backdropFilter: 'blur(4px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

function Stamp({ color, label, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: color, padding: '8px 14px 8px 10px', borderRadius: '999px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
      {icon}
      <span style={{ fontFamily: "'Nunito', sans-serif", color: '#fff', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>{label}</span>
    </div>
  );
}
