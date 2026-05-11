import { Clock, Users } from 'lucide-react';

export default function SteakhouseCard({ meal, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#0c0c0c',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Georgia', serif",
        position: 'relative',
        border: '1px solid #2a2a2a',
      }}
    >
      {/* Gold header band */}
      <div style={{ background: 'linear-gradient(90deg, #1a1a1a, #2a2200, #1a1a1a)', padding: '10px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '1px', background: '#c8a000' }} />
        <div style={{ color: '#c8a000', fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          The Steakhouse
        </div>
        <div style={{ width: '40px', height: '1px', background: '#c8a000' }} />
      </div>

      {/* Photo with dark vignette */}
      <div style={{ height: '210px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.2) contrast(1.1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #0c0c0c)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '4px 22px 22px' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', color: '#c8a000', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", marginBottom: '6px' }}>
            {meal.inspired_by || meal.inspiredBy || 'Premium Cut'}
          </div>
          <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 700, lineHeight: 1.1, marginBottom: '6px' }}>
            {meal.name}
          </h2>
          <div style={{ width: '60px', height: '1px', background: '#c8a000', margin: '0 auto 10px' }} />
          <p style={{ color: '#8a8a8a', fontSize: '13px', lineHeight: 1.5, fontStyle: 'italic' }}>
            {meal.description}
          </p>
        </div>

        {/* Meta in gold */}
        <div style={{ display: 'flex', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', padding: '12px 0', marginBottom: '14px', justifyContent: 'space-around' }}>
          {meal.prep_minutes && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#c8a000', fontSize: '20px', fontWeight: 700 }}>{meal.prep_minutes}'</div>
              <div style={{ color: '#5a5a5a', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Inter', sans-serif" }}>cook time</div>
            </div>
          )}
          {meal.servings && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#c8a000', fontSize: '20px', fontWeight: 700 }}>{meal.servings}</div>
              <div style={{ color: '#5a5a5a', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Inter', sans-serif" }}>serves</div>
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#c8a000', fontSize: '14px', fontWeight: 700 }}>{meal.difficulty === 'Easy' ? '✦' : meal.difficulty === 'Medium' ? '✦✦' : '✦✦✦'}</div>
            <div style={{ color: '#5a5a5a', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: "'Inter', sans-serif" }}>difficulty</div>
          </div>
        </div>

        {/* Ingredients */}
        {meal.ingredients?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {meal.ingredients.slice(0, 6).map((ing, i) => (
                <span key={i} style={{ background: '#1a1a1a', color: '#8a8a8a', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #2a2a2a', fontFamily: "'Inter', sans-serif" }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ borderLeft: '2px solid #c8a000', paddingLeft: '12px', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: '#c8a000', fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: '3px' }}>THE CHEF'S SECRET</div>
            <p style={{ color: '#8a8a8a', fontSize: '12px', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: '#3a3a3a', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
          Make Me Meals
        </div>
      </div>
    </div>
  );
}
