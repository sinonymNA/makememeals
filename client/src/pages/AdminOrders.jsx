import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getAdminOrders, updateAdminOrderStatus } from '../lib/api.js';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

export default function AdminOrders() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      setOrders(await getAdminOrders());
      setError(null);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access required' : 'Could not load orders');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(orderId, status) {
    try {
      await updateAdminOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Order updated');
    } catch {
      toast.error('Could not update order');
    }
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh', maxWidth: '600px' }}>
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          Shop Orders
        </h1>
      </div>

      <div className="page-pad pt-0">
        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text-light)' }}>Loading…</div>
        ) : error ? (
          <div className="card p-6 text-center">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>No orders yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>#{order.id.slice(0, 8)}</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-light)' }}>{order.email}</div>
                  </div>
                  <div className="font-bold text-[15px]" style={{ color: 'var(--accent)' }}>
                    ${(order.total_cents / 100).toFixed(2)}
                  </div>
                </div>
                <div className="text-[12px] mt-2" style={{ color: 'var(--text-mid)' }}>
                  {order.shipping_name} — {order.shipping_address?.line1}, {order.shipping_address?.city} {order.shipping_address?.state} {order.shipping_address?.zip}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(order.id, s)}
                      className={`pill-option ${order.status === s ? 'selected' : ''}`}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="pb-10" />
    </div>
  );
}
