import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { api, feedbackAPI } from '../services/api';
import { Plus, Package, Tag, BookOpen, MessageSquare, Mail, ShoppingBag, Star, Trash2, CheckCircle, Eye, EyeOff, User, BarChart } from 'lucide-react';
import AddProductForm from '../pages/admin/AddProductForm';
import AddOfferForm from '../pages/admin/AddOfferForm';
import AddBlogForm from '../pages/admin/AddBlogForm';
import ProductManagement from '../pages/admin/ProductManagement';
import OfferManagement from '../pages/admin/OfferManagement';
import BlogManagement from '../pages/admin/BlogManagement';
import SubscriberManagement from '../pages/admin/SubscriberManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import AdminProfile from '../pages/admin/AdminProfile';
import SalesReport from '../pages/admin/SalesReport';

type AdminTab = 'dashboard' | 'products' | 'offers' | 'blogs' | 'subscribers' | 'orders' | 'feedback' | 'profile' | 'sales';

export default function Admin() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const rawUser = localStorage.getItem('adminUser');
    let user: any = null;
    if (rawUser) {
      try { user = JSON.parse(rawUser); } catch { user = null; }
    }
    if (!token || !user || user.role !== 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);



  // Feedback state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const { adminProducts, offers, blogPosts } = useAdmin();

  // Load subscriber count
  useEffect(() => {
    api.newsletter.getCount()
      .then((data: any) => setSubscriberCount(data?.total || 0))
      .catch((err: any) => {
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) handleLogout();
      });
  }, []);

  // Load order count & unread status
  useEffect(() => {
    const fetchOrders = () => {
      api.orders.getAllOrders({ limit: 1 })
        .then((res: any) => {
          setOrderCount(res?.total || 0);
          setUnreadOrderCount(res?.unreadCount || 0);
        })
        .catch((err: any) => {
          if (err?.message?.includes('401') || err?.message?.includes('User not found')) handleLogout();
        });
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOrdersTabClick = async () => {
    setActiveTab('orders');
    if (unreadOrderCount > 0) {
      try {
        await api.orders.markRead();
        setUnreadOrderCount(0);
      } catch (err) {
        console.error('Failed to mark orders as read', err);
      }
    }
  };



  // Load feedback when tab opens
  useEffect(() => {
    if (activeTab !== 'feedback') return;
    setFeedbackLoading(true);
    feedbackAPI.getAll({ limit: 100 })
      .then((res: any) => {
        const items = res?.data || [];
        setFeedbacks(items);
        setUnreadFeedbackCount(items.filter((f: any) => !f.isRead).length);
      })
      .catch(console.error)
      .finally(() => setFeedbackLoading(false));
  }, [activeTab]);

  // Count unread feedback on mount
  useEffect(() => {
    feedbackAPI.getAll({ limit: 200, isRead: false })
      .then((res: any) => setUnreadFeedbackCount(res?.data?.length || 0))
      .catch(() => {});
  }, []);



  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    await feedbackAPI.delete(id);
    setFeedbacks(prev => prev.filter(f => (f._id || f.id) !== id));
  };

  const handleMarkFeedbackRead = async (id: string) => {
    await feedbackAPI.markAsRead(id);
    setFeedbacks(prev => prev.map(f => (f._id || f.id) === id ? { ...f, isRead: true } : f));
    setUnreadFeedbackCount(prev => Math.max(0, prev - 1));
  };

  const tabClass = (tab: AdminTab) =>
    `py-3 px-3 md:py-4 md:px-4 font-bold border-b-2 transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0 text-sm ${activeTab === tab
      ? 'border-[#6B8E23] text-[#6B8E23] bg-green-50/50'
      : 'border-transparent text-gray-500 hover:text-[#6B8E23] hover:bg-gray-50'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#556B2F] via-[#6B8E23] to-[#8FBC5A] text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">TerraKind Admin</h1>
              <p className="text-green-50 text-xs font-medium uppercase tracking-wider mt-0.5 opacity-80 hidden sm:block">Commerce Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold">Welcome, Overview</span>
              <span className="text-[10px] text-green-100 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Super Admin</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#6B8E23] shadow-xl scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - horizontally scrollable on mobile */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            <button onClick={() => setActiveTab('dashboard')} className={tabClass('dashboard')}>Dashboard</button>
            <button onClick={() => setActiveTab('products')} className={tabClass('products')}>
              <Package className="w-4 h-4" />Products
            </button>
            <button onClick={() => setActiveTab('offers')} className={tabClass('offers')}>
              <Tag className="w-4 h-4" />Offers
            </button>
            <button onClick={() => setActiveTab('blogs')} className={tabClass('blogs')}>
              <BookOpen className="w-4 h-4" />Blogs
            </button>
            <button onClick={handleOrdersTabClick} className={tabClass('orders')}>
              <ShoppingBag className="w-4 h-4" />Orders
              {unreadOrderCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {unreadOrderCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('sales')} className={tabClass('sales')}>
              <BarChart className="w-4 h-4" />Sales
            </button>

            <button onClick={() => setActiveTab('feedback')} className={tabClass('feedback')}>
              <MessageSquare className="w-4 h-4" />Feedback
              {unreadFeedbackCount > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadFeedbackCount}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('subscribers')} className={tabClass('subscribers')}>
              <Mail className="w-4 h-4" />Subscribers
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* ── Dashboard ── */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
              {[
                { label: 'Total Products', value: adminProducts.length, icon: <Package className="w-8 h-8 text-green-600" />, bgColor: 'bg-green-100/50', badge: null },
                { label: 'Active Offers', value: offers.filter(o => o.isActive).length, icon: <Tag className="w-8 h-8 text-yellow-600" />, bgColor: 'bg-yellow-100/50', badge: null },
                { label: 'Published Blogs', value: blogPosts.filter(b => b.isPublished).length, icon: <BookOpen className="w-8 h-8 text-blue-600" />, bgColor: 'bg-blue-100/50', badge: null },
                { 
                  label: 'Total Orders', 
                  value: orderCount, 
                  icon: <ShoppingBag className="w-8 h-8 text-purple-600" />, 
                  bgColor: 'bg-purple-100/50',
                  badge: unreadOrderCount > 0 ? `${unreadOrderCount} NEW` : null 
                },
                { label: 'Unread Feedback', value: unreadFeedbackCount, icon: <MessageSquare className="w-8 h-8 text-orange-600" />, bgColor: 'bg-orange-100/50', badge: null },
                { label: 'Newsletter', value: subscriberCount, icon: <Mail className="w-8 h-8 text-pink-600" />, bgColor: 'bg-pink-100/50', badge: null },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow group">
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left gap-3">
                    <div className="order-2 md:order-1">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{card.label}</p>
                      </div>
                      <p className="text-xl md:text-2xl font-black text-gray-800">{card.value}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform order-1 md:order-2`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => { setShowAddProduct(true); setActiveTab('products'); }} className="bg-white rounded-lg shadow p-8 text-center hover:shadow-lg transition">
                <Plus className="w-12 h-12 mx-auto mb-4 text-[#6B8E23]" />
                <h3 className="text-lg font-semibold text-[#5B6F1E] mb-2">Add New Product</h3>
                <p className="text-gray-600">Add eco-friendly products to your catalog</p>
              </button>
              <button onClick={() => { setShowAddOffer(true); setActiveTab('offers'); }} className="bg-white rounded-lg shadow p-8 text-center hover:shadow-lg transition">
                <Plus className="w-12 h-12 mx-auto mb-4 text-[#6B8E23]" />
                <h3 className="text-lg font-semibold text-[#5B6F1E] mb-2">Create New Offer</h3>
                <p className="text-gray-600">Set up discounts and promotional offers</p>
              </button>
              <button onClick={() => { setShowAddBlog(true); setActiveTab('blogs'); }} className="bg-white rounded-lg shadow p-8 text-center hover:shadow-lg transition">
                <Plus className="w-12 h-12 mx-auto mb-4 text-[#6B8E23]" />
                <h3 className="text-lg font-semibold text-[#5B6F1E] mb-2">Write New Blog</h3>
                <p className="text-gray-600">Create and schedule blog posts with videos</p>
              </button>
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#5B6F1E]">Product Management</h2>
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-[#6B8E23] text-white px-6 py-2 rounded-lg hover:bg-[#5B7A1E] transition flex items-center gap-2">
                <Plus className="w-4 h-4" />Add Product
              </button>
            </div>
            {showAddProduct && <AddProductForm onClose={() => setShowAddProduct(false)} />}
            <ProductManagement />
          </div>
        )}

        {/* ── Offers ── */}
        {activeTab === 'offers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#5B6F1E]">Offer Management</h2>
              <button onClick={() => setShowAddOffer(!showAddOffer)} className="bg-[#6B8E23] text-white px-6 py-2 rounded-lg hover:bg-[#5B7A1E] transition flex items-center gap-2">
                <Plus className="w-4 h-4" />Add Offer
              </button>
            </div>
            {showAddOffer && <AddOfferForm onClose={() => setShowAddOffer(false)} />}
            <OfferManagement />
          </div>
        )}

        {/* ── Blogs ── */}
        {activeTab === 'blogs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#5B6F1E]">Blog Management</h2>
              <button onClick={() => setShowAddBlog(!showAddBlog)} className="bg-[#6B8E23] text-white px-6 py-2 rounded-lg hover:bg-[#5B7A1E] transition flex items-center gap-2">
                <Plus className="w-4 h-4" />New Blog
              </button>
            </div>
            {showAddBlog && <AddBlogForm onClose={() => setShowAddBlog(false)} />}
            <BlogManagement />
          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-[#5B6F1E] mb-6">Order Management</h2>
            <OrderManagement />
          </div>
        )}



        {/* ── Feedback ── */}
        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-2xl font-bold text-[#5B6F1E] mb-6">Customer Feedback</h2>
            {feedbackLoading ? (
              <div className="text-center py-12 text-gray-500">Loading feedback...</div>
            ) : feedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No feedback submitted yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {feedbacks.map((f: any) => (
                  <div key={f._id || f.id} className={`bg-white rounded-lg shadow p-5 border-l-4 ${f.isRead ? 'border-gray-200' : 'border-[#6B8E23]'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-semibold text-[#5B6F1E]">{f.name}</span>
                          <span className="text-sm text-gray-500">{f.email}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            f.type === 'complaint' ? 'bg-red-100 text-red-700' :
                            f.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'}`}>
                            {f.type || 'general'}
                          </span>
                        </div>
                        <p className="text-gray-700">{f.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {f.rating && (
                            <div className="flex">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400">{new Date(f.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        {!f.isRead && (
                          <button onClick={() => handleMarkFeedbackRead(f._id || f.id)} className="p-2 text-green-600 bg-green-50 rounded-lg transition flex-1 md:flex-none flex justify-center">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteFeedback(f._id || f.id)} className="p-2 text-red-500 bg-red-50 rounded-lg transition flex-1 md:flex-none flex justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Sales ── */}
        {activeTab === 'sales' && <SalesReport />}

        {/* ── Subscribers ── */}
        {activeTab === 'subscribers' && <SubscriberManagement />}

        {/* ── Profile ── */}
        {activeTab === 'profile' && <AdminProfile />}
      </div>
    </div>
  );
}
