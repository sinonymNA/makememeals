import { useState, useEffect } from 'react';

const MESSAGES = {
  meals: [
    'Cooking up your meals... 👨‍🍳',
    'Finding some delicious options... 🤤',
    'Almost ready! ✨',
    'Adding secret ingredients... 🌿',
  ],
  grocery: [
    'Building your shopping list... 🛒',
    'Checking the pantry... 🫙',
    'Almost done! ✨',
  ],
  more: [
    'Finding more options... 🔍',
    'Checking the recipe book... 📖',
  ],
};

export default function LoadingScreen({ type = 'meals', overlay = false }) {
  const msgs = MESSAGES[type] || MESSAGES.meals;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % msgs.length), 900);
    return () => clearInterval(id);
  }, [msgs.length]);

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-5xl space-x-2">
        <span className="float-emoji">🍕</span>
        <span className="float-emoji">🍜</span>
        <span className="float-emoji">🥗</span>
        <span className="float-emoji">🍲</span>
        <span className="float-emoji">🥩</span>
      </div>
      <p className="text-lg font-bold text-center" style={{ color: 'var(--text)' }}>
        {msgs[idx]}
      </p>
    </div>
  );

  if (overlay) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(245, 240, 232, 0.92)', backdropFilter: 'blur(4px)' }}
      >
        <div className="raised p-8 mx-6">{content}</div>
      </div>
    );
  }

  return (
    <div className="app-shell flex items-center justify-center min-h-screen">
      {content}
    </div>
  );
}
