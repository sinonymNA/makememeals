export default function AmericanComfortCard({ meal, cardRef }) {
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#FFFBF0',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        border: '3px solid #CC0000',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header band */}
      <div style={{ background: '#CC0000', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>American Kitchen</span>
        <span style={{ color: '#fff', fontSize: '14px' }}>🇺🇸</span>
      </div>

      {/* Circular photo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 8px', background: '#FFFBF0' }}>
        <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #CC0000', boxShadow: '0 0 0 4px #003087' }}>
          <img
            src={meal.imageUrl}
            alt={meal.name}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        {/* Inspired by */}
        <p style={{ fontSize: '11px', color: '#003087', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center' }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'American tradition'}
        </p>
        <h2 style={{ color: '#CC0000', fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center', fontFamily: "'Georgia', serif" }}>
          {meal.name}
        </h2>
        <p style={{ color: '#4a3a2a', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center' }}>{meal.description}</p>

        {/* Stats row */}
        <div style={{ display: 'flex', background: '#003087', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Prep', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Cost', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#a0b4cc', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#CC0000', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #e8d8c0', paddingBottom: '4px' }}>
              What You Need
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#3a2a1a', marginBottom: '4px' }}>
                <span style={{ color: '#CC0000', flexShrink: 0 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#CC0000', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #e8d8c0', paddingBottom: '4px' }}>
              How to Make It
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#3a2a1a', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ background: '#CC0000', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: '#FFF3CD', border: '2px solid #CC0000', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#CC0000', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' }}>⭐ CHEF'S TIP</div>
            <p style={{ color: '#5a3a1a', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#CC0000', opacity: 0.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
