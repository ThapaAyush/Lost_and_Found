import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Calendar,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Inbox,
  Send,
  User,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { claimAPI, conversationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const ClaimsPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'submitted'
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [submittedClaims, setSubmittedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChatId, setStartingChatId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await claimAPI.getMyClaims();
        if (res.data?.success) {
          const rec = res.data.receivedClaims || [];
          const sub = res.data.submittedClaims || res.data.claims || [];
          setReceivedClaims(rec);
          setSubmittedClaims(sub);

          // If user has received claims, default to received tab; otherwise submitted
          if (rec.length > 0) {
            setActiveTab('received');
          } else if (sub.length > 0) {
            setActiveTab('submitted');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch claims.');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Quick Action: Message with claimant or finder
  const handleStartMessage = async (claim, recipientId, subjectTitle) => {
    if (!recipientId) return;
    setStartingChatId(claim._id);
    try {
      await conversationAPI.createOrGetConversation({
        itemId: claim.item?._id,
        recipientId,
        subject: `Regarding claim on ${claim.item?.title || 'item'}`,
        initialMessage: `Hello, I am reaching out regarding the claim for "${claim.item?.title}". Let's coordinate the verification and safe handover on campus.`,
      });
      navigate('/conversations');
    } catch (err) {
      // If error or already exists, navigate to conversations
      navigate('/conversations');
    } finally {
      setStartingChatId(null);
    }
  };

  const currentList = activeTab === 'received' ? receivedClaims : submittedClaims;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ownership Claims & Verification Center
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review claims submitted on your found items or check the standing of claims you submitted to recover belongings.
        </p>
      </div>

      {/* Tabs Switcher: Claims on My Found Items vs My Submitted Claims */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'received'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Claims on My Found Items</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'received' ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {receivedClaims.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submitted')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'submitted'
              ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Submitted Claims</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'submitted' ? 'bg-white text-teal-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {submittedClaims.length}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" message="Loading ownership claims..." />
      ) : currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((claim) => (
            <div
              key={claim._id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
            >
              {/* Item Photo & Claim Overview */}
              <div className="flex items-start sm:items-center space-x-4 min-w-0 w-full lg:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
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

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusBadge status={claim.status} size="xs" />
                    <span className="text-[11px] text-slate-400">
                      Filed {formatTimeAgo(claim.createdAt)}
                    </span>
                    {activeTab === 'received' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        Claimed by: {claim.claimant?.name || 'Community Member'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {claim.item?.title || 'Claimed Belonging'}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">Proof Submitted: </span>
                    "{claim.explanation}"
                  </p>
                </div>
              </div>

              {/* Action Controls: Prominent Message Logo & Text */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* 1. Direct Message Button with Message Logo & Text */}
                {activeTab === 'received' ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleStartMessage(
                        claim,
                        claim.claimant?._id,
                        claim.item?.title
                      )
                    }
                    disabled={startingChatId === claim._id}
                    className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                  >
                    {startingChatId === claim._id ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                    )}
                    <span>Message Claimant ({claim.claimant?.name || 'User'})</span>
                  </button>
                ) : (
                  claim.status === 'approved' && (
                    <Link
                      to="/conversations"
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                    >
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      <span>Message Finder</span>
                    </Link>
                  )
                )}

                {/* 2. Review Claim Link */}
                <Link
                  to={`/claims/${claim._id}`}
                  className="inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5 text-slate-500" />
                  <span>View Claim & Proof</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === 'received' ? Inbox : ShieldAlert}
          title={
            activeTab === 'received'
              ? 'No claims submitted on your found items yet'
              : 'No claims filed yet'
          }
          description={
            activeTab === 'received'
              ? 'When another student or faculty member identifies an item you reported as found and submits proof of ownership, it will appear here so you can message them directly.'
              : 'If you see an item that belongs to you in the Found Belongings section, click "Claim Ownership" to submit your proof.'
          }
          actionText="Browse Found Belongings"
          actionLink="/found-items"
        />
      )}
    </div>
  );
};

export default ClaimsPage;