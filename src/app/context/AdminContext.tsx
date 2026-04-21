import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { productsAPI, offersAPI, blogsAPI, feedbackAPI } from '../services/api';

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  validFrom: string;
  validTo: string;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  excerpt?: string;
  content?: string;
  category?: string;
  readingTime?: number;
  tags?: string[];
  videoFile?: File;
  videoUrl?: string;
  thumbnailImage?: string;
  scheduledDate: string;
  publishedDate?: string;
  isPublished: boolean;
  isScheduled: boolean;
  createdAt: string;
  author?: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  message: string;
  type: string;
  isRead: boolean;
  priority: string;
  response?: string;
  createdAt: string;
}

interface AdminContextType {
  // Products
  adminProducts: AdminProduct[];
  totalProducts: number;
  addAdminProduct: (product: AdminProduct) => void;
  updateAdminProduct: (id: string, product: AdminProduct) => void;
  deleteAdminProduct: (id: string) => Promise<void>;

  // Offers
  offers: Offer[];
  addOffer: (offer: Offer) => void;
  updateOffer: (id: string, offer: Offer) => void;
  deleteOffer: (id: string) => Promise<void>;

  // Blog Posts
  blogPosts: BlogPost[];
  addBlogPost: (blog: BlogPost) => void;
  updateBlogPost: (id: string, blog: BlogPost) => void;
  deleteBlogPost: (id: string) => Promise<void>;
  getPublishedBlogs: () => BlogPost[];
  getScheduledBlogs: () => BlogPost[];

