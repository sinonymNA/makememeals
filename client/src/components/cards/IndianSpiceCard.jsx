import { Clock, Users } from 'lucide-react';

export default function IndianSpiceCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#1a0a00',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        border: '1px solid #7a3b00',
      }}
    >
      {/* Paisley-inspired top accent */}
      <div style={{ height: '5px', background: 'linear-gradient(90deg, #e85d04, #f48c06, #faa307, #f48c06, #e85d04)' }} />

      {/* Photo */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,10,0,0.2), rgba(26,10,0,0.7))' }} />
        {/* Spice badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'linear-gradient(135deg, #e85d04, #faa307)',
          color: 'white', fontSize: '10px', fontWeight: 800,
          letterSpacing: '1.5px', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase',
        }}>
          🌶️ Indian Spice
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 22, right: 22 }}>
          <div style={{ fontSize: '10px', color: '#faa307', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
            {meal.inspired_by || meal.inspiredBy || 'Masala Kitchen'}
          </div>
          <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
            {meal.name}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 22px 22px' }}>
        <p style={{ color: '#c09060', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px', fontStyle: 'italic' }}>
          {meal.description}
        </p>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {meal.prep_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#2a1200', border: '1px solid #5a2a00', padding: '6px 12px', borderRadius: '8px' }}>
              <Clock size={11} color="#faa307" />
              <span style={{ color: '#faa307', fontSize: '12px', fontWeight: 600 }}>{meal.prep_minutes} min</span>
            </div>
          )}
          {meal.servings && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#2a1200', border: '1px solid #5a2a00', padding: '6px 12px', borderRadius: '8px' }}>
              <Users size={11} color="#faa307" />
              <span style={{ color: '#faa307', fontSize: '12px', fontWeight: 600 }}>{meal.servings} servings</span>
            </div>
          )}
          <div style={{ background: '#2a1200', border: '1px solid #5a2a00', padding: '6px 12px', borderRadius: '8px' }}>
            <span style={{ color: '#faa307', fontSize: '12px', fontWeight: 600 }}>{meal.difficulty || 'Medium'}</span>
          </div>
        </div>

        {/* Spice card ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#e85d04', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Masale & Ingredients</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 6).map((ing, i) => (
                <span key={i} style={{ background: '#2a1200', color: '#c09060', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #5a2a00' }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.2), rgba(250,163,7,0.1))', border: '1px solid #5a2a00', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', color: '#faa307', fontWeight: 700, marginBottom: '3px' }}>RASOI RAAZ — KITCHEN SECRET</div>
            <p style={{ color: '#c09060', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '14px', fontSize: '10px', color: '#5a3000', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
