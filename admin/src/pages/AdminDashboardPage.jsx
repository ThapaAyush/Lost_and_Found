import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  FileText,
  Package,
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
            Inspect reports, enforce platform moderation, manage user directory, and audit compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/items"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Lost & Found Data</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
};

export default AdminDashboardPage;

