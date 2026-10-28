import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, HeartHandshake, ShieldCheck, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Left Branding Showcase Hero */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">
                Lost <span className="text-purple-400">&</span> Found
              </h1>
              <p className="text-xs text-blue-200">Campus Reconnection Platform</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-10 md:my-0 max-w-md space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Community Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Every Lost Item Deserves A Safe Way Home.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report misplaced belongings, verify ownership with confidential proof, and safely
            coordinate handovers with fellow students and campus staff.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center space-x-3 text-slate-200">
              <div className="w-7 h-7 rounded-lg bg-blue-600/50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-300" />
              </div>
              <span>Administrator-verified ownership claims before handover</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-200">
              <div className="w-7 h-7 rounded-lg bg-purple-600/50 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-4 h-4 text-purple-300" />
              </div>
              <span>Private in-app messaging to preserve student privacy</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Campus Lost & Found Community Hub
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
