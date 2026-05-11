import { Clock, Users } from 'lucide-react';

export default function MediterraneanCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#f0f6ff',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
      }}
    >
      {/* Blue sea pattern top bar */}
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #1e5f8a, #2e86c1, #76b8d6, #1e5f8a)' }} />

      {/* Photo */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,95,138,0.1)' }} />
        {/* White wash effect at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to bottom, transparent, #f0f6ff)' }} />
        {/* Cuisine badge */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: '#1e5f8a', color: 'white',
          fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px',
          padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase',
        }}>
          🫒 Mediterranean
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 22px 22px' }}>
        <div style={{ fontSize: '10px', color: '#2e86c1', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {meal.inspired_by || meal.inspiredBy || 'Sun & Sea'}
        </div>
        <h2 style={{ color: '#0d2b4a', fontSize: '26px', fontWeight: 800, lineHeight: 1.1, marginBottom: '6px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#4a6a8a', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px', fontStyle: 'italic' }}>
          {meal.description}
        </p>

        {/* Olive branch divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #76b8d6)' }} />
          <span style={{ fontSize: '16px' }}>🫒</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #76b8d6)' }} />
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '14px' }}>
          {meal.prep_minutes && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#1e5f8a', fontSize: '18px', fontWeight: 800 }}>{meal.prep_minutes}</div>
              <div style={{ color: '#76b8d6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>min</div>
            </div>
          )}
          {meal.servings && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#1e5f8a', fontSize: '18px', fontWeight: 800 }}>{meal.servings}</div>
              <div style={{ color: '#76b8d6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>serves</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#1e5f8a', fontSize: '14px', fontWeight: 800 }}>{meal.difficulty || 'Medium'}</div>
            <div style={{ color: '#76b8d6', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>level</div>
          </div>
        </div>

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 7).map((ing, i) => (
                <span key={i} style={{ background: 'white', color: '#2e6a9a', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #b8d8f0', fontWeight: 600 }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'white', border: '1px solid #b8d8f0', padding: '10px 14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '10px', color: '#1e5f8a', fontWeight: 700, marginBottom: '3px' }}>CHEF'S WISDOM</div>
            <p style={{ color: '#4a6a8a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: '#76b8d6', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
