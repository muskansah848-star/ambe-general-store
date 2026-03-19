import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';
import {
  FiShoppingBag, FiDollarSign, FiAlertTriangle,
  FiPackage, FiTrendingUp, FiUsers, FiPlusCircle, FiEye,
} from 'react-icons/fi';

const STATUS_COLORS = {
  Pending:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-400' },
  Processing: { bg: 'bg-blue-100   dark:bg-blue-900/30',   text: 'text-blue-700   dark:text-blue-400',   dot: 'bg-blue-400'   },
  Shipped:    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-400' },
  Delivered:  { bg: 'bg-green-100  dark:bg-green-900/30',  text: 'text-green-700  dark:text-green-400',  dot: 'bg-green-400'  },
  Cancelled:  { bg: 'bg-red-100    dark:bg-red-900/30',    text: 'text-red-700    dark:text-red-400',    dot: 'bg-red-400'    },
};

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color || 'text-gray-800 dark:text-white'}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color ? color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100') : 'bg-gray-100 dark:bg-gray-700'}`}>
          <Icon size={22} className={color || 'text-gray-500'} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    api.get('/orders/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      {loading ? <Loader /> : error ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Failed to load dashboard data</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Retry</button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Welcome */}
          <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-1">Welcome back, Admin 👋</h2>
            <p className="text-green-100 text-sm">Here's what's happening in your store today.</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FiShoppingBag}
              label="Total Orders"
              value={stats.totalOrders}
              sub="All time"
              color="text-blue-600"
            />
            <StatCard
              icon={FiDollarSign}
              label="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              sub="From paid orders"
              color="text-green-600"
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Low Stock"
              value={stats.lowStock.length}
              sub="Items need restock"
              color="text-orange-500"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Pending Orders"
              value={stats.ordersByStatus.find(s => s._id === 'Pending')?.count || 0}
              sub="Awaiting processing"
              color="text-purple-600"
            />
          </div>

          {/* Order status breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FiPackage size={18} /> Order Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {['Pending','Processing','Shipped','Delivered','Cancelled'].map((status) => {
                const found = stats.ordersByStatus.find(s => s._id === status);
                const count = found?.count || 0;
                const colors = STATUS_COLORS[status];
                const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <div key={status} className={`${colors.bg} rounded-xl p-4 text-center`}>
                    <div className={`w-2 h-2 rounded-full ${colors.dot} mx-auto mb-2`} />
                    <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                    <p className={`text-xs font-medium ${colors.text} mt-1`}>{status}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><FiShoppingBag size={16} /> Recent Orders</h3>
                <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <FiEye size={12} /> View All
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((o) => {
                    const colors = STATUS_COLORS[o.status] || STATUS_COLORS.Pending;
                    return (
                      <div key={o._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {o.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{o.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">#{o._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">₹{o.totalPrice}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Low stock alert */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-orange-500">
                  <FiAlertTriangle size={16} /> Low Stock Alert
                </h3>
                <Link to="/admin/products" className="text-xs text-primary hover:underline">Manage</Link>
              </div>
              {stats.lowStock.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-sm text-gray-400">All products are well stocked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.lowStock.map((p) => (
                    <div key={p._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                      <span className="text-sm truncate max-w-[180px]">{p.name}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        p.stock === 0
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="font-bold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { to: '/admin/products/new', label: 'Add Product',     emoji: '➕', color: 'bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-800'  },
                { to: '/admin/products',     label: 'All Products',    emoji: '📦', color: 'bg-blue-50   dark:bg-blue-900/20   border-blue-200   dark:border-blue-800'   },
                { to: '/admin/orders',       label: 'Manage Orders',   emoji: '🛒', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
                { to: '/',                   label: 'View Store',      emoji: '🏪', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 ${l.color} hover:shadow-md transition-all text-center`}
                >
                  <span className="text-3xl mb-2">{l.emoji}</span>
                  <span className="text-sm font-semibold">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
