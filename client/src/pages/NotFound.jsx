import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="app-shell flex flex-col items-center justify-center" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="text-6xl mb-4">🍽️</div>
      <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Page not found</h1>
      <p className="text-[15px] mb-8 text-center px-8" style={{ color: 'var(--text-mid)' }}>
        Looks like this page wandered off the menu.
      </p>
      <button className="pill-button" onClick={() => navigate('/')}>Go home</button>
    </div>
  );
}
