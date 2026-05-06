import { Clock, ChefHat, DollarSign } from 'lucide-react';

const DIFFICULTY_STARS = { Easy: 1, Medium: 2, 'Confident Cook': 3 };

function DifficultyDots({ level }) {
  const count = DIFFICULTY_STARS[level] || 1;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= count ? 'var(--accent)' : 'var(--border)' }}
        />
      ))}
      <span className="ml-1 text-[13px]" style={{ color: 'var(--text-mid)' }}>{level}</span>
    </div>
  );
}

export default function RecipeCard({ meal, onClick, style }) {
  const topIngredients = (meal.ingredients || []).slice(0, 3);

  return (
    <div
      className="raised p-6 cursor-pointer select-none"
      style={{ background: 'var(--card)', ...style }}
      onClick={onClick}
    >
      {/* Emoji */}
      <div className="text-[80px] text-center leading-none mb-4">{meal.emoji || '🍽️'}</div>

      {/* Name */}
      <h2
        className="text-[22px] font-extrabold text-center leading-tight mb-3"
        style={{ color: 'var(--text)' }}
      >
        {meal.name}
      </h2>

      {/* Meta row */}
      <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
        <DifficultyDots level={meal.difficulty} />
        <span style={{ color: 'var(--border)' }}>•</span>
        <div className="flex items-center gap-1" style={{ color: 'var(--text-mid)' }}>
          <Clock size={13} />
          <span className="text-[13px] font-bold">{meal.prep_minutes} min</span>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-center text-[15px] italic leading-snug mb-4"
        style={{ color: 'var(--text-mid)' }}
      >
        "{meal.description}"
      </p>

      {/* Top ingredients */}
      {topIngredients.length > 0 && (
        <div className="flex justify-center gap-3 flex-wrap mb-4">
          {topIngredients.map((ing, i) => (
            <span
              key={i}
              className="text-[13px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              {ing.name}
            </span>
          ))}
        </div>
      )}

      {/* Cost */}
      <div
        className="text-center text-[14px] font-bold"
        style={{ color: 'var(--text-light)' }}
      >
        ~ ${meal.estimated_cost} for {meal.servings || 4} people
      </div>
    </div>
  );
}
