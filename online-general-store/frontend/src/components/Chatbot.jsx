import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { MdSupportAgent } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const KB = [
  // Greetings
  {
    keys: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'howdy', 'sup'],
    reply: () => 'Namaste! 🙏 Welcome to Ambe General Store. How can I help you today?\n\nYou can ask me about:\n• Orders & tracking\n• Payments & refunds\n• Delivery & location\n• Products & categories\n• Coupons & offers',
  },

  // Orders
  {
    keys: ['track', 'where is my order', 'order status', 'my order'],
    reply: () => '📦 To track your order:\n1. Click your name in the top navbar\n2. Go to "My Orders"\n3. Click "View Details" on any order\n\nYou\'ll see the live status: Pending → Processing → Shipped → Delivered.',
  },
  {
    keys: ['place order', 'how to order', 'buy', 'purchase', 'how to buy'],
    reply: () => '🛒 Ordering is easy!\n1. Browse products on the Home page\n2. Click "Add to Cart"\n3. Go to Cart → Checkout\n4. Enter your Nepal address\n5. Choose payment method\n6. Place your order!\n\nNeed help? Just ask.',
  },
  {
    keys: ['cancel order', 'cancel my order'],
    reply: () => '❌ To cancel an order:\n• Orders can be cancelled before they are shipped\n• Go to My Orders → View Details → Cancel\n\nIf the order is already shipped, you can request a refund instead.',
  },
  {
    keys: ['order history', 'past orders', 'previous orders', 'all orders'],
    reply: () => '📋 View all your orders:\n1. Log in to your account\n2. Click your name → "My Orders"\n\nYou\'ll see all past and current orders with dates, amounts, and status.',
  },
  {
    keys: ['order not received', 'not delivered', 'missing order', 'lost order'],
    reply: () => '😟 Sorry to hear that! Here\'s what to do:\n1. Check your order status in My Orders\n2. If it shows "Delivered" but you haven\'t received it, contact us:\n📞 +977-9800000000\n📧 ambestore@gmail.com\n\nWe\'ll resolve it within 24 hours.',
  },

  // Payments
  {
    keys: ['payment', 'pay', 'how to pay', 'payment method', 'payment options'],
    reply: () => '💳 We accept multiple payment methods:\n\n💵 Cash on Delivery (COD) — Pay when order arrives\n🇳🇵 Razorpay — UPI, Cards, Net Banking\n📱 UPI / QR Code — GPay, PhonePe, Paytm\n💳 Stripe — International cards\n\nAll payments are 100% secure.',
  },
  {
    keys: ['cod', 'cash on delivery', 'pay on delivery'],
    reply: () => '💵 Cash on Delivery is available!\n\n• Pay in cash when your order arrives\n• Available across all delivery areas in Nepal\n• No extra charges for COD\n\nSimply select "Cash on Delivery" at checkout.',
  },
  {
    keys: ['upi', 'gpay', 'phonepe', 'paytm', 'qr', 'qr code', 'scan'],
    reply: () => '📱 UPI / QR Code Payment:\n\n1. Select "UPI / QR Code" at checkout\n2. A QR code will appear on screen\n3. Scan with any UPI app (GPay, PhonePe, Paytm)\n4. Complete payment and place your order\n\nUPI ID: ambestore@upi',
  },
  {
    keys: ['razorpay', 'card payment', 'net banking', 'debit card', 'credit card'],
    reply: () => '🔐 Razorpay Payment:\n\n• Supports UPI, Debit/Credit Cards, Net Banking\n• 100% secure with SSL encryption\n• Select "Razorpay" at checkout\n• You\'ll be redirected to the secure payment page\n\nTest card: 4111 1111 1111 1111',
  },
  {
    keys: ['payment failed', 'payment not working', 'transaction failed', 'payment error'],
    reply: () => '⚠️ Payment failed? Try these steps:\n\n1. Check your internet connection\n2. Make sure card/UPI details are correct\n3. Try a different payment method\n4. Clear browser cache and retry\n\nIf the issue persists, contact us:\n📞 +977-9800000000\n📧 ambestore@gmail.com',
  },

  // Refunds
  {
    keys: ['refund', 'return', 'money back', 'get refund', 'refund policy'],
    reply: () => '🔄 Refund Policy:\n\n• Refunds are processed within 5–7 business days\n• Eligible if item is damaged, wrong, or not delivered\n\nTo request a refund:\n1. Go to My Orders → View Details\n2. Click "Request Refund"\n3. Or visit the Refunds page directly\n\nRefund amount goes back to your original payment method.',
  },
  {
    keys: ['exchange', 'replace', 'wrong item', 'damaged', 'broken'],
    reply: () => '📦 Received a wrong or damaged item?\n\n1. Take a photo of the item\n2. Go to My Orders → Request Refund\n3. Describe the issue\n\nWe\'ll arrange a replacement or full refund within 48 hours. We\'re sorry for the inconvenience!',
  },

  // Delivery
  {
    keys: ['delivery', 'shipping', 'deliver', 'how long', 'delivery time', 'when will i get'],
    reply: () => '🚚 Delivery Information:\n\n🏙️ Birgunj (Parsa) — Same day (order before 12 PM)\n📦 Madhesh Province — 1–2 business days\n🚛 Other Nepal areas — 3–5 business days\n\n✅ Free delivery on orders above NPR 500\n📦 Delivery charge: NPR 50 for smaller orders',
  },
  {
    keys: ['free delivery', 'free shipping', 'delivery charge', 'shipping cost'],
    reply: () => '🎉 Free Delivery!\n\n• Orders above NPR 500 → FREE delivery\n• Orders below NPR 500 → NPR 50 delivery charge\n\nTip: Add more items to your cart to qualify for free delivery!',
  },
  {
    keys: ['delivery area', 'where do you deliver', 'delivery location', 'which district'],
    reply: () => '📍 We deliver across Nepal, especially:\n\n🟢 Parsa, Bara, Rautahat\n🟢 Sarlahi, Mahottari, Dhanusha\n🟢 Siraha, Saptari\n\nFor remote areas, delivery may take 3–5 days. Contact us to confirm availability in your area.',
  },

  // Location & Store
  {
    keys: ['location', 'address', 'where are you', 'store location', 'shop address', 'where is the store'],
    reply: () => '📍 Ambe General Store\n\nBirgunj-30, Parsa\nMadhesh Province, Nepal 🇳🇵\nPostal Code: 44300\n\n📞 +977 984 4127675\n📧 ambedepartmentalstore6709@gmail.com\n\nVisit our About page for a map and more details.',
  },
  {
    keys: ['timing', 'open', 'opening hours', 'working hours', 'shop timing'],
    reply: () => '🕐 Store Hours:\n\n🟢 Sunday – Friday: 7:00 AM – 9:00 PM\n🟡 Saturday: 8:00 AM – 8:00 PM\n\nOnline orders are accepted 24/7!\nDelivery happens during business hours.',
  },
  {
    keys: ['nepal', 'nepali', 'kathmandu', 'jhapa', 'birtamode'],
    reply: () => '🇳🇵 Yes, we are based in Nepal!\n\nAmbe General Store is located in Birgunj, Parsa — serving customers across Madhesh Province and all of Nepal.\n\nWe offer local products at the best prices with fast delivery.',
  },

  // Products
  {
    keys: ['product', 'item', 'what do you sell', 'what products', 'categories'],
    reply: () => '🛍️ We sell 66+ products across 8 categories:\n\n🌾 Groceries — Rice, Dal, Oil, Spices\n🥛 Dairy — Milk, Paneer, Ghee, Butter\n🍿 Snacks — Chips, Biscuits, Namkeen\n🥤 Beverages — Tea, Coffee, Juice\n🍞 Bakery — Bread, Muffins, Rusk\n🧴 Personal Care — Soap, Shampoo\n🧹 Household — Detergent, Cleaners\n📦 Other — Batteries, Candles\n\nBrowse all on the Home page!',
  },
  {
    keys: ['grocery', 'groceries', 'rice', 'dal', 'atta', 'flour', 'oil', 'spice'],
    reply: () => '🌾 Groceries available:\n\n• Basmati Rice 5kg — NPR 450\n• Wheat Flour (Atta) 10kg — NPR 380\n• Toor Dal 1kg — NPR 120\n• Sunflower Oil 1L — NPR 120\n• Turmeric Powder 200g — NPR 55\n• And many more!\n\nClick "Groceries" on the Home page to see all.',
  },
  {
    keys: ['dairy', 'milk', 'paneer', 'ghee', 'butter', 'curd', 'cheese'],
    reply: () => '🥛 Dairy products available:\n\n• Fresh Full-Cream Milk 1L — NPR 30\n• Paneer 200g — NPR 80\n• Ghee 500ml — NPR 320\n• Amul Butter 500g — NPR 250\n• Set Curd 500g — NPR 40\n\nClick "Dairy" on the Home page to see all.',
  },
  {
    keys: ['snack', 'chips', 'biscuit', 'namkeen', 'chocolate', 'maggi', 'noodle'],
    reply: () => '🍿 Popular Snacks:\n\n• Lay\'s Classic Chips 100g — NPR 30\n• Maggi Noodles 12-Pack — NPR 180\n• Parle-G Biscuits 800g — NPR 50\n• Haldiram Bhujia 400g — NPR 130\n• Dark Chocolate Bar 100g — NPR 150\n\nClick "Snacks" on the Home page to see all.',
  },
  {
    keys: ['beverage', 'drink', 'tea', 'coffee', 'juice', 'cola', 'cold drink'],
    reply: () => '🥤 Beverages available:\n\n• Tata Tea Premium 500g — NPR 220\n• Nescafe Classic Coffee 100g — NPR 280\n• Tropicana Orange Juice 1L — NPR 110\n• Coca-Cola 2L — NPR 90\n• Bournvita 500g — NPR 230\n\nClick "Beverages" on the Home page to see all.',
  },
  {
    keys: ['out of stock', 'not available', 'stock', 'available'],
    reply: () => '📦 Stock Information:\n\n• Each product page shows current stock\n• "Out of Stock" badge means temporarily unavailable\n• "Only X left" means limited stock\n\nWe restock regularly! Check back soon or contact us to be notified when a product is back.',
  },

  // Account
  {
    keys: ['login', 'sign in', 'log in', 'signin'],
    reply: () => '🔐 To log in:\n\n1. Click "Login" in the top navbar\n2. Enter your email and password\n3. Click "Sign In"\n\nNew user? Click "Sign Up" on the login page to create a free account.',
  },
  {
    keys: ['register', 'sign up', 'create account', 'new account', 'signup'],
    reply: () => '✅ Create your account:\n\n1. Click "Login" in the navbar\n2. Click "Sign Up" tab\n3. Enter your name, email, and password\n4. Click "Create Account"\n\nIt\'s free and takes less than a minute!',
  },
  {
    keys: ['forgot password', 'reset password', 'change password', 'password'],
    reply: () => '🔑 Password help:\n\n• To change your password, go to Profile page\n• Forgot password? Contact us and we\'ll reset it:\n📧 ambestore@gmail.com\n📞 +977-9800000000\n\nWe\'ll send you a reset link within a few minutes.',
  },
  {
    keys: ['profile', 'account', 'my account', 'update profile', 'edit profile'],
    reply: () => '👤 Manage your profile:\n\n1. Click your name in the top navbar\n2. Select "Profile"\n3. Update your name, email, or phone\n4. Click "Save Changes"\n\nYour saved address will auto-fill at checkout.',
  },

  // Coupons
  {
    keys: ['coupon', 'promo', 'discount', 'offer', 'code', 'voucher', 'deal'],
    reply: () => '🎟️ Using Coupons:\n\n1. Add items to your cart\n2. Go to Checkout\n3. Find the "Promo Code" box on the right\n4. Enter your code and click "Apply"\n\nThe discount will be deducted from your total automatically!\n\nFollow us for the latest offers.',
  },

  // Invoice
  {
    keys: ['invoice', 'bill', 'receipt', 'download invoice'],
    reply: () => '🧾 Download your invoice:\n\n1. Go to My Orders\n2. Click "View Details" on your order\n3. Click "Download Invoice"\n\nThe PDF invoice includes order details, payment info, and total amount.',
  },

  // Contact / Support
  {
    keys: ['contact', 'support', 'help', 'human', 'agent', 'talk to someone', 'customer care'],
    reply: () => '📞 Contact Ambe General Store:\n\n📞 Phone: +977 984 4127675\n📧 Email: ambedepartmentalstore6709@gmail.com\n📍 Birgunj-30, Parsa, Madhesh Province, Nepal\n\n🕐 Support Hours:\nSun–Fri: 7 AM – 9 PM\nSat: 8 AM – 8 PM\n\nWe typically respond within 1 hour!',
  },
  {
    keys: ['complaint', 'problem', 'issue', 'wrong', 'bad', 'unhappy', 'not satisfied'],
    reply: () => '😔 We\'re sorry to hear that!\n\nPlease share your concern with us:\n📞 +977 984 4127675\n📧 ambedepartmentalstore6709@gmail.com\n\nOr describe your issue here and we\'ll do our best to help. Customer satisfaction is our top priority! 🙏',
  },

  // App / Website
  {
    keys: ['app', 'mobile app', 'install', 'pwa', 'download app'],
    reply: () => '📱 Install our app on your phone!\n\nAmbe General Store works as a PWA (Progressive Web App):\n\n1. Open the website in Chrome/Safari\n2. Tap the menu (⋮) → "Add to Home Screen"\n3. Tap "Install"\n\nYou\'ll get an app icon on your home screen — works even offline!',
  },
  {
    keys: ['language', 'hindi', 'english', 'change language', 'भाषा'],
    reply: () => '🌐 Language Support:\n\nWe support English and Hindi!\n\nTo switch language:\n• Look for the EN / हिं button in the top navbar\n• Click it to toggle between English and Hindi\n\nMore languages coming soon!',
  },
  {
    keys: ['dark mode', 'light mode', 'theme', 'night mode'],
    reply: () => '🌙 Dark / Light Mode:\n\nClick the 🌙 moon (or ☀️ sun) icon in the top navbar to toggle between dark and light mode.\n\nYour preference is saved automatically!',
  },

  // Farewell
  {
    keys: ['bye', 'goodbye', 'thanks', 'thank you', 'ok', 'okay', 'done', 'great', 'perfect'],
    reply: () => 'You\'re welcome! 😊 Happy shopping at Ambe General Store!\n\nIf you need anything else, I\'m always here. Have a great day! 🛍️🇳🇵',
  },
];

