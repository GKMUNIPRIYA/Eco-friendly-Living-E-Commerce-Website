import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Orders require login (registered users only)
router.post('/', authMiddleware, orderController.createOrder);
router.get('/:id', orderController.getOrder);

// Protected user routes
router.get('/', authMiddleware, orderController.getUserOrders);

// UPI payment confirmation (user confirms they've paid → order becomes 'confirmed')
router.post('/:id/confirm-upi', authMiddleware, orderController.confirmUpiPayment);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/admin/mark-read', authMiddleware, adminMiddleware, orderController.markOrdersRead);
router.put('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, adminMiddleware, orderController.cancelOrder);

export default router;
