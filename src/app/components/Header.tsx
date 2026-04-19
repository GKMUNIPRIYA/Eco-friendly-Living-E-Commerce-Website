import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Search, ShoppingCart, User, ChevronDown, Menu, X, MessageSquare, Heart, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import FeedbackModal from './FeedbackModal';
import { productsAPI } from '../services/api';

const PRODUCT_MENU_HOVER_DELAY_MS = 400;

export function Header() {
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [healthBeautyBg, setHealthBeautyBg] = useState('/menu-images/health-beauty.png');
  const [homeLivingBg, setHomeLivingBg] = useState('/menu-images/home-living.png');
  const [giftingBg, setGiftingBg] = useState('/menu-images/everyday-gifting.png');

  const DEFAULT_HEALTH_BEAUTY_BG = '/menu-images/health-beauty.png';
  const DEFAULT_HOME_LIVING_BG = '/menu-images/home-living.png';
  const DEFAULT_GIFTING_BG = '/menu-images/everyday-gifting.png';

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  // Sync search input with URL when on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    if (location.pathname === '/search' && q) setSearchQuery(q);
  }, [location.pathname, location.search]);

  // Live search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        setIsSearching(true);
        productsAPI.getAll({ search: searchQuery.trim(), limit: 5 })
          .then((res: any) => {
            setSuggestions(res?.data || []);
            setShowSuggestions(true);
          })
          .catch(err => console.error('Suggestion fetch failed', err))
          .finally(() => setIsSearching(false));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearch(false);
    setShowMobileMenu(false);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (productId: string) => {
    setShowSearch(false);
    setShowMobileMenu(false);
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200';
    if (url.startsWith('http')) return url;
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const cleanBase = API_BASE.replace('/api', '');
    return `${cleanBase}/${url.startsWith('/') ? url.slice(1) : url}`;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#6B8E23] text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Free Shipping on Orders Above ₹999</span>
          <button
            onClick={() => setShowFeedback(true)}
            className="hover:underline flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <MessageSquare className="w-3 h-3" /> Feedback
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden text-[#5B6F1E] hover:text-[#6B8E23] p-1"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center" title="TerraKind Home">
              <img
                src="/logo.jpg"
                alt="TerraKind Logo"
                className="h-10 lg:h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link to="/" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium transition-colors">
              Home
            </Link>

            {/* Products Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                setShowProductsMenu(true);
              }}
              onMouseLeave={() => {
                hoverTimerRef.current = setTimeout(() => {
                  setShowProductsMenu(false);
                  hoverTimerRef.current = null;
                }, PRODUCT_MENU_HOVER_DELAY_MS);
              }}
            >
              <button className="flex items-center text-[#5B6F1E] hover:text-[#6B8E23] font-medium transition-colors">
                Products
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {showProductsMenu && (
                <div className="absolute left-0 top-full mt-2 w-screen max-w-5xl bg-white shadow-2xl rounded-lg p-8 -ml-32 z-[60]">
                  <div className="grid grid-cols-4 gap-4">
                    {/* Health & Beauty */}
                    <div 
                      className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg"
                      onMouseLeave={() => setHealthBeautyBg(DEFAULT_HEALTH_BEAUTY_BG)}
                    >
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-400 group-hover:scale-110"
                        style={{ backgroundImage: `url("${healthBeautyBg}")`, opacity: 0.3 }}
                      />
                      <div className="relative z-10">
                        {/* Column Banner */}
                        <div className="h-32 w-full rounded-lg mb-4 overflow-hidden shadow-md border border-gray-100 transition-transform duration-500 group-hover:scale-[1.02]">
                          <img 
                            src={healthBeautyBg} 
                            alt="Banner" 
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                        </div>
                        
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Health & Beauty</h3>
                        <ul className="space-y-2">
                          {[
                            { to: '/category/personal-care', label: 'Personal Care', slug: 'personal-care' },
                            { to: '/category/period-products', label: 'Period Products', slug: 'period-products' },
                            { to: '/category/soap-bars', label: 'Zero Waste Soap Bars', slug: 'soap-bars' },
                            { to: '/category/bath-body', label: 'Bath & Body', slug: 'bath-body' },
                            { to: '/category/hair-care', label: 'Hair Care', slug: 'hair-care' },
                            { to: '/category/face', label: 'Face', slug: 'face' },
                            { to: '/category/essential-oils', label: 'Essential Oils', slug: 'essential-oils' },
                          ].map(item => (
                            <li key={item.to}>
                              <Link 
                                to={item.to} 
                                className="text-gray-700 hover:text-[#6B8E23] transition-colors block text-sm font-medium"
                                onMouseEnter={() => setHealthBeautyBg(`/images-bg-submenu/${item.slug}.png`)}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div 
                      className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg"
                      onMouseLeave={() => setHomeLivingBg(DEFAULT_HOME_LIVING_BG)}
                    >
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-400 group-hover:scale-110"
                        style={{ backgroundImage: `url("${homeLivingBg}")`, opacity: 0.3 }}
                      />
                      <div className="relative z-10">
                        {/* Column Banner */}
                        <div className="h-32 w-full rounded-lg mb-4 overflow-hidden shadow-md border border-gray-100 transition-transform duration-500 group-hover:scale-[1.02]">
                          <img 
                            src={homeLivingBg} 
                            alt="Banner" 
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                        </div>

                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Home & Living</h3>
                        <ul className="space-y-2">
                          {[
                            { to: '/category/cleaners', label: 'Cleaners', slug: 'cleaners' },
                            { to: '/category/bathroom', label: 'Bathroom', slug: 'bathroom' },
                            { to: '/category/kitchen', label: 'Kitchen', slug: 'kitchen' },
                            { to: '/category/travel', label: 'Travel', slug: 'travel' },
                            { to: '/category/home-composting', label: 'Home Composting', slug: 'home-composting' },
                            { to: '/category/stationery', label: 'Stationery', slug: 'stationery' },
                            { to: '/category/candles-aroma', label: 'Candles & Aroma', slug: 'candles-aroma' },
                            { to: '/category/pet-care', label: 'Pet Care', slug: 'pet-care' },
                            { to: '/category/reusable-bags', label: 'Reusable Bags', slug: 'reusable-bags' },
                          ].map(item => (
                            <li key={item.to}>
                              <Link 
                                to={item.to} 
                                className="text-gray-700 hover:text-[#6B8E23] transition-colors block text-sm font-medium"
                                onMouseEnter={() => setHomeLivingBg(`/images-bg-submenu/${item.slug}.png`)}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div 
                      className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg"
                      onMouseLeave={() => setGiftingBg(DEFAULT_GIFTING_BG)}
                    >
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-400 group-hover:scale-110"
                        style={{ backgroundImage: `url("${giftingBg}")`, opacity: 0.3 }}
                      />
                      <div className="relative z-10">
                        {/* Column Banner */}
                        <div className="h-32 w-full rounded-lg mb-4 overflow-hidden shadow-md border border-gray-100 transition-transform duration-500 group-hover:scale-[1.02]">
                          <img 
                            src={giftingBg} 
                            alt="Banner" 
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                        </div>

                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Everyday Gifting</h3>
                        <ul className="space-y-2">
                          {[
                            { to: '/category/zero-waste-gifts', label: 'Zero Waste Gifts', slug: 'zero-waste-gifts' },
                            { to: '/category/womens-day', label: "Women's Day", slug: 'womens-day' },
                            { to: '/category/anniversary', label: 'Anniversary', slug: 'anniversary' },
                          ].map(item => (
                            <li key={item.to}>
                              <Link 
                                to={item.to} 
                                className="text-gray-700 hover:text-[#6B8E23] transition-colors block text-sm font-medium"
                                onMouseEnter={() => setGiftingBg(`/images-bg-submenu/${item.slug}.png`)}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <h3 className="font-bold text-[#6B8E23] mb-4 mt-6 text-lg">Corporate</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link 
                              to="/category/corporate-gifting" 
                              className="text-gray-700 hover:text-[#6B8E23] transition-colors block text-sm font-medium"
                              onMouseEnter={() => setGiftingBg('/images-bg-submenu/corporate-gifting.png')}
                            >
                              Corporate Gifting
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Shop by Brand */}
                    <div className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg">
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: 'url("/menu-images/shop-brands.png")', opacity: 0.15 }}
                      />
                      <div className="relative z-10 overflow-y-auto max-h-[400px]">
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg sticky top-0 bg-white/80 backdrop-blur-sm py-1">Shop by Brand</h3>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm italic">
                          {[
                            { to: '/brands/green-feels', label: 'Green Feels' },
                            { to: '/brands/ecosys', label: 'Ecosys' },
                            { to: '/brands/myoneearth', label: 'MyOneEarth' },
                            { to: '/brands/beco', label: 'Beco' },
                            { to: '/brands/wild-ideas', label: 'Wild Ideas' },
                            { to: '/brands/dvaar', label: 'Dvaar' },
                            { to: '/brands/saathi', label: 'Saathi' },
                            { to: '/brands/thenga', label: 'Thenga' },
                          ].map(item => (
                            <li key={item.to}>
                              <Link to={item.to} className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Featured Banner */}
                  <div className="mt-8 bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white p-6 rounded-lg">
                    <h4 className="text-xl mb-2">🌿 New Arrivals</h4>
                    <p className="text-sm mb-3">Explore our latest eco-friendly products</p>
                    <Link to="/category/zero-waste-gifts" className="bg-white text-[#6B8E23] px-4 py-2 rounded-full text-sm inline-block hover:bg-gray-100">
                      Shop Now
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/blog" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium transition-colors">Blog</Link>
            <Link to="/about" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium transition-colors">Contact</Link>
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-3 lg:gap-5">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#5B6F1E] hover:text-[#6B8E23] p-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/wishlist" className="hidden sm:block text-[#5B6F1E] hover:text-[#6B8E23] p-1" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>

            <Link to="/cart" className="text-[#5B6F1E] hover:text-[#6B8E23] relative p-1" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Desktop: Profile */}
            <div className="hidden lg:block relative">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowProfileMenu(v => !v)}
                    className="flex items-center gap-2 text-[#5B6F1E] hover:text-[#6B8E23] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6B8E23]/10 border-2 border-[#6B8E23]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#6B8E23]" />
                    </div>
                    <span className="text-sm max-w-[120px] truncate font-medium">
                      {currentUser.firstName || currentUser.email?.split('@')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{currentUser.email}</p>
                        {currentUser.role && currentUser.role !== 'user' && (
                          <span className="text-[10px] bg-[#6B8E23] text-white px-2 py-0.5 rounded-full mt-1 inline-block capitalize">
                            {currentUser.role}
                          </span>
                        )}
                      </div>
                      {[
                        { to: '/my-orders', label: '📦 My Orders' },
                        { to: '/wishlist', label: '❤️ Wishlist' },
                        { to: '/profile', label: '👤 Profile' },
                      ].map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] block transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {currentUser?.role === 'admin' && location.pathname.startsWith('/admin') && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full text-left px-4 py-2.5 text-sm text-[#6B8E23] hover:bg-green-50 font-medium block"
                          >
                            📊 Admin Dashboard
                          </Link>
                          <hr className="my-1" />
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center text-sm bg-[#6B8E23] text-white px-4 py-2 rounded-full font-medium hover:bg-[#5B7A1E] transition-colors"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        {showSearch && (
          <div className="mt-4 relative z-50">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full px-4 py-3 border-2 border-[#6B8E23] rounded-lg focus:outline-none focus:border-[#8FBC5A]"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6B8E23]"></div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#6B8E23] text-white rounded-lg font-semibold hover:bg-[#5B7A1E] transition-colors"
              >
                Search
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-20 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[70]">
                <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8E23]">Quick Results</span>
                  <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleSuggestionClick(p._id)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-green-50 transition-colors text-left group border-b border-gray-50 last:border-0"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate mb-0.5">{p.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-center text-xs font-bold text-[#6B8E23] transition-colors"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────── MOBILE FULL-SCREEN DRAWER ─────────────── */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Panel — slides in from left */}
          <div className="relative w-[85vw] max-w-sm bg-white h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white flex-shrink-0">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight">🌿 TerraKind</span>
              </Link>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 rounded-full hover:bg-white/20 transition" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b bg-gray-50 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30 focus:border-[#6B8E23]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#6B8E23]"></div>
                  </div>
                )}
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[300] mt-1">
                  <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-50">
                    {suggestions.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleSuggestionClick(p._id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-green-50 text-left"
                      >
                        <img src={getImageUrl(p.image)} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate">{p.name}</h4>
                          <p className="text-[10px] text-gray-400 capitalize">{p.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Nav Content */}
            <nav className="flex-1 overflow-y-auto">
              {/* Quick Icon Shortcuts */}
              <div className="grid grid-cols-3 gap-2 p-4 border-b">
                {[
                  { to: '/', icon: '🏠', label: 'Home' },
                  { to: '/cart', icon: '🛒', label: 'Cart', badge: getCartCount() },
                  { to: '/wishlist', icon: '❤️', label: 'Wishlist' },
                ].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMobileMenu(false)}
                    className="relative flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-[#6B8E23] transition text-center"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[11px] font-semibold text-gray-700">{item.label}</span>
                    {(item as any).badge > 0 && (
                      <span className="absolute top-2 right-2.5 bg-[#FF6B35] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="px-4 py-3 space-y-5">

                {/* Health & Beauty */}
                <div>
                  <p className="font-black text-[#6B8E23] mb-2 uppercase text-[10px] tracking-widest border-l-4 border-[#6B8E23] pl-2">
                    🌿 Health &amp; Beauty
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { slug: 'personal-care', label: 'Personal Care' },
                      { slug: 'period-products', label: 'Period Products' },
                      { slug: 'soap-bars', label: 'Soap Bars' },
                      { slug: 'bath-body', label: 'Bath & Body' },
                      { slug: 'hair-care', label: 'Hair Care' },
                      { slug: 'face', label: 'Face' },
                      { slug: 'essential-oils', label: 'Essential Oils' },
                    ].map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-3 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] text-xs font-medium transition"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Home & Living */}
                <div>
                  <p className="font-black text-[#6B8E23] mb-2 uppercase text-[10px] tracking-widest border-l-4 border-[#6B8E23] pl-2">
                    🏡 Home &amp; Living
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { slug: 'cleaners', label: 'Cleaners' },
                      { slug: 'bathroom', label: 'Bathroom' },
                      { slug: 'kitchen', label: 'Kitchen' },
                      { slug: 'travel', label: 'Travel' },
                      { slug: 'home-composting', label: 'Home Composting' },
                      { slug: 'stationery', label: 'Stationery' },
                      { slug: 'candles-aroma', label: 'Candles & Aroma' },
                      { slug: 'pet-care', label: 'Pet Care' },
                      { slug: 'reusable-bags', label: 'Reusable Bags' },
                    ].map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-3 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] text-xs font-medium transition"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Gifting & Corporate */}
                <div>
                  <p className="font-black text-[#6B8E23] mb-2 uppercase text-[10px] tracking-widest border-l-4 border-[#6B8E23] pl-2">
                    🎁 Gifting &amp; Corporate
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { slug: 'zero-waste-gifts', label: 'Zero Waste Gifts' },
                      { slug: 'corporate-gifting', label: 'Corporate Gifting' },
                      { slug: 'womens-day', label: "Women's Day" },
                      { slug: 'anniversary', label: 'Anniversary' },
                    ].map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-3 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] text-xs font-medium transition"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Brands sub-menu in Mobile */}
                <div>
                  <p className="font-black text-[#6B8E23] mb-2 uppercase text-[10px] tracking-widest border-l-4 border-[#6B8E23] pl-2">
                    🏷️ Shop by Brand
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { to: '/brands/green-feels', label: 'Green Feels' },
                      { to: '/brands/ecosys', label: 'Ecosys' },
                      { to: '/brands/myoneearth', label: 'MyOneEarth' },
                      { to: '/brands/beco', label: 'Beco' },
                      { to: '/brands/wild-ideas', label: 'Wild Ideas' },
                      { to: '/brands/dvaar', label: 'Dvaar' },
                      { to: '/brands/saathi', label: 'Saathi' },
                      { to: '/brands/thenga', label: 'Thenga' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-3 py-2 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] text-[11px] font-medium transition italic"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* New Arrivals Banner in Mobile */}
                <div className="bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] p-4 rounded-xl text-white">
                  <h4 className="font-bold text-sm mb-1">🌿 New Arrivals</h4>
                  <p className="text-[10px] mb-2 opacity-90">Explore our latest eco-friendly products</p>
                  <Link
                    to="/category/zero-waste-gifts"
                    onClick={() => setShowMobileMenu(false)}
                    className="inline-block bg-white text-[#6B8E23] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  >
                    Shop Now
                  </Link>
                </div>

                {/* Page Links */}
                <div className="border-t pt-4">
                  {[
                    { to: '/blog', label: '📖 Blog' },
                    { to: '/about', label: '🌿 About Us' },
                    { to: '/contact', label: '📞 Contact' },
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] font-medium text-sm transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setShowFeedback(true); setShowMobileMenu(false); }}
                    className="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium text-sm transition w-full text-left"
                  >
                    💬 Give Feedback
                  </button>
                </div>
              </div>
            </nav>

            {/* Bottom Auth Section */}
            <div className="border-t px-4 py-4 flex-shrink-0 bg-gray-50">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#6B8E23] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'My Account'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { to: '/profile', label: '👤 Profile' },
                      { to: '/my-orders', label: '📦 My Orders' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center justify-center py-2.5 bg-white border rounded-xl text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] hover:border-[#6B8E23] transition"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full py-3 bg-[#6B8E23] text-white text-center rounded-xl font-bold hover:bg-[#5B7A1E] transition text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full py-3 border-2 border-[#6B8E23] text-[#6B8E23] text-center rounded-xl font-bold hover:bg-green-50 transition text-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </header>
  );
}