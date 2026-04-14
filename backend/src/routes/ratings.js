import express from 'express';
import {
  addOrUpdateRating,
  getProductRatings,
  getMyRating,
  deleteMyRating,
  getAllRatingsAdmin,
  toggleRatingVisibility,
  deleteRatingAdmin,
} from '../controllers/ratingController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── USER SIDE ────────────────────────────────
// Submit or update a rating (logged-in users only)
router.post('/', authMiddleware, addOrUpdateRating);

// Get all visible ratings for a product (public)
router.get('/product/:productId', getProductRatings);

// Get logged-in user's own rating for a product
router.get('/my/:productId', authMiddleware, getMyRating);

// Delete own rating
router.delete('/:productId', authMiddleware, deleteMyRating);

// ─── ADMIN SIDE ───────────────────────────────
// Get all ratings (admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllRatingsAdmin);

// Toggle rating visibility (approve/hide)
router.put('/admin/:id/visibility', authMiddleware, adminMiddleware, toggleRatingVisibility);

// Delete any rating
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteRatingAdmin);

export default router;
