# Frontend-Backend Integration Guide

## 📋 Overview

This guide shows how to connect your React admin components to the MongoDB backend API.

**Status**: Backend API is ready at `http://localhost:3000/api`
**Frontend API Service**: Created at `/src/app/services/api.ts`

---

## 🔌 Integration Phases

### Phase 1: ✅ Backend Ready (COMPLETE)
- ✅ Express server configured
- ✅ MongoDB models created
- ✅ API controllers implemented
- ✅ Routes configured

### Phase 2: 🔄 Setup (START HERE)
- [ ] Install dependencies in backend
- [ ] Configure .env file
- [ ] Start MongoDB
- [ ] Test backend connectivity

### Phase 3: 🔄 Frontend Integration (NEXT)
- [ ] Update Admin components to use API service
- [ ] Replace Context with API calls
- [ ] Handle loading/error states
- [ ] Test all CRUD operations

### Phase 4: ⏳ Features & Optimization
- [ ] Add authentication
- [ ] Implement file uploads
- [ ] Add error boundaries
- [ ] Performance optimization

---

## ⚙️ Step 1: Initialize Backend

### 1.1 Install Backend Dependencies
```bash
cd backend
npm install
```

### 1.2 Create .env File
```bash
# In backend/ folder, create .env:
MONGODB_URI=mongodb://localhost:27017/eco-commerce
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### 1.3 Start Backend Server
```bash
npm run dev
```

Expected output:
```
✅ MongoDB Connected
✅ Server running on port 3000
```

---

## 🔗 Step 2: Frontend API Service

The API service is already created at `/src/app/services/api.ts`

### 2.1 Usage Pattern

```typescript
import { api } from '@/services/api';

// Get all products
const products = await api.products.getAll();

// Create product
const newProduct = await api.products.create({
  name: 'Product Name',
  price: 299,
  image: 'https://...',
  category: 'personal-care',
  description: 'Description',
});

// Update product
const updated = await api.products.update(productId, {
  name: 'Updated Name',
  price: 399,
});

// Delete product
await api.products.delete(productId);
```

---

## 📦 Step 3: Update Admin Components

### Example: ProductManagement Component

**BEFORE (using Context):**
```typescript
import { useAdmin } from '@/context/AdminContext';

export function ProductManagement() {
  const { products, deleteProduct } = useAdmin();

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={() => deleteProduct(product.id)}
        />
      ))}
    </div>
  );
}
```

**AFTER (using API):**
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      setProducts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.products.delete(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          onDelete={() => handleDelete(product._id)}
        />
      ))}
    </div>
  );
}
```

---

## 🔄 Migration Checklist

### For Each Component that needs updating:

- [ ] Import API service: `import { api } from '@/services/api';`
- [ ] Add state for data: `const [data, setData] = useState([])`
- [ ] Add state for loading: `const [loading, setLoading] = useState(true)`
- [ ] Add state for error: `const [error, setError] = useState<string | null>(null)`
- [ ] Add useEffect for initial load
- [ ] Replace Create operations (POST)
- [ ] Replace Read operations (GET)
- [ ] Replace Update operations (PUT)
- [ ] Replace Delete operations (DELETE)
- [ ] Add error handling and user feedback
- [ ] Add loading indicators
- [ ] Test in browser

### Components to Update (Priority Order):

1. **ProductManagement.tsx** - Most critical, used on home page
   ```typescript
   // Replace: getAll() calls
   // Replace: create/update/delete operations
   ```

2. **OfferManagement.tsx** - Used in offers section
   ```typescript
   // Replace: getAll() calls
   // Replace: getActive() for frontend display
   ```

3. **BlogManagement.tsx** - Used in blog section
   ```typescript
   // Replace: getAll() calls
   // Replace: publish/schedule operations
   ```

4. **FeedbackManagement.tsx** - Admin feedback viewing
   ```typescript
   // Replace: getAll() calls
   // Replace: respond() operations
   ```

5. **Add*Form.tsx files** - For creating new items
   ```typescript
   // Replace: submit handlers
   // Call appropriate create/update APIs
   ```

---

## 📝 API Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data?: any;           // Returned data (array or object)
  count?: number;       // For list operations
  message?: string;     // Success/error message
  error?: string;       // Error details
}
```

### Examples:

**Success Response:**
```json
{
  "success": true,
  "data": [
    { "_id": "123", "name": "Product 1", "price": 299 },
    { "_id": "456", "name": "Product 2", "price": 399 }
  ],
  "count": 2
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Product not found",
  "message": "Could not retrieve product"
}
```

---

## 📊 API Endpoints Reference

### Products

```typescript
// Get all products
const response = await api.products.getAll();
// Returns: {success, data: [products], count}

// Get by ID
const product = await api.products.getById('productId');
// Returns: {success, data: product}

// Get by category
const products = await api.products.getByCategory('personal-care');
// Returns: {success, data: [products], count}

// Create
const newProduct = await api.products.create({
  name: 'Product Name',
  price: 299,
  image: 'https://...',
  category: 'personal-care',
  description: 'Description',
  inStock: true,
  quantity: 50
});
// Returns: {success, data: newProduct}

