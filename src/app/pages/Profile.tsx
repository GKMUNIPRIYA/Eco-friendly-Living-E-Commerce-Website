import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.postalCode || '',
    dateOfBirth: user?.dateOfBirth || '',
  });

  // Fetch full profile from API on mount
  useEffect(() => {
    if (isAuthenticated && !profileLoaded) {
      authAPI.getProfile().then((res: any) => {
        if (res?.success && res.data) {
          const d = res.data;
          const addr = d.address || {};
          setFormData({
            firstName: d.firstName || '',
            lastName: d.lastName || '',
            email: d.email || '',
            phone: d.phone || '',
            address: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.postalCode || '',
            dateOfBirth: d.dateOfBirth ? d.dateOfBirth.substring(0, 10) : '',
          });
          // Also update context so other pages see the full data
          updateUser({
            id: d._id || d.id || user?.id || '',
            firstName: d.firstName || '',
            lastName: d.lastName || '',
            email: d.email || '',
            role: d.role || 'user',
            phone: d.phone || '',
            dateOfBirth: d.dateOfBirth || '',
            address: addr,
          });
          setProfileLoaded(true);
        }
      }).catch(() => { /* silently fail, use context data */ });
    }
  }, [isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Auth guard placed after all hooks
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'User';

  return (
    <div
      className="min-h-screen py-12 relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] px-8 py-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{fullName}</h1>
              <p className="text-green-100 text-sm mt-1">{formData.email}</p>
              <span className="mt-2 inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {(user as any).role === 'admin' ? 'Administrator' : 'Eco Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#5B6F1E]">My Profile</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-[#6B8E23] text-white px-4 py-2 rounded-lg hover:bg-[#5B7A1E] transition text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#6B8E23] text-white px-4 py-2 rounded-lg hover:bg-[#5B7A1E] transition text-sm font-medium disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <User className="w-4 h-4" /> First Name
              </label>
              {editing ? (
                <input name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="off"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.firstName || '—'}</p>
              )}
            </div>
            {/* Last Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <User className="w-4 h-4" /> Last Name
              </label>
              {editing ? (
                <input name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="off"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.lastName || '—'}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              {editing ? (
                <input name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="off"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.email || '—'}</p>
              )}
            </div>
            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <Phone className="w-4 h-4" /> Phone
              </label>
              {editing ? (
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} autoComplete="off"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.phone || '—'}</p>
              )}
            </div>
            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <Calendar className="w-4 h-4" /> Date of Birth
              </label>
              {editing ? (
                <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : '—'}</p>
              )}
            </div>
            {/* Pincode */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <MapPin className="w-4 h-4" /> Pincode
              </label>
              {editing ? (
                <input name="pincode" value={formData.pincode} onChange={handleChange} autoComplete="off"
                  placeholder="560001"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.pincode || '—'}</p>
              )}
            </div>
            {/* Address - full width */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                <MapPin className="w-4 h-4" /> Address
              </label>
              {editing ? (
                <input name="address" value={formData.address} onChange={handleChange} autoComplete="off"
                  placeholder="Street address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.address || '—'}</p>
              )}
            </div>
            {/* City */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">City</label>
              {editing ? (
                <input name="city" value={formData.city} onChange={handleChange} autoComplete="off"
                  placeholder="Bengaluru"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.city || '—'}</p>
              )}
            </div>
            {/* State */}
            <div>
              <label className="text-sm font-medium text-gray-500 mb-1 block">State</label>
              {editing ? (
                <input name="state" value={formData.state} onChange={handleChange} autoComplete="off"
                  placeholder="Karnataka"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]" />
              ) : (
                <p className="font-semibold text-gray-800">{formData.state || '—'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
