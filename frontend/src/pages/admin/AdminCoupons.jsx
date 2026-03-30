import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';

const EMPTY = { code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/payment/coupons').then(({ data }) => setCoupons(data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      };
      const { data } = await api.post('/payment/coupon', payload);
      setCoupons((prev) => [data, ...prev]);
      setForm(EMPTY);
      toast.success('Coupon created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/payment/coupon/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiTag /> Coupons</h1>

        {/* Create form */}
        <form onSubmit={handleCreate} className="card p-6 mb-8 grid grid-cols-2 gap-4">
          <h2 className="col-span-2 font-semibold text-lg">Create Coupon</h2>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Code (e.g. SAVE20)" className="input-field" required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
          <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder={form.type === 'percentage' ? 'Discount % (e.g. 20)' : 'Discount ₹ (e.g. 50)'}
            className="input-field" required min="1" />
          <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            placeholder="Min order ₹ (optional)" className="input-field" min="0" />
          <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            placeholder="Max discount ₹ (optional)" className="input-field" min="0" />
          <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            placeholder="Usage limit (optional)" className="input-field" min="1" />
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="input-field" />
          <button type="submit" disabled={loading} className="col-span-2 btn-primary flex items-center justify-center gap-2">
            <FiPlus /> {loading ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>

        {/* Coupon list */}
        <div className="space-y-3">
          {coupons.length === 0 && <p className="text-gray-400 text-center py-8">No coupons yet</p>}
          {coupons.map((c) => (
            <div key={c._id} className="card p-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono font-bold text-primary text-lg">{c.code}</span>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                  <span>{c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}</span>
                  {c.minOrder > 0 && <span>Min ₹{c.minOrder}</span>}
                  {c.maxDiscount && <span>Max ₹{c.maxDiscount}</span>}
                  {c.usageLimit && <span>{c.usedCount}/{c.usageLimit} used</span>}
                  {c.expiresAt && <span>Expires {new Date(c.expiresAt).toLocaleDateString()}</span>}
                  <span className={c.isActive ? 'text-green-600' : 'text-red-500'}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600 p-2">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
