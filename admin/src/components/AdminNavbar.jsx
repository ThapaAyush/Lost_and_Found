import React from 'react';
import { ShieldCheck, LogOut, ExternalLink, User, Globe, ArrowUpRight } from 'lucide-react';
import { useAdminAuth, ADMIN_EMAIL } from '../context/AdminAuthContext';

const AdminNavbar = () => {
  const { adminUser, logout } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-sm font-black text-slate-800 tracking-tight hidden sm:inline-block">
          Governance Console
        </h2>

        {/* Portal Switcher Tabs */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-blue-600 text-white shadow-sm flex items-center space-x-1.5 cursor-default">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Page</span>
          </span>
          <a
            href="http://localhost:5173"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-white transition flex items-center space-x-1.5 group"
            title="Switch to Frontend Page (Port 5173)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            <span>Frontend Page</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-slate-800 leading-tight">
              {adminUser?.name || 'Ayush Admin'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 font-mono">
              {ADMIN_EMAIL}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

