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
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo in Sidebar for mobile */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between lg:hidden">
            <span className="font-bold text-slate-800 text-sm">Navigation Menu</span>
            <button
              onClick={closeSidebar}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Close
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
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
                        : link.isLost
                        ? 'text-rose-600 hover:bg-rose-50'
                        : link.isMatches
                        ? 'text-purple-600 hover:bg-purple-50'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-white'
                              : link.isLost
                              ? 'text-rose-500'
                              : link.isMatches
                              ? 'text-purple-500'
                              : 'text-slate-400'
                          }`}
                        />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                            isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
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
        <div className="p-3 border-t border-slate-100 space-y-2">
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Oversight</span>
            </NavLink>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
