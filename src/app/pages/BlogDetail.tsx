import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowLeft, Heart, Share2, Tag } from 'lucide-react';
import { blogsAPI } from '../services/api';
import { toast } from 'sonner';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
function toFullUrl(src: string | undefined): string | undefined {
    if (!src) return undefined;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return src.startsWith('/') ? `${API_HOST}${src}` : `${API_HOST}/${src}`;
}

interface BlogData {
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
    views?: number;
}

export default function BlogDetail() {
    const { blogId } = useParams<{ blogId: string }>();
    const [blog, setBlog] = useState<BlogData | null>(null);
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!blogId) return;
        setLoading(true);
        blogsAPI
            .getById(blogId)
            .then((res: any) => {
                if (res.success) {
                    setBlog(res.data);
                    setLikeCount(res.data.likeCount || 0);
                    setUserLiked(res.data.userLiked || false);
                }
            })
            .catch((err: any) => {
                console.error('Failed to load blog', err);
                toast.error('Failed to load blog post');
            })
            .finally(() => {
                setLoading(false);
                setTimeout(() => setVisible(true), 50);
            });
    }, [blogId]);

    const handleLike = () => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            toast.error('Please sign in to like blog posts');
            return;
        }
        if (!blogId) return;
        blogsAPI
            .like(blogId)
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
            .catch(() => toast.error('Could not like this blog'));
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = blog?.title || 'TerraKind Blog';
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                await navigator.clipboard?.writeText(url);
                toast.success('Link copied!');
            }
        } else {
            await navigator.clipboard?.writeText(url);
            toast.success('Link copied to clipboard');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8faf5]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#6B8E23] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8faf5]">
                <div className="text-center">
                    <p className="text-xl text-gray-600 mb-4">Blog post not found</p>
                    <Link to="/blog" className="text-[#6B8E23] hover:underline font-medium">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const published = new Date(blog.publishedDate || blog.createdAt || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const heroImage = toFullUrl(blog.thumbnailImage) || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600';
    const contentParagraphs = (blog.content || blog.description || '').split(/\n\n+/).filter(Boolean);

    return (
        <div
            className={`min-h-screen bg-[#f8faf5] transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
        >
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <img
                    src={heroImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <div className="max-w-4xl mx-auto">
                        {blog.category && blog.category !== 'General' && (
                            <span className="inline-block bg-[#6B8E23] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                                {blog.category}
                            </span>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{blog.author || 'Admin'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{published}</span>
                            </div>
                            {blog.readingTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{blog.readingTime} min read</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Navigation */}
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-[#6B8E23] hover:text-[#5B6F1E] font-medium transition group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blog
                </Link>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 py-8">
                {/* Excerpt/Intro */}
                {blog.excerpt && (
                    <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-[#6B8E23] pl-6 italic">
                        {blog.excerpt}
                    </p>
                )}

                {/* Main Content */}
                <div className="prose prose-lg max-w-none">
                    {contentParagraphs.map((paragraph, idx) => (
                        <p
                            key={idx}
                            className="text-gray-700 leading-relaxed mb-6 text-lg"
                            style={{
                                animationDelay: `${idx * 100}ms`,
                                animation: visible ? `fadeInUp 0.6s ease-out ${idx * 100}ms both` : 'none',
                            }}
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* Video */}
                {blog.videoUrl && (
                    <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
                        <video
                            src={toFullUrl(blog.videoUrl)}
                            controls
                            className="w-full bg-black"
                        />
                    </div>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-[#6B8E23]" />
                            {blog.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="bg-[#6B8E23]/10 text-[#5B6F1E] text-sm px-3 py-1 rounded-full hover:bg-[#6B8E23]/20 transition cursor-default"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-medium ${userLiked
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${userLiked ? 'fill-red-500' : ''}`} />
                            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-medium"
                        >
                            <Share2 className="w-5 h-5" />
                            Share
                        </button>
                    </div>
                    {blog.views !== undefined && (
                        <p className="text-sm text-gray-500">{blog.views} views</p>
                    )}
                </div>
            </article>

            {/* Keyframe animation */}
            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
