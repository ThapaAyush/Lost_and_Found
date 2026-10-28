import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your account email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authAPI.forgotPassword({ email });
      setSuccessMessage(res.data.message);
      if (res.data.devResetToken) {
        setDevResetToken(res.data.devResetToken);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Login
        </Link>
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <KeyRound className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot password?</h2>
        <p className="text-xs text-slate-500 mt-1">
          No worries. Enter your email and we'll send you recovery instructions.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <p className="font-bold">Instructions Dispatched</p>
              <p className="mt-1">{successMessage}</p>
            </div>
          </div>

          {devResetToken && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800">
              <p className="font-bold mb-1">Development Shortcut:</p>
              <Link
                to={`/reset-password/${devResetToken}`}
                className="underline font-semibold text-blue-700 hover:text-blue-900 break-all"
              >
                Click here to test reset password directly
              </Link>
            </div>
          )}

          <Link
            to="/login"
            className="w-full inline-flex justify-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
              <span>Send Recovery Email</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;