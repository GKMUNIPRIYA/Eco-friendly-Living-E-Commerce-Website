/**
 * Multer Configuration for File Uploads
 * Handles image and video uploads for admin panel
 * 
 * Usage:
 * - Import: import { uploadVideo, uploadImage } from './multer.js';
 * - In routes: router.post('/upload', uploadVideo.single('video'), controllerFunction);
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDirs = {
  videos: path.join(__dirname, '../../uploads/videos'),
  images: path.join(__dirname, '../../uploads/images'),
  thumbnails: path.join(__dirname, '../../uploads/thumbnails'),
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==================== VIDEO UPLOAD ====================
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.videos);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const videoFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mpeg, mov, avi)'));
  }
};

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// ==================== IMAGE UPLOAD ====================
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.images);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
  }
};

export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ==================== THUMBNAIL UPLOAD ====================
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.thumbnails);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'thumb-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ==================== BLOG MEDIA (video + thumbnail in one request) ====================
// This is used so Multer can accept both 'video' and 'thumbnail' fields together
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, uploadDirs.videos);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, uploadDirs.thumbnails);
    } else {
      cb(new Error('Unexpected field for blog upload'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'video' ? 'video-' : 'thumb-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

const blogFileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedMimes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only video files are allowed (mp4, mpeg, mov, avi)'));
  }

  if (file.fieldname === 'thumbnail') {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
  }

  return cb(new Error('Unexpected field for blog upload'));
};

export const uploadBlogMedia = multer({
  storage: blogStorage,
  fileFilter: blogFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // per-file limit
  },
});

export { uploadDirs };
