import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';

import AboutPage from './pages/AboutPage';
import WishlistPage from './pages/WishlistPage';
import RefundPage from './pages/RefundPage';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminRefunds from './pages/admin/AdminRefunds';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';

import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Hide main navbar on admin pages — AdminLayout has its own */}
      {!isAdmin && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected - Customer */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/refunds" element={<ProtectedRoute><RefundPage /></ProtectedRoute>} />

          {/* Admin — AdminLayout includes its own nav/sidebar */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
          <Route path="/admin/refunds" element={<AdminRoute><AdminRefunds /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="text-center py-20">
              <div className="text-7xl mb-4">404</div>
              <p className="text-gray-400">Page not found</p>
            </div>
          } />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      <Chatbot />
    </div>
  );
}
