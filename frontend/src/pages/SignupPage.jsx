import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateField = (field, value, allValues = formData) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value || !value.trim()) {
          error = 'Please enter your full name';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !value.trim()) {
          error = 'Please enter your email address';
        } else if (!emailRegex.test(value.trim())) {
          error = 'Please enter a valid email address (e.g. alex@example.com)';
        }
        break;
      }

      case 'phone': {
        if (value && value.trim()) {
          const cleaned = value.replace(/[\s\-\(\)\+]/g, '');
          if (cleaned.length < 7 || cleaned.length > 15 || !/^\d+$/.test(cleaned)) {
            error = 'Please enter a valid phone number (or leave blank)';
          }
        }
        break;
      }

      case 'password':
        if (!value) {
          error = 'Please create a password';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (allValues.password && value !== allValues.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'agreed':
        if (!value) {
          error = 'Please accept the guidelines & terms to proceed';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateAll = (data = formData) => {
    const newErrors = {};
    ['name', 'email', 'phone', 'password', 'confirmPassword', 'agreed'].forEach((key) => {
      const err = validateField(key, data[key], data);
      if (err) newErrors[key] = err;
    });
    return newErrors;
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // If confirmPassword was touched and password changes, revalidate confirmPassword
    if (field === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', formData.confirmPassword, updated);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }

    if (touched[field]) {
      const err = validateField(field, value, updated);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field], formData);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Mark all fields as touched to display inline errors
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreed: true,
    };
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    const result = await signup({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      const msg = result.message || 'Signup failed. Please try again.';
      // Route backend message directly to the offending input box
      if (/email.*already exists/i.test(msg)) {
        setErrors((prev) => ({
          ...prev,
          email: 'An account with this email address already exists. Please sign in or use another email.',
        }));
        setTouched((prev) => ({ ...prev, email: true }));
      } else if (/password/i.test(msg) && /match/i.test(msg)) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        setTouched((prev) => ({ ...prev, confirmPassword: true }));
      } else if (/password/i.test(msg) && /6 characters/i.test(msg)) {
        setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
        setTouched((prev) => ({ ...prev, password: true }));
      } else {
        setGeneralError(msg);
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Join our community lost & found network to report and recover items.
        </p>
      </div>

      {generalError && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="Alex Johnson"
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                touched.name && errors.name
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <User
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                touched.name && errors.name ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
          </div>
          {touched.name && errors.name && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="alex@college.edu"
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

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 555-0199"
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                touched.phone && errors.phone
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <Phone
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                touched.phone && errors.phone ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Password (at least 6 chars) *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                touched.confirmPassword && errors.confirmPassword
                  ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            <Lock
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                touched.confirmPassword && errors.confirmPassword ? 'text-rose-400' : 'text-slate-400'
              }`}
            />
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.confirmPassword}</span>
            </p>
          )}
        </div>

        {/* Terms agreement */}
        <div>
          <div className="flex items-start space-x-2 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={formData.agreed}
              onChange={(e) => handleChange('agreed', e.target.checked)}
              onBlur={() => handleBlur('agreed')}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
              I agree to the community guidelines, truthful reporting policy, and confidential claim verification process.
            </label>
          </div>
          {touched.agreed && errors.agreed && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center space-x-1.5 font-medium animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.agreed}</span>
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
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
          Sign In instead
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
