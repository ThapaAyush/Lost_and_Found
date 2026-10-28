import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Status Change Dialog State
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
            User Accounts ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage permissions, inspect registration data, and moderate account standing.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Administrator</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading users..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openRoleToggle(u)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>

                      <button
                        type="button"
                        onClick={() => openStatusToggle(u)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                          u.accountStatus === 'active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
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
            onPageChange={(page) => fetchUsers(page)}
          />
        </div>
      )}

      {/* Confirm Dialog */}
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
    </div>
  );
};

export default AdminUsersPage;