import { Clock, Users } from 'lucide-react';

export default function ItalianTrattoriaCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#fdf8f0',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Georgia', serif",
        border: '2px solid #c8a96e',
      }}
    >
      {/* Decorative header band */}
      <div style={{ background: '#1a3a2a', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#c8a96e', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          Italian Trattoria
        </div>
        <div style={{ color: '#c8a96e', fontSize: '16px' }}>🇮🇹</div>
      </div>

      {/* Photo */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,58,42,0.15)' }} />
      </div>

      {/* Torn paper edge effect */}
      <div style={{ height: '8px', background: '#fdf8f0', marginTop: '-2px', borderRadius: '0 0 0 0', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.1)' }} />

      {/* Content */}
      <div style={{ padding: '16px 22px 22px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#8b6914', fontStyle: 'italic', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>
            {meal.inspired_by || meal.inspiredBy || 'La cucina italiana'}
          </div>
          <h2 style={{ color: '#1a3a2a', fontSize: '26px', fontWeight: 700, lineHeight: 1.1, margin: '0 0 6px' }}>
            {meal.name}
          </h2>
          <div style={{ width: '40px', height: '2px', background: '#c8a96e', margin: '0 auto 10px' }} />
          <p style={{ color: '#5a4a2a', fontSize: '13px', lineHeight: 1.5, fontStyle: 'italic' }}>
            {meal.description}
          </p>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '12px 0', borderTop: '1px solid #e8d8b0', borderBottom: '1px solid #e8d8b0', marginBottom: '14px' }}>
          {meal.prep_minutes && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b6914', fontSize: '16px', fontWeight: 700 }}>{meal.prep_minutes}</div>
              <div style={{ color: '#8b8b6a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>min</div>
            </div>
          )}
          {meal.servings && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b6914', fontSize: '16px', fontWeight: 700 }}>{meal.servings}</div>
              <div style={{ color: '#8b8b6a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>serves</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8b6914', fontSize: '16px', fontWeight: 700 }}>{meal.difficulty === 'Easy' ? '★' : meal.difficulty === 'Medium' ? '★★' : '★★★'}</div>
            <div style={{ color: '#8b8b6a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Inter', sans-serif" }}>level</div>
          </div>
        </div>

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#1a3a2a', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: '8px' }}>Ingredienti</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {meal.ingredients.slice(0, 6).map((ing, i) => (
                <span key={i} style={{ background: '#f0e8d0', color: '#5a4a2a', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #ddd0a8' }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#1a3a2a', padding: '10px 14px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: '#c8a96e', fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: '3px' }}>CONSIGLIO DELLO CHEF</div>
            <p style={{ color: '#d4c9a8', fontSize: '12px', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: '#c8a96e', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
