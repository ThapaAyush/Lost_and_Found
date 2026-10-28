import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Search,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">{description}</p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl shadow-sm text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
