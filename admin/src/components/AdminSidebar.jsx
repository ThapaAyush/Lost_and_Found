import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  UserPlus,
  ShieldAlert,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import { useAdminAuth, ADMIN_EMAIL } from '../context/AdminAuthContext';

const AdminSidebar = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/items', label: 'Lost & Found Data', icon: Package },
    { to: '/users', label: 'Users Section', icon: Users },
    { to: '/signup', label: 'Sign-Up User', icon: UserPlus },
    { to: '/claims', label: 'Claims Oversight', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-200 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-slate-900 block">
                Lost <span className="text-teal-600">&</span> Found
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block">
                Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Control Center
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Switch Application
          </div>
          <a
            href="http://localhost:5173"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group"
            title="Switch to Frontend Page (Port 5173)"
          >
            <div className="flex items-center space-x-2.5">
              <Globe className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Switch to Frontend</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
          </a>
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-900 truncate">{adminUser?.name || 'Administrator'}</p>
          <p className="text-[10px] text-blue-600 truncate font-mono">{ADMIN_EMAIL}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

