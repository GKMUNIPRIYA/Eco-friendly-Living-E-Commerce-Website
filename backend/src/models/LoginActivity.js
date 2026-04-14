import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema(
  {
    // Reference to user (null if failed login attempt)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Email used during login/signup attempt
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Type of activity
    activityType: {
      type: String,
      enum: ['signin', 'signup', 'logout', 'failed_signin', 'password_reset'],
      required: true,
    },
    // Login success or failure
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
      default: 'success',
    },
    // Reason for failure (if any)
    failureReason: {
      type: String,
      trim: true,
    },
    // Device / browser info
    userAgent: {
      type: String,
      trim: true,
    },
    // IP address of the client
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast user activity lookup
loginActivitySchema.index({ userId: 1 });
// Index for email-based lookup (e.g. security audit)
loginActivitySchema.index({ email: 1 });
// Index for admin monitoring (by date)
loginActivitySchema.index({ createdAt: -1 });

export default mongoose.model('LoginActivity', loginActivitySchema);
