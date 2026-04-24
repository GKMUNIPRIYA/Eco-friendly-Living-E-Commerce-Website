import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { User, Mail, Edit3, Save, X, ShieldCheck, LayoutDashboard, LogOut, Key, Camera, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProfile() {
  const navigate = useNavigate();

  const rawAdmin = localStorage.getItem('adminUser');
  const adminUser = rawAdmin ? (() => { try { return JSON.parse(rawAdmin); } catch { return null; } })() : null;

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: adminUser?.firstName || '',
    lastName: adminUser?.lastName || '',
    email: adminUser?.email || '',
    profileImage: adminUser?.profileImage || '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (!adminUser || adminUser.role !== 'admin') {
    navigate('/admin/login');
    return null;
  }

  useEffect(() => {
    authAPI.getAdminProfile().then((res: any) => {
      if (res?.success && res.data) {
        const d = res.data;
        setFormData({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          email: d.email || '',
          profileImage: d.profileImage || '',
        });
      }
    }).catch(() => { });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateAdminProfile(formData);

      localStorage.setItem('adminUser', JSON.stringify({ ...adminUser, ...formData }));
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill both password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      // Backend usually expects 'currentPassword' and 'newPassword'
      await authAPI.updateAdminProfile({ 
        currentPassword, 
        newPassword 
      });

      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ') || 'Admin';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24 pb-8">
            <div className="h-44 bg-gradient-to-tr from-[#556B2F] to-[#8FBC5A]"></div>
            
            <div className="px-6 flex flex-col items-center">
              {/* Photo Section - Using negative margin instead of absolute positioning to keep it in flow */}
              <div className="-mt-16 mb-6">
                <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-2xl relative group ring-4 ring-white">
                  <div className="w-full h-full rounded-[1.4rem] bg-gray-50 flex items-center justify-center text-4xl font-black text-[#6B8E23] overflow-hidden border-2 border-green-100">
                    {adminUser?.profileImage || formData.profileImage ? (
                      <img 
                        src={(() => {
                          const path = formData.profileImage;
                          if (path.startsWith('http')) return path;
                          const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';
                          const rootUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
                          return `${rootUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                        })()} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                      />
                    ) : formData.firstName && formData.lastName ? (
                      `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
                    ) : (
                      <UserCircle className="w-20 h-20 text-gray-200" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-image-input"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const uploadFormData = new FormData();
                      uploadFormData.append('image', file);
                      
                      setLoading(true);
                      try {
                        const res = await authAPI.updateAdminProfileImage(uploadFormData);
                        if (res.success && res.data?.profileImage) {
                          const newImageUrl = res.data.profileImage;
                          const updatedUser = { ...adminUser, profileImage: newImageUrl };
                          localStorage.setItem('adminUser', JSON.stringify(updatedUser));
                          setFormData(prev => ({ ...prev, profileImage: newImageUrl }));
                          toast.success('Profile photo updated!');
                        } else {
                          toast.error(res.error?.message || 'Upload failed');
                        }
                      } catch (err) {
                        toast.error('Failed to upload image');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                    className="absolute bottom-1 right-1 bg-[#6B8E23] text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-transform z-10"
                    title="Change Profile Photo"
                    disabled={loading}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Name and Info Section */}
              <div className="text-center w-full">
                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">{fullName}</h2>
                <div className="flex items-center justify-center gap-1.5 text-gray-500 font-medium mb-6">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-sm">{formData.email}</span>
                </div>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="px-4 py-1.5 bg-green-50 text-[#6B8E23] text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 shadow-sm flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> System Admin
                  </span>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 shadow-sm">
                    Verified
                  </span>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-3">
                  <button onClick={() => window.open('/', '_blank')} 
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-gray-100">
                    <LayoutDashboard className="w-4 h-4" /> View Storefront
                  </button>
                  <button onClick={handleLogout}
                    className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-100">
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900">Personal Details</h3>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Manage your identity and contact info</p>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white hover:bg-[#6B8E23] hover:text-white text-[#6B8E23] border-2 border-[#6B8E23]/10 px-5 py-2 rounded-2xl transition-all font-bold text-sm flex items-center gap-2 shadow-sm"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={loading}
                    className="bg-[#6B8E23] text-white px-6 py-2 rounded-2xl hover:bg-[#556B2F] transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50">
                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="bg-gray-100 text-gray-600 px-5 py-2 rounded-2xl hover:bg-gray-200 transition-all font-bold text-sm flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#6B8E23] transition-colors" />
                    <input 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleChange} 
                      disabled={!editing}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl transition-all font-bold text-gray-900 focus:outline-none focus:bg-white ${
                        editing ? 'border-gray-100 focus:border-[#6B8E23]' : 'border-transparent'
                      }`} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#6B8E23] transition-colors" />
                    <input 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleChange} 
                      disabled={!editing}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl transition-all font-bold text-gray-900 focus:outline-none focus:bg-white ${
                        editing ? 'border-gray-100 focus:border-[#6B8E23]' : 'border-transparent'
                      }`} 
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#6B8E23] transition-colors" />
                    <input 
                      name="email" 
                      type="email"
                      value={formData.email} 
                      onChange={handleChange} 
                      disabled={!editing}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-2xl transition-all font-bold text-gray-900 focus:outline-none focus:bg-white ${
                        editing ? 'border-gray-100 focus:border-[#6B8E23]' : 'border-transparent'
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h3 className="text-xl font-black text-gray-900">Security</h3>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Manage your password and authentication</p>
              </div>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="text-[#6B8E23] hover:text-[#556B2F] font-black text-sm transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            <div className="p-8">
              {changingPassword ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#6B8E23] transition-colors" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl transition-all font-bold focus:outline-none focus:bg-white focus:border-[#6B8E23]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#6B8E23] transition-colors" />
                      <input 
                        type="password" 
                        placeholder="Min. 6 chars"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl transition-all font-bold focus:outline-none focus:bg-white focus:border-[#6B8E23]" 
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button onClick={handlePasswordChange} disabled={loading}
                      className="flex-1 bg-gray-900 text-white py-4 rounded-2xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200 disabled:opacity-50">
                      {loading ? 'Processing...' : 'Update Password'}
                    </button>
                    <button onClick={() => { setChangingPassword(false); setCurrentPassword(''); setNewPassword(''); }}
                      className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl hover:bg-gray-200 transition-all font-bold">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-50">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#6B8E23]" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">Your account is secure</h4>
                    <p className="text-xs text-gray-500 font-medium">Last password change was recently. We recommend changing it every 3 months.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

