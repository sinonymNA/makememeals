export default function PillSelector({ options, value, onChange }) {
  return (
    <div className="pill-selector">
      {options.map(opt => (
        <button
          key={opt}
          className={`pill-option ${value === opt ? 'selected' : ''}`}
          onClick={() => onChange(opt)}
          type="button"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
