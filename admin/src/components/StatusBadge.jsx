import React from 'react';
import { formatStatusLabel } from '../utils/formatters';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'lost':
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border border-rose-200/80';
    case 'found':
      return 'bg-blue-50 text-blue-700 border border-blue-200/80';
    case 'returned':
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
    case 'pending':
    case 'under_review':
      return 'bg-amber-50 text-amber-700 border border-amber-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-bold',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold',
  };

  const badgeClass = getStatusBadgeClass(status);
  const label = formatStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center rounded-full capitalize transition-colors ${badgeClass} ${
        sizeClasses[size] || sizeClasses.sm
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
};

export default StatusBadge;

