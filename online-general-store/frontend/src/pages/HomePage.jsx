import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiMic, FiMicOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { label: 'All',           emoji: '🏪' },
  { label: 'Groceries',     emoji: '🌾' },
  { label: 'Dairy',         emoji: '🥛' },
  { label: 'Snacks',        emoji: '🍿' },
  { label: 'Beverages',     emoji: '🥤' },
  { label: 'Bakery',        emoji: '🍞' },
  { label: 'Personal Care', emoji: '🧴' },
  { label: 'Household',     emoji: '🧹' },
  { label: 'Other',         emoji: '📦' },
];

const SORT_OPTIONS = [
  { value: '',           label: 'Latest'          },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'       },
];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [products,  setProducts]  = useState([]);
  const [featured,  setFeatured]  = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [inputVal,  setInputVal]  = useState(searchParams.get('keyword') || '');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const keyword  = searchParams.get('keyword')  || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || '';
  const page     = Number(searchParams.get('page') || 1);

  const isFiltered = keyword || category || sort;

  // Fetch featured once
  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setFeatured(data))
      .catch(() => {});
  }, []);

  // Fetch AI recommendations for logged-in users
  useEffect(() => {
    if (!user) return;
    api.get('/products/recommendations')
      .then(({ data }) => setRecommended(data))
      .catch(() => {});
  }, [user]);

  // Voice search setup
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice search not supported in this browser');
    if (listening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputVal(transcript);
      setParam('keyword', transcript.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Fetch products on filter/page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12 });
        if (keyword)  params.set('keyword',  keyword);
        if (category) params.set('category', category);
        if (sort)     params.set('sort',     sort);
        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort, page]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    // Only reset page when changing filters, not when changing page itself
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('keyword', inputVal.trim());
  };

  const clearSearch = () => {
    setInputVal('');
    setParam('keyword', '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ── Hero (only on unfiltered home page 1) ── */}
      {!isFiltered && page === 1 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 mb-8 text-white">
          <div className="relative z-10 max-w-lg">
            <p className="text-green-100 text-sm font-medium mb-1 uppercase tracking-wide">Welcome to</p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              Ambe General Store
            </h1>
            <p className="text-green-100 mb-5">
              Fresh groceries, snacks, dairy &amp; more — delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/?category=Groceries"
                className="bg-white text-primary font-semibold px-5 py-2 rounded-lg hover:bg-green-50 transition text-sm"
              >
                Shop Groceries
              </Link>
              <Link
                to="/?sort=price_asc"
                className="border border-white text-white font-semibold px-5 py-2 rounded-lg hover:bg-white/10 transition text-sm"
              >
                Best Deals
              </Link>
            </div>
          </div>
          <div className="absolute right-6 bottom-0 text-[120px] leading-none opacity-20 select-none">🛒</div>
        </div>
      )}

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search for rice, milk, chips…"
            className="input-field pl-10 pr-16"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputVal && (
              <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 p-1">
                <FiX size={16} />
              </button>
            )}
            <button type="button" onClick={startVoiceSearch}
              className={`p-1 rounded-full transition ${listening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-primary'}`}
              title="Voice search">
              {listening ? <FiMicOff size={16} /> : <FiMic size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
      </form>

      {/* ── Category pills ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(({ label, emoji }) => {
          const active = (label === 'All' && !category) || category === label;
          return (
            <button
              key={label}
              onClick={() => setParam('category', label === 'All' ? '' : label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${active
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:text-primary'
                }`}
            >
              <span>{emoji}</span> {label}
            </button>
          );
        })}

        {/* Sort — pushed to the right */}
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input-field text-sm py-1.5 w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="text-gray-400">Filters:</span>
          {keyword && (
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              "{keyword}"
              <button onClick={clearSearch}><FiX size={12} /></button>
            </span>
          )}
          {category && (
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              {category}
              <button onClick={() => setParam('category', '')}><FiX size={12} /></button>
            </span>
          )}
          {sort && (
            <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <button onClick={() => setParam('sort', '')}><FiX size={12} /></button>
            </span>
          )}
          <span className="text-gray-400 ml-auto">{total} result{total !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* ── Featured section (home, no filters, page 1) ── */}
      {!isFiltered && page === 1 && featured.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">⭐ Featured Products</h2>
            <Link to="/?sort=rating" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <hr className="mt-10 border-gray-100 dark:border-gray-800" />
        </section>
      )}

      {/* ── AI Recommendations (logged-in users, home page) ── */}
      {!isFiltered && page === 1 && user && recommended.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🤖 Recommended for You</h2>
            <span className="text-xs text-gray-400">Based on your purchase history</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <hr className="mt-10 border-gray-100 dark:border-gray-800" />
        </section>
      )}

      {/* ── All products heading ── */}
      {!isFiltered && page === 1 && (
        <h2 className="text-lg font-bold mb-4">🛍️ All Products</h2>
      )}

      {/* ── Product grid ── */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-semibold mb-2">No products found</p>
          <p className="text-gray-400 mb-6 text-sm">
            {keyword ? `No results for "${keyword}"` : 'Try a different category or search term'}
          </p>
          <button
            onClick={() => { setInputVal(''); setSearchParams({}); }}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setParam('page', page - 1)}
                className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setParam('page', p)}
                  className={`w-9 h-9 rounded-lg border text-sm font-medium transition
                    ${p === page
                      ? 'bg-primary text-white border-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === pages}
                onClick={() => setParam('page', page + 1)}
                className="p-2 rounded-lg border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
