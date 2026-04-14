# 🚀 Complete Setup & Getting Started Guide

Welcome! This guide will help you get the entire e-commerce system up and running.

---

## 📋 Quick Overview

Your project has:
- ✅ **Frontend**: React admin dashboard with Tailwind CSS (already built)
- ✅ **Backend**: Node.js/Express with MongoDB (ready to start)
- ✅ **Database**: MongoDB schemas & models (ready to connect)
- ✅ **API Service**: TypeScript client ready to use

**What you need to do:**
1. Setup MongoDB
2. Start backend server
3. Connect frontend to backend
4. Test everything

---

## 🔧 STEP 1: Setup MongoDB

### Option A: Local MongoDB (Recommended for Development)

#### Windows Users:
1. Download [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Run installer with default settings
3. MongoDB will start automatically as a service
4. Verify it's running: Open `C:\Program Files\MongoDB\Server\[version]\bin\mongod`

#### macOS Users:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux Users (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option B: MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account and verify email
4. Create a new project
5. Create a cluster (free tier available)
6. Get connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `username`, `password`, `dbname`

---

## ⚙️ STEP 2: Configure Backend

### 2.1 Install Dependencies
```bash
cd backend
npm install
```

Expected: No errors, takes 1-2 minutes

### 2.2 Create Environment File

Create `.env` file in `backend/` folder:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/eco-commerce
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here_12345
CORS_ORIGIN=http://localhost:5173
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/eco-commerce?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here_12345
CORS_ORIGIN=http://localhost:5173
```

### 2.3 Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: localhost
✅ Server running on port 3000
```

**If you see errors:**
- MongoDB not running? Start it first
- Wrong connection string? Double-check `.env`
- Port in use? Change PORT to 3001 in `.env`

---

## ▶️ STEP 3: Start Frontend

### 3.1 Install Dependencies (if not done)
```bash
# In root directory (not backend/)
npm install
```

### 3.2 Start Vite Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ STEP 4: Verify Everything Works

### 4.1 Open Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3000 (API only)

### 4.2 Test Admin Panel
1. Click ⚙️ icon in header
2. Go to `/admin`
3. You should see Dashboard with 4 tabs

### 4.3 Test API Connectivity
Open browser console (F12) and run:
```javascript
// Test API connection
fetch('http://localhost:3000/api/products')
  .then(r => r.json())
  .then(data => console.log('✅ Backend working!', data))
  .catch(err => console.error('❌ Backend error:', err));
```

### 4.4 Create Test Product
1. In admin panel, click Products tab
2. Click "Add Product"
3. Fill form:
   - Name: "Test Product"
   - Price: 299
   - Category: "personal-care"
   - Image: (any valid URL or leave default)
   - Description: "Test"
4. Click "Add Product"

**After submitting:**
- Product should appear in list
- Open MongoDB Compass or `mongo` CLI
- Check `eco-commerce.products` collection
- Should see your new product there

---

## 📁 Project Structure

```
root/
├── src/                          # Frontend (React)
│   ├── app/
│   │   ├── pages/Admin.tsx      # Main admin dashboard
│   │   ├── services/api.ts      # API service (NEW - use this!)
│   │   ├── context/AdminContext # State management
│   │   ├── components/              # UI components
│   │   └── data/products.ts     # Sample data
│   └── main.tsx
├── backend/                       # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── server.js            # Main Express app
│   │   ├── config/database.js   # MongoDB connection
│   │   ├── models/              # Mongoose schemas
│   │   ├── controllers/          # Business logic
│   │   └── routes/              # API endpoints
│   ├── .env                     # Your config (CREATE THIS)
│   ├── .env.example             # Template
│   └── package.json
├── BACKEND_SETUP.md             # Backend guide
├── FRONTEND_INTEGRATION.md      # How to connect frontend to backend
├── GETTING_STARTED.md           # This file
└── package.json
```

---

## 🎯 Common Tasks

### Add a New Product via API
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bamboo Toothbrush",
    "price": 299,
    "image": "https://images.unsplash.com/...",
    "category": "personal-care",
    "description": "Eco-friendly toothbrush"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Delete a Product
```bash
curl -X DELETE http://localhost:3000/api/products/[PRODUCT_ID]
```

### View MongoDB Data

**Using MongoDB CLI:**
```bash
mongo
# Then:
use eco-commerce
db.products.find()
```

**Using MongoDB Compass (GUI):**
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse collections

---

## 🔌 Frontend-Backend Integration Status

### Current Status:
- ✅ Backend API: Ready
- ✅ Frontend UI: Ready
- 🔄 Integration: Needs updating

### What Needs to Happen:
The admin components currently use local React Context (temporary storage).
They need to be updated to use the API service (`/src/app/services/api.ts`).

### Example Migration (for ProductManagement.tsx):

**OLD (Local Context):**
```typescript
import { useAdmin } from '@/context/AdminContext';

const { products, deleteProduct } = useAdmin();
```

**NEW (Backend API):**
```typescript
import { api } from '@/services/api';

const [products, setProducts] = useState([]);
useEffect(() => {
  api.products.getAll().then(r => setProducts(r.data));
}, []);
```

See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for detailed instructions.

---

## 📊 API Reference Quick Start

### Products
```typescript
import { api } from '@/services/api';

// Get all
const all = await api.products.getAll();

// Get one
const one = await api.products.getById('id');

// Create
const created = await api.products.create({
  name: 'Product',
  price: 299,
  image: 'url',
  category: 'personal-care'
});

// Update
const updated = await api.products.update('id', {name: 'New'});

// Delete
await api.products.delete('id');
```

### Offers
```typescript
// Get active offers
const active = await api.offers.getActive();

// Create
const offer = await api.offers.create({
  title: 'Sale',
  discount: 30,
  validFrom: '2026-03-01',
  validTo: '2026-03-31'
});
```

### Blogs
```typescript
// Get published (for website)
const published = await api.blogs.getPublished();

// Get all (admin)
const all = await api.blogs.getAll();

// Create & schedule
const blog = await api.blogs.create({
  title: 'Blog',
  isScheduled: true,
  scheduledDate: '2026-03-15'
});

// Publish scheduled blog
await api.blogs.publish('blogId');
```

### Feedback
```typescript
// Submit (anyone can)
await api.feedback.submit({
  name: 'John',
  email: 'john@email.com',
  message: 'Great!',
  type: 'suggestion'
});

// Get all (admin)
const all = await api.feedback.getAll();

// Respond (admin)
await api.feedback.respond('feedbackId', {
  response: 'Thank you!',
  respondedBy: 'Admin'
});
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```
Error: Error connecting to MongoDB
```
**Fix:**
1. Is MongoDB running? Check status
2. Is connection string correct in `.env`?
3. Try: `mongod --version` to verify installation

### API Returns Empty
```
{"success":true,"data":[],"count":0}
```
**Expected!** Database is empty. Add data via admin panel first.

### CORS Error in Console
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Fix:**
1. Check `CORS_ORIGIN` in backend `.env` matches your frontend URL
2. Restart backend: Stop and run `npm run dev` again

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Fix:**
- Windows: Change PORT in `.env` to 3001
- Or kill process: `netstat -ano | findstr :3000` then `taskkill /PID [number] /F`

### Frontend Shows "Loading..." Forever
**Check:**
1. Is backend running? http://localhost:3000/api/products
2. Browser console for errors (F12)
3. Network tab to see failed requests

---

## 📚 Available Commands

### Frontend
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

### Backend
```bash
npm run dev      # Start with auto-reload (port 3000)
npm start        # Start production
npm test         # Run tests (not yet configured)
```

---

## 🎓 Learning Path

1. **Get it running** (you are here)
2. **Explore admin panel** - Click around, understand features
3. **Test API endpoints** - Use curl or Postman
4. **Connect frontend to backend** - Use FRONTEND_INTEGRATION.md
5. **Add authentication** - Secure admin access
6. **Deploy** - Put on internet

---

## 📱 Features Overview

### Admin Panel (`/admin`)
- ✅ Dashboard with stats
- ✅ Product management (add/edit/delete)
- ✅ Offer creation & scheduling
- ✅ Blog with video upload & scheduling
- ✅ User feedback collection & responses
- ✅ Tab-based interface
- ✅ Responsive design

### Public Website Features
- ✅ Product catalog
- ✅ Categories
- ✅ Shopping cart
- ✅ Checkout
- ✅ Product details
- ✅ Feedback form (💬 icon in header)
- ✅ Blog section

### Backend Features
- ✅ MongoDB data persistence
- ✅ RESTful API
- ✅ CRUD operations for all entities
- ✅ Date-based offer filtering
- ✅ Blog scheduling with publishing
- ✅ Feedback management system
- ✅ File upload ready (configure S3/Cloudinary)
- ✅ Error handling
- ✅ CORS configured

---

## 🚀 Next Steps After Setup

1. **Explore the admin panel** at `/admin`
2. **Add some sample products** to database
3. **Create a test offer** with discounts
4. **Upload a blog** with video
5. **Submit feedback** using the 💬 icon
6. **Integrate frontend** to use backend API (see FRONTEND_INTEGRATION.md)
7. **Add authentication** to secure admin panel
8. **Deploy** to production

---

## 💡 Tips

- **Save Postman collection** of all API endpoints for testing
- **Keep `.env` file private** - never commit to git
- **Use MongoDB Compass** for easy data viewing
- **Check browser console** (F12) for JavaScript errors
- **Use network tab** to debug API issues
- **Read error messages carefully** - they usually point to solution

---

## 📞 Support Resources

- **MongoDB**: https://docs.mongodb.com
- **Express.js**: https://expressjs.com
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Mongoose**: https://mongoosejs.com

---

## ✨ Summary

```
┌─────────────────────────────────────────┐
│         SETUP CHECKLIST                 │
├─────────────────────────────────────────┤
│ ☐ Install MongoDB                       │
│ ☐ npm install in /backend               │
│ ☐ Create .env file in /backend          │
│ ☐ Start MongoDB service                 │
│ ☐ Run: npm run dev (in /backend)        │
│ ☐ Run: npm run dev (in root)            │
│ ☐ Open http://localhost:5173            │
│ ☐ Test admin panel at /admin            │
│ ☐ Create test product                   │
│ ☐ Verify MongoDB has data               │
└─────────────────────────────────────────┘
```

**You're all set! Start building! 🎉**

---

**Last Updated**: February 23, 2026  
**Version**: 1.0  
**Status**: Ready for Development
