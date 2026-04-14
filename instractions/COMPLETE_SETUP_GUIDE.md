# 🌍 Eco-Friendly E-Commerce Website - Complete Setup Guide

This is a comprehensive setup guide for the **Eco-Friendly Living E-Commerce Website** with automated blog system.

## 📋 Project Overview

This is a **full-stack web application** with:
- **Frontend**: React.js + TypeScript with Vite
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Authentication**: JWT-based
- **Email**: Nodemailer
- **Blog Automation**: Node Cron for scheduling

## 🎯 Key Features

✅ User Authentication & Authorization
✅ Product Management & Shopping Cart
✅ Order Management
✅ Admin Dashboard
✅ Automated Blog Publishing & Deletion
✅ Blog Likes & Comments
✅ Discount Management
✅ Email Notifications
✅ Feedback System

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas)
- **npm** or **yarn**

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the .env template from backend/.env and update with your settings

# Start the backend server
npm run dev
```

**Backend will run on**: `http://localhost:3000`

### 2. Frontend Setup

```bash
# From root directory
npm install

# Start the dev server
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

---

## 📁 Project Structure

```
eco-commerce/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Server entry point
│   ├── uploads/             # File storage
│   ├── .env                 # Environment variables
│   └── package.json
│
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (Auth, Cart)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.tsx
│   │   └── routes.ts
│   ├── styles/              # Global styles
│   └── main.tsx
│
├── .env                     # Frontend env variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eco-commerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Eco-Friendly Living
```

---

## 💾 MongoDB Setup

### Local MongoDB

1. **Install MongoDB Community**: [Download](https://www.mongodb.com/try/download/community)
2. **Run MongoDB**: 
   ```bash
   # Windows
   mongod
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. **Database will be**: `mongodb://localhost:27017/eco-commerce`

### Using MongoDB Atlas (Recommended for Production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/eco-commerce`
4. Update `MONGODB_URI` in `.env`

---

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication** in Gmail
2. **Generate App Password**:
   - Go to Google Account → Security
   - Select App Passwords
   - Choose Mail and Windows Computer
   - Copy the generated password
3. **Update .env**:
   ```env
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=generated_app_password
   ```

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get by category
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/admin/all` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update status (admin)

### Blogs
- `GET /api/blogs` - Get all published blogs
- `GET /api/blogs/:id` - Get single blog
- `POST /api/blogs` - Create blog (admin)
- `PUT /api/blogs/:id` - Update blog (admin)
- `DELETE /api/blogs/:id` - Delete blog (admin)
- `POST /api/blogs/like` - Like blog (auth required)
- `GET /api/blogs/:id/likes` - Get like count

### Offers
- `GET /api/offers` - Get all offers
- `GET /api/offers/active` - Get active offers only
- `GET /api/offers/admin/expired` - Get expired offers (admin)
- `POST /api/offers` - Create offer (admin)
- `PUT /api/offers/:id` - Update offer (admin)
- `DELETE /api/offers/:id` - Delete offer (admin)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin)
- `GET /api/feedback/:id` - Get feedback details (admin)
- `PUT /api/feedback/:id` - Update feedback (admin)
- `DELETE /api/feedback/:id` - Delete feedback (admin)

---

## 🛠️ Admin Panel Features

### Product Management
- Add/Edit/Delete products
- Manage categories
- Upload product images
- Set stock quantity
- Manage inventory

### Discount & Offers
- Create percentage or fixed discounts
- Set offer validity period
- Automatic discount expiration
- View expired offers

### Blog Management
- Create blog posts with videos
- Schedule blog publication
- Automatic blog deletion after 30 days
- View publish/delete dates
- Manual blog deletion

### Order Management
- View all orders
- Filter by status
- Track order details
- Update order status
- Cancel orders

### Feedback Management
- View customer feedback
- Mark as read/unread
- Prioritize feedback
- Respond to feedback
- View feedback statistics

---

## 🧪 Testing the Application

### 1. User Registration & Login
```bash
POST http://localhost:3000/api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

### 2. Get Products
```bash
GET http://localhost:3000/api/products
```

### 3. Create Order
```bash
POST http://localhost:3000/api/orders
{
  "products": [
    {
      "productId": "...",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 1,
      "subtotal": 29.99
    }
  ],
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123456789",
    "address": {...}
  }
}
```

---

## 📚 Important Notes

### Blog Automation
- Blogs are **automatically published** on their scheduled date
- Blogs are **automatically deleted** 30 days after publication
- Check scheduler logs for publishing events
- Setup runs every minute for publishing, every hour for deletion

### Security
- Passwords are hashed with bcryptjs
- JWT tokens expire in 7 days
- Always use HTTPS in production
- Never commit .env files

### File Uploads
- Images: Max 10MB (JPEG, PNG, GIF, WebP)
- Videos: Max 100MB (MP4, MPEG, MOV, AVI)
- Files stored in `backend/uploads/`

---

## 🚀 Production Deployment

### Frontend (Vercel)

```bash
# Build the frontend
npm run build

# Deploy to Vercel
vercel
```

### Backend (Railway/Render)

1. Create account on [Railway](https://railway.app) or [Render](https://render.com)
2. Connect your GitHub repository
3. Set environment variables
4. Deploy!

---

## 📞 Support & Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify firewall settings

### Email Not Sending
- Enable "Less secure app access" in Gmail (if not using App Password)
- Check SMTP credentials
- Look for error logs in terminal

### CORS Errors
- Verify CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

---

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📄 License

This project is licensed under the ISC License.

---

## 🎉 You're All Set!

Your Eco-Friendly E-Commerce Website is ready to run. Start the backend and frontend servers and begin shopping sustainably!

**Questions?** Check the project documentation or reach out to the development team.
