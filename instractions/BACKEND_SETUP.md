# MongoDB Backend Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Environment Variables
Create a `.env` file in the `backend` folder (copy from `.env.example`):
```bash
MONGODB_URI=mongodb://localhost:27017/eco-commerce
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start MongoDB
**Option A: Local MongoDB**
```bash
# Windows (if you have MongoDB installed)
mongod

# Or use MongoDB Community Edition
# Download from: https://docs.mongodb.com/manual/installation/
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/eco-commerce?retryWrites=true&w=majority
```

### Step 4: Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
✅ Server running on port 3000
```

---

## 📋 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Products
```
GET    /products              - Get all products
GET    /products/:id          - Get single product
GET    /products/category/:category - Get products by category
POST   /products              - Create product
PUT    /products/:id          - Update product
DELETE /products/:id          - Delete product
```

### Offers
```
GET    /offers                - Get all offers
GET    /offers/active         - Get active offers only
GET    /offers/:id            - Get single offer
POST   /offers                - Create offer
PUT    /offers/:id            - Update offer
DELETE /offers/:id            - Delete offer
```

### Blogs
```
GET    /blogs                 - Get all blogs (with filters)
GET    /blogs/published       - Get published blogs
GET    /blogs/:id             - Get single blog
POST   /blogs                 - Create blog
PUT    /blogs/:id             - Update blog
PATCH  /blogs/:id/publish     - Publish scheduled blog
DELETE /blogs/:id             - Delete blog
```

### Feedback
```
GET    /feedback              - Get all feedback
GET    /feedback/unread-count - Get unread count
GET    /feedback/:id          - Get single feedback
POST   /feedback              - Submit feedback (public)
PATCH  /feedback/:id/read     - Mark as read
PATCH  /feedback/:id/respond  - Add response to feedback
DELETE /feedback/:id          - Delete feedback
```

---

## 📊 Database Collections

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  price: Number (required),
  image: String (required),
  category: String (required, enum),
  description: String,
  inStock: Boolean,
  quantity: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Offers Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  discount: Number (0-100, required),
  validFrom: Date (required),
  validTo: Date (required),
  applicableCategories: [String],
  isActive: Boolean,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Blogs Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  videoUrl: String,
  videoFileName: String,
  thumbnailImage: String,
  thumbnailFileName: String,
  scheduledDate: Date,
  publishedDate: Date,
  isPublished: Boolean,
  isScheduled: Boolean,
  views: Number,
  author: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required),
  message: String (required),
  type: String (enum: ['suggestion', 'bug', 'feature-request', 'general']),
  isRead: Boolean,
  priority: String (enum: ['low', 'medium', 'high']),
  response: String,
  respondedAt: Date,
  respondedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Frontend Integration

Update your frontend `.env.example` (in the root frontend folder):
```
VITE_API_URL=http://localhost:3000/api
```

Update React services to use the API:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  products: {
    getAll: () => fetch(`${API_BASE}/products`).then(r => r.json()),
    create: (data) => fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    // ... etc
  }
};
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          (MongoDB connection)
│   ├── models/
│   │   ├── Product.js
│   │   ├── Offer.js
│   │   ├── Blog.js
│   │   └── Feedback.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── offerController.js
│   │   ├── blogController.js
│   │   └── feedbackController.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── offers.js
│   │   ├── blogs.js
│   │   └── feedback.js
│   └── server.js                (Main server file)
├── .env.example                 (Environment variables template)
├── package.json
└── README.md
```

---

## 🧪 Testing API Endpoints

### Using cURL
```bash
# Get all products
curl http://localhost:3000/api/products

# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Toothbrush",
    "price": 299,
    "image": "https://...",
    "category": "personal-care",
    "description": "Eco-friendly bamboo toothbrush"
  }'
```

### Using Postman
1. Import the collection (coming soon)
2. Create requests for each endpoint
3. Test all operations

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create requests in VS Code
3. Test directly from editor

---

## 🔒 Security Best Practices

### TODO (For Production):
- [ ] Add JWT authentication
- [ ] Add rate limiting
- [ ] Add input validation & sanitization
- [ ] Add error logging
- [ ] Use HTTPS
- [ ] Add CSRF protection
- [ ] Implement API versioning
- [ ] Add request/response logging
- [ ] Setup database backups
- [ ] Add environment-specific configs

---

## 📝 Example Requests

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bamboo Toothbrush Set",
    "price": 299,
    "image": "https://images.unsplash.com/...",
    "category": "personal-care",
    "description": "Set of 4 eco-friendly toothbrushes"
  }'
```

### Create Offer
```bash
curl -X POST http://localhost:3000/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale - 30% Off",
    "description": "Get 30% discount on personal care products",
    "discount": 30,
    "validFrom": "2026-03-01",
    "validTo": "2026-03-31",
    "applicableCategories": ["personal-care", "soap-bars"],
    "isActive": true
  }'
```

### Submit Feedback
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Great products! Would love to see more sustainable options.",
    "type": "suggestion"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem**: `Error connecting to MongoDB`
**Solution**:
1. Check if MongoDB is running
2. Verify connection string in .env
3. Check MongoDB authentication (if using Atlas)
4. Check network connectivity

### CORS Error
**Problem**: `Access to XMLHttpRequest blocked by CORS`
**Solution**:
1. Check CORS_ORIGIN in .env
2. Ensure frontend URL matches CORS_ORIGIN
3. Restart backend server

### Port Already in Use
**Problem**: `Error: listen EADDRINUSE :::3000`
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux
lsof -i :3000
kill -9 [PID]
```

### Request Size Too Large
**Problem**: `413 Payload Too Large`
**Solution**: Increase limit in server.js
```javascript
app.use(express.json({ limit: '50mb' }));
```

---

## 📚 Resources

- MongoDB Documentation: https://docs.mongodb.com
- Express.js Guide: https://expressjs.com
- Mongoose ORM: https://mongoosejs.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- REST API Best Practices: https://restfulapi.net

---

## ✅ Deployment Checklist

- [ ] Test all API endpoints locally
- [ ] Update environment variables
- [ ] Setup MongoDB Atlas (or hosted MongoDB)
- [ ] Configure production CORS settings
- [ ] Add authentication (JWT)
- [ ] Setup error logging
- [ ] Add request validation
- [ ] Setup API rate limiting
- [ ] Configure backups
- [ ] Deploy to Heroku/AWS/Azure
- [ ] Test endpoints on production
- [ ] Setup monitoring & alerts
- [ ] Document API endpoints
- [ ] Create API key management

---

**Backend Setup Complete!** 🎉

Your MongoDB backend is ready to serve the frontend admin panel and website.

*Last Updated: February 23, 2026*
