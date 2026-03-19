import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { FiUpload, FiLink, FiX } from 'react-icons/fi';

const CATEGORIES = ['Groceries', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Dairy', 'Bakery', 'Other'];

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading,      setLoading]      = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [imageMode,    setImageMode]    = useState('upload'); // 'upload' | 'url'
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Groceries',
    stock: '', isFeatured: false, imageUrl: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      setForm({
        name: data.name, description: data.description,
        price: data.price, category: data.category,
        stock: data.stock, isFeatured: data.isFeatured,
        imageUrl: data.image || '',
      });
      if (data.image) {
        setImagePreview(data.image);
        setImageMode(data.image.startsWith('http') && !data.imagePublicId ? 'url' : 'upload');
      }
    });
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm((f) => ({ ...f, imageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        return toast.error('Product name is required');
    if (!form.price || form.price <= 0) return toast.error('Enter a valid price');
    if (!form.stock && form.stock !== 0) return toast.error('Enter stock quantity');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name',        form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price',       form.price);
      formData.append('category',    form.category);
      formData.append('stock',       form.stock);
      formData.append('isFeatured',  form.isFeatured);

      if (imageMode === 'url' && form.imageUrl) {
        formData.append('imageUrl', form.imageUrl);
      } else if (imageFile) {
        formData.append('image', imageFile);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEdit) {
        await api.put(`/products/${id}`, formData, config);
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, config);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">

        {/* ── Image section ── */}
        <div>
          <label className="text-sm font-medium mb-2 block">Product Image</label>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button type="button"
              onClick={() => { setImageMode('upload'); clearImage(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition
                ${imageMode === 'upload' ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              <FiUpload size={14} /> Upload File
            </button>
            <button type="button"
              onClick={() => { setImageMode('url'); clearImage(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition
                ${imageMode === 'url' ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              <FiLink size={14} /> Image URL
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center relative">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview"
                    className="w-40 h-40 object-cover mx-auto rounded-lg mb-2" />
                  <button type="button" onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <FiX size={14} />
                  </button>
                </>
              ) : (
                <div className="py-6 text-gray-400">
                  <FiUpload size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Click to upload (JPG, PNG, WebP — max 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              {imagePreview && (
                <label className="btn-outline text-sm cursor-pointer inline-block mt-1">
                  Change Image
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  setImagePreview(e.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border dark:border-gray-600"
                  onError={() => setImagePreview('')}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Name ── */}
        <div>
          <label className="text-sm font-medium mb-1 block">Product Name *</label>
          <input value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Basmati Rice 5kg"
            className="input-field" required />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="text-sm font-medium mb-1 block">Description *</label>
          <textarea value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief product description…"
            className="input-field resize-none" rows={3} required />
        </div>

        {/* ── Price + Stock ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Price (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00" className="input-field pl-7" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Stock Qty *</label>
            <input type="number" min="0" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0" className="input-field" required />
          </div>
        </div>

        {/* ── Category ── */}
        <div>
          <label className="text-sm font-medium mb-1 block">Category *</label>
          <select value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Featured toggle ── */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.isFeatured ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-sm font-medium">Mark as Featured Product</span>
        </label>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/admin/products')}
            className="btn-outline flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
}
