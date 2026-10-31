import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Clock,
  History,
  ChevronDown,
} from 'lucide-react';
import { itemAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTimeAgo, formatStatusLabel } from '../utils/formatters';

const TABS = [
  { id: 'all', label: 'All Reports' },
  { id: 'lost', label: 'Lost / Missing' },
  { id: 'found', label: 'Found Belongings' },
  { id: 'returned', label: 'Reunited / Returned' },
  { id: 'closed', label: 'Closed' },
];

const MyReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Status Change State
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusHandoverLoc, setStatusHandoverLoc] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await itemAPI.getMyItems();
      if (res.data?.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch personal reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleTabChange = (tabId) => {
    const newParams = new URLSearchParams(searchParams);
    if (tabId === 'all') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tabId);
    }
    setSearchParams(newParams);
  };

  const toggleHistory = (itemId) => {
    setExpandedHistoryId((prev) => (prev === itemId ? null : itemId));
  };

  // Filter items client-side
  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'lost') {
      // Items that are still actively lost/missing
      return item.type === 'lost' && item.status === 'lost';
    }
    if (activeTab === 'found') {
      // Items originally posted as found OR lost items that have now been found / handed over
      return (
        item.type === 'found' ||
        item.status === 'found' ||
        item.status === 'handed_over'
      );
    }
    if (activeTab === 'returned') {
      return item.status === 'returned';
    }
    if (activeTab === 'closed') {
      return item.status === 'closed';
    }
    return true;
  });

  const countAll = items.length;
  const countLost = items.filter((i) => i.type === 'lost' && i.status === 'lost').length;
  const countFound = items.filter(
    (i) => i.type === 'found' || i.status === 'found' || i.status === 'handed_over'
  ).length;
  const countReturned = items.filter((i) => i.status === 'returned').length;
  const countClosed = items.filter((i) => i.status === 'closed').length;

  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'all':
        return countAll;
      case 'lost':
        return countLost;
      case 'found':
        return countFound;
      case 'returned':
        return countReturned;
      case 'closed':
        return countClosed;
      default:
        return 0;
    }
  };

  const openStatusModal = (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setStatusNote('');
    setStatusHandoverLoc(item.history?.[item.history.length - 1]?.handoverLocation || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setStatusLoading(true);
    try {
      await itemAPI.updateItemStatus(selectedItem._id, {
        status: newStatus,
        note: statusNote,
        handoverLocation: statusHandoverLoc,
      });
      setStatusModalOpen(false);
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      await itemAPI.deleteItem(deleteItem._id);
      setDeleteModalOpen(false);
      setDeleteItem(null);
      fetchMyReports();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Item Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal lost and found listings, track claims, and record handovers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/report/lost"
            className="inline-flex items-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Report Lost
          </Link>
          <Link
            to="/report/found"
            className="inline-flex items-center px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200/70 text-slate-600'
              }`}
            >
              {getTabCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading your reports..." />
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-card-hover transition flex flex-col gap-4"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left Details */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.type === 'lost' ? (
                        item.status === 'found' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                            Lost Item • Found! 🎉
                          </span>
                        ) : item.status === 'handed_over' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                            Lost Item • In Custody
                          </span>
                        ) : item.status === 'returned' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" />
                            Lost Item • Returned to You ✓
                          </span>
                        ) : item.status === 'closed' ? (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                            Lost Item • Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Lost Item • Still Missing
                          </span>
                        )
                      ) : item.status === 'returned' ? (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" />
                          Found Item • Returned to Owner ✓
                        </span>
                      ) : item.status === 'handed_over' ? (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                          Found Item • In Custody
                        </span>
                      ) : item.status === 'closed' ? (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                          Found Item • Closed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Found Item • Open
                        </span>
                      )}

                      <StatusBadge status={item.status} size="xs" />

                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
                      {item.title}
                    </h3>

                    <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                      <span className="flex items-center truncate">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.locationDescription}
                      </span>
                      <span className="flex items-center flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formatDate(item.incidentDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* View History Button */}
                  <button
                    type="button"
                    onClick={() => toggleHistory(item._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                      expandedHistoryId === item._id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="View lifecycle history"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History ({item.history?.length || 1})</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedHistoryId === item._id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => openStatusModal(item)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Status / Return
                  </button>

                  <Link
                    to={`/items/${item._id}/edit`}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                    title="Edit Listing"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteItem(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/items/${item._id}`}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="View Full Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Expandable Lifecycle History Timeline */}
              {expandedHistoryId === item._id && (
                <div className="w-full mt-1 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-5 rounded-b-2xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Lifecycle Status & Handover History
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Current: <strong className="text-slate-800 capitalize">{formatStatusLabel(item.status)}</strong>
                    </span>
                  </div>

                  {item.history && item.history.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {item.history.map((entry, idx) => (
                        <div key={idx} className="relative text-xs">
                          <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="flex items-center space-x-2">
                              <StatusBadge status={entry.toStatus} size="xs" />
                              {entry.fromStatus && (
                                <span className="text-[11px] text-slate-400">
                                  from <span className="font-semibold text-slate-600 capitalize">{entry.fromStatus}</span>
                                </span>
                              )}
                              {entry.changedBy?.name && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  by {entry.changedBy.name}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDate(entry.timestamp)} • {formatTimeAgo(entry.timestamp)}
                            </span>
                          </div>

                          {entry.handoverLocation && (
                            <p className="text-[11px] text-slate-600 font-medium mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                              Handover Location: <span className="text-slate-800 ml-1 font-bold">{entry.handoverLocation}</span>
                            </p>
                          )}

                          {entry.note && (
                            <p className="text-xs text-slate-600 mt-1 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                              "{entry.note}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-1">
                      Initial report created on {formatDate(item.createdAt)}. No further status changes recorded.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reports found in this category"
          description="Have you lost an item or discovered something? Create a new report to begin."
          actionText="Report an Item"
          onAction={() => handleTabChange('all')}
        />
      )}

      {/* Status Transition Modal */}
      {selectedItem && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Status: "${selectedItem.title}"`}
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="lost">Lost (Still Missing)</option>
                <option value="found">Found (Belonging Located)</option>
                <option value="handed_over">Handed Over to Custody</option>
                <option value="returned">Returned to Owner</option>
                <option value="closed">Closed / Resolved</option>
              </select>
            </div>

            {newStatus === 'returned' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Handover Location
                </label>
                <input
                  type="text"
                  value={statusHandoverLoc}
                  onChange={(e) => setStatusHandoverLoc(e.target.value)}
                  placeholder="e.g. Security Desk, Information Reception Desk"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Note / Circumstances
              </label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Returned to verified owner at library desk..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {statusLoading ? 'Updating...' : 'Save Lifecycle Status'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Item Report?"
        message={`Are you sure you want to delete "${deleteItem?.title}"? This cannot be undone.`}
        confirmText="Delete Report"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyReportsPage;
