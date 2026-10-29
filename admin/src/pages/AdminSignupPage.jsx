import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Users,
  ShieldAlert,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminSignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateField = (field, value, allValues = formData) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value || !value.trim()) {
          error = 'Please enter the user’s full name';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !value.trim()) {
          error = 'Please enter an email address';
        } else if (!emailRegex.test(value.trim())) {
          error = 'Please enter a valid email address';
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
          error = 'Please create an initial password';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm the password';
        } else if (allValues.password && value !== allValues.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (touched[name]) {
        const err = validateField(name, value, updated);
        setErrors((prevErr) => ({ ...prevErr, [name]: err }));
      }
      return updated;
    });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password: generated,
      confirmPassword: generated,
    }));
    setErrors((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const newErrors = {};
    ['name', 'email', 'phone', 'password', 'confirmPassword'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await adminAPI.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
      });

      if (res.data?.success) {
        setSuccessMessage(`Account for "${formData.name}" (${formData.email}) registered successfully as ${formData.role.toUpperCase()}!`);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'user',
        });
        setTouched({});
        setErrors({});
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user account.';
      setGeneralError(msg);
      if (/email.*already exists/i.test(msg)) {
        setErrors((prev) => ({ ...prev, email: 'An account with this email already exists.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Folder Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Link
          to="/items"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>Lost & Found Data</span>
        </Link>
        <Link
          to="/users"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>Users Section</span>
        </Link>
        <Link
          to="/signup"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Sign-Up User</span>
        </Link>
        <Link
          to="/claims"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Claims Oversight</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <span>Admin Sign-Up Section</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision and create new user accounts directly inside the administrative portal.
          </p>
        </div>

        <Link
          to="/users"
          className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          <span>View Users Directory</span>
        </Link>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <Link
            to="/users"
            className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
          >
            Go to Users
          </Link>
        </div>
      )}

      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center space-x-2 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card max-w-2xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. John Doe"
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                  touched.name && errors.name
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="user@example.com"
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                  touched.email && errors.email
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="+1 555-0199"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Account Role *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition ${
                  formData.role === 'user'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Standard User</p>
                  <p className="text-[11px] text-slate-500">Can report and claim items</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer flex items-center space-x-3 transition ${
                  formData.role === 'admin'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">Staff Administrator</p>
                  <p className="text-[11px] text-slate-500">Administrative capabilities</p>
                </div>
              </label>
            </div>
          </div>

          {/* Password Header & Generator */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Initial Password *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline transition"
              >
                Auto-Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="At least 6 characters"
                className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                  touched.password && errors.password
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
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
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border rounded-xl focus:outline-none transition ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                    : 'bg-slate-50 focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Provision & Register User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignupPage;

