import { MdStorefront, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md';
import { Link } from 'react-router-dom';

const WA_LINK = 'https://wa.me/9779844127675?text=' + encodeURIComponent('Hello! I have a query about Ambe General Store.');

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
            <MdStorefront size={24} /> Ambe General Store
          </div>
          <p className="text-sm mb-4">Your one-stop shop for daily household essentials in Nepal.</p>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <MdLocationOn size={16} className="mt-0.5 text-primary shrink-0" />
              Birgunj-30, Parsa<br />Madhesh Province, Nepal
            </p>
            <a href={WA_LINK} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 hover:text-green-400 transition-colors">
              <MdPhone size={16} className="text-primary shrink-0" />
              +977 984 4127675
              <span className="text-xs bg-green-700 text-white px-1.5 py-0.5 rounded-full">WhatsApp</span>
            </a>
            <a href="mailto:ambedepartmentalstore6709@gmail.com"
              className="flex items-center gap-2 hover:text-primary transition-colors">
              <MdEmail size={16} className="text-primary shrink-0" />
              ambedepartmentalstore6709@gmail.com
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
            <li><Link to="/refunds" className="hover:text-primary transition-colors">Refunds</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {['Groceries', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Personal Care', 'Household'].map((c) => (
              <li key={c}>
                <Link to={`/?category=${c}`} className="hover:text-primary transition-colors">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Delivery Areas */}
        <div>
          <h4 className="text-white font-semibold mb-3">Delivery Areas</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              'Parsa', 'Bara', 'Rautahat',
              'Sarlahi', 'Mahottari', 'Dhanusha',
              'Siraha', 'Saptari',
            ].map((d) => (
              <li key={d} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Ambe General Store, Birgunj, Parsa, Nepal. All rights reserved.
      </div>
    </footer>
  );
}