  // Feedback
  feedbackItems: FeedbackItem[];
  deleteFeedback: (id: string) => Promise<void>;
  markFeedbackAsRead: (id: string) => Promise<void>;
  refreshFeedback: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);

  // ─── Load all data from backend on mount ────────────────────────
  const loadAll = () => {
    // Products
    productsAPI
      .getAll({ page: 1, limit: 1000 })
      .then((res: any) => {
        const items = res?.data || [];
        const total = res?.total || items.length;
        const mapped: AdminProduct[] = items.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          images: p.images || [],
          category: p.category,
          description: p.description || '',
        }));
        setAdminProducts(mapped);
        setTotalProducts(total);
      })
      .catch((err: any) => console.error('Failed to load products', err));

    // Offers
    offersAPI
      .getAll({ page: 1, limit: 200 })
      .then((res: any) => {
        const items = res?.data || [];
        const mapped: Offer[] = items.map((o: any) => ({
          id: o._id || o.id,
          title: o.title,
          description: o.description || '',
          discount: o.discount,
          validFrom: o.validFrom,
          validTo: o.validTo,
          applicableCategories: o.applicableCategories || [],
          applicableProducts: o.applicableProducts || [],
          isActive: o.isActive,
        }));
        setOffers(mapped);
      })
      .catch((err: any) => console.error('Failed to load offers', err));

    // Blogs — load both published AND all (admin sees everything)
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
    const adminToken = localStorage.getItem('adminToken') || '';
    fetch(`${API_BASE}/blogs/admin/all?page=1&limit=200`, {
      headers: { ...(adminToken && { Authorization: `Bearer ${adminToken}` }) },
    })
      .then((r) => r.json())
      .then((res: any) => {
        const items = res?.data || [];
        const mapped: BlogPost[] = items.map((b: any) => ({
          id: b._id || b.id,
          title: b.title,
          description: b.description,
          excerpt: b.excerpt || '',
          content: b.content || '',
          category: b.category || 'General',
          readingTime: b.readingTime || 1,
          tags: b.tags || [],
          author: b.author || 'Admin',
          videoUrl: b.videoUrl,
          thumbnailImage: b.thumbnailImage,
          scheduledDate: b.scheduledDate || '',
          publishedDate: b.publishedDate,
          isPublished: !!b.isPublished,
          isScheduled: !!b.isScheduled,
          createdAt: b.createdAt,
        }));
        setBlogPosts(mapped);
      })
      .catch(() => {
        // Fallback: load published blogs only
        blogsAPI
          .getAll({ page: 1, limit: 200 })
          .then((res: any) => {
            const items = res?.data || [];
            const mapped: BlogPost[] = items.map((b: any) => ({
              id: b._id || b.id,
              title: b.title,
              description: b.description,
              excerpt: b.excerpt || '',
              content: b.content || '',
              category: b.category || 'General',
              readingTime: b.readingTime || 1,
              tags: b.tags || [],
              author: b.author || 'Admin',
              videoUrl: b.videoUrl,
              thumbnailImage: b.thumbnailImage,
              scheduledDate: b.scheduledDate || '',
              publishedDate: b.publishedDate,
              isPublished: !!b.isPublished,
              isScheduled: !!b.isScheduled,
              createdAt: b.createdAt,
            }));
            setBlogPosts(mapped);
          })
          .catch((err: any) => console.error('Failed to load blogs', err));
      });

    // Feedback
    refreshFeedback();
  };

  const refreshFeedback = () => {
    feedbackAPI
      .getAll({ page: 1, limit: 200 })
      .then((res: any) => {
        const items = res?.data || [];
        const mapped: FeedbackItem[] = items.map((f: any) => ({
          id: f._id || f.id,
          name: f.name,
          email: f.email,
          message: f.message,
          type: f.type || 'general',
          isRead: !!f.isRead,
          priority: f.priority || 'normal',
          response: f.response,
          createdAt: f.createdAt,
        }));
        setFeedbackItems(mapped);
      })
      .catch((err: any) => console.error('Failed to load feedback', err));
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ─── Product Management ──────────────────────────────────────────
  const addAdminProduct = (product: AdminProduct) => {
    setAdminProducts((prev) => [product, ...prev]);
    setTotalProducts((prev) => prev + 1);
  };

  const updateAdminProduct = (id: string, product: AdminProduct) => {
    setAdminProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...product, id } : item))
    );
  };

  const deleteAdminProduct = async (id: string) => {
    await productsAPI.delete(id);
    setAdminProducts((prev) => prev.filter((item) => item.id !== id));
    setTotalProducts((prev) => Math.max(0, prev - 1));
  };

  // ─── Offer Management ────────────────────────────────────────────
  const addOffer = (offer: Offer) => {
    setOffers((prev) => [offer, ...prev]);
  };

  const updateOffer = (id: string, offer: Offer) => {
    setOffers((prev) =>
      prev.map((item) => (item.id === id ? { ...offer, id } : item))
    );
  };

  const deleteOffer = async (id: string) => {
    await offersAPI.delete(id);
    setOffers((prev) => prev.filter((item) => item.id !== id));
  };

  // ─── Blog Management ─────────────────────────────────────────────
  const addBlogPost = (blog: BlogPost) => {
    setBlogPosts((prev) => [blog, ...prev]);
  };

  const updateBlogPost = (id: string, blog: BlogPost) => {
    setBlogPosts((prev) =>
      prev.map((item) => (item.id === id ? { ...blog, id } : item))
    );
  };

  const deleteBlogPost = async (id: string) => {
    await blogsAPI.delete(id);
    setBlogPosts((prev) => prev.filter((item) => item.id !== id));
  };

  const getPublishedBlogs = () => blogPosts.filter((b) => b.isPublished);
  const getScheduledBlogs = () => blogPosts.filter((b) => b.isScheduled && !b.isPublished);

  // ─── Feedback Management ─────────────────────────────────────────
  const deleteFeedback = async (id: string) => {
    await feedbackAPI.delete(id);
    setFeedbackItems((prev) => prev.filter((item) => item.id !== id));
  };

  const markFeedbackAsRead = async (id: string) => {
    await feedbackAPI.markAsRead(id);
    setFeedbackItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  return (
    <AdminContext.Provider
      value={{
        // Products
        adminProducts,
        totalProducts,
        addAdminProduct,
        updateAdminProduct,
        deleteAdminProduct,

        // Offers
        offers,
        addOffer,
        updateOffer,
        deleteOffer,

        // Blogs
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        getPublishedBlogs,
        getScheduledBlogs,

        // Feedback
        feedbackItems,
        deleteFeedback,
        markFeedbackAsRead,
        refreshFeedback,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
