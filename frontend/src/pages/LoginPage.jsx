import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MdStorefront } from 'react-icons/md';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Defined OUTSIDE the component so it never re-mounts on re-render
function Field({ icon: Icon, error, children }) {
  return (
    <div>
      <div className={`flex items-center border rounded-lg overflow-hidden transition-colors
        ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600 focus-within:border-primary'}`}>
        <span className="px-3 text-gray-400"><Icon size={16} /></span>
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <FiAlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin]   = useState(true);
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [serverOk, setServerOk] = useState(null);
  const [errors, setErrors]     = useState({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from || '/';

  useEffect(() => {
    api.get('/health')
      .then(() => setServerOk(true))
      .catch(() => {
        // In production on Render, the health check may fail due to cold start
        // Don't block the user — just hide the banner
        setServerOk(null);
      });
  }, []);

  const validate = () => {
    const e = {};
    if (!isLogin && form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Enter a valid email address';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(form.email.trim(), form.password);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
      } else {
        const user = await register(form.name.trim(), form.email.trim(), form.password);
        toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Make sure backend is running on port 5000.');
        setServerOk(false);
      } else {
        const msg = err.response?.data?.message || 'Something went wrong';
        toast.error(msg);
        if (msg.toLowerCase().includes('email'))    setErrors((p) => ({ ...p, email: msg }));
        if (msg.toLowerCase().includes('password')) setErrors((p) => ({ ...p, password: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setForm({ name: '', email: '', password: '' });
    setErrors({});
    setShowPass(false);
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="card w-full max-w-md p-8 shadow-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center text-primary mb-2">
            <MdStorefront size={44} />
          </div>
          <h1 className="text-2xl font-bold">Ambe General Store</h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Server status */}
        {serverOk === true && (
          <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <FiCheckCircle size={14} /> Server connected
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => !isLogin && switchMode()}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
              ${isLogin ? 'bg-white dark:bg-gray-800 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => isLogin && switchMode()}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all
              ${!isLogin ? 'bg-white dark:bg-gray-800 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <Field icon={FiUser} error={errors.name}>
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={set('name')}
                className="flex-1 py-2.5 pr-3 bg-transparent outline-none text-sm"
                autoComplete="name"
              />
            </Field>
          )}

          <Field icon={FiMail} error={errors.email}>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={set('email')}
              className="flex-1 py-2.5 pr-3 bg-transparent outline-none text-sm"
              autoComplete="email"
            />
          </Field>

          <Field icon={FiLock} error={errors.password}>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={set('password')}
              className="flex-1 py-2.5 bg-transparent outline-none text-sm"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="px-3 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </Field>

          <button
            type="submit"
            disabled={loading || serverOk === false}
            className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (isLogin ? 'Signing in…' : 'Creating account…')
              : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-1">Demo credentials (after running seed):</p>
          <p>Admin: <span className="font-mono">admin@store.com</span> / <span className="font-mono">admin123</span></p>
          <p>Customer: <span className="font-mono">john@example.com</span> / <span className="font-mono">john123</span></p>
        </div>
      </div>
    </div>
  );
}
