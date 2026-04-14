import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['suggestion', 'bug', 'feature-request', 'general'],
      default: 'general',
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    response: {
      type: String,
      maxlength: [2000, 'Response cannot exceed 2000 characters'],
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

// Add index for unread feedback
feedbackSchema.index({ isRead: 1, createdAt: -1 });
feedbackSchema.index({ type: 1 });

export default mongoose.model('Feedback', feedbackSchema);
