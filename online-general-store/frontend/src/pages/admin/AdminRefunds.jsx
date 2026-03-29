import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiRefreshCw } from 'react-icons/fi';

const STATUS_COLOR = {
  Requested:  'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Completed:  'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-700',
};

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    api.get('/payment/refunds')
      .then(({ data }) => setRefunds(data))
      .catch(() => toast.error('Failed to load refunds'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    setProcessing(id + action);
    try {
      const { data } = await api.put(`/payment/refund/${id}/process`, { action });
      setRefunds((prev) => prev.map((r) => (r._id === id ? data : r)));
      toast.success(action === 'approve' ? 'Refund processed' : 'Refund rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing('');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiRefreshCw /> Refund Requests</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : refunds.length === 0 ? (
          <p className="text-gray-400 text-center py-16">No refund requests</p>
        ) : (
          <div className="space-y-4">
            {refunds.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.user?.name} <span className="text-gray-400 font-normal text-sm">({r.user?.email})</span></p>
                    <p className="text-sm text-gray-500 mt-0.5">Order #{(r.order?._id || r.order)?.toString().slice(-6).toUpperCase()} — {r.method}</p>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{r.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                    {r.gatewayRefundId && (
                      <p className="text-xs text-gray-400 mt-0.5">Gateway ID: {r.gatewayRefundId}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-lg">₹{r.amount}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                      {r.status}
                    </span>
                    {r.status === 'Requested' && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleAction(r._id, 'approve')}
                          disabled={!!processing}
                          className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
                          {processing === r._id + 'approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(r._id, 'reject')}
                          disabled={!!processing}
                          className="btn-outline text-xs px-3 py-1.5 text-red-500 border-red-300 disabled:opacity-50">
                          {processing === r._id + 'reject' ? '...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
