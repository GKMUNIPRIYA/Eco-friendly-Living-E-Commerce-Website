import { useState, useEffect } from 'react';
import { useAdmin, BlogPost } from '../../context/AdminContext';
import { blogsAPI } from '../../services/api';
import { Edit2, Trash2, CheckCircle, Clock, Video, Image } from 'lucide-react';
import { toast } from 'sonner';
import AddBlogForm from './AddBlogForm';

export default function BlogManagement() {
  const { blogPosts, deleteBlogPost } = useAdmin();
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await blogsAPI.delete(id);
      deleteBlogPost(id);
      toast.success('Blog post deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete blog');
    }
  };

  if (blogPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No blog posts yet. Start creating blog content!</p>
      </div>
    );
  }

  const publishedBlogs = blogPosts.filter((b) => b.isPublished);
  const scheduledBlogs = blogPosts.filter((b) => b.isScheduled);

  const BlogCard = ({ blog }: any) => {
    const [likes, setLikes] = useState<number>(0);
    useEffect(() => {
      // fetch like count for this blog
      blogsAPI.getLikes(blog.id)
        .then((res: any) => {
          if (res.success) setLikes(res.data.likeCount || 0);
        })
        .catch(() => { });
    }, [blog.id]);

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Thumbnail */}
          {blog.thumbnailImage && (
            <div className="w-full sm:w-24 flex-shrink-0">
              <img
                src={blog.thumbnailImage}
                alt={blog.title}
                className="w-full h-48 sm:h-24 object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-[#5B6F1E] truncate">{blog.title}</h3>
              {likes > 0 && (
                <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                  ❤️ {likes}
                </span>
              )}
              {blog.videoUrl && (
                <span title="Has video" className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                  <Video className="w-4 h-4" /> Video
                </span>
              )}
              {blog.thumbnailImage && !blog.videoUrl && (
                <span title="Has image" className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Image className="w-4 h-4" /> Image
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{blog.description}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Created</p>
                <p className="text-sm font-semibold text-gray-700">{new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>
              {blog.isPublished && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Published</span>
                </div>
              )}
              {blog.isScheduled && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Scheduled {blog.scheduledDate ? new Date(blog.scheduledDate).toLocaleDateString() : ''}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => setEditingBlog(blog)}
              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit blog"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(blog.id)}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete blog"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {publishedBlogs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#5B6F1E] mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Published Blogs ({publishedBlogs.length})
          </h3>
          <div>
            {publishedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      {scheduledBlogs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#5B6F1E] mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Scheduled Blogs ({scheduledBlogs.length})
          </h3>
          <div>
            {scheduledBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      {blogPosts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No blog posts yet!</p>
        </div>
      )}

      {editingBlog && (
        <AddBlogForm
          initialData={editingBlog}
          onClose={() => setEditingBlog(null)}
        />
      )}
    </div>
  );
}
