import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Minus, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getUserDiscount, validateDiscountCode } from '../../lib/api.js';
import { getCart, updateQuantity, removeFromCart, cartSubtotalCents, getAppliedDiscount, setAppliedDiscount } from '../../lib/cart.js';

export default function ShopCart() {
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const [cart, setCart] = useState(getCart());
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(getAppliedDiscount());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isSignedIn || discount) return;
    getToken().then(token => {
      setAuthToken(token);
      getUserDiscount().then(d => {
        if (d?.code) {
          setDiscount(d);
          setAppliedDiscount(d);
        }
      }).catch(() => {});
    });
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  function refresh() {
    setCart(getCart());
  }

  async function handleApplyCode() {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const result = await validateDiscountCode(code);
      if (result.valid) {
        const d = { code: result.code, percent_off: result.percent_off };
        setDiscount(d);
        setAppliedDiscount(d);
        toast.success(`${d.percent_off}% off applied!`);
      } else {
        toast.error('Invalid code');
      }
    } catch {
      toast.error('Could not check code');
    } finally {
      setChecking(false);
    }
  }

  const subtotal = cartSubtotalCents(cart);
  const discountCents = discount ? Math.round(subtotal * discount.percent_off / 100) : 0;
  const total = subtotal - discountCents;

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/shop')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Your Cart
        </h1>
      </div>

      <div className="page-pad pt-0">
        {cart.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Your cart is empty</p>
            <button className="pill-button mt-4" onClick={() => navigate('/shop')}>Browse the shop</button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.slug} className="card p-3 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'var(--bg-warm)' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>{item.name}</div>
                    <div className="text-[13px] font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>
                      ${(item.price_cents / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ border: '1px solid var(--border-mid)' }}
                      onClick={() => { updateQuantity(item.slug, item.quantity - 1); refresh(); }}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[13px] font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ border: '1px solid var(--border-mid)' }}
                      onClick={() => { updateQuantity(item.slug, item.quantity + 1); refresh(); }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => { removeFromCart(item.slug); refresh(); }} className="p-1">
                    <X size={16} style={{ color: 'var(--text-light)' }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[12px] mb-2" style={{ color: 'var(--text-light)' }}>Discount code</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                  className="flex-1 px-3 py-2 rounded-full text-[13px]"
                  style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
                />
                <button className="pill-button outline text-[13px]" onClick={handleApplyCode} disabled={checking}>
                  {checking ? '...' : 'Apply'}
                </button>
              </div>
              {discount && (
                <p className="text-[12px] mt-2" style={{ color: 'var(--accent-green)' }}>
                  {discount.code} applied — {discount.percent_off}% off
                </p>
              )}
            </div>

            <div className="card p-4 mt-5">
              <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--text-mid)' }}>
                <span>Subtotal</span>
                <span>${(subtotal / 100).toFixed(2)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--accent-green)' }}>
                  <span>Discount</span>
                  <span>-${(discountCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--text-mid)' }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div
                className="flex justify-between text-[16px] font-bold pt-2 mt-1"
                style={{ color: 'var(--text)', borderTop: '1px solid var(--border)' }}
              >
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>

            <button className="pill-button w-full justify-center mt-4" onClick={() => navigate('/shop/checkout')}>
              Checkout
            </button>
          </>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
