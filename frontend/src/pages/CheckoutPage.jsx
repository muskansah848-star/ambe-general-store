import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiNavigation, FiTag, FiX } from 'react-icons/fi';

const ONLINE_METHODS = ['eSewa', 'FonePay', 'IMEPay', 'Khalti', 'NetBanking'];

export default function CheckoutPage() {
  const { cart, totalPrice, dispatch } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const shipping = totalPrice > 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax - discount;

  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', country: 'Nepal' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const isOnlineMethod = ONLINE_METHODS.includes(paymentMethod);

  const detectLocation = async () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
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
        } catch { toast.error('Could not fetch address'); }
        finally { setLocLoading(false); }
      },
      () => { toast.error('Location access denied'); setLocLoading(false); }
    );
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/payment/coupon/apply', { code: couponCode.trim(), cartTotal: totalPrice });
      setDiscount(data.discount);
      setAppliedCoupon(data.code);
      toast.success(`Coupon applied! You save NPR ${data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setDiscount(0); setAppliedCoupon(''); setCouponCode(''); };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.pincode)
      return toast.error('Please fill all address fields');
    setStep(2);
  };

  const handlePaymentChange = (val) => { setPaymentMethod(val); setPaymentConfirmed(false); };

  const placeOrder = async () => {
    if (isOnlineMethod && !paymentConfirmed)
      return toast.error('Please confirm you have completed the payment.');
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart.map((i) => ({ product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.qty })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: totalPrice,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal,
        coupon: appliedCoupon,
        discountAmount: discount,
        ...(isOnlineMethod && paymentConfirmed && { paymentResult: { id: `manual_${Date.now()}`, status: 'pending_verification' } }),
      };
      const { data } = await api.post('/orders', orderData);
      dispatch({ type: 'CLEAR' });
      toast.success('Order placed! We will verify your payment shortly.');
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const PAYMENT_METHODS = [
    { value: 'COD',        label: '💵 Cash on Delivery', desc: 'Pay in cash when your order arrives' },
    { value: 'eSewa',      label: '🟢 eSewa',            desc: 'Pay via eSewa digital wallet'        },
    { value: 'FonePay',    label: '🔵 FonePay',          desc: 'Scan QR with any Nepali bank app'    },
    { value: 'IMEPay',     label: '🟠 IME Pay',          desc: 'Pay via IME Pay wallet'              },
    { value: 'Khalti',     label: '🟣 Khalti',           desc: 'Pay via Khalti digital wallet'       },
    { value: 'NetBanking', label: '🏛️ Net Banking',      desc: 'Direct bank transfer — all Nepali banks' },
  ];

  const PaymentInstructions = () => {
    const amt = `NPR ${grandTotal}`;
    const id = '9844127675';
    if (paymentMethod === 'eSewa') return (
      <div className="p-4 rounded-lg border border-dashed border-green-500 bg-green-50 dark:bg-green-900/20 text-sm space-y-1">
        <p className="font-semibold text-green-700 dark:text-green-300">🟢 eSewa Payment Steps</p>
        <p>1. Open <strong>eSewa</strong> app → Tap <strong>Send Money</strong></p>
        <p>2. eSewa ID: <span className="font-mono font-bold text-green-600">{id}</span></p>
        <p>3. Amount: <strong>{amt}</strong> → Complete payment</p>
      </div>
    );
    if (paymentMethod === 'FonePay') return (
      <div className="p-4 rounded-lg border border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-sm space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-base font-bold text-blue-700 dark:text-blue-300">fone</span>
          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">pay</span>
        </div>
        <p className="text-center text-xs text-gray-500">नेपाल राष्ट्र बैंकबाट अनुमित प्राप्त</p>
        <p className="text-center text-gray-600 dark:text-gray-300 text-xs">Open your bank app → Scan QR → Pay <strong>{amt}</strong></p>
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-xl border-2 border-blue-200 shadow">
            <img
              src="/fonepay-qr.png"
              alt="FonePay QR - Ambe Departmental Store"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('2222010004189889')}`;
              }}
            />
          </div>
        </div>
        <div className="text-center space-y-0.5">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">AMBE DEPARTMENTAL STORE</p>
          <p className="text-xs text-gray-500">Terminal: 2222010004189889</p>
          <p className="text-xs text-gray-500">Address: SIMARA BRANCH</p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Amount: {amt}</p>
        </div>
        <p className="text-xs text-gray-500 text-center">Supported: NIC Asia, Nabil, Everest, Himalayan, Laxmi, Sanima, Global IME & all Nepali banks</p>
      </div>
    );
    if (paymentMethod === 'IMEPay') return (
      <div className="p-4 rounded-lg border border-dashed border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-sm space-y-1">
        <p className="font-semibold text-orange-700 dark:text-orange-300">🟠 IME Pay Steps</p>
        <p>1. Open <strong>IME Pay</strong> app → Tap <strong>Send Money</strong></p>
        <p>2. IME Pay ID: <span className="font-mono font-bold text-orange-600">{id}</span></p>
        <p>3. Amount: <strong>{amt}</strong> → Complete payment</p>
      </div>
    );
    if (paymentMethod === 'Khalti') return (
      <div className="p-4 rounded-lg border border-dashed border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-sm space-y-1">
        <p className="font-semibold text-purple-700 dark:text-purple-300">🟣 Khalti Steps</p>
        <p>1. Open <strong>Khalti</strong> app → Tap <strong>Send Money</strong></p>
        <p>2. Khalti ID: <span className="font-mono font-bold text-purple-600">{id}</span></p>
        <p>3. Amount: <strong>{amt}</strong> → Complete payment</p>
      </div>
    );
    if (paymentMethod === 'NetBanking') return (
      <div className="p-4 rounded-lg border border-dashed border-gray-400 bg-gray-50 dark:bg-gray-800 text-sm space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-200">🏛️ Bank Transfer Details</p>
        <p>Account Name: <strong>Ambe Departmental Store</strong></p>
        <p>Account No: <span className="font-mono font-bold">1234567890</span></p>
        <p>Bank: <strong>Nabil Bank / Nepal Bank</strong></p>
        <p>Amount: <strong>{amt}</strong></p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400">After transfer, send screenshot to <strong>+977 984 4127675</strong> on WhatsApp.</p>
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: 'Address' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= n ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm hidden sm:block ${step >= n ? 'text-primary font-medium' : 'text-gray-400'}`}>{label}</span>
            {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">

          {/* Step 1 — Address */}
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
                  placeholder="Postal Code (e.g. 44300)" className="input-field" required />
                <input value={address.country} className="input-field bg-gray-50 dark:bg-gray-700" readOnly />
              </div>
              <button type="submit" className="btn-primary w-full">Continue to Payment</button>
            </form>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><FiCreditCard /> Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition
                      ${paymentMethod === m.value
                        ? 'border-primary bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => handlePaymentChange(m.value)} className="mt-1" />
                    <div>
                      <p className="font-medium text-sm">{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {isOnlineMethod && <PaymentInstructions />}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Review Your Order</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.image || 'https://placehold.co/50x50'} alt={item.name}
                      className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <span className="font-semibold">NPR {item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-gray-600 pt-3 text-sm space-y-1 mb-4">
                <p><strong>Address:</strong> {address.street}, {address.city}, {address.state} - {address.pincode}, Nepal</p>
                <p><strong>Payment:</strong> {paymentMethod}</p>
                {appliedCoupon && <p className="text-green-600"><strong>Coupon:</strong> {appliedCoupon} (-NPR {discount})</p>}
              </div>

              {isOnlineMethod && (
                <div className="mb-4 space-y-3">
                  <PaymentInstructions />
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer border-primary bg-green-50 dark:bg-green-900/20">
                    <input type="checkbox" checked={paymentConfirmed}
                      onChange={(e) => setPaymentConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      ✅ I confirm I have completed payment of <strong>NPR {grandTotal}</strong> via <strong>{paymentMethod}</strong>
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
                <button onClick={placeOrder} disabled={loading || (isOnlineMethod && !paymentConfirmed)}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Placing Order...' : isOnlineMethod ? 'Confirm & Place Order' : 'Place Order'}
                </button>
              </div>
              {isOnlineMethod && !paymentConfirmed && (
                <p className="text-xs text-center text-yellow-600 dark:text-yellow-400 mt-2">
                  ⚠️ Complete payment first, then check the box above to place your order.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Items ({cart.length})</span><span>NPR {totalPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `NPR ${shipping}`}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>NPR {tax}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon})</span><span>-NPR {discount}</span>
                </div>
              )}
            </div>
            <div className="border-t dark:border-gray-600 mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span><span className="text-primary">NPR {grandTotal}</span>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1"><FiTag size={14} /> Promo Code</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-300 rounded-lg px-3 py-2">
                <span className="text-sm font-mono text-green-700 dark:text-green-400">{appliedCoupon} — -NPR {discount}</span>
                <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500"><FiX size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  placeholder="Enter code" className="input-field text-sm flex-1" />
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
