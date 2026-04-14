import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    // USER who owns this wishlist
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true, // One wishlist document per user
    },
    // Array of wished products
    products: [
      {
        productId: {
          type: String,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
          maxlength: [200, 'Note cannot exceed 200 characters'],
        },
      },
    ],
  },
  { timestamps: true }
);

// Fast lookup by user
wishlistSchema.index({ userId: 1 });

export default mongoose.model('Wishlist', wishlistSchema);
