export default function ToggleCard({ emoji, label, description, value, onChange }) {
  return (
    <div
      className="toggle-row"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{label}</div>
          {description && (
            <div className="text-[13px]" style={{ color: 'var(--text-light)' }}>{description}</div>
          )}
        </div>
      </div>
      <div className={`toggle-switch ${value ? 'on' : ''}`} />
    </div>
  );
}
