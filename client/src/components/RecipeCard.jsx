import { Clock, Users, DollarSign } from 'lucide-react';
import { getMealImageUrl } from '../lib/imageUrl.js';

export default function RecipeCard({ meal, onClick, style }) {
  const topIngredients = (meal.ingredients || []).slice(0, 4);
  const imgSrc = meal.imageUrl || getMealImageUrl(meal.name);

  return (
    <div
      className="card overflow-hidden cursor-pointer select-none"
      style={{ background: 'var(--card)', ...style }}
      onClick={onClick}
    >
      {/* Food image */}
      <div style={{ height: '200px', overflow: 'hidden', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={imgSrc}
          alt={meal.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="font-size:64px;opacity:0.5">${meal.emoji || '🍽️'}</div>`;
          }}
        />
      </div>

      {/* Card body */}
      <div style={{ padding: '20px' }}>
        {/* Meal name */}
        <h2
          className="text-[20px] leading-tight mb-2 text-center"
          style={{ color: 'var(--text)', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          {meal.name}
        </h2>

        {/* Description */}
        {meal.description && (
          <p
            className="text-[13px] italic text-center leading-snug mb-4"
            style={{ color: 'var(--text-mid)' }}
          >
            {meal.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
          {meal.prep_minutes && (
            <span
              className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}
            >
              <Clock size={11} /> {meal.prep_minutes} min
            </span>
          )}
          {meal.servings && (
            <span
              className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}
            >
              <Users size={11} /> {meal.servings}
            </span>
          )}
          {meal.estimated_cost && (
            <span
              className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--bg-soft)', color: 'var(--text-mid)' }}
            >
              <DollarSign size={11} /> ~${meal.estimated_cost}
            </span>
          )}
        </div>

        {/* Top ingredients */}
        {topIngredients.length > 0 && (
          <p className="text-center text-[12px]" style={{ color: 'var(--text-light)' }}>
            Contains: {topIngredients.map(i => i.name).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
