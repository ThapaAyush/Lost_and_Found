import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  FileText,
  Package,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  Tag,
  Image as ImageIcon,
  Activity,
  Database,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const getItemImage = (item) => {
  if (item?.images && item.images.length > 0 && item.images[0]) {
    const img = item.images[0];
    if (typeof img === 'string') {
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
        return img;
      }
      if (img.startsWith('/')) {
        return `http://localhost:5000${img}`;
      }
      return `http://localhost:5000/${img}`;
    }
  }
  return null;
};

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminAPI.getStats();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrative overview');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading admin overview dashboard..." />;
  }

  const stats = data?.stats || {};
  const recentItems = data?.recentItems || [];
  const recentUsers = data?.recentUsers || [];

  const cards = [
    {
      title: 'Total Users',
      count: stats.totalUsers || 0,
      subtext: `${stats.activeUsers || 0} active accounts`,
      icon: Users,
      link: '/users',
      bgLight: 'bg-blue-50/70',
      borderLight: 'border-blue-200/80',
      textAccent: 'text-blue-600',
      iconBox: 'bg-blue-600 text-white shadow-blue-500/20',
    },
    {
      title: 'Lost Item Reports',
      count: stats.totalLostReports || 0,
      subtext: 'Active missing reports',
      icon: Search,
      link: '/items?type=lost',
      bgLight: 'bg-rose-50/70',
      borderLight: 'border-rose-200/80',
      textAccent: 'text-rose-600',
      iconBox: 'bg-rose-600 text-white shadow-rose-500/20',
    },
    {
      title: 'Found Belongings',
      count: stats.totalFoundReports || 0,
      subtext: 'Awaiting rightful owner',
      icon: FileText,
      link: '/items?type=found',
      bgLight: 'bg-sky-50/70',
      borderLight: 'border-sky-200/80',
      textAccent: 'text-sky-600',
      iconBox: 'bg-sky-600 text-white shadow-sky-500/20',
    },
    {
      title: 'Items Reunited',
      count: stats.returnedItems || 0,
      subtext: 'Handed back safely',
      icon: CheckCircle2,
      link: '/items?status=returned',
      bgLight: 'bg-emerald-50/70',
      borderLight: 'border-emerald-200/80',
      textAccent: 'text-emerald-600',
      iconBox: 'bg-emerald-600 text-white shadow-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Folder Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto gap-2">
        <div className="flex items-center space-x-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </Link>
          <Link
            to="/items"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <Package className="w-4 h-4" />
            <span>Lost & Found Data</span>
          </Link>
          <Link
            to="/users"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>Users Section</span>
          </Link>
        </div>

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition shrink-0"
        >
          <span>Frontend Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50 to-blue-100/50 border border-blue-200/90 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin Portal Active • Live Database Connected</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Administrator Oversight Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time management dashboard for lost & found listings, user account governance, and community safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/items"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center space-x-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Lost & Found Data</span>
            </Link>
            <Link
              to="/users"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Users Section</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className={`bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-card-hover hover:border-blue-400 transition-all duration-200 group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${card.iconBox} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {card.count}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{card.subtext}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Listings Feed (2 Cols Wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Recent Lost & Found Listings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest reports submitted by community members in real time.
                </p>
              </div>

              <Link
                to="/items"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
              >
                <span>View All ({stats.totalItems || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Listings Grid or Empty State */}
            {recentItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-300 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Active Listings Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When community members post lost or found reports on the platform, they will appear here with full moderation controls.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Link
                    to="/items"
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
                  >
                    Manage Lost & Found
                  </Link>
                  <a
                    href="http://localhost:5173/report/lost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <span>Test Report on Frontend</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {recentItems.map((item) => {
                  const thumb = getItemImage(item);
                  return (
                    <div
                      key={item._id}
                      className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5 opacity-40" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span
                              className={`px-2 py-0.2 rounded text-[9px] font-black uppercase text-white ${
                                item.type === 'lost' ? 'bg-rose-600' : 'bg-blue-600'
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center">
                              <Tag className="w-2.5 h-2.5 mr-0.5 text-blue-500" />
                              {item.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.locationDescription || 'Location not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px]">
                          By {item.owner?.name || 'Anonymous'}
                        </span>
                        <Link
                          to={`/items?search=${encodeURIComponent(item.title)}`}
                          className="font-bold text-blue-600 hover:text-blue-800 transition"
                        >
                          Moderate →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Users & Server Health */}
        <div className="space-y-6">
          {/* Recent Users Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                <span>Recent Users</span>
              </h3>
              <Link
                to="/users"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
              >
                <span>Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {recentUsers.length === 0 ? (
                <p className="py-6 text-xs text-slate-400 text-center">No users registered yet.</p>
              ) : (
                recentUsers.map((u) => (
                  <Link
                    key={u._id}
                    to="/users"
                    className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-1 rounded-xl transition group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.accountStatus === 'active'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-0.5">{formatTimeAgo(u.createdAt)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* System Health & Operations Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 flex items-center mb-3.5">
              <Activity className="w-4 h-4 mr-2 text-teal-600" />
              <span>Platform Health & Environment</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <Database className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                  MongoDB Connection
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Operational
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  Admin Account
                </span>
                <span className="text-[11px] font-mono text-slate-600 truncate max-w-[150px]">
                  ayush108ayush108@gmail.com
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <ExternalLink className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  Frontend Origin
                </span>
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  localhost:5173 ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
