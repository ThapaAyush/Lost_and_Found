import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Lock,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import { claimAPI, itemAPI, conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { formatDate, formatTimeAgo } from '../utils/formatters';

const ClaimDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [claim, setClaim] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [isClaimant, setIsClaimant] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decision State
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnLocation, setReturnLocation] = useState('Security Desk');
  const [returnNotes, setReturnNotes] = useState('Item successfully returned to verified claimant.');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // Withdraw Dialog State
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const res = await claimAPI.getClaimById(id);
      if (res.data?.success && res.data?.claim) {
        setClaim(res.data.claim);
        setCanReview(res.data.canReview);
        setIsClaimant(res.data.isClaimant);
        setConversationId(res.data.conversationId);
        setReviewNotes(res.data.claim.reviewNotes || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleDecision = async (statusToSet) => {
    setSubmitting(true);
    try {
      const res = await claimAPI.updateClaimStatus(id, {
        status: statusToSet,
        reviewNotes: reviewNotes.trim(),
      });
      if (res.data?.claim) {
        setClaim(res.data.claim);
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update claim review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReturned = async (e) => {
    e.preventDefault();
    if (!claim?.item?._id) return;
    setReturnSubmitting(true);
    try {
      await itemAPI.updateItemStatus(claim.item._id, {
        status: 'returned',
        note: returnNotes.trim(),
        custodyDetails: 'returned_to_owner',
        handoverLocation: returnLocation.trim(),
      });
      setReturnModalOpen(false);
      fetchClaim();
    } catch (err) {
      alert(err.message || 'Failed to mark item as returned');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await claimAPI.updateClaimStatus(id, {
        status: 'withdrawn',
        reviewNotes: 'Withdrawn by claimant',
      });
      setWithdrawDialogOpen(false);
      fetchClaim();
    } catch (err) {
      alert(err.message || 'Failed to withdraw claim');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStartMessage = async () => {
    const targetUserId = isClaimant
      ? claim.item?.owner?._id || claim.item?.owner
      : claim.claimant?._id;
    if (!targetUserId) return;
    try {
      await conversationAPI.createOrGetConversation({
        itemId: claim.item?._id,
        recipientId: targetUserId,
        subject: `Regarding ${claim.item?.title || 'item'}`,
        initialMessage: `Hello! Reaching out regarding "${claim.item?.title}". Let's coordinate safe handover.`,
      });
      navigate('/conversations');
    } catch (err) {
      navigate('/conversations');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading claim details & verification evidence..." />;
  }

  if (error || !claim) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Claim Inaccessible</h2>
        <p className="text-xs text-slate-500 mt-2">{error || 'Claim not found or private.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Return Back
        </button>
      </div>
    );
  }

  const isApproved = claim.status === 'approved';
  const isItemReturned = claim.item?.status === 'returned';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </button>

        <div className="flex items-center space-x-2">
          <StatusBadge status={claim.status} size="sm" />
          {isClaimant && ['pending', 'under_review'].includes(claim.status) && (
            <button
              type="button"
              onClick={() => setWithdrawDialogOpen(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-xl transition border border-rose-200"
            >
              Withdraw Claim
            </button>
          )}
        </div>
      </div>

      {/* Prominent Banner when Claim is Approved */}
      {isApproved && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Ownership Verified & Approved
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Private Handover Coordination Unlocked
                </h2>
                <p className="text-xs text-slate-600">
                  Administration has verified this claim. Both users can now chat in-app to arrange a safe physical handover.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/conversations"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Open Private Chat
              </Link>

              {!isItemReturned && (canReview || isClaimant) && (
                <button
                  type="button"
                  onClick={() => setReturnModalOpen(true)}
                  className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark as Returned
                </button>
              )}
            </div>
          </div>

          {isItemReturned && (
            <div className="p-3 rounded-2xl bg-white/80 border border-teal-200 text-xs text-teal-800 font-bold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-teal-600" />
              This item has been officially marked as RETURNED to the owner! Lifecycle complete.
            </div>
          )}
        </div>
      )}

      {/* Item Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            {claim.item?.images && claim.item.images.length > 0 ? (
              <img
                src={claim.item.images[0]}
                alt={claim.item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No photo
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {claim.item?.type === 'lost' ? 'Lost Item Under Recovery' : 'Item Under Claim'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">{claim.item?.title}</h2>
            <p className="text-xs text-slate-500">
              Location: {claim.item?.locationDescription} • Date: {formatDate(claim.item?.incidentDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStartMessage}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Message {isClaimant ? (claim.item?.type === 'lost' ? 'Owner' : 'Finder') : (claim.item?.type === 'lost' ? 'Finder' : 'Claimant')}
          </button>
          <Link
            to={`/items/${claim.item?._id}`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            View Listing
          </Link>
        </div>
      </div>

      {/* Claim Evidence Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {claim.item?.type === 'lost' ? "Finder's Report & Personal Message" : 'Claimant Ownership Proof'}
            </h3>
            <p className="text-xs text-slate-400">
              Submitted by {claim.claimant?.name} • {formatTimeAgo(claim.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            <Lock className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Confidential Details
          </span>
        </div>

        {/* Ownership Explanation */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {claim.item?.type === 'lost' ? 'Where & When Found / Message to Owner' : 'Statement of Ownership'}
          </h4>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {claim.explanation}
          </p>
        </div>

        {/* Secret Identifiers */}
        {claim.secretIdentifiers && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {claim.item?.type === 'lost' ? 'Location Details & Distinguishing Notes' : 'Secret Identifiers / Private Clues'}
            </h4>
            <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono">
              {claim.secretIdentifiers}
            </p>
          </div>
        )}

        {/* Private Evidence Documents / Photos */}
        {claim.privateEvidence && claim.privateEvidence.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {claim.item?.type === 'lost' ? 'Photos of Found Item' : 'Supporting Proof Documents / Receipts / Photos'} ({claim.privateEvidence.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {claim.privateEvidence.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl overflow-hidden border border-slate-200 aspect-square group relative block bg-slate-100 shadow-sm"
                >
                  <img
                    src={url}
                    alt="Proof evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    View Full Evidence
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviewer / Decision Panel (For Item Owner or Administrator) */}
      {canReview && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            {claim.item?.type === 'lost'
              ? 'Owner Review & Handover Coordination'
              : 'Admin / Manager Verification & Review'}
          </h3>
          <p className="text-xs text-slate-500">
            {claim.item?.type === 'lost'
              ? "Review the finder's details and message above. If this is your item, approve to connect and coordinate physical return, or message them directly."
              : "Verify the claimant's proof and secret identifiers above against the item details. If satisfied, approve the claim to unlock direct in-app messaging and coordinate the handover."}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Notes (visible to {claim.item?.type === 'lost' ? 'finder' : 'claimant'})
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                claim.item?.type === 'lost'
                  ? 'e.g. Thank you! That is indeed my lost item. Let’s meet at the Security Desk...'
                  : 'e.g. Serial number verified against student registry. Claim approved...'
              }
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('approved')}
              className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {claim.item?.type === 'lost' ? 'Confirm This Is My Item & Unlock Handover' : 'Approve Claim & Unlock Chat'}
            </button>

            <button
              type="button"
              onClick={handleStartMessage}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Message {claim.item?.type === 'lost' ? 'Finder' : 'Claimant'}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('under_review')}
              className="inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Mark Under Review
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('rejected')}
              className="inline-flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              {claim.item?.type === 'lost' ? 'Not My Item (Decline)' : 'Reject Claim'}
            </button>
          </div>
        </div>
      )}

      {/* Review Outcome Display if already decided */}
      {claim.reviewedAt && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p>
            <span className="font-bold">Reviewed by:</span> {claim.reviewer?.name || 'Administrator'} on{' '}
            {formatDate(claim.reviewedAt)}
          </p>
          {claim.reviewNotes && (
            <p>
              <span className="font-bold">Decision Notes:</span> {claim.reviewNotes}
            </p>
          )}
        </div>
      )}

      {/* Mark Returned Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Complete Handover & Mark as Returned"
      >
        <form onSubmit={handleMarkReturned} className="space-y-4">
          <p className="text-xs text-slate-500">
            Confirm that the item has been safely returned to the verified owner. This marks the item
            as returned in the community registry.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Handover Location
            </label>
            <input
              type="text"
              required
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              placeholder="e.g. Security Desk, Information Reception Desk"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Handover Completion Notes
            </label>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Identity verified in person. Owner confirmed item intact..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={returnSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {returnSubmitting ? 'Saving...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Dialog */}
      <ConfirmDialog
        isOpen={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        onConfirm={handleWithdraw}
        title="Withdraw Ownership Claim?"
        message="Are you sure you wish to withdraw this claim? The finder and administrator will be notified."
        confirmText="Withdraw Claim"
        isDanger={true}
        loading={withdrawing}
      />
    </div>
  );
};

export default ClaimDetailsPage;
