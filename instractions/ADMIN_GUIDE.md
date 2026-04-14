# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a comprehensive management system for your Eco-Friendly E-commerce Website. It provides functionality to manage products, offers, blog posts, and user feedback all in one place.

## Access
- **URL**: `http://localhost:5173/admin` (or your project port)
- **Admin Panel**: Click the Settings icon (⚙️) in the top-right corner of any page

## Features

### 1. Dashboard Overview
The dashboard displays:
- **Total Products**: Count of all products in your catalog
- **Active Offers**: Number of currently active promotional offers
- **Published Blogs**: Count of published blog posts
- **User Feedback**: Number of unread user feedback messages

Quick access buttons for:
- Adding new products
- Creating offers
- Writing blog posts

---

## 2. Product Management

### Add New Product
1. Click the "Add Product" button
2. Fill in the product details:
   - **Product Name** (required)
   - **Price in ₹** (required)
   - **Category** (required) - Select from predefined categories
   - **Image URL** (required) - Provide a direct link to product image
   - **Description** - Product details and benefits

3. Click "Add Product" to save

### View Products
- All products are displayed as cards showing:
  - Product image
  - Product name
  - Description
  - Price
  - Category badge

### Edit Product
- Click the edit icon (✏️) on any product card
- Modify the details as needed
- Save changes

### Delete Product
- Click the delete icon (🗑️) on any product card
- Confirm deletion

---

## 3. Offer Management

### Create New Offer
1. Click the "Add Offer" button
2. Fill in offer details:
   - **Offer Title** (required) - e.g., "Summer Sale - 30% Off"
   - **Description** - Details about the offer
   - **Discount %** (required) - Percentage off (0-100)
   - **Status** - Toggle between Active/Inactive
   - **Valid From** (required) - Start date
   - **Valid To** (required) - End date
   - **Applicable Categories** - Select categories where this offer applies

3. Click "Create Offer" to save

### View Offers
- All offers are displayed showing:
  - Discount percentage (highlighted)
  - Validity period
  - Active/Inactive status
  - Applicable categories
  - Creation date

### Edit Offer
- Click the edit icon on any offer card
- Update offer details
- Save changes

### Delete Offer
- Click the delete icon on any offer card
- Confirm deletion

---

## 4. Blog Management

### Create New Blog Post
1. Click the "New Blog" button
2. Fill in blog details:
   - **Blog Title** (required)
   - **Description** (required) - Write your blog content here
   - **Thumbnail Image** - Upload a cover image for the blog
   - **Video File** - Attach a video file (MP4, WebM, etc.)

3. Choose publication type:
   - **Publish Now** - Blog goes live immediately
   - **Schedule for Later** - Set a future date and time to automatically publish

4. Click "Create Blog" to save

### View Blogs
Blogs are organized into:
- **Published Blogs** - Live blog posts visible to users
- **Scheduled Blogs** - Blogs set to publish at a future date

Each blog card shows:
- Blog title
- Description preview
- Author information
- Video indicator (🎥) if video is attached
- Publication status (Published/Scheduled)
- Created/Scheduled date

### Video Attachment
- Supports common video formats: MP4, WebM, OGG
- Videos are processed and attached to blog posts
- Users will see the video player when viewing the blog

### Edit Blog
- Click the edit icon on any blog card
- Modify blog content and scheduling
- Save changes

### Delete Blog
- Click the delete icon on any blog card
- Confirm deletion

### Blog Scheduling
- Set future publication dates
- Blogs automatically publish at scheduled times
- Perfect for planning content calendar

---

## 5. User Feedback Management

### View Feedback
- All user feedback is organized by:
  - **New Feedback** - Unread feedback (shown at top)
  - **Previous Feedback** - Already read feedback

### Feedback Types
Users can submit feedback as:
- **General Feedback** - General comments
- **Suggestion** - Product or service suggestions
- **Feature Request** - Requests for new features
- **Bug Report** - Issues or bugs found

