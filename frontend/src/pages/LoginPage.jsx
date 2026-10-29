import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = (currentEmail = email, currentPassword = password) => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!currentEmail || !currentEmail.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!emailRegex.test(currentEmail.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!currentPassword) {
      errs.password = 'Please enter your password';
    }

    return errs;
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (touched.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let err = '';
      if (!val || !val.trim()) {
        err = 'Please enter your email address';
      } else if (!emailRegex.test(val.trim())) {
        err = 'Please enter a valid email address';
      }
      setErrors((prev) => ({ ...prev, email: err }));
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: val ? '' : 'Please enter your password' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setTouched({ email: true, password: true });

    const valErrors = validate(email, password);
    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) {
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setGeneralError(result.message || 'Invalid email or password.');
      setErrors({
        email: 'Please check your email address',
        password: 'Or verify your password is correct',
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your account credentials to access your dashboard and reports.
        </p>
      </div>

      {generalError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }));
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                let err = '';
                if (!email || !email.trim()) err = 'Please enter your email address';
                else if (!emailRegex.test(email.trim())) err = 'Please enter a valid email address';
                setErrors((prev) => ({ ...prev, email: err }));
              }}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                touched.email && errors.email
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <Mail
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                touched.email && errors.email ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
          </div>
          {touched.email && errors.email && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }));
                setErrors((prev) => ({
                  ...prev,
                  password: password ? '' : 'Please enter your password',
                }));
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                touched.password && errors.password
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <Lock
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                touched.password && errors.password ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Sign In to Lost & Found</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
