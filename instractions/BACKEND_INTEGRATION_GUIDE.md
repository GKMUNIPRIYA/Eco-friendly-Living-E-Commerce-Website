# Admin Backend Integration Guide

## Overview
This guide provides instructions for integrating the admin panel with a backend API. Currently, the admin system uses React Context for state management. To make data persistent and accessible across sessions, you'll need to connect to a backend server.

---

## Architecture Overview

```
Frontend (React Admin Panel)
         ↓
   API Endpoints (REST/GraphQL)
         ↓
   Backend Server (Node.js/Python/Java)
         ↓
   Database (MongoDB/PostgreSQL/MySQL)
         ↓
   File Storage (AWS S3/Cloudinary/Azure)
```

---

## API Endpoints Structure

### Base URL
```
http://localhost:3000/api
```

---

## 1. Products API

### Get All Products
```
GET /products
Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "image": "string (URL)",
      "category": "string",
      "description": "string",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ]
}
```

### Get Single Product
```
GET /products/:id
Response:
{
  "success": true,
  "data": { product object }
}
```

### Create Product
```
POST /products
Content-Type: application/json

Request Body:
{
  "name": "string (required)",
  "price": "number (required)",
  "image": "string URL (required)",
  "category": "string (required)",
  "description": "string"
}

Response:
{
  "success": true,
  "data": { product object with id and timestamps }
}
```

### Update Product
```
PUT /products/:id
Content-Type: application/json

Request Body:
{
  "name": "string",
  "price": "number",
  "image": "string",
  "category": "string",
  "description": "string"
}

Response:
{
  "success": true,
  "data": { updated product object }
}
```

### Delete Product
```
DELETE /products/:id

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 2. Offers API

### Get All Offers
```
GET /offers
Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "discount": "number",
      "validFrom": "ISO date",
      "validTo": "ISO date",
      "applicableCategories": ["string array"],
      "isActive": "boolean",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ]
}
```

### Get Active Offers Only
```
GET /offers?active=true
```

### Create Offer
```
POST /offers
Content-Type: application/json

Request Body:
{
  "title": "string (required)",
  "description": "string",
  "discount": "number (0-100, required)",
  "validFrom": "ISO date (required)",
  "validTo": "ISO date (required)",
  "applicableCategories": ["string array"],
  "isActive": "boolean"
}

Response:
{
  "success": true,
  "data": { offer object with id }
}
```

### Update Offer
```
PUT /offers/:id
Response: Updated offer object
```

### Delete Offer
```
DELETE /offers/:id
Response:
{
  "success": true,
  "message": "Offer deleted successfully"
}
```

---

## 3. Blog Posts API

### Get All Blogs
```
GET /blogs
Query Parameters:
  - status: "all" | "published" | "scheduled"
  - limit: number
  - offset: number

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string (URL)",
      "thumbnailImage": "string (URL)",
      "scheduledDate": "ISO date",
      "publishedDate": "ISO date",
      "isPublished": "boolean",
      "isScheduled": "boolean",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ]
}
```

### Get Published Blogs (For Frontend)
```
GET /blogs/published
Query Parameters:
  - limit: number (default: 10)
  - offset: number (default: 0)
```

### Create Blog Post
```
POST /blogs
Content-Type: multipart/form-data

Request Fields:
{
  "title": "string (required)",
  "description": "string (required)",
  "video": "file (optional, max 500MB)",
  "thumbnail": "file (optional, jpeg/png)",
  "scheduledDate": "ISO datetime (if scheduling)",
  "publishNow": "boolean"
}

Response:
{
  "success": true,
  "data": { blog object with id and URLs }
}
```

### Update Blog Post
```
PUT /blogs/:id
Content-Type: multipart/form-data

Same fields as POST, all optional
```

### Delete Blog Post
```
DELETE /blogs/:id
Response:
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

### Publish Scheduled Blog
```
PATCH /blogs/:id/publish
Response:
{
  "success": true,
  "data": { updated blog object }
}
```

---

## 4. User Feedback API

### Get All Feedback
```
GET /feedback
Query Parameters:
  - type: "suggestion" | "bug" | "feature-request" | "general"
  - unreadOnly: "true" | "false"
  - limit: number
  - offset: number

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "message": "string",
      "type": "suggestion | bug | feature-request | general",
      "createdAt": "ISO timestamp",
      "isRead": "boolean"
    }
  ]
}
```

