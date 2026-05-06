import GroceryItem from './GroceryItem.jsx';

const CATEGORY_EMOJIS = {
  'Meat & Seafood': '🥩',
  'Produce': '🥦',
  'Dairy': '🥛',
  'Pantry': '🫙',
  'Bakery': '🥖',
  'Frozen': '❄️',
  'Other': '🛒',
};

const CATEGORY_ORDER = ['Meat & Seafood', 'Produce', 'Dairy', 'Pantry', 'Bakery', 'Frozen', 'Other'];

export default function GroceryPaper({ items, estimatedTotal, onToggle }) {
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div className="grocery-paper-wrapper mx-4">
      <div className="torn-top" />
      <div className="grocery-paper">
        {/* Title */}
        <div className="mb-4" style={{ paddingTop: '8px' }}>
          <div
            className="text-[13px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--accent)', lineHeight: '32px' }}
          >
            🍽️ MAKE ME MEALS
          </div>
          <div
            className="text-[20px] font-extrabold"
            style={{ color: 'var(--text)', lineHeight: '32px' }}
          >
            Grocery List
          </div>
        </div>

        {/* Categories */}
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-2">
            <div
              className="text-[13px] font-extrabold uppercase tracking-wide"
              style={{ color: 'var(--accent)', lineHeight: '32px' }}
            >
              {CATEGORY_EMOJIS[category]} {category}
            </div>
            {catItems.map((item, i) => (
              <GroceryItem key={`${item.name}-${i}`} item={item} onToggle={onToggle} />
            ))}
          </div>
        ))}

        {/* Total */}
        <div
          className="mt-4 pt-2 border-t"
          style={{ borderColor: 'var(--border)', lineHeight: '32px' }}
        >
          <div className="font-extrabold text-[16px]" style={{ color: 'var(--text)' }}>
            Estimated total: ~${estimatedTotal?.toFixed(2) || '0.00'}
          </div>
          <div
            className="text-[12px] italic"
            style={{ color: 'var(--text-light)', lineHeight: '20px' }}
          >
            Actual cost may be lower with store sales and loyalty cards 🎉
          </div>
        </div>
      </div>
    </div>
  );
}
