import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import RecipeCard from './RecipeCard.jsx';

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ meal, onSwipeLeft, onSwipeRight, isTop, stackIndex }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40, 0], [1, 0.6, 0]);
  const rightOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.6, 1]);
  const [isDragging, setIsDragging] = useState(false);

  const stackStyles = {
    0: { scale: 1, y: 0, zIndex: 10 },
    1: { scale: 0.95, y: 12, zIndex: 9 },
    2: { scale: 0.90, y: 24, zIndex: 8 },
  };

  const stack = stackStyles[stackIndex] || stackStyles[2];

  async function handleDragEnd(_, info) {
    setIsDragging(false);
    const offset = info.offset.x;

    if (offset < -SWIPE_THRESHOLD) {
      await animate(x, -600, { duration: 0.3 });
      onSwipeLeft();
    } else if (offset > SWIPE_THRESHOLD) {
      await animate(x, 600, { duration: 0.3 });
      onSwipeRight();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  }

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: stack.scale, y: stack.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ zIndex: stack.zIndex }}
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
      {/* Left swipe overlay */}
      <motion.div
        className="swipe-overlay-left"
        style={{ opacity: leftOpacity }}
      >
        <div className="absolute top-6 right-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--red)' }}
          >
            <X size={24} color="white" strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* Right swipe overlay */}
      <motion.div
        className="swipe-overlay-right"
        style={{ opacity: rightOpacity }}
      >
        <div className="absolute top-6 left-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--green)' }}
          >
            <Heart size={24} color="white" fill="white" />
          </div>
        </div>
      </motion.div>

      <RecipeCard meal={meal} />
    </motion.div>
  );
}
