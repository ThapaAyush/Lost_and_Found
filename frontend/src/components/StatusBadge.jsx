import React from 'react';
import { getStatusBadgeClass, formatStatusLabel } from '../utils/formatters';

const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
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
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
