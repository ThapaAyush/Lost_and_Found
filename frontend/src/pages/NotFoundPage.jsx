import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-5 shadow-card">
        <Compass className="w-10 h-10 animate-pulse" />
      </div>

      <h1 className="text-5xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">This Page Seems to Be Lost</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-2">
        We couldn't find the resource or page you were looking for. Even the best navigators lose
        their way sometimes!
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-md"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <Link
          to="/found-items"
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition"
        >
          <Search className="w-4 h-4 mr-2" />
          Browse Found Items
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;