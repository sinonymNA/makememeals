import logo from '../MMMlogolong.png';
import { CARD_THEMES, DEFAULT_THEME } from './cardThemes.js';

function Chip({ icon, value, theme }) {
  return (
    <div style={{
      background: theme.chipBg,
      border: `1px solid ${theme.chipBorder}`,
      borderRadius: '999px',
      padding: '5px 12px',
      fontSize: '12px',
      color: theme.chipText,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {icon} {value}
    </div>
  );
}

export default function SocialRecipeCard({ meal, socialRef }) {
  const theme = CARD_THEMES[meal.cuisine] || DEFAULT_THEME;
  const ingredients = (meal.ingredients || []).slice(0, 5);

  function fmtQty(ing) {
    const q = ing.quantity || '';
    const u = ing.unit || '';
    if (!u || q.toLowerCase().includes(u.toLowerCase())) return q;
    return `${q} ${u}`;
  }

  return (
    <div
      ref={socialRef}
      style={{
        width: '390px',
        height: '600px',
        background: theme.cardBg,
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        flexShrink: 0,
      }}
    >
      {/* Photo — 260px tall */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:${theme.ingBorder}22">${meal.emoji || '🍽️'}</div>`;
          }}
        />
        {/* Cuisine tag overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.55)',
          padding: '8px 16px',
        }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: '#fff',
            textTransform: 'uppercase',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}>
            {theme.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 20px 44px' }}>
        {/* Inspired by */}
        {(meal.inspired_by || meal.inspiredBy) && (
          <p style={{
            fontSize: '12px',
            color: '#8B7355',
            fontStyle: 'italic',
            margin: '0 0 5px',
            textAlign: 'center',
          }}>
            Inspired by {meal.inspired_by || meal.inspiredBy}
          </p>
        )}

        {/* Recipe name */}
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '24px',
          fontWeight: 700,
          color: theme.nameColor,
          lineHeight: 1.2,
          margin: '0 0 12px',
          textAlign: 'center',
        }}>
          {meal.name}
        </h2>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
          <Chip icon="⏱" value={meal.prep_minutes ? `${meal.prep_minutes} min` : '—'} theme={theme} />
          <Chip icon="👥" value={`${meal.servings || 2} servings`} theme={theme} />
          <Chip icon="💰" value={meal.estimated_cost ? `~$${meal.estimated_cost}` : '—'} theme={theme} />
        </div>

        {/* Top 5 ingredients */}
        <div style={{
          fontSize: '10px',
          color: theme.labelColor,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Ingredients
        </div>
        {ingredients.map((ing, i) => (
          <div key={i} style={{
            borderLeft: `2px solid ${theme.ingBorder}`,
            paddingLeft: '10px',
            marginBottom: '5px',
            fontSize: '12px',
            color: theme.descColor,
            lineHeight: 1.4,
          }}>
            <strong>{fmtQty(ing)}</strong>{' '}
            <span style={{ fontWeight: 400 }}>{ing.name}</span>
          </div>
        ))}
      </div>

      {/* Watermark — bottom center, fixed position inside card */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.45,
      }}>
        <img
          src={logo}
          alt="MakeMeMeals"
          crossOrigin="anonymous"
          style={{ height: '16px', width: 'auto' }}
        />
      </div>
    </div>
  );
}
