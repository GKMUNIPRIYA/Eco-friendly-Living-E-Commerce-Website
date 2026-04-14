import cron from 'node-cron';
import Blog from '../models/Blog.js';
import { sendBlogPublishedNotification, broadcastNewBlog } from './emailService.js';

// Schedule blogs to be published
export const setupBlogScheduler = () => {
  // Check every minute if any blogs should be published
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const blogsToPublish = await Blog.find({
        isScheduled: true,
        isPublished: false,
        scheduledDate: { $lte: now },
      });

      for (const blog of blogsToPublish) {
        blog.isPublished = true;
        blog.publishedDate = now;
        blog.isScheduled = false;
        await blog.save();
        console.log(`✅ Blog published: ${blog.title}`);

        // Send notification to all subscribers
        broadcastNewBlog(blog).catch(err => console.error('Scheduled blog broadcast error:', err));
      }
    } catch (error) {
      console.error('❌ Error in blog publish scheduler:', error);
    }
  });

  // Check every hour for blogs that should be deleted (30 days old)
  cron.schedule('0 * * * *', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const blogsToDelete = await Blog.find({
        isPublished: true,
        publishedDate: { $lte: thirtyDaysAgo },
      });

      for (const blog of blogsToDelete) {
        await Blog.findByIdAndDelete(blog._id);
        console.log(`🗑️  Blog deleted (30 days old): ${blog.title}`);
      }
    } catch (error) {
      console.error('❌ Error in blog deletion scheduler:', error);
    }
  });

  console.log('✅ Blog scheduler initialized');
};

// Manually publish a scheduled blog
export const publishScheduledBlog = async (blogId) => {
  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }

    blog.isPublished = true;
    blog.publishedDate = new Date();
    blog.isScheduled = false;
    await blog.save();

    return blog;
  } catch (error) {
    throw error;
  }
};

// Calculate delete date (30 days from publish date)
export const calculateDeleteDate = (publishDate) => {
  const deleteDate = new Date(publishDate);
  deleteDate.setDate(deleteDate.getDate() + 30);
  return deleteDate;
};
