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
  LogOut,
  X,
  ShieldCheck,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = ({ isOpen, isDesktopOpen = true, closeSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Main Navigation',
      links: [
        { to: '/', label: 'Homepage', icon: Home },
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/found-items', label: 'Found Belongings', icon: CheckSquare },
        { to: '/lost-items', label: 'Lost Reports', icon: Search },
      ],
    },
    {
      title: 'Quick Actions',
      links: [
        { to: '/report/lost', label: 'Report Lost Item', icon: PlusCircle, isLost: true },
        { to: '/report/found', label: 'Report Found Item', icon: PlusCircle, isFound: true },
      ],
    },
    {
      title: 'Personal Workspace',
      links: [
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
      ],
    },
    {
      title: 'Account',
      links: [
        { to: '/profile', label: 'My Profile', icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay - Fullscreen dark blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel: Full height edge-to-edge native drawer on mobile, static 64px offset on desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 h-dvh w-[85vw] max-w-xs sm:max-w-sm bg-white flex flex-col justify-between transition-transform duration-300 ease-out shrink-0 select-none z-50 rounded-r-3xl shadow-2xl lg:rounded-none lg:shadow-none lg:border-r lg:border-slate-200 lg:top-16 lg:bottom-auto lg:h-[calc(100dvh-4rem)] lg:w-64 lg:z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDesktopOpen
            ? 'lg:translate-x-0'
            : 'lg:-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Header inside Sidebar for mobile drawer */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden shrink-0 bg-gradient-to-r from-blue-50/70 via-slate-50/30 to-white">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/25">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <span className="font-black text-base tracking-tight text-slate-900">
                Lost <span className="text-teal-600">&</span> Found
              </span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-2xs transition active:scale-95"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Summary Card (Mobile Drawer only) */}
          {user ? (
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 lg:hidden flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-2xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase shrink-0">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/60 border-b border-blue-100/60 lg:hidden flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-800">Welcome to Lost & Found</p>
                <p className="text-[10px] text-slate-500">Sign in to report and track items</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  navigate('/login');
                }}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-2xs hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </div>
          )}

          {/* Navigation Links with custom scroll */}
          <nav className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-none">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                {section.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={(e) => {
                        closeSidebar();
                        if (!user && link.to !== '/') {
                          e.preventDefault();
                          navigate('/login');
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all tap-bounce ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
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
                                  : link.isLost
                                  ? 'text-rose-500'
                                  : link.isFound
                                  ? 'text-blue-600'
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
                                isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white shadow-2xs'
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
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Switch Application Card & Quick Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2 shrink-0 safe-bottom">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
            Application
          </div>
          <a
            href="http://localhost:5174"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50/60 border border-slate-200/80 shadow-2xs transition group"
            title="Switch to Admin Page (Port 5174)"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Switch to Admin Portal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
          </a>

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 shadow-2xs transition active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
