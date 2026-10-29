import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Camera,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Sync state whenever user data loads or updates
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone !== undefined) setPhone(user.phone || '');
      if (user.avatar) {
        setAvatarPreview(user.avatar);
        setAvatarImgError(false);
      }
    }
  }, [user]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Auto-upload and save avatar immediately upon file selection
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setAvatarFile(file);
    const localBlob = URL.createObjectURL(file);
    setAvatarPreview(localBlob);
    setAvatarImgError(false);
    setAvatarUploading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      if (name) formData.append('name', name.trim());
      if (phone !== undefined) formData.append('phone', phone.trim());

      const res = await userAPI.updateProfile(formData);
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setAvatarPreview(res.data.user.avatar || localBlob);
        setProfileSuccess('Profile picture updated and saved successfully!');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      console.error('[Avatar Upload Error]', err);
      setProfileError(err.message || 'Failed to upload profile picture. Please try again.');
      setAvatarPreview(user?.avatar || '');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await userAPI.updateProfile(formData);
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setProfileSuccess('Profile details updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await userAPI.changePassword({ currentPassword, newPassword });
      if (res.data?.success) {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center sm:items-start space-y-5 sm:space-y-0 sm:space-x-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-blue-100/30 via-teal-100/20 to-transparent pointer-events-none rounded-bl-full" />

        {/* Avatar with Camera Overlay */}
        <div className="relative group shrink-0">
          {(avatarPreview || user?.avatar) && !avatarImgError ? (
            <img
              src={avatarPreview || user?.avatar}
              alt={user?.name}
              onError={() => setAvatarImgError(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-white shadow-md ring-2 ring-blue-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}

          {avatarUploading && (
            <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center border-4 border-white">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          <button
            type="button"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg transition disabled:opacity-75"
            title="Upload profile picture"
          >
            {avatarUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* User Identity Details */}
        <div className="flex-1 text-center sm:text-left space-y-3 relative z-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 mr-0.5 text-blue-600" />
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{user?.email}</p>
            </div>

            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Verified
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Member since {formatDate(user?.createdAt)}
            </span>
            {user?.phone && (
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Edit Profile & Change Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column: Edit Personal Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500 mt-1">
              Update your display name and optional contact phone number.
            </p>
          </div>

          {profileError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-100 text-sm border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Email address is tied to your verified login credentials.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {profileSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Security & Password Update */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ensure your account stays secure by updating your password.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 shrink-0" />
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password (min 6 characters) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {passwordSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          {/* Sign out section */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Current Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;