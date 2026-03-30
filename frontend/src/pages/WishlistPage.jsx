import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setProducts(data);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const remove = async (id) => {
    await api.delete(`/wishlist/${id}`);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (product) => {
    dispatch({ type: 'ADD', item: product });
    remove(product._id);
    toast.success(`${product.name} moved to cart`);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiHeart className="text-red-500" /> My Wishlist
        <span className="text-sm font-normal text-gray-400 ml-2">({products.length} items)</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💝</div>
          <p className="text-xl font-semibold mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 mb-6 text-sm">Save products you love to buy them later</p>
          <Link to="/" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p._id} className="card overflow-hidden group">
              <Link to={`/product/${p._id}`}>
                <img
                  src={p.image || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(p.name)}`}
                  alt={p.name}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(p.name)}`; }}
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${p._id}`}>
                  <h3 className="font-semibold text-sm mb-1 hover:text-primary line-clamp-2">{p.name}</h3>
                </Link>
                <p className="text-primary font-bold text-lg mb-3">₹{p.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveToCart(p)}
                    disabled={p.stock === 0}
                    className="flex-1 btn-primary text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <FiShoppingCart size={14} />
                    {p.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="p-2 border rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
