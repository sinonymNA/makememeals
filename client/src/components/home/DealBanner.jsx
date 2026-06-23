import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { setAppliedDiscount } from '../../lib/cart.js';

export default function DealBanner() {
  const navigate = useNavigate();

  function handleClaim() {
    setAppliedDiscount({ code: 'NEWCUSTOMER15', percent: 15, reason: 'New customer bundle discount' });
    toast.success('15% off applied — new customer bundle discount');
    navigate('/shop');
  }

  return (
    <section id="deal" className="mmm-deal-banner mmm-container">
      <div className="mmm-deal-title">New here? Save 15% on your first kitchen bundle.</div>
      <p className="mmm-deal-sub">New customer bundle discount — applied automatically at checkout.</p>
      <button className="mmm-btn mmm-btn-orange" onClick={handleClaim}>Claim My 15% Off</button>
      <p className="mmm-deal-fine">No spam. Just a discount on the tools that make dinner easier.</p>
    </section>
  );
}
