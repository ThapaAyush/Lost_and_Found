import React from 'react';
import { ShieldCheck, LogOut, ExternalLink, User } from 'lucide-react';
import { useAdminAuth, ADMIN_EMAIL } from '../context/AdminAuthContext';

const AdminNavbar = () => {
  const { adminUser, logout } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <h2 className="text-sm font-black text-slate-800 tracking-tight">
          Platform Governance Console
        </h2>
        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 hidden sm:inline-block">
          Local Port 5174
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Open Public Site</span>
        </a>

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
