export default function SteakhouseCard({ meal, cardRef }) {
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#1C1C1C',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        border: '3px solid #B8860B',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Brass header */}
      <div style={{ background: '#B8860B', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#1C1C1C', fontSize: '10px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase' }}>The Steakhouse</span>
        <span style={{ fontSize: '14px' }}>🥩</span>
      </div>

      {/* Full-bleed photo with vignette */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) contrast(1.1)' }}
        />
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #1C1C1C)' }} />
        {/* Name overlay on photo */}
        <div style={{ position: 'absolute', bottom: '12px', left: '22px', right: '22px' }}>
          <p style={{ fontSize: '10px', color: '#B8860B', fontStyle: 'italic', margin: '0 0 2px', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
            Inspired by {meal.inspired_by || meal.inspiredBy || 'Classic steakhouse'}
          </p>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, lineHeight: 1.1, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {meal.name}
          </h2>
        </div>
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ color: '#c0a060', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{meal.description}</p>

        {/* Stats — brass bar */}
        <div style={{ display: 'flex', background: '#111', border: '1px solid #B8860B', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Time', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Cost', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid #B8860B' : 'none' }}>
              <div style={{ color: '#B8860B', fontSize: '14px', fontWeight: 900 }}>{item.value}</div>
              <div style={{ color: '#5a4820', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#B8860B', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              Ingredients
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#d0b080', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>
                <span style={{ color: '#B8860B', flexShrink: 0 }}>—</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#B8860B', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              Method
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#d0b080', marginBottom: '6px', alignItems: 'flex-start', fontFamily: 'Georgia, serif' }}>
                <span style={{ background: '#B8860B', color: '#1C1C1C', width: '18px', height: '18px', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid #B8860B', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#B8860B', fontWeight: 900, letterSpacing: '2px', marginBottom: '3px', textTransform: 'uppercase' }}>THE CHEF'S CUT</div>
            <p style={{ color: '#c0a060', fontSize: '12px', lineHeight: 1.4, margin: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#B8860B', opacity: 0.5, fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
