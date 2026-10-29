import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  User,
  CheckCircle2,
  Sparkles,
  Filter,
  Package,
  Users,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const AdminClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getClaims({
        page,
        limit: 12,
        status: status !== 'All' ? status : undefined,
      });
      if (res.data?.success) {
        setClaims(res.data.claims);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Admin Claims Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims(1);
  }, [status]);

  return (
    <div className="space-y-6">
      {/* Top Folder Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
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
        <Link
          to="/signup"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Sign-Up User</span>
        </Link>
        <Link
          to="/claims"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Claims Oversight</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Overview</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ownership Claims Oversight ({totalCount})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review claimant identification documents, secret verification questions, and handover statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-transparent pr-4 py-1.5 focus:outline-none"
          >
            <option value="All">All Claims Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Active Review</option>
            <option value="approved">Approved Claims</option>
            <option value="rejected">Rejected Claims</option>
            <option value="handed_over">Handed Over Items</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading ownership claims..." />
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-card">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Claims Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {status !== 'All' ? `No claims matching "${status}".` : 'No claims submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Under Claim</th>
                  <th className="py-3 px-4">Claimant Information</th>
                  <th className="py-3 px-4">Finder / Reporter</th>
                  <th className="py-3 px-4">Verification Answers</th>
                  <th className="py-3 px-4">Claim Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <p className="text-slate-900 font-bold">{claim.item?.title || 'Unknown Item'}</p>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Category: {claim.item?.category || 'General'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{claim.claimant?.name || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-400">{claim.claimant?.email}</p>
                      {claim.claimant?.phone && (
                        <p className="text-[10px] text-slate-400">{claim.claimant?.phone}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">{claim.item?.owner?.name || 'Finder'}</p>
                      <p className="text-[11px] text-slate-400">{claim.item?.owner?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {claim.proofDescription || claim.verificationAnswers?.[0]?.answer || 'No description provided'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={claim.status} size="xs" />
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(claim.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchClaims(page)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminClaimsPage;

