import express from 'express';
import {
  getMyActivity,
  getAllActivityAdmin,
  getActivityStats,
} from '../controllers/loginActivityController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── USER SIDE ────────────────────────────────
// Get my own login/signup history
router.get('/my', authMiddleware, getMyActivity);

// ─── ADMIN SIDE ───────────────────────────────
// Get all login/signup activity across all users
router.get('/admin/all', authMiddleware, adminMiddleware, getAllActivityAdmin);

// Get activity statistics summary
router.get('/admin/stats', authMiddleware, adminMiddleware, getActivityStats);

export default router;
