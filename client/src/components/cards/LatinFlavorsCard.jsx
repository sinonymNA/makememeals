import { Clock, Users } from 'lucide-react';

export default function LatinFlavorsCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#fff8f0',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
      }}
    >
      {/* Photo with warm overlay */}
      <div style={{ height: '210px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(230,57,70,0.35) 0%, rgba(255,140,0,0.2) 100%)' }} />
        {/* Diagonal stripe pattern */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
          background: 'linear-gradient(to bottom, transparent, #fff8f0)'
        }} />
        {/* Cuisine badge */}
        <div style={{
          position: 'absolute', top: 16, left: 16,
          background: 'linear-gradient(135deg, #e63946, #ff8c00)',
          color: 'white', fontSize: '10px', fontWeight: 800,
          letterSpacing: '2px', padding: '5px 12px', borderRadius: '20px',
          textTransform: 'uppercase',
        }}>
          🌶️ Sabores Latinos
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '4px 22px 22px' }}>
        <div style={{ fontSize: '10px', color: '#cc4400', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {meal.inspired_by || meal.inspiredBy || 'Casa cooking'}
        </div>
        <h2 style={{ color: '#1a1210', fontSize: '26px', fontWeight: 900, lineHeight: 1.1, marginBottom: '6px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#7a5a44', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
          {meal.description}
        </p>

        {/* Zigzag divider */}
        <svg width="100%" height="12" viewBox="0 0 380 12" style={{ margin: '0 0 14px', display: 'block' }}>
          <polyline points="0,12 19,0 38,12 57,0 76,12 95,0 114,12 133,0 152,12 171,0 190,12 209,0 228,12 247,0 266,12 285,0 304,12 323,0 342,12 361,0 380,12" style={{ fill: 'none', stroke: '#ff8c00', strokeWidth: 2 }} />
        </svg>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
          {meal.prep_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7a5a44', fontSize: '12px' }}>
              <Clock size={12} color="#e63946" /> {meal.prep_minutes} min
            </div>
          )}
          {meal.servings && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7a5a44', fontSize: '12px' }}>
              <Users size={12} color="#e63946" /> {meal.servings}
            </div>
          )}
          <div style={{ color: '#7a5a44', fontSize: '12px' }}>{meal.difficulty || 'Medium'}</div>
        </div>

        {/* Ingredients as colorful pills */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 7).map((ing, i) => {
                const colors = ['#fff0e6', '#ffe6e6', '#fff5e0', '#e6f7e6', '#e6e6ff'];
                const textColors = ['#cc4400', '#cc0000', '#cc7700', '#007744', '#440099'];
                return (
                  <span key={i} style={{ background: colors[i % 5], color: textColors[i % 5], fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    {typeof ing === 'string' ? ing : ing.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'linear-gradient(135deg, #e63946, #ff8c00)', padding: '12px 14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: '3px' }}>TRUCO DEL CHEF</div>
            <p style={{ color: 'white', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '12px', fontSize: '10px', color: '#cc7744', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
