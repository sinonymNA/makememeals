import { useState } from 'react';
import { Check } from 'lucide-react';

export default function GroceryItem({ item, onToggle }) {
  return (
    <div
      className="flex items-center gap-3 py-1"
      style={{ lineHeight: '32px', minHeight: '32px' }}
    >
      <button
        className={`grocery-checkbox ${item.checked ? 'checked' : ''}`}
        onClick={() => onToggle(item)}
        type="button"
        aria-label={item.checked ? 'Uncheck' : 'Check'}
      >
        <Check size={13} color="white" strokeWidth={3} />
      </button>
      <span
        className={`grocery-item-text flex-1 text-[15px] font-semibold ${item.checked ? 'checked' : ''}`}
        style={{ color: item.checked ? 'var(--text-light)' : 'var(--text)' }}
      >
        {item.quantity && `${item.quantity} `}{item.unit && `${item.unit} `}{item.name}
      </span>
    </div>
  );
}
