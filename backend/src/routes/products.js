import express from 'express';
import * as productController from '../controllers/productController.js';
import { uploadProductImages } from '../config/cloudinary.js';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all products (public)
router.get('/', productController.getAllProducts);

// GET products by category (public)
router.get('/category/:category', productController.getProductsByCategory);

// GET single product (public)
router.get('/:id', productController.getProduct);

// POST create product (admin) — images uploaded directly to Cloudinary
router.post('/', authMiddleware, adminMiddleware, uploadProductImages.array('images', 10), productController.createProduct);

// PUT update product (admin) — images uploaded directly to Cloudinary
router.put('/:id', authMiddleware, adminMiddleware, uploadProductImages.array('images', 10), productController.updateProduct);

// PUT update product quantity (admin)
router.put('/:id/quantity', authMiddleware, adminMiddleware, productController.updateProductQuantity);

// DELETE product (admin)
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

export default router;
