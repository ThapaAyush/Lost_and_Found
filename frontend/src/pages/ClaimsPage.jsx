import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';
import { claimAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await claimAPI.getMyClaims();
        if (res.data?.success) {
          setClaims(res.data.claims);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch claims.');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Ownership Claims
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review the verification status of claims you filed to recover your found belongings.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" message="Loading your claims..." />
      ) : claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                  {claim.item?.images && claim.item.images.length > 0 ? (
                    <img
                      src={claim.item.images[0]}
                      alt={claim.item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={claim.status} size="xs" />
                    <span className="text-[11px] text-slate-400">
                      Submitted {formatTimeAgo(claim.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">
                    {claim.item?.title || 'Claimed Belonging'}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    "{claim.explanation}"
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link
                  to={`/claims/${claim._id}`}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <span>Review Claim & Chat</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="No claims filed yet"
          description="If you see an item that belongs to you in the Found Belongings section, click 'Claim Ownership' to submit your proof."
          actionText="Browse Found Belongings"
          actionLink="/found-items"
        />
      )}
    </div>
  );
};

export default ClaimsPage;
