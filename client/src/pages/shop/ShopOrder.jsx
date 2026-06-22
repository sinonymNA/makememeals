import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getOrder } from '../../lib/api.js';

const STATUS_LABELS = {
  pending: 'Pending payment',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export default function ShopOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

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
          Order
        </h1>
      </div>

      <div className="page-pad pt-0">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text-light)' }}>Loading…</div>
        ) : error || !order ? (
          <div className="card p-6 text-center">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Order not found</p>
          </div>
        ) : (
          <>
            <div className="card p-6 text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold text-[17px]" style={{ color: 'var(--text)' }}>Order confirmed!</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-mid)' }}>#{order.id.slice(0, 8)}</p>
              <div
                className="inline-block mt-3 px-4 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ background: 'var(--bg-warm)', color: 'var(--accent)' }}
              >
                {STATUS_LABELS[order.status] || order.status}
              </div>
            </div>

            <div className="card p-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-[14px] py-1.5">
                  <span style={{ color: 'var(--text)' }}>{item.quantity} × {item.product_name}</span>
                  <span style={{ color: 'var(--text-mid)' }}>${(item.line_total_cents / 100).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-[13px] py-1 mt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-mid)' }}>
                <span>Subtotal</span><span>${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-[13px] py-1" style={{ color: 'var(--accent-green)' }}>
                  <span>{order.discount_code}</span><span>-${(order.discount_cents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[16px] font-bold pt-2" style={{ color: 'var(--text)' }}>
                <span>Total</span><span>${(order.total_cents / 100).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[12px] text-center mt-4" style={{ color: 'var(--text-light)' }}>
              We'll email you at {order.email} when it ships.
            </p>
          </>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
