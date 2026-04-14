/// <reference types="vite/client" />

/**
 * API Service for Backend Integration
 * Handles all HTTP requests to the Express backend
 * Base URL: http://localhost:3000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token (user/customer)
function getAuthToken(): string {
  return localStorage.getItem('authToken') || localStorage.getItem('adminToken') || '';
}

// Helper for admin-only requests (keeps admin session separate from user)
function getAdminToken(): string {
  return localStorage.getItem('adminToken') || '';
}

// Helper function for fetch requests with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { useAdminToken?: boolean } = {}
): Promise<T> {
  const { useAdminToken, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const token = useAdminToken ? getAdminToken() : getAuthToken();

  // Debug: log if admin token is missing for admin routes
  if (useAdminToken && !token) {
    console.warn(`[API WARNING] Admin token missing for ${endpoint}`);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(typeof fetchOptions.headers === 'object' && fetchOptions.headers ? fetchOptions.headers as Record<string, string> : {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || error.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        const text = await response.text();
        if (text) {
          errorMessage = text.substring(0, 100);
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);

    // If admin user account not found, immediately clear admin session
    if (error?.message?.includes('User account not found') || error?.message?.includes('User not found')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        console.warn('[API] Admin user not found in database - clearing admin session');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }

    // Give clearer message when the browser cannot reach the backend at all
    if (error?.message === 'Failed to fetch' || error instanceof TypeError) {
      throw new Error(
        'Cannot reach backend API. Make sure the Node server is running on http://localhost:3000 and that it started without errors.'
      );
    }

    throw error;
  }
}

// ==================== AUTHENTICATION API ====================
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; phone?: string; dateOfBirth?: string; address?: string; city?: string; state?: string; pincode?: string }) =>
    fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: () =>
    fetchAPI('/auth/profile', { method: 'GET' }),

  updateProfile: (data: any) =>
    fetchAPI('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateProfileImage: (formData: FormData) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    return fetch(`${API_BASE_URL}/auth/profile/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(r => r.json());
  },

  forgotPassword: (email: string) =>
    fetchAPI('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (data: { token: string; password: string; confirmPassword: string }) =>
    fetchAPI('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  verifyEmail: (data: { email: string; code: string }) =>
    fetchAPI('/auth/verify-email', { method: 'POST', body: JSON.stringify(data) }),

  resendVerification: (email: string) =>
    fetchAPI('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
};

// ==================== PRODUCTS API ====================
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/products${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET' });
  },

  getById: (id: string) =>
    fetchAPI(`/products/${id}`, { method: 'GET' }),

  getByCategory: (category: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/products/category/${category}${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET' });
  },

  create: (data: { name: string; price: number; image: string; category: string; description?: string }) =>
    fetchAPI('/products', { method: 'POST', body: JSON.stringify(data), useAdminToken: true }),

  update: (id: string, data: Partial<{ name: string; price: number; image: string; category: string; description?: string }>) =>
    fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data), useAdminToken: true }),

  updateQuantity: (id: string, quantity: number) =>
    fetchAPI(`/products/${id}/quantity`, { method: 'PUT', body: JSON.stringify({ quantity }), useAdminToken: true }),

  delete: (id: string) =>
    fetchAPI(`/products/${id}`, { method: 'DELETE', useAdminToken: true }),
};
// ==================== ORDERS API ====================
export const ordersAPI = {
  create: (orderData: any) =>
    fetchAPI('/orders', { method: 'POST', body: JSON.stringify(orderData) }),

  getById: (id: string) =>
    fetchAPI(`/orders/${id}`, { method: 'GET' }),

  getUserOrders: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/orders${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET' });
  },
  // wishlist
  toggleWishlist: (productId: string) =>
    fetchAPI('/auth/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  getWishlist: () =>
    fetchAPI('/auth/wishlist', { method: 'GET' }),

  getAllOrders: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/orders/admin/all${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET', useAdminToken: true });
  },

  updateStatus: (id: string, status: string) =>
    fetchAPI(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), useAdminToken: true }),

  markRead: () =>
    fetchAPI('/orders/admin/mark-read', { method: 'PUT', useAdminToken: true }),

  cancel: (id: string) =>
    fetchAPI(`/orders/${id}`, { method: 'DELETE' }),

  confirmUpi: (id: string) =>
    fetchAPI(`/orders/${id}/confirm-upi`, { method: 'POST' }),
};

// ==================== BLOGS API ====================
export const blogsAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    return fetchAPI(`/blogs${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET' });
  },

  getById: (id: string) =>
    fetchAPI(`/blogs/${id}`, { method: 'GET' }),

  create: (data: FormData) =>
    fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        ...(getAdminToken() && { Authorization: `Bearer ${getAdminToken()}` }),
      },
      body: data,
    }).then(r => r.json()),

  update: (id: string, data: any) => {
    // Support both JSON and FormData
    if (data instanceof FormData) {
      return fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          ...(getAdminToken() && { Authorization: `Bearer ${getAdminToken()}` }),
        },
        body: data,
      }).then(r => r.json());
    }
    return fetchAPI(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data), useAdminToken: true });
  },

  delete: (id: string) =>
    fetchAPI(`/blogs/${id}`, { method: 'DELETE', useAdminToken: true }),

  like: (blogId: string) =>
    fetchAPI('/blogs/like', { method: 'POST', body: JSON.stringify({ blogId }) }),

  getLikes: (id: string) =>
    fetchAPI(`/blogs/${id}/likes`, { method: 'GET' }),

  getScheduled: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/blogs/admin/scheduled${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET', useAdminToken: true });
  },

  publishScheduled: (id: string) =>
    fetchAPI(`/blogs/${id}/publish`, { method: 'POST', useAdminToken: true }),
};

// ==================== WISHLIST API ====================
export const wishlistAPI = {
  getPopular: () =>
    fetchAPI('/wishlist/admin/popular', { method: 'GET', useAdminToken: true }),
};

// ==================== OFFERS API ====================
export const offersAPI = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/offers${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET' });
  },

  getActive: () =>
    fetchAPI('/offers/active', { method: 'GET' }),

  getExpired: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchAPI(`/offers/admin/expired${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET', useAdminToken: true });
  },

  getById: (id: string) =>
    fetchAPI(`/offers/${id}`, { method: 'GET' }),

  create: (data: any) =>
    fetchAPI('/offers', { method: 'POST', body: JSON.stringify(data), useAdminToken: true }),

  update: (id: string, data: any) =>
    fetchAPI(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(data), useAdminToken: true }),

  delete: (id: string) =>
    fetchAPI(`/offers/${id}`, { method: 'DELETE', useAdminToken: true }),
};

// ==================== FEEDBACK API ====================
export const feedbackAPI = {
  create: (data: { name: string; email: string; message: string; type?: string; rating?: number }) =>
    fetchAPI('/feedback', { method: 'POST', body: JSON.stringify(data) }),

  getAll: (params?: { page?: number; limit?: number; type?: string; isRead?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.isRead !== undefined) query.append('isRead', String(params.isRead));

    return fetchAPI(`/feedback${query.toString() ? '?' + query.toString() : ''}`, { method: 'GET', useAdminToken: true });
  },

  getById: (id: string) =>
    fetchAPI(`/feedback/${id}`, { method: 'GET', useAdminToken: true }),

  update: (id: string, data: { priority?: string; response?: string }) =>
    fetchAPI(`/feedback/${id}`, { method: 'PUT', body: JSON.stringify(data), useAdminToken: true }),

  delete: (id: string) =>
    fetchAPI(`/feedback/${id}`, { method: 'DELETE', useAdminToken: true }),

  markAsRead: (id: string) =>
    fetchAPI(`/feedback/${id}/read`, { method: 'PATCH', useAdminToken: true }),

  getStats: () =>
    fetchAPI('/feedback/admin/stats', { method: 'GET', useAdminToken: true }),
};

// ==================== COMBINED API EXPORT ====================
export const api = {
  auth: authAPI,
  products: productsAPI,
  offers: offersAPI,
  orders: ordersAPI,
  blogs: blogsAPI,
  feedback: feedbackAPI,
  newsletter: {
    subscribe: (email: string) =>
      fetchAPI('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getCount: () =>
      fetchAPI('/newsletter/count', { method: 'GET', useAdminToken: true }),
    getSubscribers: (page?: number, limit?: number) => {
      const query = new URLSearchParams();
      if (page) query.append('page', page.toString());
      if (limit) query.append('limit', limit.toString());
      return fetchAPI(
        `/newsletter${query.toString() ? '?' + query.toString() : ''}`,
        { method: 'GET', useAdminToken: true }
      );
    },
  },
};

export default api;
