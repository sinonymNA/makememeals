export default function ItalianTrattoriaCard({ meal, cardRef }) {
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: '#F5ECD7',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        border: '3px solid #2D5016',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#2D5016', padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#F5ECD7', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontStyle: 'italic' }}>Trattoria Italiana</span>
        <span style={{ color: '#F5ECD7', fontSize: '14px' }}>🇮🇹</span>
      </div>

      {/* Photo with sepia overlay */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(25%) saturate(1.1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #F5ECD7 100%)' }} />
      </div>

      <div style={{ padding: '8px 22px 20px' }}>
        <p style={{ fontSize: '11px', color: '#2D5016', fontStyle: 'italic', margin: '0 0 4px', textAlign: 'center' }}>
          Inspired by {meal.inspired_by || meal.inspiredBy || 'Italian tradition'}
        </p>
        <h2 style={{ color: '#1a2e0a', fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 6px', textAlign: 'center', fontStyle: 'italic' }}>
          {meal.name}
        </h2>
        <p style={{ color: '#5a4030', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px', textAlign: 'center' }}>{meal.description}</p>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#2D5016', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
          {[
            { label: 'Tempo', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Porzioni', value: meal.servings || 4 },
            { label: 'Costo', value: meal.estimated_cost ? `$${meal.estimated_cost}` : '—' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '9px 4px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <div style={{ color: '#F5ECD7', fontSize: '14px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: '#8aab6a', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', fontStyle: 'italic' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#2D5016', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #c8b890', paddingBottom: '4px', fontStyle: 'italic' }}>
              Ingredienti
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#3a2a14', marginBottom: '4px' }}>
                <span style={{ color: '#C4622D', flexShrink: 0 }}>•</span>
                <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: '#2D5016', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #c8b890', paddingBottom: '4px', fontStyle: 'italic' }}>
              Preparazione
            </div>
            {steps.slice(0, 6).map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#3a2a14', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ background: '#C4622D', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                <span style={{ lineHeight: 1.4 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{ background: 'rgba(196,98,45,0.08)', border: '1px solid #C4622D', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#C4622D', fontWeight: 700, letterSpacing: '1px', marginBottom: '3px', fontStyle: 'italic' }}>Il Segreto dello Chef</div>
            <p style={{ color: '#5a3a1a', fontSize: '12px', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>{meal.chef_tip}</p>
          </div>
        )}

        <div style={{ textAlign: 'right', fontSize: '9px', color: '#2D5016', opacity: 0.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontStyle: 'italic' }}>
          MakeMeMeals.com
        </div>
      </div>
    </div>
  );
}
