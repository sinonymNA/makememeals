export default function HealthyCard({ meal, cardRef }) {
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
        fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
        border: '2px solid #7D9B76',
        boxShadow: '0 4px 24px rgba(45,74,45,0.10)',
      }}
    >
      {/* Sage header */}
      <div style={{ background: '#7D9B76', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Wholesome Kitchen</span>
        <span style={{ fontSize: '14px' }}>🥗</span>
      </div>

      {/* Photo */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.1) brightness(1.02)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #fff 100%)' }} />
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ fontSize: '11px', color: '#7D9B76', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center' }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'clean eating tradition'}
        </p>
        <h2 style={{ color: '#2D4A2D', fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#4a5a4a', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center' }}>{meal.description}</p>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#EDF4EC', border: '1px solid #7D9B76', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Prep', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Cost', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid #7D9B76' : 'none' }}>
              <div style={{ color: '#2D4A2D', fontSize: '14px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#7D9B76', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#2D4A2D', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #7D9B76', paddingBottom: '4px' }}>
              What You Need
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#2a3a2a', marginBottom: '4px' }}>
                <span style={{ color: '#7D9B76', flexShrink: 0 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#2D4A2D', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #7D9B76', paddingBottom: '4px' }}>
              How to Make It
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#2a3a2a', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ background: '#7D9B76', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#EDF4EC', border: '1px solid #7D9B76', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#2D4A2D', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' }}>🌿 NUTRITIONIST'S TIP</div>
            <p style={{ color: '#3a5a3a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#7D9B76', opacity: 0.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
