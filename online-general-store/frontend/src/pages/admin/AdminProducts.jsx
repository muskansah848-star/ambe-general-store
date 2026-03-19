import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiAlertTriangle } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await api.get(`/products?limit=100${search ? `&keyword=${search}` : ''}`);
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </Link>
      </div>

      <input
        value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..." className="input-field max-w-sm mb-6"
      />

      {loading ? <Loader /> : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>No products found</p>
          <Link to="/admin/products/new" className="btn-primary mt-4 inline-block">Add First Product</Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Rating</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || `https://placehold.co/40x40/e2e8f0/94a3b8?text=${p.name[0]}`}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => { e.target.src = `https://placehold.co/40x40/e2e8f0/94a3b8?text=${p.name[0]}`; }}
                        />
                        <div>
                          <p className="font-medium line-clamp-1 max-w-[180px]">{p.name}</p>
                          {p.isFeatured && <span className="text-xs text-primary">⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                    <td className="px-4 py-3 font-semibold text-primary">₹{p.price}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 font-medium ${
                        p.stock === 0 ? 'text-red-500' : p.stock <= 10 ? 'text-orange-500' : 'text-green-600'
                      }`}>
                        {p.stock <= 10 && p.stock > 0 && <FiAlertTriangle size={12} />}
                        {p.stock === 0 ? 'Out of Stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-yellow-500">{p.rating?.toFixed(1)} ⭐ ({p.numReviews})</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <FiEdit2 size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(p._id, p.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
