export default function LatinFlavorsCard({ meal, cardRef }) {
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Arial Black', 'Arial', sans-serif",
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Alternating border pattern header */}
      <div style={{ display: 'flex', height: '8px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ flex: 1, background: i % 2 === 0 ? '#D4622D' : '#00897B' }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ background: '#D4622D', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' }}>Latin Flavors</span>
        <span style={{ fontSize: '14px' }}>🌶️</span>
      </div>

      {/* Square saturated photo */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.3) contrast(1.05)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #fff 100%)' }} />
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ fontSize: '11px', color: '#00897B', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center' }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'Latin tradition'}
        </p>
        <h2 style={{ color: '#D4622D', fontSize: '24px', fontWeight: 900, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#3a2a1a', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>{meal.description}</p>

        {/* Stats */}
        <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', border: '2px solid #D4622D' }}>
          {[
            { label: 'Tiempo', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—', bg: '#D4622D' },
            { label: 'Porciones', value: meal.servings || 4, bg: '#00897B' },
            { label: 'Costo', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—', bg: '#D4622D' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', background: item.bg }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 900 }}>{item.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#D4622D', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #D4622D', paddingBottom: '4px' }}>
              Ingredientes
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#2a1a0a', marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>
                <span style={{ color: '#00897B', flexShrink: 0, fontWeight: 900 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#00897B', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #00897B', paddingBottom: '4px' }}>
              Preparación
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#2a1a0a', marginBottom: '6px', alignItems: 'flex-start', fontFamily: 'Arial, sans-serif' }}>
                <span style={{ background: '#00897B', color: '#fff', width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'rgba(212,98,45,0.08)', border: '2px dashed #D4622D', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#D4622D', fontWeight: 900, letterSpacing: '1px', marginBottom: '3px' }}>🌶 TRUQUITO DEL CHEF</div>
            <p style={{ color: '#5a2a0a', fontSize: '12px', lineHeight: 1.4, margin: 0, fontFamily: 'Arial, sans-serif' }}>{meal.chef_tip}</p>
          </div>
        )}

        {/* Bottom border pattern */}
        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: i % 2 === 0 ? '#00897B' : '#D4622D' }} />
          ))}
        </div>

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#D4622D', opacity: 0.5, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
