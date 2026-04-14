import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../../services/api';
import { useAdmin } from '../../context/AdminContext';
import { Trash2, CheckCircle, Star, RefreshCw } from 'lucide-react';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  message: string;
  type: string;
  rating?: number;
  createdAt: string;
  isRead: boolean;
}

export default function FeedbackManagement() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markFeedbackAsRead: markInContext } = useAdmin();
  const navigate = useNavigate();

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('[DEBUG] Admin token exists:', !!adminToken);
      
      const res: any = await feedbackAPI.getAll({ page: 1, limit: 200 });
      console.log('[DEBUG] feedbackAPI.getAll response:', res);
      console.log('[DEBUG] Response data:', res?.data);
      
      const items: FeedbackItem[] = (res?.data || []).map((f: any) => ({
        id: f._id || f.id,
        name: f.name,
        email: f.email,
        message: f.message,
        type: f.type || 'general',
        rating: f.rating,
        createdAt: f.createdAt,
        isRead: !!f.isRead,
      }));
      console.log('[DEBUG] mapped feedback items:', items);
      setFeedbackList(items);
    } catch (err: any) {
      console.error('[ERROR] Full error object:', err);
      console.error('[ERROR] Error message:', err?.message);
      
      // Handle 401 / user not found errors - force logout
      const errMsg = err?.message || '';
      if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('User') || errMsg.includes('account') || errMsg.includes('token')) {
        console.warn('[FEEDBACK] Admin session invalid - forcing logout');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setTimeout(() => navigate('/admin/login'), 100);
        return;
      }
      
      setError(err?.message || 'Failed to load feedback. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await feedbackAPI.markAsRead(id);
      setFeedbackList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      markInContext(id); // keep context badge in sync
    } catch {
      // silently ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback permanently?')) return;
    try {
      await feedbackAPI.delete(id);
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert('Failed to delete: ' + (err?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6B8E23] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    // Check if it's an auth error
    const isAuthError = error.includes('401') || error.includes('Unauthorized') || error.includes('Invalid') || error.includes('expired');
    
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <p className="text-red-500 font-semibold mb-2">Error loading feedback</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        {isAuthError && (
          <p className="text-amber-600 text-sm mb-4 font-medium">
            💡 Tip: Your admin session may have expired. Try signing out and signing back in.
          </p>
        )}
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-2 mx-auto bg-[#6B8E23] text-white px-4 py-2 rounded-lg hover:bg-[#5B7A1E] transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium">No feedback yet</p>
        <p className="text-gray-400 text-sm mt-1">Feedback submitted by users will appear here.</p>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-2 mx-auto mt-4 text-[#6B8E23] hover:underline text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  const unreadFeedback = feedbackList.filter((f) => !f.isRead);
  const readFeedback = feedbackList.filter((f) => f.isRead);

  const FeedbackCard = ({ feedback }: { feedback: FeedbackItem }) => {
    const rating = feedback.rating && feedback.rating >= 1 && feedback.rating <= 5 ? feedback.rating : 0;
    return (
      <div
        className={`rounded-xl shadow-sm border p-6 mb-4 transition-all ${feedback.isRead
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-l-4 border-l-[#6B8E23] border-gray-200 shadow-md'
          }`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-bold text-[#5B6F1E]">{feedback.name}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${feedback.type === 'suggestion'
                    ? 'bg-purple-100 text-purple-700'
                    : feedback.type === 'bug'
                      ? 'bg-red-100 text-red-700'
                      : feedback.type === 'feature-request'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                  }`}
              >
                {feedback.type.replace('-', ' ').toUpperCase()}
              </span>
              {!feedback.isRead && (
                <span className="w-2.5 h-2.5 bg-[#6B8E23] rounded-full animate-pulse" title="New" />
              )}
            </div>

            <p className="text-gray-500 text-sm mb-2">{feedback.email}</p>

            {rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={rating} />
                <span className="text-sm text-gray-500 font-medium">{rating}/5</span>
              </div>
            )}

            <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-4">
              {feedback.message}
            </p>

            <div className="text-xs text-gray-400">
              Received: {new Date(feedback.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {!feedback.isRead && (
              <button
                onClick={() => handleMarkAsRead(feedback.id)}
                className="p-2 text-[#6B8E23] hover:bg-green-50 rounded-lg transition"
                title="Mark as read"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleDelete(feedback.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Delete feedback"
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
      {/* Stats bar */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-3 flex items-center gap-3">
          <span className="w-3 h-3 bg-[#6B8E23] rounded-full" />
          <div>
            <p className="text-xs text-gray-500">Unread</p>
            <p className="text-xl font-bold text-[#5B6F1E]">{unreadFeedback.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-3 flex items-center gap-3">
          <span className="w-3 h-3 bg-gray-400 rounded-full" />
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-700">{feedbackList.length}</p>
          </div>
        </div>
        <button
          onClick={fetchFeedback}
          className="ml-auto flex items-center gap-2 text-sm text-[#6B8E23] hover:text-[#5B7A1E] font-medium border border-[#6B8E23] px-3 py-2 rounded-lg hover:bg-green-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {unreadFeedback.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#5B6F1E] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#6B8E23] rounded-full" />
            New Messages ({unreadFeedback.length})
          </h3>
          {unreadFeedback.map((f) => (
            <FeedbackCard key={f.id} feedback={f} />
          ))}
        </div>
      )}

      {readFeedback.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-500 mb-4">
            Previous Feedback ({readFeedback.length})
          </h3>
          {readFeedback.map((f) => (
            <FeedbackCard key={f.id} feedback={f} />
          ))}
        </div>
      )}
    </div>
  );
}
