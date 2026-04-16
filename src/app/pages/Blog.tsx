import { useEffect, useState } from 'react';
import { blogsAPI, api } from '../services/api';
import BlogCard from '../components/BlogCard';
import ScrollReveal from '../components/ScrollReveal';
import { ImageWithFallback } from '../components/UIUX/ImageWithFallback';

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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchBlogs = () => {
    setLoading(true);
    setError(null);

    blogsAPI
      .getAll({ page: 1, limit: 20 })
      .then((res: any) => {
        const items = res?.data || [];
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const toFullUrl = (v: string | undefined) => {
          if (!v) return v;
          if (v.startsWith('http://') || v.startsWith('https://')) return v;
          return v.startsWith('/') ? `${apiBase.replace(/\/api$/, '')}${v}` : `${apiBase.replace(/\/api$/, '')}/${v}`;
        };
        const mapped: BlogPost[] = items.map((b: any) => ({
          _id: b._id,
          title: b.title,
          description: b.description,
          excerpt: b.excerpt || '',
          content: b.content || '',
          category: b.category || 'General',
          readingTime: b.readingTime || 1,
          tags: b.tags || [],
          thumbnailImage: toFullUrl(b.thumbnailImage || b.thumbnailFileName || b.thumbnail),
          videoUrl: b.videoUrl ? toFullUrl(b.videoUrl) : b.video,
          author: b.author || 'Admin',
          publishedDate: b.publishedDate,
          createdAt: b.createdAt,
        }));
        setPosts(mapped);
      })
      .catch((err: any) => {
        console.error('Failed to load blogs', err);
        setError(err?.message || 'Failed to load blogs');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBlogs();
    setTimeout(() => setVisible(true), 50);

    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(fetchBlogs, 30000);

    // Also re-fetch when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchBlogs();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ backgroundColor: '#f8faf5' }}
    >
      {/* Hero Banner */}
      <div className="relative h-72 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&auto=format&fit=crop"
          alt="Eco Blog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">🌿 Eco Living Blog</h1>
            <p className="text-green-100 text-lg">Tips, stories and inspiration for sustainable living</p>
          </div>
        </div>
      </div>

      {/* Blog Info Banner */}
      <ScrollReveal variant="fade-up" delay={100}>
        <div className="bg-[#FFF3E0] border-l-4 border-[#FF6B35] py-4">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-[#FF6B35] font-medium">
              📅 New blog posts every week! Posts are automatically curated and updated daily.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#6B8E23] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <ScrollReveal key={post._id} variant="fade-up" delay={idx * 100}>
                <BlogCard post={post} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <ScrollReveal variant="fade-up">
        <div className="bg-[#6B8E23] text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Never Miss an Eco Tip!</h2>
            <p className="mb-8">
              Subscribe to our newsletter and get weekly sustainability tips delivered to your inbox
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                id="newsletter-blog"
                className="flex-1 px-4 py-3 rounded-full text-gray-900"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('newsletter-blog') as HTMLInputElement;
                  const email = input?.value;
                  if (email) {
                    try {
                      const d = await api.newsletter.subscribe(email);
                      if (d.success) {
                        alert('Subscribed successfully!');
                        input.value = '';
                      } else {
                        alert(d.error?.message || 'Subscription failed');
                      }
                    } catch (err) {
                      alert('Subscription error');
                    }
                  }
                }}
                className="bg-[#FF6B35] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#FF5722] transition"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
