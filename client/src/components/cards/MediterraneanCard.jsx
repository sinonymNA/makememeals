export default function MediterraneanCard({ meal, cardRef }) {
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
        fontFamily: "'Georgia', 'Times New Roman', serif",
        border: '3px solid #0047AB',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#0047AB', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Mediterranean</span>
        <span style={{ fontSize: '14px' }}>🫒</span>
      </div>

      {/* Photo */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #fff 100%)' }} />
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ fontSize: '11px', color: '#0047AB', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center' }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'Mediterranean tradition'}
        </p>
        <h2 style={{ color: '#0047AB', fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#3a3a4a', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center' }}>{meal.description}</p>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#0047AB', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Prep', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Cost', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#0047AB', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #0047AB', paddingBottom: '4px' }}>
              What You Need
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#2a2a3a', marginBottom: '4px' }}>
                <span style={{ color: '#0047AB', flexShrink: 0 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#0047AB', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '2px solid #0047AB', paddingBottom: '4px' }}>
              How to Make It
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#2a2a3a', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ background: '#0047AB', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'rgba(224,123,84,0.08)', border: '2px solid #E07B54', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#E07B54', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' }}>☀️ CHEF'S TIP</div>
            <p style={{ color: '#5a3a2a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#0047AB', opacity: 0.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
