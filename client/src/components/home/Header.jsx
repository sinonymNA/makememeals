import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { getCart, cartCount } from '../../lib/cart.js';

const NAV_LINKS = [
  { label: 'Recipes', to: '/#recipes' },
  { label: 'Shop', to: '/shop' },
  { label: 'Meal Planner', to: '/guest-setup' },
];

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount(getCart()));
    const onUpdate = () => setCount(cartCount(getCart()));
    window.addEventListener('cart-updated', onUpdate);
    return () => window.removeEventListener('cart-updated', onUpdate);
  }, []);

  function go(to) {
    setMenuOpen(false);
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(to);
    }
  }

  return (
    <header className="mmm-header">
      <div className="mmm-header-inner">
        <button className="mmm-icon-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <button className="mmm-logo-btn" onClick={() => navigate('/')} aria-label="Make Me Meals home">
          <img src="/images/brand/logo.png" alt="Make Me Meals" className="mmm-logo-img" />
        </button>
        <button className="mmm-icon-btn" onClick={() => navigate('/shop/cart')} aria-label="Cart">
          <ShoppingBag size={20} />
          {count > 0 && <span className="mmm-cart-badge">{count}</span>}
        </button>
      </div>
      {menuOpen && (
        <nav className="mmm-mobile-menu">
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.to} onClick={(e) => { e.preventDefault(); go(link.to); }}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
