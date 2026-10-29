import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  Package,
  Users,
  UserPlus,
  ExternalLink,
  Tag,
  MapPin,
  Calendar,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { formatDate } from '../utils/formatters';

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

const AdminItemsPage = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'All';

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(initialType);
  const [isProhibited, setIsProhibited] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Moderate Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderateModalOpen, setModerateModalOpen] = useState(false);
  const [prohibitAction, setProhibitAction] = useState(false);
  const [prohibitReason, setProhibitReason] = useState('');
  const [moderateLoading, setModerateLoading] = useState(false);

  // Delete Item State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

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
      setActionSuccess(`Listing "${selectedItem.title}" updated.`);
      setTimeout(() => setActionSuccess(''), 4500);
      fetchItems(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update moderation state');
    } finally {
      setModerateLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await adminAPI.deleteItem(itemToDelete._id);
      setDeleteModalOpen(false);
      const title = itemToDelete.title;
      setItemToDelete(null);
      setActionSuccess(`Post "${title}" removed successfully.`);
      setTimeout(() => setActionSuccess(''), 4500);
      fetchItems(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to remove listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Folder Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Link
          to="/items"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
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
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition shrink-0"
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

      {actionSuccess && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-teal-600 shrink-0" />
            {actionSuccess}
          </span>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-teal-700 hover:text-teal-900 text-xs font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lost & Found Data
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              {totalCount} total listings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse all lost and found reports with photos. Moderate visibility or delete posts as an administrator.
          </p>
        </div>
      </div>

      {/* Filter / Search & View Toggle Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search listings by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:outline-none font-bold text-slate-700 transition"
          >
            <option value="All">All Types</option>
            <option value="lost">Lost Reports</option>
            <option value="found">Found Belongings</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={isProhibited}
            onChange={(e) => setIsProhibited(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:outline-none font-bold text-slate-700 transition"
          >
            <option value="All">All Visibility</option>
            <option value="false">Active / Visible</option>
            <option value="true">Prohibited / Hidden</option>
          </select>

          {/* View Mode Switcher (Grid Cards vs Table) */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View (Same as Frontend)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline-block text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View with Thumbnails"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline-block text-[11px]">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading listings & photographs..." />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, type filter, or visibility settings.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ======================== 1. GRID CARDS VIEW (Same as Frontend ItemCard) ======================== */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((it) => {
              const thumb = getItemImage(it);
              return (
                <div
                  key={it._id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner - Exactly as frontend ItemCard */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={it.title}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : null}

                      <div
                        className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 ${
                          thumb ? 'hidden' : 'flex'
                        }`}
                      >
                        <ImageIcon className="w-10 h-10 mb-1 opacity-40 text-slate-400" />
                        <span className="text-[11px] font-medium text-slate-400">No photo uploaded</span>
                      </div>

                      {/* Type Ribbon (Lost in rose, Found in blue) */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm text-white ${
                            it.type === 'lost' ? 'bg-rose-600' : 'bg-blue-600'
                          }`}
                        >
                          {it.type}
                        </span>
                      </div>

                      {/* Status & Visibility Badges */}
                      <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                        <StatusBadge status={it.status} size="xs" />
                        {it.isProhibited && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-sm">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Category & Brand */}
                      <div className="flex items-center text-xs font-bold text-blue-600 mb-1.5 space-x-2">
                        <span className="flex items-center">
                          <Tag className="w-3.5 h-3.5 mr-1 text-blue-500" />
                          {it.category}
                        </span>
                        {it.brand && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-normal">{it.brand}</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 text-base">
                        {it.title}
                      </h3>

                      {/* Description Snippet */}
                      {it.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {it.description}
                        </p>
                      )}

                      {/* Location & Incident Date */}
                      <div className="mt-3 space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <div className="flex items-center text-slate-600">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
                          <span className="truncate">{it.locationDescription || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          <span>
                            {it.type === 'lost' ? 'Lost on' : 'Found on'} {formatDate(it.incidentDate)}
                          </span>
                        </div>
                      </div>

                      {/* Reporter Information */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-bold text-slate-800 text-[11px] truncate">
                            {it.owner?.name || 'Anonymous User'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">
                            {it.owner?.email || 'No email provided'}
                          </p>
                        </div>
                        <div>
                          {it.isProhibited ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Prohibited
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                              Visible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Moderation Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <a
                      href={`http://localhost:5173/items/${it._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold transition shadow-xs"
                      title="Open listing in public frontend"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>View</span>
                    </a>

                    {it.isProhibited ? (
                      <button
                        type="button"
                        onClick={() => openModerateModal(it, false)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition"
                      >
                        Reinstate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openModerateModal(it, true)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition"
                      >
                        Hide
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openDeleteModal(it)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition"
                      title="Permanently remove post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchItems(page)}
            />
          </div>
        </div>
      ) : (
        /* ======================== 2. MODERN TABLE VIEW (With Image Thumbnails) ======================== */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Photo & Listing</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => {
                  const thumb = getItemImage(it);
                  return (
                    <tr key={it._id} className="hover:bg-slate-50/60 transition">
                      {/* Photo Thumbnail & Listing Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={it.title}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 ${
                                thumb ? 'hidden' : 'flex'
                              }`}
                            >
                              <ImageIcon className="w-5 h-5 opacity-40 text-slate-400" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <span
                                className={`px-2 py-0.2 rounded text-[9px] font-black uppercase text-white ${
                                  it.type === 'lost' ? 'bg-rose-600' : 'bg-blue-600'
                                }`}
                              >
                                {it.type}
                              </span>
                              <span className="text-[11px] font-bold text-blue-600 flex items-center">
                                <Tag className="w-3 h-3 mr-0.5" />
                                {it.category}
                              </span>
                            </div>
                            <p className="text-slate-900 font-bold text-sm truncate max-w-xs">{it.title}</p>
                            <div className="flex items-center text-[11px] text-slate-500 mt-0.5">
                              <MapPin className="w-3 h-3 mr-1 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {it.locationDescription || 'No location specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Reporter Info */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-semibold text-slate-900">{it.owner?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{it.owner?.email || '—'}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-700">{it.category}</span>
                        {it.brand && <p className="text-[10px] text-slate-400 mt-0.5">{it.brand}</p>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={it.status} size="xs" />
                      </td>

                      {/* Visibility */}
                      <td className="py-3.5 px-4">
                        {it.isProhibited ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Prohibited
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            Visible
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`http://localhost:5173/items/${it._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center transition"
                          title="View on frontend"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </a>

                        {it.isProhibited ? (
                          <button
                            type="button"
                            onClick={() => openModerateModal(it, false)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition"
                          >
                            Reinstate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openModerateModal(it, true)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                          >
                            Hide
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDeleteModal(it)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 inline-flex items-center transition"
                          title="Permanently remove post"
                        >
                          <Trash2 className="w-3 h-3 mr-1 text-rose-600" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                prohibitAction ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {moderateLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              {prohibitAction ? 'Hide Listing' : 'Reinstate Listing'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Permanently Remove Post?"
        message={`Are you sure you want to remove "${itemToDelete?.title}" posted by ${
          itemToDelete?.owner?.name || 'community member'
        }? This listing and its associated claims will be permanently removed.`}
        confirmText="Remove Post"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminItemsPage;
