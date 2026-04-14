import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog ID is required'],
    },
  },
  { timestamps: true }
);

// Ensure one like per user per blog
likeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);
