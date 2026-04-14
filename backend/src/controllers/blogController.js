import Blog from '../models/Blog.js';
import Like from '../models/Like.js';
import { publishScheduledBlog, calculateDeleteDate } from '../services/blogScheduler.js';
import { broadcastNewBlog } from '../services/emailService.js';

// Get all published blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ publishedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get ALL blogs for admin (published + scheduled + draft)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 200, search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog || !blog.isPublished) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Get like count
    const likeCount = await Like.countDocuments({ blogId: blog._id });
    const userLiked = req.userId ? await Like.findOne({ userId: req.userId, blogId: blog._id }) : null;

    res.status(200).json({
      success: true,
      data: {
        ...blog.toObject(),
        likeCount,
        userLiked: !!userLiked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Create blog (admin)
export const createBlog = async (req, res) => {
  try {
    const { title, description, excerpt, content, category, readingTime, videoUrl, thumbnailImage, scheduledDate, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and description are required',
        },
      });
    }

    const isScheduled = !!scheduledDate;
    const blog = new Blog({
      title,
      description,
      excerpt: excerpt || '',
      content: content || '',
      category: category || 'General',
      readingTime: readingTime ? parseInt(readingTime) : 1,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags) : [],
      // videoUrl/thumbnailImage may be overwritten below if files are uploaded
      videoUrl,
      thumbnailImage,
      scheduledDate: isScheduled ? new Date(scheduledDate) : null,
      isScheduled,
      author: req.body.author || req.user?.firstName || 'Admin',
    });

    // process any uploaded media (multer stores them in req.files)
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        const vf = req.files.video[0];
        // store relative path so client can resolve via /uploads
        blog.videoUrl = `/uploads/videos/${vf.filename}`;
        blog.videoFileName = vf.filename;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const tf = req.files.thumbnail[0];
        blog.thumbnailImage = `/uploads/thumbnails/${tf.filename}`;
        blog.thumbnailFileName = tf.filename;
      }
    }

    // If not scheduled, publish immediately so it appears on the Blog page
    if (!isScheduled) {
      blog.isPublished = true;
      blog.publishedDate = new Date();
    }

    await blog.save();

    // Notify subscribers if published immediately
    if (blog.isPublished) {
      broadcastNewBlog(blog).catch(err => console.error('Blog broadcast error:', err));
    }

    res.status(201).json({
      success: true,
      message: isScheduled ? 'Blog scheduled successfully' : 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }
};

// Update blog (admin)
export const updateBlog = async (req, res) => {
  try {
    const { title, description, excerpt, content, category, readingTime, videoUrl, thumbnailImage, tags, author } = req.body;

    // prepare update object
    const updateObj = { title, description };
    if (excerpt !== undefined) updateObj.excerpt = excerpt;
    if (content !== undefined) updateObj.content = content;
    if (category !== undefined) updateObj.category = category;
    if (readingTime !== undefined) updateObj.readingTime = parseInt(readingTime) || 1;
    if (author !== undefined) updateObj.author = author;
    if (tags) updateObj.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;

    // if client passed explicit urls via body keep them
    if (videoUrl) updateObj.videoUrl = videoUrl;
    if (thumbnailImage) updateObj.thumbnailImage = thumbnailImage;

    // process uploaded files if present (multer)
    if (req.files) {
      if (req.files.video && req.files.video[0]) {
        const vf = req.files.video[0];
        updateObj.videoUrl = `/uploads/videos/${vf.filename}`;
        updateObj.videoFileName = vf.filename;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        const tf = req.files.thumbnail[0];
        updateObj.thumbnailImage = `/uploads/thumbnails/${tf.filename}`;
        updateObj.thumbnailFileName = tf.filename;
      }
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }
};

// Delete blog (admin)
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    // Delete associated likes
    await Like.deleteMany({ blogId: blog._id });

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Publish scheduled blog (admin)
export const publishScheduled = async (req, res) => {
  try {
    const blog = await publishScheduledBlog(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog published successfully',
      data: blog,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get scheduled blogs (admin)
export const getScheduledBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find({ isScheduled: true })
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments({ isScheduled: true });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Like a blog
export const likeBlog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User must be authenticated to like a blog',
        },
      });
    }

    const { blogId } = req.body;

    if (!blogId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Blog ID is required',
        },
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ userId: req.userId, blogId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });

      res.status(200).json({
        success: true,
        message: 'Blog unliked',
        liked: false,
      });
    } else {
      // Like
      const like = new Like({
        userId: req.userId,
        blogId,
      });

      await like.save();

      res.status(201).json({
        success: true,
        message: 'Blog liked',
        liked: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get blog like count
export const getBlogLikes = async (req, res) => {
  try {
    const likeCount = await Like.countDocuments({ blogId: req.params.id });
    const userLiked = req.userId ? await Like.findOne({ userId: req.userId, blogId: req.params.id }) : null;

    res.status(200).json({
      success: true,
      data: {
        likeCount,
        userLiked: !!userLiked,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};
