import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Blog description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      maxlength: [50000, 'Content cannot exceed 50000 characters'],
    },
    category: {
      type: String,
      default: 'General',
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    videoUrl: {
      type: String,
    },
    videoFileName: {
      type: String,
    },
    thumbnailImage: {
      type: String,
    },
    thumbnailFileName: {
      type: String,
    },
    scheduledDate: {
      type: Date,
    },
    publishedDate: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isScheduled: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    author: {
      type: String,
      default: 'Admin',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Add index for published blogs
blogSchema.index({ isPublished: 1, publishedDate: -1 });
blogSchema.index({ isScheduled: 1, scheduledDate: 1 });

export default mongoose.model('Blog', blogSchema);
