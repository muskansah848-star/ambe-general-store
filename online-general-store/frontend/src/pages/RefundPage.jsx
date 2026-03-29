import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { FiRefreshCw } from 'react-icons/fi';

const STATUS_COLOR = {
  Requested:  'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Completed:  'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-700',
};

export default function RefundPage() {
  const [refunds, setRefunds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ orderId: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/payment/refunds/my'),
      api.get('/orders/my-orders'),
    ]).then(([r, o]) => {
      setRefunds(r.data);
      // Only show paid orders that aren't already refunded
      const refundedOrderIds = new Set(r.data.map((rf) => rf.order?._id || rf.order));
      setOrders(o.data.filter((ord) => ord.isPaid && !refundedOrderIds.has(ord._id)));
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const submitRefund = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.reason.trim())
      return toast.error('Select an order and provide a reason');
    setSubmitting(true);
    try {
      const { data } = await api.post('/payment/refund', form);
      setRefunds((prev) => [data, ...prev]);
      setOrders((prev) => prev.filter((o) => o._id !== form.orderId));
      setForm({ orderId: '', reason: '' });
      toast.success('Refund request submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit refund');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiRefreshCw /> Refunds
      </h1>

      {/* Request form */}
      {orders.length > 0 && (
        <form onSubmit={submitRefund} className="card p-6 mb-8 space-y-4">
          <h2 className="font-semibold text-lg">Request a Refund</h2>
          <select
            value={form.orderId}
            onChange={(e) => setForm({ ...form, orderId: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Select an order</option>
            {orders.map((o) => (
              <option key={o._id} value={o._id}>
                Order #{o._id.slice(-6).toUpperCase()} — ₹{o.totalPrice} ({o.paymentMethod})
              </option>
            ))}
          </select>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason for refund (e.g. wrong item, damaged product)"
            className="input-field min-h-[80px] resize-none"
            required
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Refund Request'}
          </button>
        </form>
      )}

      {/* Refund history */}
      <h2 className="font-semibold text-lg mb-4">Refund History</h2>
      {refunds.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiRefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p>No refund requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((r) => (
            <div key={r._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Order #{(r.order?._id || r.order)?.toString().slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.reason}</p>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">₹{r.amount}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
