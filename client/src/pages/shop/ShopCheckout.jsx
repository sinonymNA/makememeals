import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, createPaymentIntent, confirmOrder } from '../../lib/api.js';
import { getCart, cartSubtotalCents, clearCart, getAppliedDiscount } from '../../lib/cart.js';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentStep({ orderId, total, onBack }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) {
        toast.error(error.message || 'Payment failed');
        setSubmitting(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await confirmOrder(orderId).catch(() => {});
        clearCart();
        navigate(`/shop/order/${orderId}`);
      } else {
        toast.error('Payment did not complete');
        setSubmitting(false);
      }
    } catch (err) {
      toast.error(err.message || 'Payment failed');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement />
      <button className="pill-button w-full justify-center mt-5" disabled={submitting || !stripe}>
        {submitting ? 'Processing…' : `Pay $${(total / 100).toFixed(2)}`}
      </button>
      <button type="button" className="pill-button ghost w-full justify-center mt-2 text-[13px]" onClick={onBack}>
        Back
      </button>
    </form>
  );
}

export default function ShopCheckout() {
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [cart] = useState(getCart());
  const [discount] = useState(getAppliedDiscount());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState({ line1: '', city: '', state: '', zip: '' });
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (cart.length === 0) navigate('/shop/cart');
  }, [cart, navigate]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) setEmail(user.primaryEmailAddress.emailAddress);
    if (user?.fullName) setName(user.fullName);
  }, [user]);

  async function handleContinue(e) {
    e.preventDefault();
    if (!email || !name || !address.line1 || !address.city || !address.state || !address.zip) {
      toast.error('Please fill in all fields');
      return;
    }
    setCreating(true);
    try {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      }
      const result = await createPaymentIntent({
        items: cart.map(i => ({ slug: i.slug, quantity: i.quantity })),
        discountCode: discount?.code,
        email,
        shippingName: name,
        shippingAddress: address,
      });
      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      setPricing(result);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not start checkout');
    } finally {
      setCreating(false);
    }
  }

  const subtotal = cartSubtotalCents(cart);

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/shop/cart')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Checkout
        </h1>
      </div>

      <div className="page-pad pt-0">
        {!clientSecret ? (
          <form onSubmit={handleContinue} className="flex flex-col gap-3">
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
            />
            <input
              type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
            />
            <input
              type="text" placeholder="Street address" value={address.line1}
              onChange={(e) => setAddress(a => ({ ...a, line1: e.target.value }))}
              className="px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
            />
            <div className="flex gap-2">
              <input
                type="text" placeholder="City" value={address.city}
                onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))}
                className="flex-1 px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
              />
              <input
                type="text" placeholder="State" value={address.state}
                onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))}
                className="w-20 px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
              />
              <input
                type="text" placeholder="ZIP" value={address.zip}
                onChange={(e) => setAddress(a => ({ ...a, zip: e.target.value }))}
                className="w-24 px-4 py-3 rounded-2xl text-[14px]" style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
              />
            </div>

            <div className="card p-4 mt-2">
              <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--text-mid)' }}>
                <span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--accent-green)' }}>
                  <span>{discount.code}</span><span>-{discount.percent_off}%</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--text-mid)' }}>
                <span>Shipping</span><span>Free</span>
              </div>
            </div>

            <button className="pill-button w-full justify-center mt-2" disabled={creating}>
              {creating ? 'Loading…' : 'Continue to payment'}
            </button>
          </form>
        ) : (
          <>
            <div className="card p-4 mb-4">
              <div
                className="flex justify-between text-[16px] font-bold"
                style={{ color: 'var(--text)' }}
              >
                <span>Total</span>
                <span>${(pricing.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>
            {stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentStep orderId={orderId} total={pricing.total_cents} onBack={() => setClientSecret(null)} />
              </Elements>
            ) : (
              <p className="text-[13px] text-center" style={{ color: 'var(--text-light)' }}>
                Stripe isn't configured yet.
              </p>
            )}
          </>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
