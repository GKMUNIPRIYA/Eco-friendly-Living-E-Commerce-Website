# ⚡ Quick Developer Reference Guide

## 🚀 Starting the Project

### Terminal 1 - Backend Server
```bash
cd backend
npm install  # First time only
npm run dev  # Starts on http://localhost:3000
```

### Terminal 2 - Frontend Server
```bash
# From root directory
npm install  # First time only
npm run dev  # Starts on http://localhost:5173
```

## 🔑 Key Files & Locations

### Backend Structure
```
backend/
├── src/
│   ├── server.js                 # Main server file
│   ├── config/database.js        # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── blogController.js
│   │   ├── offerController.js
│   │   └── feedbackController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── multer.js
│   ├── models/                   # Database schemas
│   ├── routes/                   # API routes
│   ├── services/
│   │   ├── emailService.js
│   │   ├── tokenService.js
│   │   └── blogScheduler.js
│   └── uploads/                  # File storage
├── .env                          # Environment config
└── package.json
```

### Frontend Structure
```
src/
├── app/
│   ├── components/               # UI Components
│   ├── context/                  # State management
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/                    # Page components
│   ├── services/
│   │   └── api.ts               # API integration
│   ├── App.tsx
│   └── routes.ts                # Route definitions
├── styles/                       # CSS files
└── main.tsx
```

## 📡 Common API Calls

### Authentication
```javascript
// Register
import { authAPI } from '@/services/api';
authAPI.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'Password123',
  confirmPassword: 'Password123'
});

// Login
authAPI.login({
  email: 'john@example.com',
  password: 'Password123'
});

// Get Profile
authAPI.getProfile();
```

### Products
```javascript
import { productsAPI } from '@/services/api';

// Get all products
productsAPI.getAll({ category: 'soap-bars', page: 1, limit: 10 });

// Get single product
productsAPI.getById('productId');

// By category
productsAPI.getByCategory('personal-care');
```

### Orders
```javascript
import { ordersAPI } from '@/services/api';

// Create order
ordersAPI.create({
  products: [...],
  customerInfo: {...},
  paymentInfo: {...}
});

// Get user orders
ordersAPI.getUserOrders();

// Get all orders (admin)
ordersAPI.getAllOrders({ status: 'pending' });
```

### Blogs
```javascript
import { blogsAPI } from '@/services/api';

// Get blogs
blogsAPI.getAll({ page: 1 });

// Like blog
blogsAPI.like(blogId);

// Create blog (admin)
const formData = new FormData();
formData.append('title', 'Blog Title');
formData.append('description', 'Description');
formData.append('video', videoFile);
blogsAPI.create(formData);
```

## 🔐 Authentication Usage

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

## 🛒 Cart Usage

```typescript
import { useCart } from '@/context/CartContext';

function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart();

  return (
    <div>
      <p>Total: ${total}</p>
      <button onClick={() => addToCart(product)}>Add Item</button>
    </div>
  );
}
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Required
MONGODB_URI=mongodb://localhost:27017/eco-commerce
JWT_SECRET=your_secret_key
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Optional
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📝 Common Tasks

### Adding a New Product (Admin)
```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', 29.99);
formData.append('category', 'soap-bars');
formData.append('description', 'Description');
formData.append('image', imageFile);

productsAPI.create(formData);
```

### Scheduling a Blog
```javascript
const blogData = {
  title: 'Eco Tips',
  description: 'Learn about sustainable living',
  videoUrl: 'https://youtube.com/...',
  scheduledDate: '2026-03-01T10:00:00'
};

blogsAPI.create(blogData);
```

### Creating an Offer
```javascript
offersAPI.create({
  title: 'Spring Sale',
  discount: 20,
  validFrom: '2026-03-01',
  validTo: '2026-03-31',
  applicableCategories: ['soap-bars', 'personal-care']
});
```

## 🐛 Debugging

### Check Backend Logs
```bash
# Terminal shows all API requests and errors
# Look for: 
# - Connection errors
# - Route not found (404)
# - Validation errors (400)
# - Server errors (500)
```

### Check Network Requests
```javascript
// Open browser DevTools (F12)
// Go to Network tab
// Check request/response headers and body
```

### Test API Directly
```bash
# Using curl
curl -X GET http://localhost:3000/api/products

# Using Postman
# Create request to http://localhost:3000/api/products
```

## 📊 Admin Endpoints

```
All admin endpoints require:
Authorization: Bearer <token>
And user role must be 'admin'

Products
- POST /api/products               Create
- PUT /api/products/:id            Update
- DELETE /api/products/:id         Delete
- PUT /api/products/:id/quantity   Update qty

Blogs
- POST /api/blogs                  Create
- PUT /api/blogs/:id               Update
- DELETE /api/blogs/:id            Delete
- POST /api/blogs/:id/publish      Publish scheduled
- GET /api/blogs/admin/scheduled   Get scheduled

Offers
- POST /api/offers                 Create
- PUT /api/offers/:id              Update
- DELETE /api/offers/:id           Delete

Orders
- GET /api/orders/admin/all        Get all
- PUT /api/orders/:id/status       Update status

Feedback
- GET /api/feedback                Get all
- PUT /api/feedback/:id            Update
- DELETE /api/feedback/:id         Delete
- GET /api/feedback/admin/stats    Get stats
```

## 🎯 Useful Commands

```bash
# Backend
npm run dev              # Start dev server
npm run start            # Start production server

# Frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run typecheck        # Check TypeScript types

# MongoDB
mongod                   # Start MongoDB (Windows)
brew services start mongodb-community  # macOS
```

## 💡 Tips & Tricks

1. **Always verify auth token exists before making protected API calls**
2. **Use FormData for file uploads**
3. **Check console for API errors in browser dev tools**
4. **MongoDB runs on port 27017 by default**
5. **Backends serve uploads from /uploads path**
6. **Blog deletion runs hourly - check server logs**
7. **Test emails are logged in console if SMTP fails**

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **MongoDB connection fails** | Ensure mongod is running: `mongod` |
| **API returns 401** | Check if token is stored in localStorage |
| **Cannot upload files** | Verify uploads folder exists: `backend/uploads/` |
| **Email not sending** | Check SMTP credentials in .env |
| **Port already in use** | Kill process: `lsof -i :3000 \| kill -9` |
| **CORS errors** | Verify CORS_ORIGIN in backend .env |

---

**Happy Coding! 🚀**
