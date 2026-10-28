import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  HelpCircle,
  Building2,
  Users,
  Compass,
} from 'lucide-react';
import { itemAPI, matchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('found'); // 'found' | 'lost' | 'returned'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [communityMatches, setCommunityMatches] = useState([]);

  const categories = [
    'All',
    'Electronics',
    'Wallets and purses',
    'Bags and backpacks',
    'Keys',
    'Documents and identity cards',
    'Jewelry',
    'Books',
  ];

  // Fetch showcase items
  useEffect(() => {
    const fetchShowcaseItems = async () => {
      setLoading(true);
      try {
        let params = { limit: 6, sortBy: 'createdAt', order: 'desc' };
        if (activeTab === 'returned') {
          params.status = 'returned';
        } else {
          params.type = activeTab;
          params.status = activeTab; // only active lost or found
        }
        const res = await itemAPI.getItems(params);
        if (res.data?.success) {
          setItems(res.data.items || []);
        }
      } catch (err) {
        console.error('Error fetching showcase items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseItems();
  }, [activeTab]);

  // Fetch community matches for smart match banner
  useEffect(() => {
    matchAPI
      .getCommunityMatches({ limit: 4 })
      .then((res) => {
        if (res.data?.matches) {
          setCommunityMatches(res.data.matches);
        }
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    navigate(`/found-items?${params.toString()}`);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Report an Item',
      desc: 'Submit detailed lost or found reports with photos, last seen landmarks, date, and distinguishing marks.',
      icon: PlusCircle,
      accent: 'bg-blue-600',
    },
    {
      step: '02',
      title: 'Find a Match',
      desc: 'Our multi-factor matching engine cross-references title, brand, category, date, and location keywords.',
      icon: Sparkles,
      accent: 'bg-teal-600',
    },
    {
      step: '03',
      title: 'Claim Ownership',
      desc: 'The rightful owner clicks “Claim Ownership” and provides confidential proof like receipts or serial numbers.',
      icon: ShieldCheck,
      accent: 'bg-blue-600',
    },
    {
      step: '04',
      title: 'Admin Verification',
      desc: 'Campus administrators review the submitted proof of ownership to verify legitimate claims.',
      icon: ShieldAlert,
      accent: 'bg-teal-600',
    },
    {
      step: '05',
      title: 'Private Safe Chat',
      desc: 'Once approved, both parties communicate in-app to coordinate handover without exposing phone numbers.',
      icon: MessageSquare,
      accent: 'bg-blue-600',
    },
    {
      step: '06',
      title: 'Handover & Mark Returned',
      desc: 'Meet safely at campus security or union desks, complete the return, and mark the item as returned.',
      icon: CheckCircle2,
      accent: 'bg-teal-600',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section - Soothing White & Ocean Blue */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/50 via-white to-white border border-slate-200/90 text-slate-800 p-8 sm:p-12 lg:p-16 shadow-sm">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Campus Community Lost & Found Reconnection Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
            Every Lost Item Deserves <br className="hidden sm:inline" />
            <span className="text-blue-600">
              A Safe Way Home
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report misplaced belongings, register items you've found on campus, and let our smart matching
            and verified handover system connect you securely.
          </p>

          {/* Quick Dual Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/report/lost"
              className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-2 text-slate-600" />
              I Lost Something
            </Link>

            <Link
              to="/report/found"
              className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              I Found Something
            </Link>

            <Link
              to="/found-items"
              className="inline-flex items-center px-6 py-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm border border-teal-200/80 transition"
            >
              <Search className="w-4 h-4 mr-2 text-teal-600" />
              Browse Found Items
            </Link>
          </div>

          {/* Search Bar Container */}
          <div className="pt-6">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto text-slate-800"
            >
              <div className="flex-1 flex items-center px-3 w-full">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What did you lose or find? (e.g., iPhone 15, Blue Backpack, AirPods)"
                  className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Campus Reconnection Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reconnection Rate', value: '94%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Belongings Reunited', value: '450+', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Smart Match Speed', value: '< 24 Hours', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admin Verified Claims', value: '100%', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center space-x-4 hover:shadow-md transition"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Smart Matches Banner (If active matches exist) */}
      {communityMatches.length > 0 && (
        <section className="bg-teal-50/50 border border-teal-200/70 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900">Live Campus Matches Detected</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                    {communityMatches.length} Matches
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Our algorithm matched recently reported lost items with active found reports. Are one of these yours?
                </p>
              </div>
            </div>

            <Link
              to="/found-items"
              className="inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              View in Found Section
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communityMatches.slice(0, 2).map((match, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-extrabold uppercase border border-teal-100">
                      {match.score}% Confidence Match
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{match.foundItem?.title}</h3>
                    <p className="text-xs text-slate-500">
                      Discovered at: {match.foundItem?.locationDescription}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Matches Lost Item:</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{match.lostItem?.title}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 italic">
                    Reason: {match.reasons?.[0] || 'Matching category and keywords'}
                  </span>
                  <Link
                    to={`/items/${match.foundItem?._id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition shadow-sm"
                  >
                    Claim Ownership
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Complete 6-Step Workflow Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            The Campus Reconnection Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From initial report to verified handover, every step is built for transparency, privacy, and community safety.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-card-hover transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.accent} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-blue-200 transition">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Live Showcase Grid with Filter Tabs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Community Listings Showcase
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore recently discovered belongings, active lost reports, and verified reunites.
            </p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('found')}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                activeTab === 'found'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Items
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lost')}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                activeTab === 'lost'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('returned')}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                activeTab === 'returned'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reunited 🎉
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="md" message="Loading listings..." />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No listings found in this tab</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to report an item in this category or check back shortly.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            to={activeTab === 'lost' ? '/lost-items' : '/found-items'}
            className="inline-flex items-center px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-sm transition hover:shadow"
          >
            Browse All {activeTab === 'lost' ? 'Lost Items' : 'Found Items'}
            <ArrowRight className="w-4 h-4 ml-2 text-blue-600" />
          </Link>
        </div>
      </section>

      {/* 6. Campus Safe Zones & Handover Advice */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
              Campus Handover Zones
            </span>
            <h2 className="text-2xl font-black text-slate-900">Recommended Safe Handover Locations</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              When arranging item handovers following verified admin claim approvals, we strongly encourage
              meeting at supervised campus locations during standard operating hours.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Building2 className="w-12 h-12 text-blue-600 p-2.5 bg-blue-50 rounded-2xl flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">Campus Security & Lost Property Desk</p>
              <p className="text-[11px] text-slate-400">Open Daily 08:00 – 20:00 • Building A Central</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {[
            {
              title: 'Student Union Hub',
              desc: 'High foot-traffic, well-lit reception desk with campus staff presence.',
              icon: Users,
            },
            {
              title: 'Central Library Foyer',
              desc: 'Supervised front desk area with continuous security personnel.',
              icon: Building2,
            },
            {
              title: 'Always Verify Proof',
              desc: 'Request the admin claim approval code or photo ID match before releasing valuables.',
              icon: ShieldCheck,
            },
          ].map((zone, i) => {
            const Icon = zone.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
                  <Icon className="w-4 h-4" />
                  <span>{zone.title}</span>
                </div>
                <p className="text-xs text-slate-500">{zone.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Call-To-Action */}
      <section className="rounded-3xl bg-blue-600 text-white p-8 sm:p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Help Reunite Someone Today?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Join hundreds of students and campus members who make our community safer and more connected.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-6 py-3.5 bg-white text-blue-700 font-bold text-xs rounded-2xl shadow-sm hover:bg-slate-100 transition"
            >
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="px-6 py-3.5 bg-white text-blue-700 font-bold text-xs rounded-2xl shadow-lg hover:bg-slate-100 transition"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-xs rounded-2xl border border-white/20 transition"
              >
                Log In to Account
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
