import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const MatchCard = ({ matchCandidate, match, layout = 'vertical', onClaim, onContact }) => {
  const candidate = matchCandidate || match || {};
  const { item, score = 0, reasons = [] } = candidate;

  if (!item) return null;

  // Soothing Sage Teal / Ocean Blue Confidence Meter
  let scoreBadgeClass = 'text-teal-700 bg-teal-50 border-teal-200';
  let barColorClass = 'bg-teal-600';
  if (score >= 70) {
    scoreBadgeClass = 'text-teal-800 bg-teal-50 border-teal-300';
    barColorClass = 'bg-teal-600';
  } else if (score < 40) {
    scoreBadgeClass = 'text-blue-700 bg-blue-50 border-blue-200';
    barColorClass = 'bg-blue-600';
  }

  // 1. Vertical Layout (Standard for Grid Views) - Image on Top with proper 16:10 aspect ratio
  if (layout === 'vertical') {
    return (
      <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-teal-300 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between h-full">
        <div>
          {/* Top Image with natural 16:10 aspect ratio and overlays (never vertically stretched) */}
          <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-4">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No photo provided
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm ${
                  item.type === 'lost' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {item.type} Report
              </span>
            </div>

            {/* Match Confidence Overlay Pill */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black shadow-sm ${scoreBadgeClass}`}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-current" />
                {score}% Match
              </span>
            </div>
          </div>

          {/* Category & Brand */}
          <div className="flex items-center text-xs font-semibold text-teal-700 mb-1.5 space-x-2">
            <span>{item.category}</span>
            {item.brand && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">{item.brand}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h4 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition line-clamp-1 mb-1.5">
            {item.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {/* Location & Date */}
          <div className="space-y-1.5 text-xs text-slate-500 mb-4 pt-2 border-t border-slate-100">
            <div className="flex items-center text-slate-600 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 shrink-0" />
              <span className="truncate">{item.locationDescription}</span>
            </div>
            <div className="flex items-center text-slate-500">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
              <span>
                {item.type === 'lost' ? 'Lost on' : 'Found on'} {formatDate(item.incidentDate)}
              </span>
            </div>
          </div>

          {/* Match Score Meter */}
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>Match Confidence</span>
              <span className={score >= 70 ? 'text-teal-700' : 'text-blue-700'}>{score}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Matching Criteria Breakdown */}
          {reasons && reasons.length > 0 && (
            <div className="bg-teal-50/50 p-3 rounded-2xl border border-teal-100/80 space-y-1.5 mb-4">
              <p className="text-[10px] font-extrabold text-teal-900 uppercase tracking-wider">
                Matched Attributes:
              </p>
              {reasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1 font-medium">{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2 mt-auto">
          <Link
            to={`/items/${item._id}`}
            className="w-full sm:flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>

          {item.type === 'found' ? (
            <Link
              to={`/items/${item._id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Claim Ownership
            </Link>
          ) : (
            <Link
              to={`/items/${item._id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              I Found This Item
            </Link>
          )}
        </div>
      </div>
    );
  }

  // 2. Horizontal Layout (for Full-Width Row Lists)
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-300 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col md:flex-row gap-5 items-start">
      {/* Fixed size thumbnail - never stretched */}
      <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            No photo provided
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm ${
              item.type === 'lost' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>
      </div>

      {/* Main Details */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div>
          {/* Header & Match Score */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              {item.type} Report • {item.category}
            </span>

            <div
              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black ${scoreBadgeClass}`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-current" />
              {score}% Match Confidence
            </div>
          </div>

          <h4 className="text-lg font-black text-slate-900 mb-1">{item.title}</h4>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>

          {/* Location & Date */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
            <div className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
              <span>{item.locationDescription}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>{formatDate(item.incidentDate)}</span>
            </div>
          </div>

          {/* Match Score Meter */}
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Matching Criteria Breakdown */}
          {reasons && reasons.length > 0 && (
            <div className="bg-teal-50/40 p-3 rounded-xl border border-teal-100 space-y-1">
              <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1">
                Matched Attributes:
              </p>
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          <Link
            to={`/items/${item._id}`}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>

          {item.type === 'found' ? (
            <Link
              to={`/items/${item._id}`}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Claim Ownership
            </Link>
          ) : (
            <Link
              to={`/items/${item._id}`}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              I Found This Item
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;