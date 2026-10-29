import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm mt-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition"
        >
          Previous
        </button>
        <span className="text-xs font-bold text-slate-500 self-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">
            Showing page <span className="font-bold text-blue-600">{currentPage}</span> of{' '}
            <span className="font-bold text-blue-600">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center rounded-l-xl px-2.5 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="relative inline-flex items-center px-3 py-2 text-xs font-bold text-slate-400 ring-1 ring-inset ring-slate-200">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-3.5 py-2 text-xs font-bold transition ${
                        currentPage === page
                          ? 'z-10 bg-blue-600 text-white focus:z-20'
                          : 'text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="relative inline-flex items-center rounded-r-xl px-2.5 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
