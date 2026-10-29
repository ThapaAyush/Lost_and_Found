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
      <div className="md:w-1/2 bg-blue-600 text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight">
                Lost <span className="text-teal-300">&</span> Found
              </h1>
            </div>
          </Link>
        </div>

        <div className="relative z-10 my-10 md:my-0 max-w-md space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Community Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Every Lost Item Deserves A Safe Way Home.
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Report misplaced belongings, verify ownership with confidential proof, and safely
            coordinate handovers with fellow students and campus staff.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span>Administrator-verified ownership claims before handover</span>
            </div>

            <div className="flex items-center space-x-3 text-white">
              <div className="w-7 h-7 rounded-lg bg-teal-500/30 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-4 h-4 text-teal-200" />
              </div>
              <span>Private in-app messaging to preserve student privacy</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-blue-200">
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
