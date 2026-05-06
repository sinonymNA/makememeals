export default function ToggleCard({ emoji, label, description, value, onChange }) {
  return (
    <div
      className={`toggle-card ${value ? 'active' : ''}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className={`font-bold text-[15px] ${value ? 'text-white' : ''}`} style={!value ? { color: 'var(--text)' } : {}}>
            {label}
          </div>
          {description && (
            <div className={`text-[13px] font-semibold ${value ? 'text-white/80' : ''}`} style={!value ? { color: 'var(--text-light)' } : {}}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div className={`toggle-switch ${value ? 'on' : ''}`} />
    </div>
  );
}
