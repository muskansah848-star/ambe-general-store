import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { MdOutlineLocalOffer } from 'react-icons/md';
import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Groceries:      'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
  Snacks:         'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Beverages:      'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  Dairy:          'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
  Bakery:         'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Personal Care':'bg-pink-100   text-pink-700   dark:bg-pink-900/40   dark:text-pink-300',
  Household:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Other:          'bg-gray-100   text-gray-600   dark:bg-gray-700      dark:text-gray-300',
};

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return toast.error('Out of stock');
    dispatch({ type: 'ADD', item: product });
    toast.success(`${product.name} added to cart`, { icon: '🛒' });
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login to use wishlist');
    try {
      const { data } = await api.post(`/wishlist/${product._id}`);
      setWishlisted(data.added);
      toast.success(data.added ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const categoryColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other;
  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock <= 10;

  return (
    <Link
      to={`/product/${product._id}`}
      className="card group flex flex-col overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image || `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-60' : ''}`}
          onError={(e) => {
            e.target.src = `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(product.name)}`;
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Only {product.stock} left
            </span>
          )}
          {product.isFeatured && !isOutOfStock && (
            <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <MdOutlineLocalOffer size={11} /> Featured
            </span>
          )}
        </div>

        {/* Category pill top-right */}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor}`}>
          {product.category}
        </span>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FiHeart size={14} fill={wishlisted ? '#ef4444' : 'none'} className={wishlisted ? 'text-red-500' : 'text-gray-400'} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Name */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <FiStar
              key={s}
              size={12}
              className="text-yellow-400"
              fill={s <= Math.round(product.rating || 0) ? 'currentColor' : 'none'}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.numReviews || 0})</span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price + Cart */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div>
            <span className="text-xl font-bold text-primary">₹{product.price}</span>
          </div>

          <button
            onClick={addToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isOutOfStock
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
              }`}
          >
            <FiShoppingCart size={14} />
            {isOutOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
