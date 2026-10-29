import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Package,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatTimeAgo } from '../utils/formatters';

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

  const cards = [
    {
      title: 'Total Users',
      count: stats.totalUsers || 0,
      icon: Users,
      link: '/users',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Lost Item Reports',
      count: stats.totalLostReports || 0,
      icon: Search,
      link: '/items?type=lost',
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      title: 'Found Item Reports',
      count: stats.totalFoundReports || 0,
      icon: FileText,
      link: '/items?type=found',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Items Reunited / Returned',
      count: stats.returnedItems || 0,
      icon: CheckCircle2,
      link: '/items?status=returned',
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      title: 'Pending Ownership Claims',
      count: stats.pendingClaims || 0,
      icon: ShieldAlert,
      link: '/claims',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            Dedicated Admin Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-slate-900">
            Administrator Oversight Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Verify ownership claims, enforce platform moderation, manage user directory, and audit compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/signup"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign-Up User</span>
          </Link>
          <Link
            to="/items"
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Lost & Found Data</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-card-hover transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">{card.count}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Overview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Administration Controls */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center mb-4">
              <TrendingUp className="w-4 h-4 mr-2 text-teal-600" />
              Administrative Actions
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Direct shortcuts to manage the community lost and found ecosystem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/items"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group"
              >
                <Package className="w-5 h-5 text-blue-600 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Moderate Posts</p>
                <p className="text-[11px] text-slate-500">Remove or reinstate reports</p>
              </Link>

              <Link
                to="/signup"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group"
              >
                <UserPlus className="w-5 h-5 text-blue-600 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Sign Up User</p>
                <p className="text-[11px] text-slate-500">Provision user accounts</p>
              </Link>

              <Link
                to="/users"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group"
              >
                <Users className="w-5 h-5 text-blue-600 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Manage Users</p>
                <p className="text-[11px] text-slate-500">Suspend, delete or update</p>
              </Link>

              <Link
                to="/claims"
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group"
              >
                <ShieldAlert className="w-5 h-5 text-blue-600 mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Review Claims</p>
                <p className="text-[11px] text-slate-500">Validate item ownership</p>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Admin: <strong className="text-slate-800">ayush108ayush108@gmail.com</strong></span>
            <span className="text-teal-600 font-bold">● Active Session</span>
          </div>
        </div>

        {/* Platform Status & Security Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center mb-4">
              <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
              Governance & Security Standards
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Platform policy, admin credential rules, and system oversight overview.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Designated Single Administrator Gate</p>
                  <p className="text-[11px] text-slate-500">
                    Restricted exclusively to <code className="text-blue-700 font-bold">ayush108ayush108@gmail.com</code> with permanent credentials.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Direct Post & Account Governance</p>
                  <p className="text-[11px] text-slate-500">
                    Removal authority for both lost & found posts and rogue user accounts with automated cascade cleanup.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Bidirectional Portal Switcher</p>
                  <p className="text-[11px] text-slate-500">
                    Seamless 1-click transition between this Admin portal (port 5174) and Public Frontend (port 5173).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Local Server: <strong className="text-slate-800">http://localhost:5174</strong></span>
            <span className="text-teal-600 font-bold">● System Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

