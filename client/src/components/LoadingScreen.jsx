import { useState, useEffect } from 'react';

const MESSAGES = {
  meals: [
    'Cooking up your meals...',
    'Finding delicious options...',
    'Almost ready!',
    'Adding the finishing touches...',
  ],
  grocery: [
    'Building your shopping list...',
    'Organizing by aisle...',
    'Almost done!',
  ],
  more: [
    'Finding more options...',
    'Checking the recipe book...',
  ],
};

export default function LoadingScreen({ type = 'meals', overlay = false }) {
  const msgs = MESSAGES[type] || MESSAGES.meals;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % msgs.length), 1100);
    return () => clearInterval(id);
  }, [msgs.length]);

  const content = (
    <div className="flex flex-col items-center justify-center gap-5 p-8">
      <div className="loading-ring" />
      <p className="text-[15px] font-500 text-center" style={{ color: 'var(--text-mid)', fontWeight: 500 }}>
        {msgs[idx]}
      </p>
    </div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="app-shell flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
      {content}
    </div>
  );
}
