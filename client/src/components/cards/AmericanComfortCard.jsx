import { Clock, Users } from 'lucide-react';

export default function AmericanComfortCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#fafafa',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        border: '2px solid #e8e0d0',
      }}
    >
      {/* Diner-style header */}
      <div style={{ background: '#1c2b3a', padding: '8px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#e63946', '#f4a261', '#2a9d8f'].map((c, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ color: '#f4d03f', fontSize: '10px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
          American Comfort
        </div>
        <div style={{ color: '#f4d03f', fontSize: '14px' }}>🇺🇸</div>
      </div>

      {/* Photo */}
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #fafafa)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '8px 22px 22px' }}>
        <div style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {meal.inspired_by || meal.inspiredBy || 'Classic American'}
        </div>
        <h2 style={{ color: '#1c2b3a', fontSize: '26px', fontWeight: 900, lineHeight: 1.1, marginBottom: '6px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#6a7a8a', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px' }}>
          {meal.description}
        </p>

        {/* Retro diner stats box */}
        <div style={{ display: 'flex', background: '#1c2b3a', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Time', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || '—' },
            { label: 'Level', value: meal.difficulty === 'Easy' ? 'Easy' : meal.difficulty === 'Medium' ? 'Med' : 'Pro' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', borderRight: i < 2 ? '1px solid #2c3b4a' : 'none' }}>
              <div style={{ color: '#f4d03f', fontSize: '15px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#8a9ab0', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#1c2b3a', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>What's Inside</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 6).map((ing, i) => (
                <span key={i} style={{ background: '#e8f0f8', color: '#2c4a6a', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#fff9e0', border: '2px dashed #f4d03f', padding: '10px 12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '10px', color: '#b8860b', fontWeight: 700, marginBottom: '3px' }}>PRO TIP 🏆</div>
            <p style={{ color: '#6a5a2a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '14px', fontSize: '10px', color: '#c0cad4', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
