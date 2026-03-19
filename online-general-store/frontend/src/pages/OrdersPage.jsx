import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { FiPackage, FiDownload } from 'react-icons/fi';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiPackage /> My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 mb-4">No orders yet</p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="font-mono text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold text-primary">₹{order.totalPrice}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                    <img src={item.image || 'https://via.placeholder.com/30'} alt={item.name} className="w-6 h-6 object-cover rounded" />
                    <span className="text-xs">{item.name} x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Link to={`/order/${order._id}`} className="btn-outline text-sm py-1.5">View Details</Link>
                <a href={`/api/orders/${order._id}/invoice`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline py-1.5">
                  <FiDownload size={14} /> Invoice
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
