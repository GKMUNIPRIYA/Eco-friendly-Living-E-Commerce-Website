# Admin Panel - Quick Start Guide

## 🚀 How to Access the Admin Panel

### On Your Computer
1. Open your browser
2. Go to: **`http://localhost:5173/admin`** (or your project's port)
3. You should see the Admin Dashboard

### From the Website
1. Navigate to any page on your website
2. Look for the **Settings Icon (⚙️)** in the top-right corner
3. Click it to go to the admin panel
4. You can also see the **Message Icon (💬)** to send feedback

---

## 📊 Main Admin Features

### 1️⃣ Dashboard
**View quick stats:**
- Total products added
- Active promotional offers
- Published blog posts
- New user feedback count
- Quick access buttons for adding products, offers, and blogs

### 2️⃣ Product Management
**Add, edit, and remove products:**
- Product name and description
- Price in Indian Rupees (₹)
- Product category
- Product image URL
- View all your products in one place

### 3️⃣ Offer Management
**Create promotional offers:**
- Set discount percentages
- Choose valid date ranges
- Select which product categories get the offer
- Activate or deactivate offers anytime
- See all active and inactive offers

### 4️⃣ Blog Management
**Write and schedule blog posts:**
- Create engaging blog content
- Attach videos directly to blogs (MP4, WebM formats)
- Add thumbnail images
- **Publish immediately** OR **Schedule for later**
- See published blogs and scheduled posts separately

### 5️⃣ Feedback Management
**Collect and review customer feedback:**
- See new unread feedback first
- Users can submit:
  - General feedback
  - Product suggestions
  - Feature requests
  - Bug reports
- Mark feedback as read
- View feedback history

---

## 🎯 Step-by-Step: Add Your First Product

1. Click **"Products"** tab from the left menu
2. Click the **"+ Add Product"** button
3. Fill in the form:
   - **Product Name**: E.g., "Organic Bamboo Toothbrush"
   - **Price**: E.g., "299" (in rupees)
   - **Category**: Select from dropdown (e.g., "Personal Care")
   - **Image URL**: Paste a link to product image
   - **Description**: Write what makes this product special
4. Click **"Add Product"**
5. ✅ Your product is now in the system!

---

## 🎁 Step-by-Step: Create an Offer

1. Click **"Offers"** tab
2. Click **"+ Add Offer"** button
3. Fill in offer details:
   - **Title**: E.g., "Summer Sale - 30% Off"
   - **Discount**: E.g., "30" (percentage)
   - **Valid From**: Select start date
   - **Valid To**: Select end date
   - **Categories**: Pick which categories this offer applies to
4. Toggle **"Active"** to turn offer on/off
5. Click **"Create Offer"**
6. ✅ Your offer is now live!

---

## 📝 Step-by-Step: Write a Blog Post

### For Immediate Publishing:
1. Click **"Blogs"** tab
2. Click **"+ New Blog"** button
3. Fill in:
   - **Title**: Your blog headline
   - **Description**: Your blog content
   - **Thumbnail**: Upload a cover image
   - **Video**: (Optional) Attach a video file
4. Select **"Publish Now"**
5. Click **"Create Blog"**
6. ✅ Your blog is now live for users to read!

### For Scheduling (Post Later):
1. Same steps as above
2. **Instead of "Publish Now"**, select **"Schedule for Later"**
3. Pick a **date and time** when you want the blog to go live
4. Click **"Schedule Blog"**
5. ✅ Blog will automatically publish at that time!

---

## 💬 Feedback Collection

### How Users Send Feedback
Users can click the **Message Icon (💬)** in the top-right corner of any page to send you:
- Suggestions for improving products
- Feature requests for the website
- Bug reports if something isn't working
- General feedback

### How You Manage Feedback
1. Click **"Feedback"** tab in admin panel
2. See all new unread feedback first
3. Read each feedback message
4. Click the **checkmark (✓)** to mark as read
5. Use the **trash icon (🗑️)** to delete old feedback
6. Use feedback to improve your website!

---

## 🎥 Tips for Success

### Products
✅ Use clear, high-quality product images
✅ Write detailed descriptions highlighting environmental benefits
✅ Keep prices competitive
✅ Organize by correct categories

### Offers
✅ Create limited-time offers for urgency
✅ Target specific categories for better results
✅ Don't overlap offer dates unnecessarily
✅ Activate seasonal offers at right times

### Blogs
✅ Write engaging titles that catch attention
✅ Include videos showing products in action
✅ Keep posts informative and entertaining
✅ Schedule posts during peak user activity
✅ Maintain consistent publishing schedule

### Feedback
✅ Check feedback at least 2-3 times per week
✅ Respond to important suggestions
✅ Fix reported bugs quickly
✅ Use feedback to guide product improvements

---

## ⚙️ Technical Info

**Current Storage**: Data stored in browser memory
- Data resets when browser closes
- Perfect for testing

**To Make it Permanent**:
- Connect to a database (MongoDB, PostgreSQL, etc.)
- Implement admin login/authentication
- Add file storage for images and videos (AWS S3, Cloudinary)
- Set up automated backups

---

## ❓ Frequently Asked Questions

**Q: Where do my products appear after I add them?**
A: They automatically appear on the Products tab and will show in categories once you link them properly.

**Q: Can I edit products after adding them?**
A: Click the edit icon (✏️) on any product card to modify it.

**Q: What happens if I schedule a blog and then want to change it?**
A: Click edit icon before the scheduled time, or delete and create a new one.

**Q: How do users give me feedback?**
A: They click the message icon (💬) in the top-right corner of any page.

**Q: Is my feedback confidential?**
A: Yes, only admins can see user feedback in the admin panel.

**Q: Can I delete feedback?**
A: Yes, click the delete icon (🗑️) on any feedback to remove it.

---

## 📞 Need Help?

1. Check the full **ADMIN_GUIDE.md** for detailed documentation
2. Check browser console (F12) for any error messages
3. Ensure all required fields are filled when adding products/offers/blogs
4. Make sure image URLs are valid and accessible

---

## 🎉 You're All Set!

Your admin panel is ready to use. Start by:
1. Adding a few products
2. Creating an offer
3. Writing your first blog post
4. Checking for user feedback

**Happy managing!** 🌱

---

*Last Updated: February 23, 2026*
