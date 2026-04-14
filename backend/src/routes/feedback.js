import express from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', feedbackController.createFeedback);

// Admin routes - NOTE: specific named paths must come BEFORE /:id to avoid param shadowing
router.get('/admin/stats', authMiddleware, adminMiddleware, feedbackController.getFeedbackStats);
router.get('/', authMiddleware, adminMiddleware, feedbackController.getAllFeedback);
router.get('/:id', authMiddleware, adminMiddleware, feedbackController.getFeedback);
router.put('/:id', authMiddleware, adminMiddleware, feedbackController.updateFeedback);
router.delete('/:id', authMiddleware, adminMiddleware, feedbackController.deleteFeedback);
router.patch('/:id/read', authMiddleware, adminMiddleware, feedbackController.markAsRead);

export default router;
