import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { cart, dispatch, totalPrice } = useCart();
  const navigate = useNavigate();

  const shipping = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Add some products to get started</p>
      <Link to="/" className="btn-primary">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <img
                src={item.image || 'https://via.placeholder.com/80?text=No+Image'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <Link to={`/product/${item._id}`} className="font-semibold hover:text-primary line-clamp-1">{item.name}</Link>
                <p className="text-primary font-bold mt-1">₹{item.price}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => item.qty === 1 ? dispatch({ type: 'REMOVE', id: item._id }) : dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty - 1 })}
                      className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    ><FiMinus size={14} /></button>
                    <span className="px-3 py-1 text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty + 1 })}
                      className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    ><FiPlus size={14} /></button>
                  </div>
                  <span className="text-sm font-semibold">₹{item.price * item.qty}</span>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE', id: item._id })}
                    className="ml-auto text-red-400 hover:text-red-600"
                  ><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => dispatch({ type: 'CLEAR' })} className="text-sm text-red-400 hover:text-red-600">
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-500">Free</span> : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax}</span></div>
            {totalPrice < 500 && <p className="text-xs text-gray-400">Add ₹{500 - totalPrice} more for free shipping</p>}
          </div>
          <div className="border-t dark:border-gray-600 pt-3 flex justify-between font-bold text-lg mb-6">
            <span>Total</span><span className="text-primary">₹{grandTotal}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiShoppingBag /> Proceed to Checkout
          </button>
          <Link to="/" className="block text-center text-sm text-primary mt-3 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
