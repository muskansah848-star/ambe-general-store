import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';

export default function CheckoutPage() {
  const { cart, totalPrice, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const shipping = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode)
      return toast.error('Please fill all address fields');
    setStep(2);
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart.map((i) => ({
          product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.qty,
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal,
      };
      const { data } = await api.post('/orders', orderData);
      dispatch({ type: 'CLEAR' });
      toast.success('Order placed successfully!');
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: 'Address', icon: FiMapPin }, { n: 2, label: 'Payment', icon: FiCreditCard }, { n: 3, label: 'Review', icon: FiTruck }].map(({ n, label, icon: Icon }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm hidden sm:block ${step >= n ? 'text-primary font-medium' : 'text-gray-400'}`}>{label}</span>
            {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="card p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><FiMapPin /> Shipping Address</h2>
              <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Street Address" className="input-field" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City" className="input-field" required />
                <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State" className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="Pincode" className="input-field" required />
                <input value={address.country} className="input-field bg-gray-50 dark:bg-gray-700" readOnly />
              </div>
              <button type="submit" className="btn-primary w-full">Continue to Payment</button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><FiCreditCard /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                  { value: 'Stripe', label: '💳 Credit / Debit Card (Stripe)', desc: 'Secure online payment' },
                ].map((m) => (
                  <label key={m.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === m.value ? 'border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                    <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)} className="mt-1" />
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-sm text-gray-400">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Review Your Order</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <span className="font-semibold">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-gray-600 pt-3 text-sm space-y-1 mb-4">
                <p><strong>Address:</strong> {address.street}, {address.city}, {address.state} - {address.pincode}</p>
                <p><strong>Payment:</strong> {paymentMethod}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
                <button onClick={placeOrder} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h3 className="font-bold mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Items ({cart.length})</span><span>₹{totalPrice}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{tax}</span></div>
          </div>
          <div className="border-t dark:border-gray-600 mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span><span className="text-primary">₹{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