// Quick reply suggestions shown at start
const QUICK_REPLIES = [
  'Track my order',
  'Payment methods',
  'Delivery areas',
  'Return & Refund',
  'Store location',
  'Apply coupon',
  'Contact support',
  'What do you sell?',
];

// ─── Reply Engine ──────────────────────────────────────────────────────────────
function getBotReply(input) {
  const lower = input.toLowerCase().trim();
  for (const { keys, reply } of KB) {
    if (keys.some((kw) => lower.includes(kw))) return reply();
  }
  // Partial word match fallback
  for (const { keys, reply } of KB) {
    if (keys.some((kw) => kw.split(' ').some((word) => lower.includes(word) && word.length > 3))) {
      return reply();
    }
  }
  return "🤔 I'm not sure about that. Here's what I can help with:\n\n• Orders & tracking\n• Payments & refunds\n• Delivery info\n• Products & categories\n• Coupons & offers\n• Store location\n\nOr contact us directly:\n📞 +977-9800000000\n📧 ambestore@gmail.com";
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Namaste! 🙏 I\'m your Ambe General Store assistant.\n\nAsk me anything about orders, payments, delivery, products, and more!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, typing]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setShowQuick(false);
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getBotReply(trimmed);
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
    }, 600 + Math.random() * 400);
  };

  const handleSend = () => sendMessage(input);

  // Render message text with line breaks
  const renderText = (text) =>
    text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          style={{ maxHeight: '80vh' }}>

          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MdSupportAgent size={24} />
              <div>
                <p className="font-semibold text-sm">Ambe Store Assistant</p>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Always online
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-1.5 mt-1 shrink-0">
                    🤖
                  </div>
                )}
                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                }`}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-1.5 shrink-0">🤖</div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies */}
            {showQuick && !typing && (
              <div className="pt-1">
                <p className="text-xs text-gray-400 mb-2 ml-8">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5 ml-8">
                  {QUICK_REPLIES.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs bg-green-50 dark:bg-green-900/30 text-primary border border-primary/30 px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t dark:border-gray-700 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 text-sm border rounded-xl px-3 py-2 dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-primary transition-colors"
            />
            <button onClick={handleSend}
              className="bg-primary text-white p-2 rounded-xl hover:bg-green-700 transition active:scale-95">
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition active:scale-95"
        aria-label="Open chat"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  );
}
