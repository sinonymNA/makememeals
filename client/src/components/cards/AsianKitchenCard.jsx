import { Clock, Users } from 'lucide-react';

export default function AsianKitchenCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#0f1923',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
      }}
    >
      {/* Photo */}
      <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #0f1923 100%)' }} />
        {/* Red stripe accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#e63946' }} />
        {/* Cuisine tag */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: '#e63946', color: 'white', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>
          Asian Kitchen
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ fontSize: '11px', color: '#e63946', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
          {meal.inspired_by || meal.inspiredBy || 'Chef\'s Special'}
        </div>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.2, marginBottom: '8px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#8d9db6', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
          {meal.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {meal.prep_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8d9db6', fontSize: '12px' }}>
              <Clock size={12} color="#e63946" /> {meal.prep_minutes} min
            </div>
          )}
          {meal.servings && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8d9db6', fontSize: '12px' }}>
              <Users size={12} color="#e63946" /> {meal.servings} servings
            </div>
          )}
          <div style={{ color: '#8d9db6', fontSize: '12px' }}>
            ⚡ {meal.difficulty || 'Medium'}
          </div>
        </div>

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ borderTop: '1px solid #1e2d3d', paddingTop: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Key Ingredients</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 6).map((ing, i) => (
                <span key={i} style={{ background: '#1a2535', color: '#8d9db6', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #2a3a4a' }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#1a2535', borderLeft: '3px solid #e63946', padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, marginBottom: '3px' }}>CHEF'S TIP</div>
            <p style={{ color: '#8d9db6', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        {/* Brand */}
        <div style={{ textAlign: 'right', marginTop: '14px', fontSize: '10px', color: '#3a4a5a', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
