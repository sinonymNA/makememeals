import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import RecipeCard from './RecipeCard.jsx';

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ meal, onSwipeLeft, onSwipeRight, onCardClick, isTop, stackIndex }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const [isDragging, setIsDragging] = useState(false);

  const stackStyles = {
    0: { scale: 1, y: 0, zIndex: 10 },
    1: { scale: 0.96, y: 16, zIndex: 9 },
    2: { scale: 0.92, y: 32, zIndex: 8 },
  };

  const stack = stackStyles[stackIndex] || stackStyles[2];

  async function handleDragEnd(_, info) {
    setIsDragging(false);
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD) {
      await animate(x, -600, { type: 'spring', stiffness: 500, damping: 20 });
      onSwipeLeft();
    } else if (offset > SWIPE_THRESHOLD) {
      await animate(x, 600, { type: 'spring', stiffness: 500, damping: 20 });
      onSwipeRight();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 18 });
    }
  }

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: stack.scale, y: stack.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ zIndex: stack.zIndex, pointerEvents: 'none' }}
      >
        <RecipeCard meal={meal} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: stack.zIndex }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      {/* Skip overlay (left) */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          opacity: leftOpacity,
          background: 'rgba(224,90,90,0.15)',
          zIndex: 20,
        }}
      >
        <div className="absolute top-5 right-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: '#E05A5A' }}
          >
            <X size={22} color="white" strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* Love overlay (right) */}
      <motion.div
        className="absolute inset-0 rounded-[20px] pointer-events-none"
        style={{
          opacity: rightOpacity,
          background: 'rgba(46,204,113,0.15)',
          zIndex: 20,
        }}
      >
        <div className="absolute top-5 left-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-green)' }}
          >
            <Heart size={22} color="white" fill="white" />
          </div>
        </div>
      </motion.div>

      <div onClick={onCardClick} style={{ cursor: 'pointer' }}>
        <RecipeCard meal={meal} />
      </div>
    </motion.div>
  );
}
