import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    // USER who gave the rating
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    // PRODUCT being rated
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    // Star rating: 1 to 5
    rating: {
      type: Number,
      required: [true, 'Rating value is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    // Optional review text
    review: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    // Review title
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters'],
    },
    // Admin can verify/approve reviews
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Admin can hide inappropriate reviews
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One rating per user per product (unique constraint)
ratingSchema.index({ userId: 1, productId: 1 }, { unique: true });
// Index for fast product rating lookup
ratingSchema.index({ productId: 1 });

export default mongoose.model('Rating', ratingSchema);
