import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  ShieldAlert,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/formatters';

const AdminItemsPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [isProhibited, setIsProhibited] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Moderate Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderateModalOpen, setModerateModalOpen] = useState(false);
  const [prohibitAction, setProhibitAction] = useState(false);
  const [prohibitReason, setProhibitReason] = useState('');
  const [moderateLoading, setModerateLoading] = useState(false);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getItems({
        page,
        limit: 12,
        search: search || undefined,
        type: type !== 'All' ? type : undefined,
        isProhibited: isProhibited !== 'All' ? isProhibited : undefined,
      });
      if (res.data?.success) {
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Admin Items Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [type, isProhibited]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  const openModerateModal = (item, shouldProhibit) => {
    setSelectedItem(item);
    setProhibitAction(shouldProhibit);
    setProhibitReason('');
    setModerateModalOpen(true);
  };

  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setModerateLoading(true);
    try {
      await adminAPI.moderateItem(selectedItem._id, {
        isProhibited: prohibitAction,
        reason: prohibitReason.trim() || 'Violates listing guidelines',
      });
      setModerateModalOpen(false);
      fetchItems(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update moderation state');
    } finally {
      setModerateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Listing Moderation ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee community reports, flag inappropriate content, or reinstate hidden listings.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <select
            value={isProhibited}
            onChange={(e) => setIsProhibited(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Visibility</option>
            <option value="false">Active / Visible</option>
            <option value="true">Prohibited / Hidden</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading listings..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Listing Title</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Type & Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <Link to={`/items/${it._id}`} className="hover:text-blue-600 transition">
                        {it.title}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                        {it.locationDescription}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-semibold">{it.owner?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400">{it.owner?.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          it.type === 'lost'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {it.type}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{it.category}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={it.status} size="xs" />
                    </td>

                    <td className="py-3.5 px-4">
                      {it.isProhibited ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Prohibited
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Visible
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/items/${it._id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        View
                      </Link>

                      {it.isProhibited ? (
                        <button
                          type="button"
                          onClick={() => openModerateModal(it, false)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Reinstate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openModerateModal(it, true)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                        >
                          Mark Prohibited
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchItems(page)}
          />
        </div>
      )}

      {/* Moderation Modal */}
      <Modal
        isOpen={moderateModalOpen}
        onClose={() => setModerateModalOpen(false)}
        title={prohibitAction ? 'Prohibit Listing' : 'Reinstate Listing'}
      >
        <form onSubmit={handleModerateSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            {prohibitAction
              ? `You are about to hide "${selectedItem?.title}" from public search and listings.`
              : `You are restoring "${selectedItem?.title}" to public search and listings.`}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Moderation Note *
            </label>
            <textarea
              required
              rows={3}
              value={prohibitReason}
              onChange={(e) => setProhibitReason(e.target.value)}
              placeholder="Explain the policy justification..."
              className="w-full px-4 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setModerateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={moderateLoading}
              className={`inline-flex items-center px-4 py-2 text-white rounded-xl text-xs font-bold transition shadow-sm ${
                prohibitAction ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {moderateLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {prohibitAction ? 'Hide Listing' : 'Reinstate Listing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminItemsPage;