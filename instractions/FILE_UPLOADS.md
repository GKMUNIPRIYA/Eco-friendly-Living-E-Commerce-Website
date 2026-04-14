# File Upload Documentation

## 📤 Overview

The backend supports file uploads for:
- 🎥 **Videos** - Blog videos (up to 100MB)
- 🖼️ **Images** - Product images & thumbnails (up to 10MB each)

File uploads are handled with **Multer** middleware.

---

## 📍 Upload Directories

Files are saved to:
```
backend/
├── uploads/
│   ├── videos/       # Blog videos
│   ├── images/       # Product & blog images
│   └── thumbnails/   # Blog thumbnails
```

**Auto-created**: Directories are created automatically on first upload.

---

## 🎬 Video Upload

### Supported Formats
- MP4 (video/mp4)
- MPEG (video/mpeg)
- MOV (video/quicktime)
- AVI (video/x-msvideo)

### Size Limit
- Maximum: 100MB

### Usage - Create Blog with Video

**Form Data:**
```
- title: "My Blog Post"
- description: "Description here"
- isPublished: true
- video: [video file]
- thumbnail: [image file]
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/blogs \
  -F "title=My Blog" \
  -F "description=Blog content" \
  -F "isPublished=true" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Blog",
    "videoFileName": "video-1707021345678-123456789.mp4",
    "videoUrl": "http://localhost:3000/uploads/videos/video-1707021345678-123456789.mp4",
    "thumbnailFileName": "thumb-1707021345678-987654321.jpg",
    "createdAt": "2026-02-23T10:15:00Z"
  }
}
```

---

## 🖼️ Image Upload

### Supported Formats
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

### Size Limits
- Product Images: 10MB
- Thumbnails: 5MB

### Usage - Create Product with Image

**Form Data:**
```
- name: "Bamboo Toothbrush"
- price: 299
- category: "personal-care"
- description: "Eco-friendly"
- image: [image file]
```

**JavaScript/Fetch Example:**
```javascript
const formData = new FormData();
formData.append('name', 'Bamboo Toothbrush');
formData.append('price', 299);
formData.append('category', 'personal-care');
formData.append('description', 'Eco-friendly toothbrush');
formData.append('image', fileInputElement.files[0]);

const response = await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  body: formData, // Note: no Content-Type header needed
});

const data = await response.json();
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -F "name=Bamboo Toothbrush" \
  -F "price=299" \
  -F "category=personal-care" \
  -F "description=Eco-friendly" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Bamboo Toothbrush",
    "price": 299,
    "image": "http://localhost:3000/uploads/images/image-1707021345678-123456789.jpg",
    "imageFileName": "image-1707021345678-123456789.jpg",
    "createdAt": "2026-02-23T10:15:00Z"
  }
}
```

---

## 📁 Frontend Integration

### Using React with FormData

```typescript
import { useState } from 'react';
import { api } from '@/services/api';

export function AddProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData for multipart/form-data
    const uploadFormData = new FormData();
    uploadFormData.append('name', formData.name);
    uploadFormData.append('price', formData.price);
    uploadFormData.append('category', formData.category);
    
    if (formData.image) {
      uploadFormData.append('image', formData.image);
    }

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Product created with image!');
        // Refresh products list
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Product name"
        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
      />
      
      <input
        type="number"
        name="price"
        placeholder="Price"
        onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
      >
        <option value="">Select category</option>
        <option value="personal-care">Personal Care</option>
        <option value="home">Home</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {formData.image && <p>Image: {formData.image.name}</p>}

      <button type="submit">Add Product</button>
    </form>
  );
}
```

### Handling File Upload in API Service

Update your API service to handle multipart uploads:

```typescript
// In /src/app/services/api.ts
async function fetchMultipart(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Upload Error [${endpoint}]:`, error);
    throw error;
  }
}

export const productsAPI = {
  // ... existing methods ...

  /**
   * Create product with image upload
   */
  createWithImage: (formData: FormData) =>
    fetchMultipart('/products', formData, {
      method: 'POST',
    }),

  /**
   * Update product with optional image
   */
  updateWithImage: (productId: string, formData: FormData) =>
    fetchMultipart(`/products/${productId}`, formData, {
      method: 'PUT',
    }),
};
```

---

## ✅ File Upload Best Practices

### 1. Validate on Frontend
```typescript
// Check file size before upload
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  alert('File too large');
  return;
}

// Check file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  alert('Invalid file type');
  return;
}
```

### 2. Show Progress
```typescript
// For large uploads, show progress
const fileInput = document.getElementById('file') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const formData = new FormData();
  formData.append('video', (e.target as HTMLInputElement).files![0]);

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    const progress = (e.loaded / e.total) * 100;
    console.log(`Upload progress: ${progress}%`);
  });

  xhr.open('POST', 'http://localhost:3000/api/blogs');
  xhr.send(formData);
});
```

### 3. Handle Errors Gracefully
```typescript
const handleUpload = async (file: File) => {
  try {
    if (!file) throw new Error('No file selected');
    if (file.size > 100 * 1024 * 1024) throw new Error('File too large (max 100MB)');

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
```

---

## 🔐 Security Considerations

### Implemented Protections
✅ File size limits (100MB videos, 10MB images)
✅ MIME type validation
✅ File extension validation
✅ Unique filename generation (timestamp + random)

### TODO for Production
- [ ] Add JWT authentication to upload routes
- [ ] Scan uploaded files for malware
- [ ] Store files in S3/Cloudinary instead of local disk
- [ ] Add rate limiting to prevent abuse
- [ ] Compress images automatically
- [ ] Generate video thumbnails automatically
- [ ] Add virus scanning (ClamAV)

---

## 🔗 Serving Uploaded Files

### Local Storage (Current)
Files are accessible via:
```
http://localhost:3000/uploads/images/[filename]
http://localhost:3000/uploads/videos/[filename]
```

### Configure Express to Serve Static Files
In `backend/src/server.js`, add:
```javascript
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### For Production: Use Cloud Storage
```typescript
// Example with Cloudinary
import { v2 as cloudinary } from 'cloudinary';

const uploadToCloud = async (file: Express.Multer.File) => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    upload.end(file.buffer);
  });
};
```

---

## 📊 Storage Management

### Check Upload Folder Size
```bash
# Get total size of uploads folder
du -sh backend/uploads/

# List files by size
ls -lhS backend/uploads/images/
```

### Clean Up Old Files
```bash
# Delete files older than 30 days
find backend/uploads/ -type f -mtime +30 -delete
```

### Database Cleanup
If you delete a file from disk, update the database:
```javascript
await Product.updateOne(
  { _id: productId },
  { image: null }
);
```

---

## 🐛 Troubleshooting

### "File too large" Error
- Increase limit in multer.js
- Check Content-Length header on client

### "Only image files allowed" Error
- Verify file MIME type
- Check allowed file extensions
- Ensure file is actually the correct format

### Files Not Found After Upload
- Check if upload directory exists: `backend/uploads/`
- Verify permissions on directory
- Check `imageFileName`/`videoFileName` returned from API

### CORS Error on File Upload
- Set proper CORS headers
- Check POST request headers
- Ensure preflight request succeeds

---

## 📝 API Response Examples

### Successful Image Upload
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "image": "http://localhost:3000/uploads/images/image-1707021345678-123456789.jpg",
    "imageFileName": "image-1707021345678-123456789.jpg"
  }
}
```

### Failed Upload
```json
{
  "success": false,
  "error": "Only image files are allowed (jpeg, png, gif, webp)",
  "message": "File validation failed"
}
```

---

## 🚀 Advanced: Batch Upload

### Multiple Files
```javascript
const formData = new FormData();
formData.append('title', 'My Gallery');

// Add multiple images
document.querySelectorAll('input[type="file"]').forEach((input, idx) => {
  if (input.files?.[0]) {
    formData.append(`images`, input.files[0]);
  }
});

const response = await fetch('http://localhost:3000/api/gallery', {
  method: 'POST',
  body: formData,
});
```

### Handle Multipart in Controller
```javascript
// In controllers, access files
export const createGallery = (req, res) => {
  const files = req.files; // Array from multer
  const { title } = req.body;

  // Process multiple files
  const fileNames = files.map(f => f.filename);

  res.json({
    success: true,
    data: { title, files: fileNames }
  });
};
```

---

**Last Updated**: February 23, 2026

For more info, see [BACKEND_SETUP.md](./BACKEND_SETUP.md) and [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
