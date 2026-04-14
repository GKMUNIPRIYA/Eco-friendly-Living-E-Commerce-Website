import { useState } from 'react';
import { useAdmin, BlogPost } from '../../context/AdminContext';
import { X, Upload, Tag, BookOpen } from 'lucide-react';
import { blogsAPI } from '../../services/api';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

const BLOG_CATEGORIES = [
  'General',
  'Sustainability',
  'Recycling',
  'Eco Tips',
  'Green Living',
  'Climate Action',
  'Product Reviews',
  'Zero Waste',
  'Renewable Energy',
];

export default function AddBlogForm({ onClose }: Props) {
  const { addBlogPost } = useAdmin();
  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    description: '',
    excerpt: '',
    content: '',
    category: 'General',
    readingTime: 1,
    tags: [],
    author: '',
    scheduledDate: '',
    isPublished: false,
    isScheduled: false,
    createdAt: new Date().toISOString(),
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      isScheduled: true,
      isPublished: false,
    }));
  };

  const handlePublish = () => {
    setFormData((prev) => ({
      ...prev,
      isPublished: true,
      isScheduled: false,
      publishedDate: new Date().toISOString(),
    }));
  };

  // Auto-calculate reading time from content
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const readTime = calculateReadingTime(value);
    setFormData((prev) => ({
      ...prev,
      content: value,
      readingTime: readTime,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    // Build multipart form data
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('excerpt', formData.excerpt || '');
    fd.append('content', formData.content || '');
    fd.append('category', formData.category || 'General');
    fd.append('readingTime', String(formData.readingTime || 1));
    fd.append('author', formData.author || 'Admin');
    if (tagsInput.trim()) {
      fd.append('tags', tagsInput);
    }

    // Tell the backend whether to publish now or schedule
    if (formData.isPublished) {
      fd.append('isPublished', 'true');
    } else if (formData.isScheduled && formData.scheduledDate) {
      fd.append('scheduledDate', formData.scheduledDate);
    }
    if (videoFile) fd.append('video', videoFile);
    if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

    blogsAPI
      .create(fd)
      .then((res: any) => {
        if (res.success) {
          const created = res.data;
          addBlogPost({
            id: created._id || created.id || Date.now().toString(),
            title: created.title,
            description: created.description,
            excerpt: created.excerpt,
            content: created.content,
            category: created.category,
            readingTime: created.readingTime,
            tags: created.tags,
            author: created.author,
            videoUrl: created.videoUrl,
            thumbnailImage: created.thumbnailImage,
            scheduledDate: created.scheduledDate || '',
            publishedDate: created.publishedDate,
            isPublished: !!created.isPublished,
            isScheduled: !!created.isScheduled,
            createdAt: created.createdAt,
          });
          setFormData({
            id: '',
            title: '',
            description: '',
            excerpt: '',
            content: '',
            category: 'General',
            readingTime: 1,
            tags: [],
            author: '',
            scheduledDate: '',
            isPublished: false,
            isScheduled: false,
            createdAt: new Date().toISOString(),
          });
          setVideoFile(null);
          setThumbnailFile(null);
          setTagsInput('');
          onClose();
          toast.success(created.isScheduled ? 'Blog scheduled successfully!' : 'Blog published successfully!');
        } else {
          toast.error('Failed to create blog post');
        }
      })
      .catch((err: any) => {
        toast.error('Blog upload failed: ' + (err?.message || 'Unknown error'));
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#6B8E23] text-white p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Create New Blog Post</h2>
          <button onClick={onClose} className="hover:bg-[#5B7A1E] p-2 rounded transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Blog Title */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Blog Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Enter blog title"
              required
            />
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Author Name</label>
            <input
              type="text"
              name="author"
              value={formData.author || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Author name (defaults to Admin)"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Category</label>
            <select
              name="category"
              value={formData.category || 'General'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23] bg-white"
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">
              Excerpt <span className="text-gray-400 font-normal">(Short preview text shown on blog cards)</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Write a brief excerpt or summary (2-3 sentences)"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Short Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="Brief description (also used as fallback when no excerpt)"
              rows={3}
              required
            />
          </div>

          {/* Full Content Body */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Full Article Content
              <span className="text-gray-400 font-normal ml-2">(Shown when user clicks "Read More")</span>
            </label>
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleContentChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23] font-mono text-sm"
              placeholder="Write the full article content here. Use blank lines to separate paragraphs. This is the main body that readers see when they open the full blog post."
              rows={10}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Separate paragraphs with blank lines. Supports plain text.
              </p>
              <p className="text-xs text-gray-500">
                Est. reading time: <strong>{formData.readingTime || 1} min</strong>
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags <span className="text-gray-400 font-normal">(Comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
              placeholder="e.g. sustainability, recycling, eco-friendly"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagsInput.split(',').map((tag, i) => tag.trim() && (
                  <span key={i} className="bg-[#6B8E23]/10 text-[#5B6F1E] text-xs px-2 py-1 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Thumbnail Image</label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#6B8E23]">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500 mb-2" />
                <span className="text-sm text-gray-600">
                  {thumbnailFile ? thumbnailFile.name : 'Click to upload thumbnail'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Video File */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Video File</label>
            <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#6B8E23]">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500 mb-2" />
                <span className="text-sm text-gray-600">
                  {videoFile ? videoFile.name : 'Click to upload video (MP4, WebM, etc.)'}
                </span>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Video will be processed and attached to your blog</p>
          </div>

          {/* Publish Type */}
          <div>
            <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Publish Type</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="publishType"
                  value="publish"
                  onChange={handlePublish}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium text-gray-700">Publish Now</span>
                  <p className="text-xs text-gray-600">Blog will be visible to users immediately</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="publishType"
                  value="schedule"
                  onChange={handleSchedule}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-medium text-gray-700">Schedule for Later</span>
                  <p className="text-xs text-gray-600">Blog will be published automatically at scheduled time</p>
                </div>
              </label>
            </div>
          </div>

          {formData.isScheduled && (
            <div>
              <label className="block text-sm font-semibold text-[#5B6F1E] mb-2">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                required={formData.isScheduled}
              />
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-[#6B8E23] text-white py-2 rounded-lg hover:bg-[#5B7A1E] transition font-semibold"
            >
              {formData.isPublished ? 'Publish Blog' : formData.isScheduled ? 'Schedule Blog' : 'Create Blog'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
