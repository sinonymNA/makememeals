import { useNavigate } from 'react-router-dom';

const LINKS = [
  { label: 'Recipes', to: '/#recipes' },
  { label: 'Shop', to: '/shop' },
  { label: 'Meal Planner', to: '/guest-setup' },
  { label: 'Deals', to: '/#deal' },
  { label: 'Contact', to: '/#contact' },
];

export default function Footer() {
  const navigate = useNavigate();

  function go(to) {
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(to);
    }
  }

  return (
    <footer id="contact" className="mmm-footer">
      <div className="mmm-container">
        <div className="mmm-logo-text" style={{ color: 'var(--mmm-white)' }}>Make Me Meals</div>
        <nav className="mmm-footer-links">
          {LINKS.map(l => (
            <a key={l.label} href={l.to} onClick={(e) => { e.preventDefault(); go(l.to); }}>{l.label}</a>
          ))}
        </nav>
        <p className="mmm-footer-fine">
          Some links on this site are affiliate links — Make Me Meals may earn a commission on purchases, at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
