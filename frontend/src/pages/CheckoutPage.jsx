import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiTruck, FiNavigation, FiTag, FiX } from 'react-icons/fi';

export default function CheckoutPage() {
  const { cart, totalPrice, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const shipping = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax - discount;

  // UPI QR — generate a UPI deep link QR
  const upiId = import.meta.env.VITE_UPI_ID || 'store@upi';
  const upiQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=GeneralStore&am=${grandTotal}&cu=INR`
  )}`;

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'Nepal',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Auto-fill address via geolocation
  const detectLocation = async () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          setAddress((prev) => ({
            ...prev,
            street: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ') || prev.street,
            city: addr.city || addr.town || addr.village || prev.city,
            state: addr.state || prev.state,
            pincode: addr.postcode || prev.pincode,
          }));
          toast.success('Location detected!');
        } catch {
          toast.error('Could not fetch address details');
        } finally {
          setLocLoading(false);
        }
      },
      () => { toast.error('Location access denied'); setLocLoading(false); }
    );
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/payment/coupon/apply', {
        code: couponCode.trim(),
        cartTotal: totalPrice,
      });
      setDiscount(data.discount);
      setAppliedCoupon(data.code);
      toast.success(`Coupon applied! You save ₹${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon('');
    setCouponCode('');
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode)
      return toast.error('Please fill all address fields');
    setStep(2);
  };

  const placeOrder = async (method = paymentMethod, paymentId = null) => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart.map((i) => ({
          product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.qty,
        })),
        shippingAddress: address,
        paymentMethod: method,
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal,
        coupon: appliedCoupon,
        discountAmount: discount,
        ...(paymentId && { paymentResult: { id: paymentId, status: 'paid' } }),
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

  const PAYMENT_METHODS = [
    { value: 'COD', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
    { value: 'UPI', label: '📱 UPI / QR Code',    desc: 'Scan QR or pay via UPI ID'  },
    { value: 'Stripe', label: '💳 Credit / Debit Card (Stripe)', desc: 'Secure international payment' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { n: 1, label: 'Address', icon: FiMapPin },
          { n: 2, label: 'Payment', icon: FiCreditCard },
          { n: 3, label: 'Review',  icon: FiTruck },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= n ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm hidden sm:block ${step >= n ? 'text-primary font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
            {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">

          {/* ── Step 1: Address ── */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2"><FiMapPin /> Shipping Address</h2>
                <button type="button" onClick={detectLocation} disabled={locLoading}
                  className="flex items-center gap-1 text-sm text-primary hover:underline disabled:opacity-50">
                  <FiNavigation size={14} />
                  {locLoading ? 'Detecting...' : 'Use my location'}
                </button>
              </div>
              <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Street / Tole / Ward No." className="input-field" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City / Municipality" className="input-field" required />
                <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="input-field" required>
                  <option value="">Select Province</option>
                  <option>Koshi Province</option>
                  <option>Madhesh Province</option>
                  <option>Bagmati Province</option>
                  <option>Gandaki Province</option>
                  <option>Lumbini Province</option>
                  <option>Karnali Province</option>
                  <option>Sudurpashchim Province</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="Postal Code (e.g. 44600)" className="input-field" required />
                <input value={address.country} className="input-field bg-gray-50 dark:bg-gray-700" readOnly />
              </div>
              <button type="submit" className="btn-primary w-full">Continue to Payment</button>
            </form>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><FiCreditCard /> Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.value}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition
                      ${paymentMethod === m.value
                        ? 'border-primary bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600'}`}>
                    <input type="radio" name="payment" value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)} className="mt-1" />
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-sm text-gray-400">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* UPI QR code shown inline when UPI selected */}
              {paymentMethod === 'UPI' && (
                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg border-dashed border-primary">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Scan with any UPI app (GPay, PhonePe, Paytm)
                  </p>
                  <img src={upiQRUrl} alt="UPI QR Code" className="w-44 h-44 rounded-lg" />
                  <p className="text-xs text-gray-400">UPI ID: <span className="font-mono text-primary">{upiId}</span></p>
                  <p className="text-xs text-gray-400">Amount: <strong>₹{grandTotal}</strong></p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                    After payment, click "Review Order" and place your order.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Review Your Order</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name}
                      className="w-12 h-12 object-cover rounded" />
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
                {appliedCoupon && <p className="text-green-600"><strong>Coupon:</strong> {appliedCoupon} (-₹{discount})</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
                <button onClick={() => placeOrder()} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Items ({cart.length})</span><span>₹{totalPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon})</span><span>-₹{discount}</span>
                </div>
              )}
            </div>
            <div className="border-t dark:border-gray-600 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span><span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>

          {/* Coupon box */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><FiTag size={14} /> Promo Code</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-300 rounded-lg px-3 py-2">
                <span className="text-sm font-mono text-green-700 dark:text-green-400">{appliedCoupon} — -₹{discount}</span>
                <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500"><FiX size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  placeholder="Enter code"
                  className="input-field text-sm flex-1"
                />
                <button onClick={applyCoupon} disabled={couponLoading}
                  className="btn-primary text-sm px-3 disabled:opacity-50">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