### Get Unread Feedback Count
```
GET /feedback/unread-count
Response:
{
  "success": true,
  "count": "number"
}
```

### Submit Feedback (User Endpoint)
```
POST /feedback
Content-Type: application/json

Request Body:
{
  "name": "string (required)",
  "email": "string email (required)",
  "message": "string (required)",
  "type": "suggestion | bug | feature-request | general (required)"
}

Response:
{
  "success": true,
  "data": { feedback object }
}
```

### Mark Feedback as Read
```
PATCH /feedback/:id/read
Response:
{
  "success": true,
  "data": { updated feedback object }
}
```

### Delete Feedback
```
DELETE /feedback/:id
Response:
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

---

## Authentication & Authorization

Add to all admin endpoints:

```
Headers:
Authorization: Bearer <admin_token>

The backend should:
1. Validate JWT token from Authorization header
2. Verify token is valid and not expired
3. Check user has admin role
4. Return 401 if unauthorized
5. Return 403 if forbidden
```

### Login Endpoint
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "admin@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "admin"
  }
}
```

---

## File Upload Handling

### Image Upload (Products, Blogs)
- Supported formats: JPEG, PNG, WebP, AVIF
- Max size: 5MB
- Recommended: Upload to AWS S3 or Cloudinary
- Return public URL

### Video Upload (Blogs)
- Supported formats: MP4, WebM, OGG
- Max size: 500MB
- Recommended: Use Cloudinary or AWS MediaConvert for transcoding
- Return playable URL

### Implementation Example (Node.js with Multer):
```javascript
const multer = require('multer');
const upload = multer({ 
  storage: multerS3({ bucket: 'your-bucket' }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for video
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

app.post('/blogs', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  // Handle blog creation
});
```

---

## Database Schema Examples

### MongoDB

**Products Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  image: String,
  category: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Offers Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  discount: Number,
  validFrom: Date,
  validTo: Date,
  applicableCategories: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Blogs Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,
  thumbnailImage: String,
  scheduledDate: Date,
  publishedDate: Date,
  isPublished: Boolean,
  isScheduled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Feedback Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  message: String,
  type: String, // "suggestion", "bug", "feature-request", "general"
  createdAt: Date,
  isRead: Boolean
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

### Example Error Responses
```json
// 400 - Missing required field
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product name is required"
  }
}

// 401 - Invalid token
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}

// 404 - Resource not found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

## Rate Limiting

Implement rate limiting to prevent abuse:

```
- 1000 requests per hour per IP
- 10000 requests per hour per authenticated user
- Return 429 Too Many Requests if exceeded
```

---

## Sample Integration Code (React)

```typescript
// services/admin.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('adminToken');

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Products
export const adminApi = {
  products: {
    getAll: () => apiClient.get('/products'),
    create: (data) => apiClient.post('/products', data),
    update: (id, data) => apiClient.put(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
  },
  
  offers: {
    getAll: () => apiClient.get('/offers'),
    create: (data) => apiClient.post('/offers', data),
    update: (id, data) => apiClient.put(`/offers/${id}`, data),
    delete: (id) => apiClient.delete(`/offers/${id}`),
  },
  
  blogs: {
    getAll: (params) => apiClient.get('/blogs', { params }),
    create: (formData) => apiClient.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => apiClient.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/blogs/${id}`),
  },
  
  feedback: {
    getAll: (params) => apiClient.get('/feedback', { params }),
    getUnreadCount: () => apiClient.get('/feedback/unread-count'),
    submit: (data) => axios.post(`${API_BASE}/feedback`, data),
    markAsRead: (id) => apiClient.patch(`/feedback/${id}/read`),
    delete: (id) => apiClient.delete(`/feedback/${id}`),
  },
};
```

---

## Deployment Checklist

- [ ] Database configured and tested
- [ ] File storage (AWS S3/Cloudinary) configured
- [ ] Authentication system implemented
- [ ] All API endpoints tested
- [ ] Error handling implemented
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Environment variables secured
- [ ] Database backups automated
- [ ] Logging and monitoring set up
- [ ] SSL/HTTPS enabled
- [ ] Admin panel integrated with API

---

## Support & Documentation

- REST API best practices: https://restfulapi.net
- MongoDB documentation: https://docs.mongodb.com
- AWS S3 documentation: https://docs.aws.amazon.com/s3
- Cloudinary documentation: https://cloudinary.com/documentation

---

*Last Updated: February 23, 2026*
