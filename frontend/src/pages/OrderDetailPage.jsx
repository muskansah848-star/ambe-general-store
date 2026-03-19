import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { FiDownload, FiCheckCircle, FiClock, FiTruck } from 'react-icons/fi';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STATUS_COLORS = {
  Pending: 'text-yellow-500', Processing: 'text-blue-500',
  Shipped: 'text-purple-500', Delivered: 'text-green-500', Cancelled: 'text-red-500',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <a href={`/api/orders/${order._id}/invoice`} target="_blank" rel="noreferrer"
          className="btn-outline flex items-center gap-2 text-sm">
          <FiDownload /> Download Invoice
        </a>
      </div>

      {/* Status tracker */}
      {order.status !== 'Cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i <= stepIndex ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i <= stepIndex ? 'text-primary font-medium' : 'text-gray-400'}`}>{s}</span>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${i < stepIndex ? 'bg-primary' : 'bg-gray-200'}`} style={{ display: 'none' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Items Ordered</h2>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <span className="font-semibold text-sm">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress.street}, {order.shippingAddress.city},<br />
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Payment Info</h2>
            <p className="text-sm">Method: <strong>{order.paymentMethod}</strong></p>
            <p className="text-sm">Status: <span className={order.isPaid ? 'text-green-500' : 'text-red-500'}>{order.isPaid ? 'Paid' : 'Not Paid'}</span></p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-3">Price Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Items</span><span>₹{order.itemsPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{order.shippingPrice}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{order.taxPrice}</span></div>
              <div className="flex justify-between font-bold text-base border-t dark:border-gray-600 pt-2 mt-2">
                <span>Total</span><span className="text-primary">₹{order.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/orders" className="btn-outline">← Back to Orders</Link>
      </div>
    </div>
  );
}
