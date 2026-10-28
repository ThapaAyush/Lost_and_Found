import React, { useState } from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Tag, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Wallets and purses',
  'Bags and backpacks',
  'Keys',
  'Documents and identity cards',
  'Jewelry',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
];

const FilterPanel = ({
  filters = {},
  category,
  location,
  startDate,
  sortBy,
  order,
  onFilterChange,
  onReset,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCategory = category !== undefined ? category : filters.category || 'All';
  const activeLocation = location !== undefined ? location : filters.location || '';
  const activeStartDate = startDate !== undefined ? startDate : filters.startDate || '';
  const activeSortBy = sortBy !== undefined ? sortBy : filters.sortBy || 'createdAt';
  const activeOrder = order !== undefined ? order : filters.order || 'desc';

  const handleReset = onResetFilters || onReset || (() => {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">Filter & Refine Listings</h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-blue-600 flex items-center p-1 font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Filters
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg"
          >
            {isOpen ? 'Hide' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        className={`mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${
          isOpen ? 'block' : 'hidden md:grid'
        }`}
      >
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
            <Tag className="w-3 h-3 mr-1 text-blue-600" />
            Category
          </label>
          <select
            value={activeCategory}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-blue-600" />
            Location Landmark
          </label>
          <input
            type="text"
            placeholder="e.g. Science Hall, Library, Gym..."
            value={activeLocation}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-blue-600" />
            Incident Date
          </label>
          <input
            type="date"
            value={activeStartDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center">
            <ArrowUpDown className="w-3 h-3 mr-1 text-blue-600" />
            Sort Listings
          </label>
          <select
            value={`${activeSortBy}-${activeOrder}`}
            onChange={(e) => {
              const [sBy, ord] = e.target.value.split('-');
              onFilterChange('sortBy', sBy);
              onFilterChange('order', ord);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
          >
            <option value="createdAt-desc">Newest Reports First</option>
            <option value="createdAt-asc">Oldest Reports First</option>
            <option value="incidentDate-desc">Recent Incident Date</option>
            <option value="incidentDate-asc">Earliest Incident Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
