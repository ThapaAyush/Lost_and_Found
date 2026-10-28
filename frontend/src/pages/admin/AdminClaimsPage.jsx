import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, User, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-700 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Admin Overview
          </Link>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ownership Claims Oversight ({totalCount})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review claimant statements, verify proof documents, and approve handovers across campus.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved & Unlocked</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading platform ownership claims..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3.5 px-5">Claimed Item</th>
                  <th className="py-3.5 px-4">Claimant</th>
                  <th className="py-3.5 px-4">Explanation Preview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5 font-bold text-slate-800">
                      <p className="text-slate-900 font-bold">{claim.item?.title || 'Unknown Item'}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Ref #{claim.item?._id?.substring(0, 8)}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <p className="font-bold text-slate-800">{claim.claimant?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-400">{claim.claimant?.email}</p>
                    </td>

                    <td className="py-4 px-4 text-slate-500 max-w-xs truncate">
                      "{claim.explanation}"
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={claim.status} size="xs" />
                    </td>

                    <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(claim.createdAt)}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/claims/${claim._id}`}
                        className="inline-flex items-center px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <span>Verify Proof</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
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
