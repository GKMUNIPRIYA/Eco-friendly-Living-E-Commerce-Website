/**
 * Cloudinary Configuration
 * Images are uploaded to Cloudinary for persistent storage.
 * Render's local disk is ephemeral — files are wiped on every redeploy.
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==================== PRODUCT IMAGE STORAGE ====================
const productImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'terrakind/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

export const uploadProductImages = multer({
  storage: productImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
    }
  },
});

// ==================== BLOG THUMBNAIL STORAGE ====================
const blogThumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'terrakind/blog-thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
  },
});

// ==================== BLOG VIDEO STORAGE ====================
// Note: Cloudinary free tier supports video uploads too
const blogVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'terrakind/blog-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mpeg', 'mov', 'avi'],
  },
});

// Blog media uploader (handles both thumbnail + video fields)
export const uploadBlogMediaCloud = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      if (file.fieldname === 'video') {
        return {
          folder: 'terrakind/blog-videos',
          resource_type: 'video',
          allowed_formats: ['mp4', 'mpeg', 'mov', 'avi'],
        };
      }
      // thumbnail
      return {
        folder: 'terrakind/blog-thumbnails',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
      };
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for video
});

// ==================== PROFILE IMAGE STORAGE ====================
const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'terrakind/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, webp)'));
    }
  },
});

export { cloudinary };
export default cloudinary;
