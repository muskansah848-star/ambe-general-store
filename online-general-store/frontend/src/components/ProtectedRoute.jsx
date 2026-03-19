import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Requires login
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

// Requires admin role
export const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
            This area is restricted to administrators only.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-primary">Go to Store</Link>
            <Link to="/orders" className="btn-outline">My Orders</Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Logged in as <span className="font-medium">{user.name}</span> ({user.role})
          </p>
        </div>
      </div>
    );
  }

  return children;
};
