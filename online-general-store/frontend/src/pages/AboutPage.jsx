import { Link } from 'react-router-dom';
import {
  MdLocationOn, MdPhone, MdEmail, MdDeliveryDining,
  MdVerified, MdSupportAgent, MdLocalOffer,
} from 'react-icons/md';
import {
  FiShoppingCart, FiStar, FiShield, FiRefreshCw,
  FiCreditCard, FiSmartphone, FiGlobe, FiTruck,
} from 'react-icons/fi';

const FEATURES = [
  { icon: FiShoppingCart,      color: 'bg-green-100 text-green-600',   title: 'Easy Shopping',          desc: 'Browse 66+ products across 8 categories with smart search and filters.' },
  { icon: MdDeliveryDining,    color: 'bg-blue-100 text-blue-600',     title: 'Fast Delivery',          desc: 'Same-day delivery in Jhapa. Next-day delivery across Koshi Province.' },
  { icon: FiCreditCard,        color: 'bg-purple-100 text-purple-600', title: 'Multiple Payments',      desc: 'Cash on Delivery, Razorpay, UPI/QR Code, and Card payments supported.' },
  { icon: MdLocalOffer,        color: 'bg-yellow-100 text-yellow-600', title: 'Coupons & Discounts',    desc: 'Apply promo codes at checkout to save on every order.' },
  { icon: FiRefreshCw,         color: 'bg-red-100 text-red-600',       title: 'Easy Refunds',           desc: 'Hassle-free refund requests directly from your orders page.' },
  { icon: FiStar,              color: 'bg-orange-100 text-orange-600', title: 'Product Reviews',        desc: 'Read and write reviews to help the community make better choices.' },
  { icon: FiShield,            color: 'bg-teal-100 text-teal-600',     title: 'Secure & Trusted',       desc: 'JWT authentication, encrypted payments, and secure checkout.' },
  { icon: MdSupportAgent,      color: 'bg-pink-100 text-pink-600',     title: 'AI Chatbot Support',     desc: 'Our smart chatbot answers your questions 24/7 — orders, delivery, and more.' },
  { icon: FiSmartphone,        color: 'bg-indigo-100 text-indigo-600', title: 'PWA — Works Offline',    desc: 'Install the app on your phone and shop even with slow internet.' },
  { icon: FiGlobe,             color: 'bg-cyan-100 text-cyan-600',     title: 'English & Hindi',        desc: 'Switch between English and Hindi with one click.' },
  { icon: MdVerified,          color: 'bg-emerald-100 text-emerald-600',title: 'Quality Guaranteed',   desc: 'All products are sourced from trusted local suppliers in Nepal.' },
  { icon: FiTruck,             color: 'bg-amber-100 text-amber-600',   title: 'Order Tracking',         desc: 'Track your order status in real-time from your orders page.' },
];

const DELIVERY_DISTRICTS = [
  'Parsa', 'Bara', 'Rautahat', 'Sarlahi',
  'Mahottari', 'Dhanusha', 'Siraha', 'Saptari',
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 text-white mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Ambe General Store</h1>
        <p className="text-green-100 text-lg mb-2">Birgunj, Parsa, Nepal 🇳🇵</p>
        <p className="text-green-100 max-w-xl mx-auto">
          Your trusted neighbourhood store — now online. Fresh groceries, dairy, snacks and daily essentials delivered to your door across Madhesh Province.
        </p>
        <Link to="/" className="inline-block mt-5 bg-white text-primary font-semibold px-6 py-2 rounded-lg hover:bg-green-50 transition">
          Shop Now
        </Link>
      </div>

      {/* Store Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MdLocationOn className="text-primary" size={22} /> Store Location
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>Address:</strong> Birgunj-30, Parsa, Madhesh Province, Nepal</p>
            <p><strong>Postal Code:</strong> 44300</p>
            <p className="flex items-center gap-2">
              <MdPhone className="text-primary" />
              <a href="tel:+9779844127675" className="hover:text-primary">+977 984 4127675</a>
            </p>
            <p className="flex items-center gap-2">
              <MdEmail className="text-primary" />
              <a href="mailto:ambedepartmentalstore6709@gmail.com" className="hover:text-primary">ambedepartmentalstore6709@gmail.com</a>
            </p>
          </div>
          {/* Embedded map placeholder */}
          <div className="mt-4 rounded-xl overflow-hidden border dark:border-gray-700">
            <iframe
              title="Ambe General Store Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=84.82,27.00,84.92,27.05&layer=mapnik&marker=27.012,84.877"
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <a
            href="https://www.openstreetmap.org/?mlat=27.012&mlon=84.877#map=14/27.012/84.877"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            View larger map →
          </a>
        </div>

        {/* Delivery Areas */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiTruck className="text-primary" size={20} /> Delivery Areas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            We deliver across Madhesh Province, Nepal. Free delivery on orders above NPR 500.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DELIVERY_DISTRICTS.map((d) => (
              <div key={d} className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {d}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <strong>Delivery Times:</strong><br />
            🏙️ Birgunj — Same day (order before 12 PM)<br />
            📦 Madhesh Province — 1–2 business days<br />
            🚚 Other areas — 3–5 business days
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <h2 className="text-2xl font-bold text-center mb-8">Why Shop With Us?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
        {FEATURES.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card p-5 flex gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-2">Ready to order?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">
          Fresh products, great prices, delivered to your door in Nepal.
        </p>
        <Link to="/" className="btn-primary px-8 py-3 text-base">Start Shopping</Link>
      </div>
    </div>
  );
}
