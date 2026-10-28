import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { formatDate, formatTimeAgo } from '../../utils/formatters';

const AdminAbuseReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [reviewStatus, setReviewStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Resolution Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAbuseReports({
        page,
        limit: 12,
        reviewStatus: reviewStatus !== 'All' ? reviewStatus : undefined,
      });
      if (res.data?.success) {
        setReports(res.data.reports);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Admin Abuse Reports Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [reviewStatus]);

  const openResolveModal = (report) => {
    setSelectedReport(report);
    setResolutionStatus('resolved');
    setResolutionDetails('');
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setResolving(true);
    try {
      await adminAPI.resolveAbuseReport(selectedReport._id, {
        reviewStatus: resolutionStatus,
        resolutionDetails: resolutionDetails.trim(),
      });
      setResolveModalOpen(false);
      fetchReports(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update report resolution');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Admin Overview
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Community Abuse Reports ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review user-submitted reports regarding potential scams, harassment, or policy
            violations.
          </p>
        </div>

        <div>
          <select
            value={reviewStatus}
            onChange={(e) => setReviewStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading abuse reports..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Reason & Target</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Report Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="capitalize">{rep.reason.replace('_', ' ')}</span>
                      <p className="text-[10px] text-slate-400 font-normal uppercase">
                        Target: {rep.targetType} (#{rep.targetId.slice(-6)})
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold">{rep.reporter?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-400">{rep.reporter?.email}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      "{rep.description}"
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rep.reviewStatus === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : rep.reviewStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rep.reviewStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(rep.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openResolveModal(rep)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-sm transition"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchReports(page)}
          />
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Community Abuse Report"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Report Reason: <strong className="capitalize">{selectedReport?.reason.replace('_', ' ')}</strong>
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            "{selectedReport?.description}"
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Determination *
            </label>
            <select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700"
            >
              <option value="resolved">Resolved (Action taken / Warning issued)</option>
              <option value="dismissed">Dismissed (No violation found)</option>
              <option value="reviewed">Reviewed (Pending investigation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resolution Audit Notes
            </label>
            <textarea
              rows={3}
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
              placeholder="Detail actions taken (e.g. verified listing, issued warning, user confirmed)..."
              className="w-full px-4 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              {resolving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAbuseReportsPage;