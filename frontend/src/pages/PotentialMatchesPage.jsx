import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { matchAPI, itemAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ImageUploader from '../components/ImageUploader';

const PotentialMatchesPage = () => {
  const [matchGroups, setMatchGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Claim modal state
  const [claimItem, setClaimItem] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimExplanation, setClaimExplanation] = useState('');
  const [claimIdentifiers, setClaimIdentifiers] = useState('');
  const [claimFiles, setClaimFiles] = useState([]);
  const [claimPreviews, setClaimPreviews] = useState([]);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.getMatches({ minScore: 20 });
      if (res.data?.success) {
        setMatchGroups(res.data.matches);
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate potential matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const openClaimModal = (targetItem) => {
    setClaimItem(targetItem);
    setClaimExplanation('');
    setClaimIdentifiers('');
    setClaimFiles([]);
    setClaimPreviews([]);
    setClaimError('');
    setClaimSuccess('');
    setClaimModalOpen(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimExplanation.trim() || claimExplanation.trim().length < 10) {
      setClaimError('Please provide an ownership explanation with at least 10 characters.');
      return;
    }

    setClaimSubmitting(true);
    setClaimError('');
    try {
      const formData = new FormData();
      formData.append('explanation', claimExplanation.trim());
      formData.append('secretIdentifiers', claimIdentifiers.trim());
      claimFiles.forEach((f) => formData.append('evidence', f));

      const res = await itemAPI.submitClaim(claimItem._id, formData);
      if (res.data?.success) {
        setClaimSuccess('Claim submitted successfully! The administrator and finder will review your details.');
        setTimeout(() => {
          setClaimModalOpen(false);
        }, 1800);
      }
    } catch (err) {
      setClaimError(err.message || 'Failed to submit claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Potential Item Matches
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Our intelligent algorithm continuously compares your lost or found reports against
          opposite listings based on category, title, description keywords, brand, color, date, and
          location.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" message="Scanning listings for potential matches..." />
      ) : matchGroups.length > 0 ? (
        <div className="space-y-8">
          {matchGroups.map((group) => (
            <div
              key={group.myReport._id}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
            >
              {/* Group Header: Your Item */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      group.myReport.type === 'lost'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    Your {group.myReport.type} Report
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{group.myReport.title}</h3>
                </div>

                <Link
                  to={`/items/${group.myReport._id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center"
                >
                  View Your Report
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {/* Candidate Matches for this Item */}
              <div className="space-y-4">
                {group.candidateMatches.map((cand, idx) => (
                  <MatchCard
                    key={idx}
                    matchCandidate={cand}
                    layout="horizontal"
                    onClaim={(item) => openClaimModal(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No candidate matches discovered yet"
          description="As more lost and found reports are published across campus, potential matches will automatically appear here."
          actionText="Browse Found Belongings"
          actionLink="/found-items"
        />
      )}

      {/* Claim Submission Modal */}
      {claimItem && (
        <Modal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          title={`Claim Ownership: "${claimItem.title}"`}
        >
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Please explain why this found item belongs to you. Your submission will be privately
              reviewed by the administrator and finder.
            </p>

            {claimError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {claimError}
              </div>
            )}

            {claimSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                {claimSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ownership Explanation *
              </label>
              <textarea
                required
                rows={4}
                value={claimExplanation}
                onChange={(e) => setClaimExplanation(e.target.value)}
                placeholder="Describe when/where you lost it, contents inside, unique marks..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Secret Identifiers / Private Info
              </label>
              <input
                type="text"
                value={claimIdentifiers}
                onChange={(e) => setClaimIdentifiers(e.target.value)}
                placeholder="e.g. Serial numbers, name on cards inside..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <ImageUploader
              files={claimFiles}
              setFiles={setClaimFiles}
              previews={claimPreviews}
              setPreviews={setClaimPreviews}
              label="Upload Private Proof / Receipts"
              maxFiles={3}
            />

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={claimSubmitting || Boolean(claimSuccess)}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PotentialMatchesPage;
