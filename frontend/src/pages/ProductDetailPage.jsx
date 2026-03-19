import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { FiStar, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (product.stock === 0) return toast.error('Out of stock');
    for (let i = 0; i < qty; i++) dispatch({ type: 'ADD', item: product });
    toast.success(`${qty}x ${product.name} added to cart`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="card p-4">
          <img
            src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
            alt={product.name}
            className="w-full h-80 object-contain rounded-lg"
          />
        </div>

        {/* Info */}
        <div>
          <span className="text-sm bg-green-100 dark:bg-green-900 text-primary px-2 py-1 rounded">{product.category}</span>
          <h1 className="text-2xl font-bold mt-2 mb-2">{product.name}</h1>

          <div className="flex items-center gap-2 mb-3">
            {[1,2,3,4,5].map((s) => (
              <FiStar key={s} fill={s <= Math.round(product.rating) ? '#facc15' : 'none'} className="text-yellow-400" />
            ))}
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-primary mb-4">₹{product.price}</p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>

          <p className={`text-sm font-medium mb-4 ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
            {product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? `Only ${product.stock} left!` : `In Stock (${product.stock})`}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiMinus /></button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiPlus /></button>
              </div>
              <button onClick={addToCart} className="btn-primary flex items-center gap-2">
                <FiShoppingCart /> Add to Cart
              </button>
            </div>
          )}

          <button onClick={() => { addToCart(); navigate('/cart'); }} disabled={product.stock === 0}
            className="btn-outline w-full">
            Buy Now
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="text-gray-400 mb-6">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 mb-8">
            {product.reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{r.name}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <FiStar key={s} size={14} fill={s <= r.rating ? '#facc15' : 'none'} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write review */}
        {user && (
          <form onSubmit={submitReview} className="card p-6">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <div className="mb-3">
              <label className="text-sm font-medium mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setReview({ ...review, rating: s })}>
                    <FiStar size={24} fill={s <= review.rating ? '#facc15' : 'none'} className="text-yellow-400" />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              placeholder="Share your experience..."
              className="input-field mb-3"
              rows={3}
              required
            />
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
