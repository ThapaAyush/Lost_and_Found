import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  ShieldAlert,
  FileText,
  AlertTriangle,
  History,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Package,
  LayoutDashboard,
  UserPlus,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatTimeAgo } from '../../utils/formatters';

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
    return <LoadingSpinner size="lg" message="Loading admin oversight dashboard..." />;
  }

  const stats = data?.stats || {};

  const cards = [
    {
      title: 'Total Users',
      count: stats.totalUsers || 0,
      icon: Users,
      link: '/admin/users',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Lost Item Reports',
      count: stats.totalLostReports || 0,
      icon: Search,
      link: '/admin/items?type=lost',
      color: 'text-rose-500 bg-rose-50 border-rose-200',
    },
    {
      title: 'Found Item Reports',
      count: stats.totalFoundReports || 0,
      icon: FileText,
      link: '/admin/items?type=found',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Items Reunited / Returned',
      count: stats.returnedItems || 0,
      icon: CheckCircle2,
      link: '/admin/items?status=returned',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Pending Ownership Claims',
      count: stats.pendingClaims || 0,
      icon: ShieldAlert,
      link: '/admin/claims',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Community Abuse Flags',
      count: stats.openAbuseReports || 0,
      icon: AlertTriangle,
      link: '/admin/abuse-reports',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Admin Folder Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Link
          to="/admin/items"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>Lost & Found Data</span>
        </Link>
        <Link
          to="/admin/users"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>Users Section</span>
        </Link>
        <Link
          to="/admin/signup"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Sign-Up User</span>
        </Link>
        <Link
          to="/admin/claims"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Claims Oversight</span>
        </Link>
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin Overview</span>
        </Link>
      </div>

      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-300 border border-white/20">
            Platform Security & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-white">
            Administrator Oversight Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Verify ownership claims, enforce platform moderation, and audit handover compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/claims"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Verify Pending Claims
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition">
                  {card.count}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Pending Claims & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Pending Claims to Verify */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Ownership Claims</h3>
              <p className="text-xs text-slate-500">Awaiting administrative proof verification</p>
            </div>
            <Link
              to="/admin/claims"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center"
            >
              All Claims
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
            {data?.recentClaims && data.recentClaims.length > 0 ? (
              data.recentClaims.map((claim) => (
                <div key={claim._id} className="py-3 px-2 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {claim.item?.title || 'Unknown Item'}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Claimant: {claim.claimant?.name} • {formatTimeAgo(claim.createdAt)}
                    </p>
                  </div>
                  <Link
                    to={`/claims/${claim._id}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center"
                  >
                    Verify
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending claims awaiting review!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Audit Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Security Audit Logs</h3>
              <p className="text-xs text-slate-500">Live trail of system interactions & state changes</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center"
            >
              Full Audit Trail
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 divide-y divide-slate-100">
            {data?.recentAuditLogs && data.recentAuditLogs.length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div key={log._id} className="py-3 px-2 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {log.action}
                    </span>
                    <p className="text-slate-600 text-[11px] mt-1 font-medium">
                      By {log.actor?.name || 'System User'} • Target: {log.targetType}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatTimeAgo(log.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent audit actions logged
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
