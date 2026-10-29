import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Camera,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
  Clock,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [removeAvatarModalOpen, setRemoveAvatarModalOpen] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // User Dashboard Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch quick activity stats on load
  useEffect(() => {
    const fetchUserStats = async () => {
      setStatsLoading(true);
      try {
        const res = await userAPI.getStats();
        if (res.data?.success && res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('[Fetch Stats Error]', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchUserStats();
  }, []);

  // Sync state whenever user data loads or updates
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone !== undefined) setPhone(user.phone || '');
      if (user.avatar) {
        setAvatarPreview(user.avatar);
        setAvatarImgError(false);
      } else {
        setAvatarPreview('');
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

  const handleConfirmRemoveAvatar = async () => {
    setAvatarRemoving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await userAPI.removeAvatar();
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setAvatarPreview('');
        setAvatarFile(null);
        setAvatarImgError(false);
        setProfileSuccess('Profile picture removed successfully!');
        setTimeout(() => setProfileSuccess(''), 4000);
      }
    } catch (err) {
      console.error('[Remove Avatar Error]', err);
      setProfileError(err.message || 'Failed to remove profile picture. Please try again.');
    } finally {
      setAvatarRemoving(false);
      setRemoveAvatarModalOpen(false);
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

  const hasAvatar = Boolean((avatarPreview || user?.avatar) && !avatarImgError);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {/* Subtle Decorative Top Banner */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Account Badges on Top Right */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
              {user?.role === 'admin' ? 'Administrator' : 'Community Member'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified
            </span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-5">
            {/* Avatar Circle with Hover Effect & Edge Camera Badge */}
            <div className="relative group shrink-0 self-center sm:self-auto">
              <div
                onClick={() => {
                  if (!avatarUploading && !avatarRemoving) {
                    fileInputRef.current?.click();
                  }
                }}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-slate-100 cursor-pointer group-hover:ring-blue-400/60 transition-all duration-300 relative bg-white"
              >
                {hasAvatar ? (
                  <img
                    src={avatarPreview || user?.avatar}
                    alt={user?.name}
                    onError={() => setAvatarImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-4xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}

                {/* Dark Hover Overlay */}
                {!avatarUploading && !avatarRemoving && (
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                    <Camera className="w-6 h-6 mb-1 text-white/95" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                      {hasAvatar ? 'Change Photo' : 'Upload'}
                    </span>
                  </div>
                )}

                {/* Loading State Overlay */}
                {(avatarUploading || avatarRemoving) && (
                  <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white backdrop-blur-[2px] z-10">
                    <Loader2 className="w-7 h-7 animate-spin text-white mb-1.5" />
                    <span className="text-[11px] font-bold text-white/90">
                      {avatarUploading ? 'Saving...' : 'Removing...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Edge Camera Action Button */}
              <button
                type="button"
                disabled={avatarUploading || avatarRemoving}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition disabled:opacity-50"
                title={hasAvatar ? 'Change profile photo' : 'Upload profile photo'}
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Photo Action Buttons on Right Side */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2 sm:pt-0">
              <button
                type="button"
                disabled={avatarUploading || avatarRemoving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>{hasAvatar ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {hasAvatar && (
                <button
                  type="button"
                  disabled={avatarUploading || avatarRemoving}
                  onClick={() => setRemoveAvatarModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/80 transition shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* User Identity Info */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center justify-center sm:justify-start space-x-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {user?.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                  Active
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start">
              <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
              <span>{user?.email}</span>
            </p>

            {/* Meta Information Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>

              <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 font-medium">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span>{user?.phone || 'No phone number added'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lost Reports</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {statsLoading ? '...' : stats?.totalLost ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Found Items</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {statsLoading ? '...' : stats?.totalFound ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Returned</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {statsLoading ? '...' : stats?.returnedItems ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Open</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {statsLoading ? '...' : stats?.openReports ?? 0}
            </p>
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

      {/* Remove Profile Picture Confirmation Dialog */}
      <ConfirmDialog
        isOpen={removeAvatarModalOpen}
        onClose={() => setRemoveAvatarModalOpen(false)}
        onConfirm={handleConfirmRemoveAvatar}
        title="Remove Profile Picture?"
        message="Are you sure you want to remove your profile picture? Your profile will revert to displaying your name initial."
        confirmText="Remove Picture"
        isDanger={true}
        loading={avatarRemoving}
      />
    </div>
  );
};

export default ProfilePage;