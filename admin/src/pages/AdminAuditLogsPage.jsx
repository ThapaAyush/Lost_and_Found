import React, { useState, useEffect } from 'react';
import { History, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionQuery, setActionQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({
        page,
        limit: 20,
        action: actionQuery || undefined,
      });
      if (res.data?.success) {
        setLogs(res.data.logs);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Admin Audit Logs Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security Audit Trail ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological audit log tracking logins, report creations, status modifications, claims, and administrative actions.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter by action..."
            value={actionQuery}
            onChange={(e) => setActionQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading audit logs..." />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-card">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Logs Found</h3>
          <p className="text-xs text-slate-500 mt-1">No audit activities recorded.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">IP & Network</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(log.createdAt)}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{log.actor?.name || 'System / Guest'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.actor?.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[11px] font-semibold">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {log.targetType} {log.targetId ? `(#${log.targetId.slice(-6)})` : ''}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchLogs(page)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;

