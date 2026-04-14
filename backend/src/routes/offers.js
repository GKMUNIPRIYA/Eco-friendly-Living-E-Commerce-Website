import express from 'express';
import * as offerController from '../controllers/offerController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', offerController.getAllOffers);
router.get('/active', offerController.getActiveOffers);
router.get('/:id', offerController.getOffer);
router.get('/admin/expired', authMiddleware, adminMiddleware, offerController.getExpiredOffers);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, offerController.createOffer);
router.put('/:id', authMiddleware, adminMiddleware, offerController.updateOffer);
router.delete('/:id', authMiddleware, adminMiddleware, offerController.deleteOffer);

export default router;
