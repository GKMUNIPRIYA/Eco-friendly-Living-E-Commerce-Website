import express from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

import { uploadImage } from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/profile/image', authMiddleware, uploadImage.single('image'), authController.updateProfileImage);

// wishlist endpoints
router.post('/wishlist', authMiddleware, authController.toggleWishlist);
router.get('/wishlist', authMiddleware, authController.getWishlist);

export default router;
