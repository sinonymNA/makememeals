
const CATEGORY_EMOJIS = {
  'Meat & Seafood': '🥩',
  'Produce':        '🥦',
  'Dairy':          '🥛',
  'Pantry':         '🫙',
  'Bakery':         '🥖',
  'Frozen':         '❄️',
  'Other':          '🛒',
};

const CATEGORY_ORDER = ['Meat & Seafood', 'Produce', 'Dairy', 'Pantry', 'Bakery', 'Frozen', 'Other'];

function dots(n = 20) {
  return '·'.repeat(n);
}

function priceCol(price) {
  if (!price && price !== 0) return '';
  return `$${Number(price).toFixed(2)}`;
}

export default function GroceryPaper({ items, estimatedTotal, budget, onToggle }) {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  const checkedTotal = items
    .filter(i => i.checked && i.estimated_price)
    .reduce((s, i) => s + Number(i.estimated_price), 0);
  const remainingTotal = items
    .filter(i => !i.checked && i.estimated_price)
    .reduce((s, i) => s + Number(i.estimated_price), 0);
  const hasAnyPrices = items.some(i => i.estimated_price);

  return (
    <div className="grocery-paper-wrapper mx-4">
      <div className="torn-top" />
      <div className="grocery-paper" style={{ paddingLeft: '52px' }}>

        {/* Receipt header */}
        <div style={{ paddingTop: '8px', marginBottom: '8px', lineHeight: '32px' }}>
          <div className="text-center font-black text-[16px]" style={{ color: 'var(--accent)', lineHeight: '32px' }}>
            🍽️ MAKE ME MEALS
          </div>
          <div className="text-center font-bold text-[13px]" style={{ color: 'var(--text-light)', lineHeight: '24px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div
            className="text-center text-[11px] font-semibold mt-1"
            style={{
              borderTop: '1px dashed var(--border)',
              borderBottom: '1px dashed var(--border)',
              padding: '4px 0',
              color: 'var(--text-light)',
              lineHeight: '24px',
            }}
          >
            ── GROCERY LIST ──
          </div>
        </div>

        {/* Budget vs actual bar */}
        {budget > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div className="flex justify-between text-[11px] font-semibold mb-1" style={{ color: 'var(--text-mid)' }}>
              <span>Budget: ${budget.toFixed(0)}</span>
              <span style={{ color: estimatedTotal > budget ? '#ff6b6b' : 'var(--accent)' }}>
                {estimatedTotal > budget ? `$${(estimatedTotal - budget).toFixed(2)} over` : `$${(budget - estimatedTotal).toFixed(2)} under`}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((estimatedTotal / budget) * 100, 100)}%`,
                  background: estimatedTotal > budget ? '#ff6b6b' : 'var(--accent)',
                }}
              />
            </div>
          </div>
        )}

        {/* Categories */}
        {Object.entries(grouped).map(([category, catItems]) => {
          const catTotal = catItems
            .filter(i => i.estimated_price)
            .reduce((s, i) => s + Number(i.estimated_price), 0);

          return (
            <div key={category} className="mb-2">
              {/* Category header */}
              <div
                className="text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-between"
                style={{ color: 'var(--accent)', lineHeight: '32px' }}
              >
                <span>{CATEGORY_EMOJIS[category]} {category}</span>
                {hasAnyPrices && catTotal > 0 && (
                  <span style={{ color: 'var(--text-light)' }}>${catTotal.toFixed(2)}</span>
                )}
              </div>

              {/* Items */}
              {catItems.map((item, i) => (
                <ReceiptItem key={`${item.name}-${i}`} item={item} onToggle={onToggle} />
              ))}
            </div>
          );
        })}

        {/* Receipt totals */}
        <div style={{ borderTop: '1px dashed var(--border)', marginTop: '8px', paddingTop: '4px' }}>
          {hasAnyPrices ? (
            <>
              {checkedTotal > 0 && (
                <div className="flex justify-between text-[13px] font-semibold" style={{ color: 'var(--text-light)', lineHeight: '28px' }}>
                  <span>Got it ✓</span>
                  <span>-${checkedTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] font-extrabold" style={{ color: 'var(--text)', lineHeight: '32px' }}>
                <span>Still need</span>
                <span>${remainingTotal.toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                <div className="flex justify-between text-[15px] font-black" style={{ color: 'var(--text)', lineHeight: '32px' }}>
                  <span>TOTAL</span>
                  <span>~${(estimatedTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-[15px] font-black" style={{ color: 'var(--text)', lineHeight: '32px' }}>
              <span>Est. total</span>
              <span>~${(estimatedTotal || 0).toFixed(2)}</span>
            </div>
          )}

          <div
            className="text-[11px] italic text-center mt-2"
            style={{ color: 'var(--text-light)', lineHeight: '20px' }}
          >
            Prices are estimates. May be lower with<br />store sales and loyalty cards 🎉
          </div>

          {/* Receipt footer */}
          <div
            className="text-center text-[11px] font-bold mt-3"
            style={{
              borderTop: '1px dashed var(--border)',
              paddingTop: '8px',
              color: 'var(--text-light)',
              lineHeight: '20px',
            }}
          >
            Thank you for cooking! 👨‍🍳<br />MakeMeMeals.com
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptItem({ item, onToggle }) {
  const hasPrice = item.estimated_price != null;
  const label = item.display_name || [item.quantity, item.unit, item.name].filter(Boolean).join(' ');

  return (
    <div
      className={`flex items-center gap-2 ${item.checked ? 'opacity-40' : ''}`}
      style={{ lineHeight: '32px', minHeight: '32px', transition: 'opacity 0.2s' }}
    >
      {/* Checkbox */}
      <button
        className={`grocery-checkbox flex-shrink-0 ${item.checked ? 'checked' : ''}`}
        onClick={() => onToggle(item)}
        type="button"
        style={{ width: '20px', height: '20px' }}
      >
        <svg viewBox="0 0 12 10" fill="none" style={{ width: 10, height: 10, opacity: item.checked ? 1 : 0 }}>
          <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Name — fills space */}
      <span
        className="flex-1 text-[13px] font-semibold truncate"
        style={{
          color: 'var(--text)',
          textDecoration: item.checked ? 'line-through' : 'none',
          fontFamily: "'Caveat', cursive",
        }}
      >
        {label}
      </span>

      {/* Price */}
      {hasPrice && (
        <span
          className="text-[13px] font-bold flex-shrink-0 ml-2"
          style={{ color: item.checked ? 'var(--text-light)' : 'var(--text)', minWidth: '44px', textAlign: 'right' }}
        >
          ${Number(item.estimated_price).toFixed(2)}
        </span>
      )}
    </div>
  );
}
