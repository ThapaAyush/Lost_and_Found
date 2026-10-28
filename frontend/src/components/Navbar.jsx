import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Compass,
  User,
  LogOut,
  ShieldCheck,
  FileText,
  ChevronDown,
  PlusCircle,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const reportRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (reportRef.current && !reportRef.current.contains(e.target)) {
        setReportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/found-items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 shadow-sm flex items-center">
      <div className="w-full flex items-center justify-between gap-3 lg:gap-5">
        {/* Left: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Toggle Navigation Sidebar"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition whitespace-nowrap">
                Lost <span className="text-teal-600">&</span> Found
              </span>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase -mt-0.5 whitespace-nowrap">
                Campus Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Center-Left: Desktop Quick Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-bold text-slate-600">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl transition ${
              location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Home
          </Link>
          <Link
            to="/found-items"
            className={`px-3 py-2 rounded-xl transition ${
              location.pathname === '/found-items' ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Found Belongings
          </Link>
          <Link
            to="/lost-items"
            className={`px-3 py-2 rounded-xl transition ${
              location.pathname === '/lost-items' ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Lost Reports
          </Link>
          {user && (
            <>
              <Link
                to="/matches"
                className={`px-3 py-2 rounded-xl transition flex items-center ${
                  location.pathname === '/matches' ? 'text-teal-700 bg-teal-50' : 'hover:text-teal-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                Matches
              </Link>
              <Link
                to="/claims"
                className={`px-3 py-2 rounded-xl transition flex items-center ${
                  location.pathname === '/claims' ? 'text-blue-600 bg-blue-50' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Claims
              </Link>
            </>
          )}
        </nav>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search belongings by keyword or location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick "Report Item" Dropdown (Always visible for easy access) */}
          <div className="relative" ref={reportRef}>
            <button
              type="button"
              onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
              className="inline-flex items-center px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Report</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" />
            </button>

            {reportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                <Link
                  to="/report/lost"
                  onClick={() => setReportDropdownOpen(false)}
                  className="flex items-center px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-700 mr-2.5" />
                  Report Lost Belonging
                </Link>
                <Link
                  to="/report/found"
                  onClick={() => setReportDropdownOpen(false)}
                  className="flex items-center px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-2.5" />
                  Report Found Belonging
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Private Messages Link */}
              <Link
                to="/conversations"
                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition relative"
                title="Private Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* In-App Notifications Dropdown */}
              <NotificationDropdown />

              {/* User Profile Pill & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 text-blue-600" />
                        User Dashboard
                      </Link>
                      <Link
                        to="/my-reports"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        My Reports & Custody
                      </Link>
                      <Link
                        to="/claims"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2 text-slate-400" />
                        My Ownership Claims
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        Account Settings
                      </Link>

                      {isAdmin && (
                        <div className="pt-1 border-t border-slate-100">
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
                            Admin Oversight Panel
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
