import React, { useState } from 'react';
import { reportAPI } from '../services/api';
import Modal from './Modal';
import { ShieldAlert, Loader2 } from 'lucide-react';

const ReportAbuseModal = ({ isOpen, onClose, targetType, targetId, targetTitle }) => {
  const [reason, setReason] = useState('scam_fraud');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a short explanation for the moderation team.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await reportAPI.submitReport({
        targetType,
        targetId,
        reason,
        description,
      });
      setSuccessMessage('Your report has been submitted to our moderation team.');
      setTimeout(() => {
        setSuccessMessage('');
        setDescription('');
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Content to Moderation">
      <form onSubmit={handleSubmit} className="space-y-4">
        {targetTitle && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            Reporting: <span className="font-semibold text-slate-800">{targetTitle}</span>
          </p>
        )}

        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Report
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="scam_fraud">Suspicious Activity / Potential Scam</option>
            <option value="false_claim">False Ownership Claim</option>
            <option value="inappropriate_content">Inappropriate Content or Language</option>
            <option value="harassment">Harassment or Offensive Behavior</option>
            <option value="prohibited_item">Prohibited / Illegal Belonging</option>
            <option value="other">Other Violation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Explanation & Details
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail why this listing or activity violates community trust..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || Boolean(successMessage)}
            className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
            Submit Report
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportAbuseModal;