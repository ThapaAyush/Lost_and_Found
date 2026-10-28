import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  Search,
  Plus,
  MessageSquare,
  User,
  Sparkles,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // If on login/signup page, don't show the bottom bar
  const isAuthPage = ['/login', '/signup', '/forgot-password'].some((p) =>
    location.pathname.startsWith(p)
  );
  if (isAuthPage) return null;

  return (
    <>
      {/* Quick Report Choice Sheet on Mobile */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setReportModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4 shadow-2xl safe-bottom animate-slide-up z-10 border-t border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">What would you like to report?</h3>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/report/lost"
                onClick={() => setReportModalOpen(false)}
                className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-300 transition flex flex-col items-center text-center space-y-2 tap-bounce"
              >
                <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Lost Something</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Report misplaced belonging</p>
                </div>
              </Link>

              <Link
                to="/report/found"
                onClick={() => setReportModalOpen(false)}
                className="p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:border-blue-300 transition flex flex-col items-center text-center space-y-2 tap-bounce"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Found Something</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Register discovered item</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav for Mobile Screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-1.5 safe-bottom shadow-[0_-4px_24px_rgba(15,23,42,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition tap-bounce ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </NavLink>

          {/* Found Items */}
          <NavLink
            to="/found-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition tap-bounce ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Found</span>
          </NavLink>

          {/* Center Elevated Action: + Report */}
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            aria-label="Report lost or found item"
            className="flex flex-col items-center justify-center -mt-5 tap-bounce group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 border-2 border-white group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">Report</span>
          </button>

          {/* Lost Items */}
          <NavLink
            to="/lost-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition tap-bounce ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">Lost</span>
          </NavLink>

          {/* Messages or Dashboard */}
          {user ? (
            <NavLink
              to="/conversations"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition relative tap-bounce ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">Messages</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition tap-bounce ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">Login</span>
            </NavLink>
          )}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;
