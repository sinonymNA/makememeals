import { useState } from 'react';
import logo from '../MMMlogolong.png';

function Chip({ icon, value, theme }) {
  return (
    <div style={{
      background: theme.chipBg,
      border: `1px solid ${theme.chipBorder}`,
      borderRadius: '999px',
      padding: '6px 14px',
      fontSize: '13px',
      color: theme.chipText,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontFamily: "'Fredoka', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {icon} {value}
    </div>
  );
}

export default function BaseRecipeCard({ meal, cardRef, theme }) {
  const [expanded, setExpanded] = useState(false);
  const ingredients = meal.ingredients || [];
  const steps = meal.steps || [];
  const visibleSteps = expanded ? steps : steps.slice(0, 3);
  const hiddenCount = steps.length - 3;

  function fmtQty(ing) {
    const q = ing.quantity || '';
    const u = ing.unit || '';
    // If unit is already embedded in quantity (e.g. "3 medium"), don't double-append
    if (!u || q.toLowerCase().includes(u.toLowerCase())) return q;
    return `${q} ${u}`;
  }

  return (
    <div
      ref={cardRef}
      style={{
        width: '380px',
        background: theme.cardBg,
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: "'Fredoka', sans-serif",
        boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
        border: 'none',
      }}
    >
      {/* Full-width photo with cuisine overlay */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderRadius: '20px 20px 0 0', flexShrink: 0 }}>
        <img
          src={meal.imageUrl}
          alt={meal.name}
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:72px;background:${theme.ingBorder}22">${meal.emoji || '🍽️'}</div>`;
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
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 600,
          }}>
            {theme.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: '0' }}>

        {/* Inspired by — above name */}
        {(meal.inspired_by || meal.inspiredBy) && (
          <p style={{
            fontSize: '13px',
            color: '#8B7355',
            fontStyle: 'italic',
            margin: '0 0 6px',
            textAlign: 'center',
            fontFamily: "'Fredoka', sans-serif",
          }}>
            Inspired by {meal.inspired_by || meal.inspiredBy}
          </p>
        )}

        {/* Recipe name */}
        <h2 style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: '26px',
          fontWeight: 700,
          color: theme.nameColor,
          lineHeight: 1.2,
          margin: '0 0 10px',
          textAlign: 'center',
        }}>
          {meal.name}
        </h2>

        {/* Description — 2 lines max */}
        {meal.description && (
          <p style={{
            fontSize: '13px',
            color: theme.descColor,
            lineHeight: 1.5,
            margin: '0 0 14px',
            textAlign: 'center',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {meal.description}
          </p>
        )}

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Chip icon="⏱" value={meal.prep_minutes ? `${meal.prep_minutes} min` : '—'} theme={theme} />
          <Chip icon="👥" value={`${meal.servings || 2} servings`} theme={theme} />
          <Chip icon="💰" value={meal.estimated_cost ? `~$${meal.estimated_cost}` : '—'} theme={theme} />
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              fontSize: '11px',
              color: theme.labelColor,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: "'Fredoka', sans-serif",
            }}>
              Ingredients
            </div>
            {ingredients.slice(0, 8).map((ing, i) => (
              <div key={i} style={{
                borderLeft: `2px solid ${theme.ingBorder}`,
                paddingLeft: '10px',
                marginBottom: '6px',
                fontSize: '13px',
                color: theme.descColor,
                lineHeight: 1.4,
              }}>
                <strong>{fmtQty(ing)}</strong>{' '}
                <span style={{ fontWeight: 400 }}>{ing.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              fontSize: '11px',
              color: theme.labelColor,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: "'Fredoka', sans-serif",
            }}>
              How to Make It
            </div>
            {visibleSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: theme.descColor, marginBottom: '8px', alignItems: 'flex-start' }}>
                <span style={{
                  background: theme.stepNumBg,
                  color: theme.stepNumText,
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                  fontFamily: "'Fredoka', sans-serif",
                }}>{i + 1}</span>
                <span style={{ lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
            {!expanded && hiddenCount > 0 && (
              <button
                onClick={() => setExpanded(true)}
                style={{
                  background: 'none', border: 'none',
                  color: theme.accent, fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer',
                  padding: '4px 0',
                  fontFamily: "'Fredoka', sans-serif",
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                + {hiddenCount} more step{hiddenCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}

        {/* Chef tip */}
        {meal.chef_tip && (
          <div style={{
            background: theme.tipBg,
            border: `1.5px solid ${theme.ingBorder}44`,
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '14px',
          }}>
            <div style={{
              fontSize: '10px',
              color: theme.labelColor,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontFamily: "'Fredoka', sans-serif",
            }}>⭐ Chef's Tip</div>
            <p style={{ color: theme.descColor, fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{meal.chef_tip}</p>
          </div>
        )}

        {/* Watermark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', opacity: 0.35, marginTop: '4px' }}>
          <img src={logo} alt="MakeMeMeals" crossOrigin="anonymous" style={{ height: '13px', width: 'auto' }} />
        </div>
      </div>
    </div>
  );
}
