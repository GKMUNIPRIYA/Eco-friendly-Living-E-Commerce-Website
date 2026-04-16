import express from 'express';
import * as blogController from '../controllers/blogController.js';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { uploadBlogMediaCloud } from '../config/cloudinary.js';

const router = express.Router();

// ─── ADMIN SPECIFIC ROUTES (must be before /:id wildcards) ───────────────────
router.get('/admin/all', authMiddleware, adminMiddleware, blogController.getAllBlogsAdmin);
router.get('/admin/scheduled', authMiddleware, adminMiddleware, blogController.getScheduledBlogs);
router.post('/:id/publish', authMiddleware, adminMiddleware, blogController.publishScheduled);

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.get('/', optionalAuthMiddleware, blogController.getAllBlogs);
router.get('/:id/likes', optionalAuthMiddleware, blogController.getBlogLikes);
router.get('/:id', optionalAuthMiddleware, blogController.getBlog);

// ─── USER ROUTES ──────────────────────────────────────────────────────────────
router.post('/like', authMiddleware, blogController.likeBlog);

// ─── ADMIN CRUD ROUTES ────────────────────────────────────────────────────────
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  uploadBlogMediaCloud.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  blogController.createBlog
);
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  uploadBlogMediaCloud.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  blogController.updateBlog
);
router.delete('/:id', authMiddleware, adminMiddleware, blogController.deleteBlog);

export default router;
