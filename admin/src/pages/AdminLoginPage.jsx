import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertTriangle, KeyRound } from 'lucide-react';
import { useAdminAuth, ADMIN_EMAIL } from '../context/AdminAuthContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('ayush108ayush108@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleUseCredentials = () => {
    setEmail('ayush108ayush108@gmail.com');
    setPassword('1234qwer');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.trim()) {
      setError('Please provide the designated administrator email.');
      return;
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError(`Access denied. Only the designated administrator (${ADMIN_EMAIL}) is permitted.`);
      return;
    }

    if (!password) {
      setError('Please enter the administrator password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center shadow-xl shadow-blue-500/20 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Administrator Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access portal for Lost & Found platform administrators.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/70 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                Designated Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ayush108ayush108@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={handleUseCredentials}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition flex items-center space-x-1"
                >
                  <KeyRound className="w-3 h-3 mr-0.5" />
                  <span>Auto-fill Admin Pass</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <a
              href="http://localhost:5173"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              ← Return to Public Lost & Found Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

