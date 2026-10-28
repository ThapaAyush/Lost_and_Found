import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Search,
  CheckSquare,
  PlusCircle,
  FileText,
  Sparkles,
  ShieldAlert,
  Bell,
  MessageSquare,
  User,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = ({ isOpen, isDesktopOpen = true, closeSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Homepage', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/found-items', label: 'Found Belongings', icon: CheckSquare },
    { to: '/lost-items', label: 'Lost Reports', icon: Search },
    { to: '/report/lost', label: 'Report Lost Item', icon: PlusCircle, isLost: true },
    { to: '/report/found', label: 'Report Found Item', icon: PlusCircle, isFound: true },
    { to: '/my-reports', label: 'My Reports', icon: FileText },
    { to: '/matches', label: 'Smart Matches', icon: Sparkles, isMatches: true },
    { to: '/claims', label: 'My Claims', icon: ShieldAlert },
    { to: '/conversations', label: 'Messages', icon: MessageSquare },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel: Sticks below Navbar on desktop (lg:top-16), never overlapping top bar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full'
        } ${
          isDesktopOpen
            ? 'lg:translate-x-0 lg:w-64 lg:shadow-none'
            : 'lg:-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        {/* Top Header inside Sidebar for mobile drawer */}
        <div className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
            <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with custom scroll */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-white'
                              : link.isMatches
                              ? 'text-teal-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{link.label}</span>
                      </div>
                      {link.badge && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full shrink-0 ${
                            isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Quick Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2 shrink-0">
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
              <span className="truncate">Admin Oversight</span>
            </NavLink>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;