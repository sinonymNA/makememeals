import { getMealImageUrl } from '../lib/imageUrl.js';

const CUISINE_THEMES = {
  american: {
    bg: '#FFFBF0', border: '#CC0000', accent: '#CC0000', label: '#003087',
    font: "'Georgia', serif", headerBg: '#CC0000', headerText: '#fff', tag: 'American Kitchen',
  },
  italian: {
    bg: '#F5ECD7', border: '#2D5016', accent: '#C4622D', label: '#2D5016',
    font: "'Georgia', serif", headerBg: '#2D5016', headerText: '#F5ECD7', tag: 'Trattoria Italiana',
  },
  asian: {
    bg: '#1A1A1A', border: '#FFD700', accent: '#FFD700', label: '#FFD700',
    font: "'Georgia', serif", headerBg: '#111', headerText: '#FFD700', tag: 'Asian Kitchen',
    textColor: '#d4c090', descColor: '#c0a880',
  },
  latin: {
    bg: '#fff', border: '#D4622D', accent: '#D4622D', label: '#00897B',
    font: "'Arial Black', sans-serif", headerBg: '#D4622D', headerText: '#fff', tag: 'Latin Flavors',
  },
  mediterranean: {
    bg: '#fff', border: '#0047AB', accent: '#0047AB', label: '#0047AB',
    font: "'Georgia', serif", headerBg: '#0047AB', headerText: '#fff', tag: 'Mediterranean',
  },
  indian: {
    bg: '#6B2D3E', border: '#FF9933', accent: '#FF9933', label: '#FF9933',
    font: "'Georgia', serif", headerBg: '#4a1a2a', headerText: '#FF9933', tag: 'Indian Spice',
    textColor: '#f0d8b8', descColor: '#e0c0a0',
  },
  steakhouse: {
    bg: '#1C1C1C', border: '#B8860B', accent: '#B8860B', label: '#B8860B',
    font: "'Arial Black', sans-serif", headerBg: '#B8860B', headerText: '#1C1C1C', tag: 'The Steakhouse',
    textColor: '#d0b080', descColor: '#c0a060',
  },
  healthy: {
    bg: '#fff', border: '#7D9B76', accent: '#7D9B76', label: '#2D4A2D',
    font: "'Arial', sans-serif", headerBg: '#7D9B76', headerText: '#fff', tag: 'Wholesome Kitchen',
  },
};

const DEFAULT_THEME = CUISINE_THEMES.american;

export default function RecipeCard({ meal, onClick, style }) {
  const theme = CUISINE_THEMES[meal.cuisine] || DEFAULT_THEME;
  const imgSrc = meal.imageUrl || getMealImageUrl(meal.name);
  const textColor = theme.textColor || '#1a1a1a';
  const descColor = theme.descColor || '#555';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.bg,
        borderRadius: '20px',
        overflow: 'hidden',
        border: `2.5px solid ${theme.border}`,
        boxShadow: theme.bg === '#1A1A1A' || theme.bg === '#1C1C1C'
          ? `0 0 20px rgba(0,0,0,0.4), 0 0 0 1px ${theme.accent}22`
          : `0 4px 20px rgba(0,0,0,0.10)`,
        fontFamily: theme.font,
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Cuisine header band */}
      <div style={{
        background: theme.headerBg,
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: `1px solid ${theme.accent}44`,
      }}>
        <span style={{ color: theme.headerText, fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          {theme.tag}
        </span>
        <span style={{ fontSize: '14px' }}>{meal.emoji || '🍽️'}</span>
      </div>

      {/* Photo */}
      <div style={{ height: '180px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <img
          src={imgSrc}
          alt={meal.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: (theme.bg === '#1A1A1A' || theme.bg === '#1C1C1C') ? 'brightness(0.85) contrast(1.05)' : 'none',
          }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;background:${theme.headerBg}">${meal.emoji || '🍽️'}</div>`;
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, transparent 50%, ${theme.bg} 100%)`,
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Inspired by */}
        {(meal.inspired_by || meal.inspiredBy) && (
          <p style={{ fontSize: '10px', color: theme.label, fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
            Inspired by {meal.inspired_by || meal.inspiredBy}
          </p>
        )}

        {/* Name */}
        <h2 style={{
          color: theme.accent,
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: 1.2,
          margin: 0,
          textAlign: 'center',
        }}>
          {meal.name}
        </h2>

        {/* Description */}
        {meal.description && (
          <p style={{
            fontSize: '12px',
            color: descColor,
            lineHeight: 1.45,
            margin: 0,
            textAlign: 'center',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {meal.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex',
          background: theme.headerBg,
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${theme.accent}44`,
          marginTop: '4px',
        }}>
          {[
            { label: 'Prep', value: meal.prep_minutes ? `${meal.prep_minutes}m` : '—' },
            { label: 'Serves', value: meal.servings || 4 },
            { label: 'Difficulty', value: meal.difficulty === 'Confident Cook' ? 'Pro' : (meal.difficulty || '—') },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '7px 4px',
              borderRight: i < 2 ? `1px solid ${theme.accent}33` : 'none',
            }}>
              <div style={{ color: theme.headerText, fontSize: '13px', fontWeight: 800 }}>{item.value}</div>
              <div style={{ color: `${theme.headerText}88`, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Top ingredients preview */}
        {(meal.ingredients || []).length > 0 && (
          <p style={{ fontSize: '11px', color: descColor, margin: 0, textAlign: 'center', opacity: 0.75 }}>
            {(meal.ingredients || []).slice(0, 3).map(i => i.name).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
