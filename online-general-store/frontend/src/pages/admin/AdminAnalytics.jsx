import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

const BAR_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

function SimpleBar({ data, valueKey, labelKey, color = '#16a34a' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-xs text-gray-500 truncate shrink-0">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
              style={{ width: `${Math.max((d[valueKey] / max) * 100, 4)}%`, backgroundColor: color }}
            >
              {d[valueKey] > 0 ? (valueKey === 'revenue' ? `₹${d[valueKey].toLocaleString()}` : d[valueKey]) : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/analytics')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><Loader /></AdminLayout>;
  if (!data) return <AdminLayout><p className="p-6 text-red-500">Failed to load analytics</p></AdminLayout>;

  const growth = data.lastMonthRevenue > 0
    ? (((data.thisMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100).toFixed(1)
    : 100;

  const stats = [
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: data.totalOrders, icon: FiShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Customers', value: data.totalUsers, icon: FiUsers, color: 'bg-purple-100 text-purple-600' },
    { label: 'This Month', value: `₹${data.thisMonthRevenue.toLocaleString()}`, icon: FiTrendingUp, color: 'bg-orange-100 text-orange-600',
      sub: `${growth > 0 ? '+' : ''}${growth}% vs last month` },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-green-600 mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Daily revenue */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Revenue — Last 7 Days</h2>
          <SimpleBar data={data.last7Days} valueKey="revenue" labelKey="date" color="#16a34a" />
        </div>

        {/* Monthly revenue */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Revenue — Last 6 Months</h2>
          <SimpleBar data={data.last6Months} valueKey="revenue" labelKey="month" color="#2563eb" />
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Top 5 Selling Products</h2>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                    style={{ backgroundColor: BAR_COLORS[i] }}>
                    {i + 1}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="flex gap-4 text-gray-500">
                  <span>{p.qty} sold</span>
                  <span className="font-semibold text-primary">₹{p.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders per day */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Orders — Last 7 Days</h2>
          <SimpleBar data={data.last7Days} valueKey="orders" labelKey="date" color="#f59e0b" />
        </div>
      </div>
    </AdminLayout>
  );
}
