import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import initAdminUser from './config/initAdmin.js';
import { setupBlogScheduler } from './services/blogScheduler.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import offerRoutes from './routes/offers.js';
import blogRoutes from './routes/blogs.js';
import feedbackRoutes from './routes/feedback.js';
import orderRoutes from './routes/orders.js';
import newsletterRoutes from './routes/newsletter.js';
import ratingRoutes from './routes/ratings.js';
import wishlistRoutes from './routes/wishlist.js';
import loginActivityRoutes from './routes/loginActivity.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Allow frontend running on any localhost port (Vite may change ports)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients or same-origin
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/activity', loginActivityRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

// Start server only after MongoDB connection is established
const startServer = async () => {
  try {
    await connectDB();

    // Ensure initial admin user exists
    await initAdminUser();

    // Setup blog scheduler after DB is ready
    setupBlogScheduler();

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🌍 Eco-Commerce Backend Server  🌍   ║
╚════════════════════════════════════════╝
✅ Server running on port ${PORT}
✅ Environment: ${process.env.NODE_ENV || 'development'}
✅ MongoDB: Connected
✅ Blog Scheduler: Initialized
📝 API Documentation:
   - Auth: http://localhost:${PORT}/api/auth
   - Products: http://localhost:${PORT}/api/products
   - Offers: http://localhost:${PORT}/api/offers
   - Blogs: http://localhost:${PORT}/api/blogs
   - Feedback: http://localhost:${PORT}/api/feedback
   - Orders: http://localhost:${PORT}/api/orders
   - Ratings: http://localhost:${PORT}/api/ratings
   - Wishlist: http://localhost:${PORT}/api/wishlist
   - Activity: http://localhost:${PORT}/api/activity
   - Health: http://localhost:${PORT}/health
`);
    });

    // Handle server-level errors (like EADDRINUSE) gracefully
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
