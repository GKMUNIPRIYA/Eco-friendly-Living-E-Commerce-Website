import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { Search, ShoppingCart, User, ChevronDown, Menu, X, MessageSquare, Heart } from 'lucide-react';
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
  // use centralized auth context instead of manual localStorage
  const { user: currentUser, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
   const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
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
      <div className="bg-[#6B8E23] text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 text-center">
          Free Shipping on Orders Above ₹999
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex-shrink-0 flex items-center h-full" title="TerraKind Home">
            <img
              src="/logo.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
              alt="TerraKind Logo"
              className="h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium">
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
              <button className="flex items-center text-[#5B6F1E] hover:text-[#6B8E23] font-medium">
                Products
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {showProductsMenu && (
                <div className="absolute left-0 top-full mt-2 w-screen max-w-5xl bg-white shadow-2xl rounded-lg p-8 -ml-32 z-[60]">
                  <div className="grid grid-cols-4 gap-4">
                    {/* Health & Beauty */}
                    <div className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg">
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: 'url("/menu-images/health-beauty.png")', opacity: 0.15 }}
                      />
                      <div className="relative z-10">
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Health & Beauty</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link to="/category/personal-care" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Personal Care
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/period-products" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Period Products
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/soap-bars" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Zero Waste Soap Bars
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/bath-body" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Bath & Body
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/hair-care" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Hair Care
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/face" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Face
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/essential-oils" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Essential Oils
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Home & Living */}
                    <div className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg">
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: 'url("/menu-images/home-living.png")', opacity: 0.15 }}
                      />
                      <div className="relative z-10">
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Home & Living</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link to="/category/cleaners" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Cleaners
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/bathroom" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Bathroom
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/kitchen" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Kitchen
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/travel" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Travel
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/home-composting" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Home Composting
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/stationery" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Stationery
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/candles-aroma" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Candles & Aroma
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/pet-care" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Pet Care
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/reusable-bags" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Reusable Bags
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Gifting & More */}
                    <div className="relative group overflow-hidden rounded-xl p-6 transition-all duration-500 hover:shadow-lg">
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: 'url("/menu-images/everyday-gifting.png")', opacity: 0.15 }}
                      />
                      <div className="relative z-10">
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg">Everyday Gifting</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link to="/category/zero-waste-gifts" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Zero Waste Gifts
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/womens-day" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Women's Day
                            </Link>
                          </li>
                          <li>
                            <Link to="/category/anniversary" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Anniversary
                            </Link>
                          </li>
                        </ul>

                        <h3 className="font-bold text-[#6B8E23] mb-4 mt-6 text-lg">Corporate</h3>
                        <ul className="space-y-2">
                          <li>
                            <Link to="/category/corporate-gifting" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
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
                      <div className="relative z-10 text-xs overflow-y-auto max-h-[400px]">
                        <h3 className="font-bold text-[#6B8E23] mb-4 text-lg sticky top-0 bg-white/80 backdrop-blur-sm py-1">Shop by Brand</h3>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm italic">
                          <li>
                            <Link to="/brands/green-feels" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Green Feels
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/ecosys" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Ecosys
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/myoneearth" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              MyOneEarth
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/beco" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Beco
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/wild-ideas" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Wild Ideas
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/dvaar" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Dvaar
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/saathi" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Saathi
                            </Link>
                          </li>
                          <li>
                            <Link to="/brands/thenga" className="text-gray-700 hover:text-[#6B8E23] transition-colors block">
                              Thenga
                            </Link>
                          </li>
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

            <Link to="/blog" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium">
              Blog
            </Link>
            <Link to="/about" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium">
              About
            </Link>
            <Link to="/contact" className="text-[#5B6F1E] hover:text-[#6B8E23] font-medium">
              Contact
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-[#5B6F1E] hover:text-[#6B8E23]"
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>

            <Link to="/wishlist" className="text-[#5B6F1E] hover:text-[#6B8E23] relative">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
            </Link>

            <Link to="/cart" className="text-[#5B6F1E] hover:text-[#6B8E23] relative">
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Desktop auth / profile */}
            <div className="hidden lg:block relative">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowProfileMenu((v) => !v)}
                    className="flex items-center gap-2 text-[#5B6F1E] hover:text-[#6B8E23]"
                  >
                    <User className="w-6 h-6" />
                    <span className="text-sm max-w-[160px] truncate">
                      {currentUser.firstName || currentUser.lastName
                        ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                        : currentUser.email || 'Profile'}
                    </span>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 break-all">
                          {currentUser.email}
                        </p>
                        {currentUser.role && currentUser.role !== 'user' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Role: {currentUser.role}
                          </p>
                        )}
                      </div>
                      <Link
                        to="/my-orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                      >
                        Wishlist
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                      >
                        Profile
                      </Link>
                      {/* only show admin dashboard link when user is admin and currently in admin area */}
                      {currentUser?.role === 'admin' && location.pathname.startsWith('/admin') && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-[#6B8E23] hover:bg-green-50 font-medium"
                          >
                            📊 Admin Dashboard
                          </Link>
                          <hr className="my-1" />
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center text-sm bg-[#6B8E23] text-white px-3 py-1.5 rounded-full font-medium hover:bg-[#5B7A1E]"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Sign in
                  </Link>
                </div>
              )}
            </div>



            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden text-[#5B6F1E] hover:text-[#6B8E23]"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

         {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 relative z-50">
            <form
              onSubmit={handleSearchSubmit}
              className="flex gap-2"
            >
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

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-16 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8E23]">Quick Results</span>
                   <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleSuggestionClick(p._id)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-green-50 transition-colors text-left group border-b border-gray-50 last:border-0"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <img 
                          src={getImageUrl(p.image)} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-800 truncate mb-0.5">{p.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category}</span>
                        </div>
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 py-4 border-t max-h-[70vh] overflow-y-auto custom-scrollbar">
            <nav className="space-y-6">
              {/* Search in Mobile Menu */}
              <div className="relative mb-4">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/20"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#6B8E23]"></div>
                    </div>
                  )}
                </form>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                    <div className="max-h-[300px] overflow-y-auto">
                      {suggestions.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => handleSuggestionClick(p._id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-green-50 text-left border-b border-gray-50"
                        >
                          <img 
                            src={getImageUrl(p.image)} 
                            className="w-10 h-10 object-cover rounded-lg" 
                            alt="" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate">{p.name}</h4>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block text-[#5B6F1E] hover:text-[#6B8E23] font-bold text-lg"
              >
                Home
              </Link>

              {/* Health & Beauty */}
              <div>
                <p className="font-black text-[#6B8E23] mb-3 uppercase text-xs tracking-widest border-l-4 border-[#6B8E23] pl-2">Health & Beauty</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['personal-care', 'period-products', 'soap-bars', 'bath-body', 'hair-care', 'face', 'essential-oils'].map(cat => (
                    <Link
                      key={cat}
                      to={`/category/${cat}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="block p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] capitalize"
                    >
                      {cat.replace('-', ' ')}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Home & Living */}
              <div>
                <p className="font-black text-[#6B8E23] mb-3 uppercase text-xs tracking-widest border-l-4 border-[#6B8E23] pl-2">Home & Living</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['cleaners', 'bathroom', 'kitchen', 'travel', 'home-composting', 'stationery', 'candles-aroma', 'pet-care', 'reusable-bags'].map(cat => (
                    <Link
                      key={cat}
                      to={`/category/${cat}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="block p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] capitalize"
                    >
                      {cat.replace('-', ' ')}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Gifting */}
              <div>
                <p className="font-black text-[#6B8E23] mb-3 uppercase text-xs tracking-widest border-l-4 border-[#6B8E23] pl-2">Gifting & Corporate</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['zero-waste-gifts', 'corporate-gifting', 'womens-day', 'anniversary'].map(cat => (
                    <Link
                      key={cat}
                      to={`/category/${cat}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="block p-3 bg-gray-50 rounded-lg text-gray-700 hover:bg-green-50 hover:text-[#6B8E23] capitalize"
                    >
                      {cat.replace('-', ' ')}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <Link
                  to="/blog"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-[#5B6F1E] hover:text-[#6B8E23] font-medium"
                >
                  📖 Blog
                </Link>
                <Link
                  to="/about"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-[#5B6F1E] hover:text-[#6B8E23] font-medium"
                >
                  🌿 About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-[#5B6F1E] hover:text-[#6B8E23] font-medium"
                >
                  📞 Contact
                </Link>
              </div>

              {/* Mobile Auth */}
              <div className="pt-6 border-t">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">My Account</p>
                    <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="block py-2 text-gray-700 hover:text-[#6B8E23]">My Profile</Link>
                    <Link to="/my-orders" onClick={() => setShowMobileMenu(false)} className="block py-2 text-gray-700 hover:text-[#6B8E23]">My Orders</Link>
                    <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 font-bold">Logout</button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full py-3 bg-[#6B8E23] text-white text-center rounded-xl font-bold hover:bg-[#5B7A1E]"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </header>
  );
}