### Feedback Card Shows:
- User name
- Email address
- Feedback type (color-coded badge)
- Message content
- Received date and time
- Read status

### Mark as Read
- Click the checkmark icon (✓) on unread feedback
- Feedback moves to "Previous Feedback" section

### Delete Feedback
- Click the delete icon (🗑️) on any feedback
- Permanently removes the feedback

### Unread Counter
- Badge shows number of unread feedback
- Updates automatically as new feedback arrives

---

## 6. User Feedback Widget

### Accessing Feedback Form
- Click the **Message Icon** (💬) in the top-right corner of any page
- Opens feedback collection modal

### Submit Feedback
Users can provide:
- **Name** (required)
- **Email** (required)
- **Feedback Type** - Choose from dropdown
- **Message** (required)

Feedback is stored in admin panel for review.

---

## Backend Integration

### Current Setup
The admin system currently uses **React Context** for state management with local storage capability. This is stored in memory while the application is running.

### To Add Backend Connection
1. **Database Setup**: Connect to MongoDB/PostgreSQL
2. **API Endpoints**: Create REST/GraphQL endpoints for:
   - Products CRUD operations
   - Offers management
   - Blog posts with video storage
   - Feedback collection and retrieval
3. **Authentication**: Implement admin login/authentication
4. **File Upload**: Set up cloud storage (AWS S3, Cloudinary) for images and videos

### Recommended Backend Structure
```
/api/
  /products
    GET /          - Get all products
    POST /         - Create product
    PUT /:id       - Update product
    DELETE /:id    - Delete product
  
  /offers
    GET /          - Get all offers
    POST /         - Create offer
    PUT /:id       - Update offer
    DELETE /:id    - Delete offer
  
  /blogs
    GET /          - Get all blogs
    POST /         - Create blog (with video upload)
    PUT /:id       - Update blog
    DELETE /:id    - Delete blog
  
  /feedback
    GET /          - Get all feedback
    POST /         - Create feedback
    PATCH /:id     - Mark as read
    DELETE /:id    - Delete feedback
```

---

## Tips for Best Results

### Products
- Use high-quality images
- Write clear, descriptive product descriptions
- Organize products properly by category
- Keep prices updated

### Offers
- Set realistic discount percentages
- Ensure valid dates don't overlap confusingly
- Target specific categories for targeted promotions
- Activate offers at appropriate times

### Blog Posts
- Write engaging titles that attract readers
- Provide detailed descriptions
- Attach videos to show products in action
- Schedule posts during peak user activity times
- Use consistent publishing schedule

### Feedback
- Check feedback regularly
- Respond to user suggestions
- Fix reported bugs promptly
- Use feedback for product improvement

---

##  Keyboard Shortcuts (To be added)
- Alt + A: Go to Admin
- Alt + F: Open Feedback Modal
- Ctrl + N: New Product (on Admin page)

---

## Support & Troubleshooting

### Common Issues

**1. Products not showing after adding?**
- Ensure image URL is valid and accessible
- Check browser console for errors
- Refresh the page

**2. Scheduled blogs not publishing?**
- Verify scheduled date and time are in future
- Check system time is correct
- Ensure blog is marked as "Scheduled for Later"

**3. Feedback not appearing?**
- Check Admin page Feedback section
- Ensure user submitted form with all required fields
- Refresh to see latest feedback

### Notes
- All data is currently stored in React state
- Implement backend storage for persistence across sessions
- Consider adding admin authentication for production use
- Add role-based access control for multiple admins

---

## Future Enhancements

- [ ] Admin authentication and role management
- [ ] Real-time notifications for new feedback
- [ ] Analytics dashboard (sales, popular products)
- [ ] Inventory management system
- [ ] Email notifications for scheduled events
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Batch product import/export
- [ ] Video transcoding and optimization
- [ ] Automated backup system

---

**Last Updated**: February 23, 2026
**Version**: 1.0
