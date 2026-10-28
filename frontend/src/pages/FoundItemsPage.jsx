import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PlusCircle,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Tag,
  Eye,
} from 'lucide-react';
import { itemAPI, matchAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

const FoundItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [communityMatches, setCommunityMatches] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'matches'
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const location = searchParams.get('location') || '';
  const startDate = searchParams.get('startDate') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  // Fetch found items
  useEffect(() => {
    const fetchFoundItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          type: 'found',
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
        setError(err.message || 'Failed to fetch found items listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoundItems();
  }, [searchParams, currentPage, search, category, location, startDate, sortBy, order]);

  // Fetch matching pairs (lost items that match found items)
  useEffect(() => {
    setLoadingMatches(true);
    matchAPI
      .getCommunityMatches({ limit: 12, minScore: 20 })
      .then((res) => {
        if (res.data?.matches) {
          setCommunityMatches(res.data.matches);
        }
      })
      .catch((err) => console.error('Error fetching community matches:', err))
      .finally(() => setLoadingMatches(false));
  }, []);

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
    <div className="space-y-8">
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Found Belongings & Match Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse discovered items on campus. When a lost item report matches a found item, it automatically appears here so the owner can claim ownership and coordinate handover.
          </p>
        </div>

        <Link
          to="/report/found"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Report Found Item
        </Link>
      </div>

      {/* Prominent Cross-Matched Lost Items Showcase in Found Section */}
      {communityMatches.length > 0 && (
        <div className="bg-teal-50/50 border border-teal-200/70 rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200/60 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Lost Items Matched in Found Section
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {communityMatches.length} Match{communityMatches.length > 1 ? 'es' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  When a user uploads a lost report and another uploads a found report, the match appears below. Owners can submit an ownership claim for manager verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'matches' ? 'all' : 'matches')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 self-start sm:self-center flex items-center"
            >
              {viewMode === 'matches' ? 'Show All Found Grid' : 'Expand All Matches'}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Horizontal scrollable / responsive match pairs preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
            {communityMatches.slice(0, viewMode === 'matches' ? communityMatches.length : 3).map((match, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-teal-100 shadow-sm p-4 flex flex-col justify-between space-y-3 hover:border-teal-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-black uppercase tracking-wider flex items-center border border-teal-100">
                    <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
                    {match.score}% Confidence
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Pair #{idx + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Lost Item */}
                  <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200">
                    <span className="text-[9px] font-black uppercase text-rose-700 block">Lost Report</span>
                    <p className="font-bold text-slate-900 truncate mt-0.5">{match.lostItem?.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{match.lostItem?.category}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">By: {match.lostItem?.owner?.name}</p>
                  </div>

                  {/* Found Item */}
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100">
                    <span className="text-[9px] font-black uppercase text-blue-700 block">Found Report</span>
                    <p className="font-bold text-slate-900 truncate mt-0.5">{match.foundItem?.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{match.foundItem?.category}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">Finder: {match.foundItem?.owner?.name}</p>
                  </div>
                </div>

                {match.reasons && match.reasons.length > 0 && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg truncate">
                    Matched: {match.reasons[0]}
                  </p>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to={`/items/${match.foundItem?._id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    View Details
                  </Link>

                  <Link
                    to={`/items/${match.foundItem?._id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Claim Ownership
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Found Items Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">
            All Found Belongings ({totalCount})
          </h2>
          <span className="text-xs text-slate-400">
            Updated in real-time
          </span>
        </div>

        {/* Search & Filter Panel */}
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

        {/* Active Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Items Grid */}
        {loading ? (
          <LoadingSpinner size="lg" message="Loading found items..." />
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <EmptyState
            title="No Found Belongings Match Your Criteria"
            description="Try adjusting your keyword searches or filter parameters, or register a new found report if you discovered an item on campus."
            actionText="Report Found Item"
            actionLink="/report/found"
          />
        )}
      </div>
    </div>
  );
};

export default FoundItemsPage;