// Update
const updated = await api.products.update('productId', {
  name: 'Updated Name',
  price: 399
});
// Returns: {success, data: updatedProduct}

// Delete
await api.products.delete('productId');
// Returns: {success, message: 'Product deleted'}
```

### Offers

```typescript
// Get all offers
const offers = await api.offers.getAll();

// Get active offers (frontend)
const activeOffers = await api.offers.getActive();

// Create offer
const offer = await api.offers.create({
  title: 'Summer Sale',
  description: 'Get 30% off',
  discount: 30,
  validFrom: '2026-03-01',
  validTo: '2026-03-31',
  applicableCategories: ['personal-care'],
  isActive: true
});

// Update & Delete similar to products
```

### Blogs

```typescript
// Get all blogs
const allBlogs = await api.blogs.getAll();

// Get published only (frontend)
const published = await api.blogs.getPublished();

// Create blog
const blog = await api.blogs.create({
  title: 'Blog Title',
  description: 'Blog content',
  videoUrl: 'https://vimeo.com/...',
  thumbnailImage: 'https://...',
  isPublished: false,
  isScheduled: true,
  scheduledDate: '2026-03-15'
});

// Publish scheduled blog
await api.blogs.publish('blogId');

// Update & Delete similar to products
```

### Feedback

```typescript
// Get all feedback (admin)
const feedback = await api.feedback.getAll();

// Get unread count
const count = await api.feedback.getUnreadCount();
// Returns: {success, data: {count: 5}}

// Submit feedback (public)
await api.feedback.submit({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Great products!',
  type: 'suggestion'
});

// Mark as read
await api.feedback.markAsRead('feedbackId');

// Add admin response
await api.feedback.respond('feedbackId', {
  response: 'Thank you for your feedback!',
  respondedBy: 'Admin Name'
});

// Delete
await api.feedback.delete('feedbackId');
```

---

## 🛠️ Error Handling Pattern

```typescript
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await api.products.create(formData);
    
    if (result.success) {
      // Show success toast
      toast.success('Product created successfully!');
      // Refresh list
      await loadProducts();
      // Close modal
      setOpen(false);
    } else {
      setError(result.error || 'Failed to create product');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testing Integration

### Test 1: Backend Connectivity
```bash
# In terminal, send a test request
curl http://localhost:3000/api/products

# Should return:
# {"success":true,"data":[],"count":0}
```

### Test 2: Frontend API Service
```typescript
// In browser console:
import { api } from '/src/app/services/api.ts';
const products = await api.products.getAll();
console.log(products);
```

### Test 3: Create Product via Admin
1. Open admin panel at `/admin`
2. Go to Products tab
3. Click "Add Product"
4. Fill form and submit
5. Check if product appears in list
6. Check MongoDB: should have new document

### Test 4: Create and Publish Blog
1. Go to Blogs tab
2. Click "Add Blog"
3. Fill title, description, upload video
4. Click "Publish Immediately"
5. Blog should appear in Published list
6. Check MongoDB blogs collection

---

## 🔐 Future: Authentication

Once you're ready to add authentication:

```typescript
// Add to api.ts
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => {
    localStorage.removeItem('token');
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },
};

// Update fetchAPI to include token
function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  // ... rest of function
}
```

---

## 📱 Database Field Mapping

Frontend forms should map to backend fields:

```typescript
// Frontend form state
const formData = {
  productName: 'Organic Toothbrush',
  productPrice: 299,
  productImage: 'https://...',
  category: 'personal-care',
};

// Backend API expects
const apiPayload = {
  name: formData.productName,
  price: formData.productPrice,
  image: formData.productImage,
  category: formData.category,
  description: '',
  inStock: true,
  quantity: 100,
};

// Send to backend
await api.products.create(apiPayload);
```

---

## 📚 Next Steps

1. **Start Backend**: `npm run dev` in backend folder
2. **Test Connectivity**: Verify API returns data
3. **Update ProductManagement.tsx** first (foundation)
4. **Update OfferManagement.tsx**
5. **Update BlogManagement.tsx**
6. **Update FeedbackManagement.tsx**
7. **Add error boundaries** for better UX
8. **Add authentication** when ready
9. **Setup file uploads** for videos/images
10. **Deploy to production**

---

## 📞 Troubleshooting

### API Returns 404
- [ ] Backend server is running on port 3000
- [ ] Check endpoint path is correct
- [ ] Verify API_BASE_URL in api.ts

### CORS Error
- [ ] Check CORS_ORIGIN in backend .env matches frontend URL
- [ ] Restart backend after changing .env

### Empty Response
- [ ] MongoDB is running
- [ ] Database connection successful
- [ ] Check MongoDB has data

### Timeout Errors
- [ ] Check network connectivity
- [ ] Verify backend is running
- [ ] Check database performance

---

**Happy Integrating! 🚀**

For more help, check:
- [Backend Setup Guide](./BACKEND_SETUP.md)
- [API Service Implementation](../src/app/services/api.ts)

*Last Updated: February 23, 2026*
