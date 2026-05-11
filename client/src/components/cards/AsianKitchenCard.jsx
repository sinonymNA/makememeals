export default function AsianKitchenCard({ meal, cardRef }) {
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#1A1A1A',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        border: '2px solid #FFD700',
        boxShadow: '0 0 24px rgba(255,215,0,0.2), 0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #FFD700', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#FFD700', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>Asian Kitchen</span>
        <span style={{ fontSize: '14px' }}>🥢</span>
      </div>

      {/* Circular photo with gold border */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 8px' }}>
        <div style={{
          width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden',
          border: '3px solid #FFD700',
          boxShadow: '0 0 0 4px #1A1A1A, 0 0 0 6px #FFD700, 0 0 20px rgba(255,215,0,0.4)',
        }}>
          <img
            src={meal.imageUrl}
            alt={meal.name}
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ fontSize: '11px', color: '#FFD700', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center', opacity: 0.8 }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'Asian tradition'}
        </p>
        <h2 style={{ color: '#FFD700', fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center', letterSpacing: '0.5px' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#c0a880', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center' }}>{meal.description}</p>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#111', border: '1px solid #FFD700', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Time', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Cost', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid #FFD700' : 'none' }}>
              <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#6a5a40', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#FFD700', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              Ingredients
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#d4c090', marginBottom: '4px' }}>
                <span style={{ color: '#FFD700', flexShrink: 0 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#FFD700', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
              Method
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#d4c090', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ background: '#FFD700', color: '#1A1A1A', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid #FFD700', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#FFD700', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px' }}>✦ CHEF'S SECRET</div>
            <p style={{ color: '#c0a060', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#FFD700', opacity: 0.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
