import { Clock, Users } from 'lucide-react';

export default function HealthyCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#f4faf4',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        border: '1.5px solid #c8e6c9',
      }}
    >
      {/* Leaf pattern header */}
      <div style={{ background: '#2e7d32', padding: '10px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>🌿</div>
        <div style={{ color: 'white', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
          Nourish + Thrive
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>🌿</div>
      </div>

      {/* Photo */}
      <div style={{ height: '195px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(46,125,50,0.05)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, transparent, #f4faf4)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '8px 22px 22px' }}>
        <div style={{ fontSize: '10px', color: '#2e7d32', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {meal.inspired_by || meal.inspiredBy || 'Clean & Nourishing'}
        </div>
        <h2 style={{ color: '#1a3a1a', fontSize: '24px', fontWeight: 800, lineHeight: 1.1, marginBottom: '6px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#4a6a4a', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
          {meal.description}
        </p>

        {/* Nutrient highlights */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          {meal.prep_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e8f5e9', padding: '5px 10px', borderRadius: '20px' }}>
              <Clock size={11} color="#2e7d32" />
              <span style={{ color: '#2e7d32', fontSize: '11px', fontWeight: 700 }}>{meal.prep_minutes} min</span>
            </div>
          )}
          {meal.servings && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e8f5e9', padding: '5px 10px', borderRadius: '20px' }}>
              <Users size={11} color="#2e7d32" />
              <span style={{ color: '#2e7d32', fontSize: '11px', fontWeight: 700 }}>{meal.servings} servings</span>
            </div>
          )}
          <div style={{ background: '#e8f5e9', padding: '5px 10px', borderRadius: '20px' }}>
            <span style={{ color: '#2e7d32', fontSize: '11px', fontWeight: 700 }}>{meal.difficulty || 'Easy'}</span>
          </div>
          {meal.estimated_cost && (
            <div style={{ background: '#e8f5e9', padding: '5px 10px', borderRadius: '20px' }}>
              <span style={{ color: '#2e7d32', fontSize: '11px', fontWeight: 700 }}>~${meal.estimated_cost}</span>
            </div>
          )}
        </div>

        {/* Ingredients with leaf bullets */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#2e7d32', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>What's In It</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 7).map((ing, i) => (
                <span key={i} style={{ background: 'white', color: '#2e5a2e', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #c8e6c9', fontWeight: 500 }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', color: '#2e7d32', fontWeight: 700, marginBottom: '3px' }}>🌱 WELLNESS TIP</div>
            <p style={{ color: '#3a6a3a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: '#a8c8a8', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
