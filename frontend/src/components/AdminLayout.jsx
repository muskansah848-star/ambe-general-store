import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiLogOut,
  FiMenu, FiSun, FiMoon, FiHome, FiPlusCircle, FiUser,
  FiTag, FiRefreshCw, FiTrendingUp,
} from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',              label: 'Dashboard',   icon: FiGrid        },
  { to: '/admin/analytics',    label: 'Analytics',   icon: FiTrendingUp  },
  { to: '/admin/products',     label: 'Products',    icon: FiPackage     },
  { to: '/admin/products/new', label: 'Add Product', icon: FiPlusCircle  },
  { to: '/admin/orders',       label: 'Orders',      icon: FiShoppingBag },
  { to: '/admin/users',        label: 'Users',       icon: FiUser        },
  { to: '/admin/coupons',      label: 'Coupons',     icon: FiTag         },
  { to: '/admin/refunds',      label: 'Refunds',     icon: FiRefreshCw   },
];

// Defined OUTSIDE AdminLayout so it is never re-created on each render
function Sidebar({ user, location, onClose, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b dark:border-gray-700">
        <Link to="/admin" className="flex items-center gap-2 text-primary font-bold text-lg" onClick={onClose}>
          <MdStorefront size={26} />
          <span>Admin Panel</span>
        </Link>
        <p className="text-xs text-gray-400 mt-1">Ambe General Store</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        <div className="pt-3 border-t dark:border-gray-700 mt-3">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiHome size={18} /> View Store
          </Link>
        </div>
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarProps = {
    user,
    location,
    onClose: () => setSidebarOpen(false),
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 fixed h-full z-30">
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
            <Sidebar {...sidebarProps} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="font-semibold text-gray-700 dark:text-gray-200">
              {NAV.find((n) => n.to === location.pathname)?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <FiUser size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <FiLogOut size={15} /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
