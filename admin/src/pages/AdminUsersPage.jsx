import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Trash2,
  Package,
  Eye,
  Tag,
  MapPin,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Clock,
  Activity,
  FileText,
  AlertTriangle,
  Phone,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAdminAuth, ADMIN_EMAIL } from '../context/AdminAuthContext';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTimeAgo } from '../utils/formatters';

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

const AdminUsersPage = () => {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, activeUsers: 0, totalPosts: 0 });
  const [loading, setLoading] = useState(true);

  // User Posts Inspection Modal State
  const [userPostsModalOpen, setUserPostsModalOpen] = useState(false);
  const [inspectingUser, setInspectingUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState({ totalPosts: 0, lostCount: 0, foundCount: 0 });
  const [postsLoading, setPostsLoading] = useState(false);

  // Status Change Dialog State
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Delete User Dialog State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        page,
        limit: 12,
        search: search || undefined,
        role: role !== 'All' ? role : undefined,
        status: status !== 'All' ? status : undefined,
      });
      if (res.data?.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
        if (res.data.stats) {
          setGlobalStats(res.data.stats);
        }
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Admin Users Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [role, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Inspect User Posts
  const openUserPostsModal = async (user) => {
    setInspectingUser(user);
    setUserPostsModalOpen(true);
    setPostsLoading(true);
    try {
      const res = await adminAPI.getUserPosts(user._id);
      if (res.data?.success) {
        setUserPosts(res.data.items || []);
        setUserStats(res.data.stats || { totalPosts: 0, lostCount: 0, foundCount: 0 });
        if (res.data.user) {
          setInspectingUser(res.data.user);
        }
      }
    } catch (err) {
      console.error('[Fetch User Posts Error]', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleTogglePostProhibit = async (item) => {
    try {
      await adminAPI.moderateItem(item._id, {
        isProhibited: !item.isProhibited,
        reason: item.isProhibited ? 'Reinstated by admin' : 'Hidden by admin moderation',
      });
      // Refresh modal posts
      const res = await adminAPI.getUserPosts(inspectingUser._id);
      if (res.data?.success) {
        setUserPosts(res.data.items || []);
        setUserStats(res.data.stats || {});
      }
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update post visibility');
    }
  };

  const handleDeletePost = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await adminAPI.deleteItem(itemId);
      const res = await adminAPI.getUserPosts(inspectingUser._id);
      if (res.data?.success) {
        setUserPosts(res.data.items || []);
        setUserStats(res.data.stats || {});
      }
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const openStatusToggle = (targetUser) => {
    const nextStatus = targetUser.accountStatus === 'active' ? 'suspended' : 'active';
    setSelectedUser(targetUser);
    setTargetStatus(nextStatus);
    setTargetRole('');
    setDialogOpen(true);
  };

  const openRoleToggle = (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    setSelectedUser(targetUser);
    setTargetRole(nextRole);
    setTargetStatus('');
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminAPI.updateUserStatus(selectedUser._id, {
        accountStatus: targetStatus || undefined,
        role: targetRole || undefined,
      });
      setDialogOpen(false);
      setActionSuccess(`Updated ${selectedUser.name}'s account standing.`);
      setTimeout(() => setActionSuccess(''), 4500);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteUserModal = (targetUser) => {
    setUserToDelete(targetUser);
    setDeleteUserModalOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await adminAPI.deleteUser(userToDelete._id);
      setDeleteUserModalOpen(false);
      const name = userToDelete.name;
      setUserToDelete(null);
      setActionSuccess(`User "${name}" and all associated posts were permanently deleted.`);
      setTimeout(() => setActionSuccess(''), 4500);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm shadow-blue-500/20 shrink-0"
        >
          <Users className="w-4 h-4" />
          <span>Users Section</span>
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
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <span className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            {actionSuccess}
          </span>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Users Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              {totalCount} total members
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track registered users who sign in and use the website. Click any user to inspect all their lost & found posts.
          </p>
        </div>
      </div>

      {/* Database User Activity Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signed-Up Users</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {globalStats.totalUsers || totalCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Registered accounts in database</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Members</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {globalStats.activeUsers || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Using website in good standing</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Community Posts</p>
            <p className="text-2xl font-black text-blue-600 mt-0.5">
              {globalStats.totalPosts || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Total lost & found listings</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none font-bold text-slate-700 transition"
          >
            <option value="All">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Administrator</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:outline-none font-bold text-slate-700 transition"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading users & activity from database..." />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800">No Users Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or role/status filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Posts Created</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isPermanentAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                  const totalPosts = u.postsCount || 0;
                  const lostCount = u.lostCount || 0;
                  const foundCount = u.foundCount || 0;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-blue-50/30 transition group cursor-pointer"
                      onClick={() => openUserPostsModal(u)}
                    >
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition truncate">
                                {u.name}
                              </p>
                              {isPermanentAdmin && (
                                <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shadow-xs">
                                  PRIMARY ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                            {u.phone && (
                              <p className="text-[10px] text-slate-500 flex items-center mt-0.5">
                                <Phone className="w-2.5 h-2.5 mr-1 text-slate-400" />
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Posts Created (Clickable badge to view posts) */}
                      <td className="py-3.5 px-4" onClick={(e) => { e.stopPropagation(); openUserPostsModal(u); }}>
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-800 font-bold transition text-[11px] border border-slate-200 hover:border-blue-300"
                          title="Click to inspect all posts by this user"
                        >
                          <Package className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                          <span>{totalPosts} {totalPosts === 1 ? 'Post' : 'Posts'}</span>
                          {totalPosts > 0 && (
                            <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                              ({lostCount}L • {foundCount}F)
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.accountStatus === 'active'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
                          {u.accountStatus}
                        </span>
                      </td>

                      {/* Joined Date & Activity */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <p className="font-semibold text-slate-700">{formatDate(u.createdAt)}</p>
                        {u.lastLogin && (
                          <p className="text-[10px] text-slate-400 flex items-center mt-0.5">
                            <Clock className="w-2.5 h-2.5 mr-1 text-slate-400" />
                            Active: {formatTimeAgo(u.lastLogin)}
                          </p>
                        )}
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {/* View Posts Button */}
                        <button
                          type="button"
                          onClick={() => openUserPostsModal(u)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition inline-flex items-center"
                          title="View all posts created by this user"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span>View Posts ({totalPosts})</span>
                        </button>

                        {!isPermanentAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openRoleToggle(u)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            >
                              {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>

                            <button
                              type="button"
                              onClick={() => openStatusToggle(u)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                                u.accountStatus === 'active'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteUserModal(u)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 inline-flex items-center transition"
                              title="Permanently remove user"
                            >
                              <Trash2 className="w-3 h-3 mr-1 text-rose-600" />
                              Remove
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => fetchUsers(page)}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          USER ACTIVITY & POST HISTORY MODAL
          Directly fetches and shows all posts created by the selected user from DB
      ========================================================================= */}
      <Modal
        isOpen={userPostsModalOpen}
        onClose={() => setUserPostsModalOpen(false)}
        title={inspectingUser ? `User Activity: ${inspectingUser.name}` : 'User Activity & Posts'}
        maxWidth="max-w-4xl"
      >
        {inspectingUser && (
          <div className="space-y-5">
            {/* User Profile Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/20">
                  {inspectingUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-slate-900 text-base">{inspectingUser.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        inspectingUser.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {inspectingUser.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inspectingUser.accountStatus === 'active'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inspectingUser.accountStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {inspectingUser.email}
                  </p>
                  {inspectingUser.phone && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {inspectingUser.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-center px-3 border-r border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Posts</p>
                  <p className="text-base font-black text-slate-900">{userStats.totalPosts}</p>
                </div>
                <div className="text-center px-3 border-r border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-rose-500">Lost</p>
                  <p className="text-base font-black text-rose-600">{userStats.lostCount}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-bold uppercase text-blue-500">Found</p>
                  <p className="text-base font-black text-blue-600">{userStats.foundCount}</p>
                </div>
              </div>
            </div>

            {/* Posts Header */}
            <div className="flex items-center justify-between pt-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center">
                <Package className="w-4 h-4 mr-1.5 text-blue-600" />
                <span>Posts Made By {inspectingUser.name} ({userPosts.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">Live data loaded from database</span>
            </div>

            {/* Posts Content */}
            {postsLoading ? (
              <LoadingSpinner size="md" message="Loading posts from database..." />
            ) : userPosts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-slate-700">No Posts Created Till Now</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  This user has signed in to the platform but has not submitted any lost reports or found items yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                {userPosts.map((post) => {
                  const thumb = getItemImage(post);
                  return (
                    <div
                      key={post._id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <ImageIcon className="w-8 h-8 mb-1 opacity-40 text-slate-400" />
                              <span className="text-[10px] text-slate-400">No photo uploaded</span>
                            </div>
                          )}

                          {/* Type Ribbon */}
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full text-white shadow-xs ${
                                post.type === 'lost' ? 'bg-rose-600' : 'bg-blue-600'
                              }`}
                            >
                              {post.type}
                            </span>
                          </div>

                          {/* Status & Hidden Badges */}
                          <div className="absolute top-2 right-2 flex items-center space-x-1">
                            <StatusBadge status={post.status} size="xs" />
                            {post.isProhibited && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-600 text-white rounded-md">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3.5 space-y-1.5">
                          <div className="flex items-center text-[11px] font-bold text-blue-600 space-x-1.5">
                            <Tag className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{post.category}</span>
                            {post.brand && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-normal truncate">{post.brand}</span>
                              </>
                            )}
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{post.title}</h5>

                          {post.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {post.description}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-blue-600 shrink-0" />
                              <span className="truncate">{post.locationDescription || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center text-[10px] text-slate-400">
                              <Calendar className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                              <span>Posted on {formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <a
                          href={`http://localhost:5173/items/${post._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center px-2 py-1 text-[11px] font-bold rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span>View Listing</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleTogglePostProhibit(post)}
                          className={`px-2 py-1 text-[11px] font-bold rounded-lg transition ${
                            post.isProhibited
                              ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          {post.isProhibited ? 'Reinstate' : 'Hide'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                          title="Permanently remove listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setUserPostsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close Activity View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status / Role Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={targetRole ? 'Alter User Permissions?' : 'Update Account Standing?'}
        message={
          targetRole
            ? `Change role for ${selectedUser?.name} to "${targetRole}"?`
            : `Set account status for ${selectedUser?.name} to "${targetStatus}"?`
        }
        confirmText="Confirm Modification"
        isDanger={targetStatus === 'suspended'}
        loading={actionLoading}
      />

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteUserModalOpen}
        onClose={() => setDeleteUserModalOpen(false)}
        onConfirm={handleDeleteUserConfirm}
        title="Permanently Remove User Account?"
        message={`Are you sure you want to permanently delete "${userToDelete?.name}" (${userToDelete?.email})? All posts and claims submitted by this user will also be removed.`}
        confirmText="Delete User"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminUsersPage;
