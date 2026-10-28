import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        <div
          className={`relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white text-left shadow-2xl transition-all w-full ${maxWidth} border border-slate-200 animate-slide-up sm:my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-xl p-1.5 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body with comfortable scrolling */}
          <div className="px-6 py-5 max-h-[82vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
