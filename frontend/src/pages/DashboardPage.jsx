import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await userAPI.getStats();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your personal dashboard..." />;
  }

  const stats = data?.stats || {
    totalLost: 0,
    totalFound: 0,
    openReports: 0,
    returnedItems: 0,
    pendingClaims: 0,
    potentialMatchesCount: 0,
  };

  const statCards = [
    {
      title: 'Lost Reports',
      count: stats.totalLost,
      icon: Search,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      link: '/my-reports?type=lost',
    },
    {
      title: 'Found Reports',
      count: stats.totalFound,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      link: '/my-reports?type=found',
    },
    {
      title: 'Active Open',
      count: stats.openReports,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      link: '/my-reports?status=open',
    },
    {
      title: 'Reunited / Returned',
      count: stats.returnedItems,
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      link: '/my-reports?status=returned',
    },
    {
      title: 'Pending Claims',
      count: stats.pendingClaims,
      icon: ShieldAlert,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      link: '/claims',
    },
    {
      title: 'Candidate Matches',
      count: stats.potentialMatchesCount,
      icon: Sparkles,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      link: '/matches',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Personalized Welcome Header Banner - Soothing White & Ocean Blue */}
      <div className="bg-gradient-to-b from-blue-50/50 via-white to-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Member Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-slate-900">
              Welcome Back, {user?.name || 'Community Member'}!
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Monitor your filed reports, check match scores, and verify ownership claims.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/report/lost"
              className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 text-slate-500" />
              Report Lost Item
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-card-hover transition group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500">{stat.title}</span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${stat.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition">
                  {stat.count}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Potential Matches Highlight Alert (If Any) */}
      {stats.potentialMatchesCount > 0 && (
        <div className="bg-teal-50/50 border border-teal-200/70 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {stats.potentialMatchesCount} Potential Match
                {stats.potentialMatchesCount > 1 ? 'es' : ''} Detected!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Our cross-matching engine discovered candidate listings that closely resemble items you reported.
              </p>
            </div>
          </div>
          <Link
            to="/matches"
            className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap"
          >
            Review Potential Matches
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      )}

      {/* User's Recent Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Recent Reports</h3>
            <p className="text-xs text-slate-500">Items you have reported lost or found</p>
          </div>
          <Link
            to="/my-reports"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center"
          >
            View All ({stats.totalLost + stats.totalFound})
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {data?.recentItems && data.recentItems.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {data.recentItems.map((item) => (
              <div
                key={item._id}
                className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.type === 'lost'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500 mt-1 space-x-3">
                      <span className="flex items-center truncate">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {item.locationDescription}
                      </span>
                      <span className="flex items-center flex-shrink-0">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {formatDate(item.incidentDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <StatusBadge status={item.status} size="xs" />
                  <Link
                    to={`/items/${item._id}`}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    title="View Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reports filed yet"
            description="Have you lost an item or found someone's belonging? File your first report to connect with the community."
            actionText="Report an Item"
            actionLink="/report/lost"
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
