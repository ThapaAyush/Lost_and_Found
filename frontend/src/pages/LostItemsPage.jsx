import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PlusCircle, AlertCircle } from 'lucide-react';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const LostItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  // Parse filters from search params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const location = searchParams.get('location') || '';
  const startDate = searchParams.get('startDate') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  useEffect(() => {
    const fetchLostItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          type: 'lost',
          page: currentPage,
          limit: 12,
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          location: location || undefined,
          startDate: startDate || undefined,
          sortBy,
          order,
        };

        const res = await itemAPI.getItems(params);
        if (res.data?.success) {
          setItems(res.data.items);
          setTotalPages(res.data.totalPages);
          setTotalCount(res.data.total);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch lost items listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchLostItems();
  }, [searchParams, currentPage, search, category, location, startDate, sortBy, order]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Reported Lost Belongings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse items reported missing by community members ({totalCount} reports)
          </p>
        </div>

        <Link
          to="/report/lost"
          className="inline-flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report a Lost Item
        </Link>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        search={search}
        category={category}
        location={location}
        startDate={startDate}
        sortBy={sortBy}
        order={order}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading lost belongings listings..." />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          title="No Lost Belongings Found Matching Filters"
          description="Try broadening your search query or clear filters to view all active lost reports."
          actionText="Clear Filter Parameters"
          actionLink="/lost-items"
        />
      )}
    </div>
  );
};

export default LostItemsPage;
