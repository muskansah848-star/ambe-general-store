import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { FiShoppingCart, FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { dark, toggle } = useTheme();
  const { lang, t, cycleLang, currentLabel, LANGS, langIndex } = useLang();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <MdStorefront size={28} />
          <span className="hidden sm:block">{t.storeName}</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={(e) => { e.preventDefault(); navigate(`/?keyword=${e.target.search.value}`); }}
          className="hidden md:flex flex-1 max-w-md mx-6">
          <input name="search" placeholder={t.search} className="input-field rounded-r-none" />
          <button type="submit" className="btn-primary rounded-l-none px-4">{t.searchBtn}</button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Language cycle button — shows current lang, click to cycle */}
          <button
            onClick={cycleLang}
            className="px-2 py-1 text-xs font-bold rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[2.2rem] text-center"
            title={`Current: ${LANGS[langIndex].name} — click to switch`}
          >
            {currentLabel}
          </button>

          <Link to="/cart" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <FiShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiUser size={20} />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 card shadow-lg py-1 hidden group-hover:block">
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">{t.adminDashboard}</Link>
                )}
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">{t.profile}</Link>
                <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">{t.myOrders}</Link>
                <Link to="/refunds" className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Refunds</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-red-500 flex items-center gap-2">
                  <FiLogOut size={14} /> {t.logout}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden md:block text-sm">{t.login}</Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/?keyword=${e.target.search.value}`); setMenuOpen(false); }}>
            <input name="search" placeholder={t.search} className="input-field mt-2" />
          </form>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2">{t.adminDashboard}</Link>}
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2">{t.profile}</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2">{t.myOrders}</Link>
              <Link to="/refunds" onClick={() => setMenuOpen(false)} className="block py-2">Refunds</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-500 py-2">{t.logout}</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-primary font-medium">{t.login}</Link>
          )}
        </div>
      )}
    </nav>
  );
}
