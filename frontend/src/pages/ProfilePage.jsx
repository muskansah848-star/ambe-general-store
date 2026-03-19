import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    password: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, address: form.address };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiUser /> My Profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Full Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field" required />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <input value={user?.email} className="input-field bg-gray-50 dark:bg-gray-700" readOnly />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number" className="input-field" />
        </div>

        <div className="border-t dark:border-gray-600 pt-4">
          <h3 className="font-semibold mb-3">Address</h3>
          <div className="space-y-3">
            <input value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
              placeholder="Street" className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                placeholder="City" className="input-field" />
              <input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                placeholder="State" className="input-field" />
            </div>
            <input value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
              placeholder="Pincode" className="input-field" />
          </div>
        </div>

        <div className="border-t dark:border-gray-600 pt-4">
          <label className="text-sm font-medium mb-1 block">New Password (leave blank to keep current)</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="New password" className="input-field" minLength={6} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
