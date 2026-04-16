import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock } from 'lucide-react';
import { blogsAPI } from '../services/api';
import { toast } from 'sonner';

// Resolve relative upload paths to full backend URLs
const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
function toFullUrl(src: string | undefined): string | undefined {
  if (!src) return undefined;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return src.startsWith('/') ? `${API_HOST}${src}` : `${API_HOST}/${src}`;
}

interface BlogPost {
  _id: string;
  title: string;
  description?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  readingTime?: number;
  tags?: string[];
  thumbnailImage?: string;
  author?: string;
  publishedDate?: string;
  createdAt?: string;
  videoUrl?: string;
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    blogsAPI
      .getLikes(post._id)
      .then((res: any) => {
        if (res.success) {
          setLikeCount(res.data.likeCount || 0);
          setUserLiked(res.data.userLiked || false);
        }
      })
      .catch(console.error);
  }, [post._id]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast.error('Please sign in to like blog posts');
      return;
    }

    blogsAPI
      .like(post._id)
      .then((res: any) => {
        if (res.success) {
          if (res.liked === false) {
            setLikeCount((c) => c - 1);
            setUserLiked(false);
          } else {
            setLikeCount((c) => c + 1);
            setUserLiked(true);
            toast.success('Blog liked!');
          }
        }
      })
      .catch((err: any) => {
        console.error(err);
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
          toast.error('Please sign in to like blog posts');
        } else {
          toast.error('Could not like this blog. Please try again.');
        }
      });
  };

  const published = new Date(
    post.publishedDate || post.createdAt || new Date().toISOString()
  ).toLocaleDateString();

  const previewText = post.excerpt || (post.description
    ? post.description.length > 120
      ? post.description.slice(0, 120) + '...'
      : post.description
    : '');

  const heroImage = toFullUrl(post.thumbnailImage) || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800';

  return (
    <Link
      to={`/blog/${post._id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
        {/* Magazine-style Image with Title Overlay */}
        <div className="relative overflow-hidden h-72">
          <img
            src={heroImage}
            alt={post.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? 'scale-110' : 'scale-100'
              }`}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Category badge */}
          {post.category && post.category !== 'General' && (
            <span className="absolute top-4 left-4 bg-[#6B8E23] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {post.category}
            </span>
          )}

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
              {post.title}
            </h2>
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{published}</span>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime} min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Content Below Image */}
        <div className="p-5">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {previewText}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{post.author || 'Admin'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm font-medium transition ${userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
              >
                {userLiked ? '❤️' : '🤍'} {likeCount}
              </button>

              <span className="text-[#6B8E23] font-semibold text-sm group-hover:text-[#5B6F1E] transition flex items-center gap-1">
                Read More
                <span className={`transition-transform inline-block ${hovered ? 'translate-x-1' : ''}`}>→</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
