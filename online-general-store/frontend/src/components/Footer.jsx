import { MdStorefront } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
            <MdStorefront size={24} /> Online General Store
          </div>
          <p className="text-sm">Your one-stop shop for daily household essentials.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/cart" className="hover:text-primary">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-primary">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {['Groceries', 'Snacks', 'Beverages', 'Personal Care', 'Household'].map((c) => (
              <li key={c}><Link to={`/?category=${c}`} className="hover:text-primary">{c}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} Online General Store. All rights reserved.
      </div>
    </footer>
  );
}
