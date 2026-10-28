import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PlusCircle, AlertCircle, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Tag } from 'lucide-react';
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
      .getCommunityMatches({ limit: 10, minScore: 20 })
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
            Browse items found on campus or discover matching lost reports waiting for ownership claims.
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

      {/* View Switcher: All Found Items vs Matched Lost Items */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Found Items ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('matches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            viewMode === 'matches'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Matched Lost Reports ({communityMatches.length})</span>
        </button>
      </div>

      {/* Feature Highlight: When one user reports lost and another reports found, show in Found Section */}
      {viewMode === 'matches' ? (
        <div className="space-y-6">
          <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Lost Items Matched with Discovered Belongings
                </h2>
                <p className="text-xs text-slate-600">
                  When a user uploads a lost item report and another uploads a matching found report,
                  they appear together here. Owners can click <span className="font-bold text-purple-700">“Claim Ownership”</span> to submit verification proof.
                </p>
              </div>
            </div>
          </div>

          {loadingMatches ? (
            <LoadingSpinner size="md" message="Scanning cross-matches..." />
          ) : communityMatches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {communityMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                      {match.score}% Cross-Match Confidence
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Match Pair #{idx + 1}</span>
                  </div>

                  {/* Comparison Columns: Lost Item vs Found Item */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Lost Item Column */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                        Lost Report
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{match.lostItem?.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{match.lostItem?.description}</p>
                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-rose-200/50">
                        <p className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{match.lostItem?.locationDescription}</span>
                        </p>
                        <p className="text-slate-400">Reported by: {match.lostItem?.owner?.name}</p>
                      </div>
                    </div>

                    {/* Found Item Column */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                        Found Report
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{match.foundItem?.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{match.foundItem?.description}</p>
                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-blue-200/50">
                        <p className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{match.foundItem?.locationDescription}</span>
                        </p>
                        <p className="text-slate-400">Finder: {match.foundItem?.owner?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Match Explanations */}
                  {match.reasons && match.reasons.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                        Why this is a potential match:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500">
                        {match.reasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action CTA: Claim Ownership */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Is this found item yours?</span>
                    <Link
                      to={`/items/${match.foundItem?._id}`}
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Claim Ownership
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No cross-matches detected yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                As more lost and found reports are filed across campus, our matching engine will
                automatically surface pairs here.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Regular Found Items Grid with Filters */
        <div className="space-y-6">
          {/* Smart Matches mini prompt banner if matches exist */}
          {communityMatches.length > 0 && (
            <div
              onClick={() => setViewMode('matches')}
              className="cursor-pointer bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between hover:bg-purple-50/80 transition shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {communityMatches.length} Lost Report{communityMatches.length > 1 ? 's' : ''} Matched with Found Items
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Click here to review potential matches and claim ownership with supporting proof.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 flex items-center">
                Review Matches
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          )}

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
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
      )}
    </div>
  );
};

export default FoundItemsPage;
