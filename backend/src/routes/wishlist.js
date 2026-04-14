import express from 'express';
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getAllWishlistsAdmin,
  getMostWishlistedProducts,
} from '../controllers/wishlistController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── USER SIDE ────────────────────────────────
// Get my wishlist
router.get('/', authMiddleware, getMyWishlist);

// Add product to wishlist
router.post('/add', authMiddleware, addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', authMiddleware, removeFromWishlist);

// Clear entire wishlist
router.delete('/clear', authMiddleware, clearWishlist);

// ─── ADMIN SIDE ───────────────────────────────
// View all users' wishlists
router.get('/admin/all', authMiddleware, adminMiddleware, getAllWishlistsAdmin);

// Most wishlisted products analytics
router.get('/admin/popular', authMiddleware, adminMiddleware, getMostWishlistedProducts);

export default router;
