import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  UserPlus,
  ShieldAlert,
  AlertTriangle,
  History,
  LogOut,
  ExternalLink,
  ShieldCheck,
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
    { to: '/abuse-reports', label: 'Abuse Reports', icon: AlertTriangle },
    { to: '/audit-logs', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block">
                Lost & Found
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/50">
                Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
            External Links
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center space-x-3">
              <ExternalLink className="w-4 h-4 text-teal-400" />
              <span>Public Portal (5173)</span>
            </div>
          </a>
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <p className="text-xs font-black text-white truncate">{adminUser?.name || 'Administrator'}</p>
          <p className="text-[10px] text-blue-400 truncate font-mono">{ADMIN_EMAIL}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
