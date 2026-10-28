import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({ token, newPassword });
      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
      <div className="mb-6">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Set new password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Choose a secure password for your Lost & Found account.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      {success ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-sm text-emerald-900">Password Reset Successful!</h4>
          <p className="text-xs text-emerald-700">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;