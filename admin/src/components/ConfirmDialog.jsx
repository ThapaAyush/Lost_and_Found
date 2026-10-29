import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition flex items-center ${
            isDanger
              ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
