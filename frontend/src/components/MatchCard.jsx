import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const MatchCard = ({ matchCandidate, match, onClaim, onContact }) => {
  const candidate = matchCandidate || match || {};
  const { item, score = 0, reasons = [] } = candidate;

  if (!item) return null;

  // Modern Purple/Blue Confidence Meter
  let scoreBadgeClass = 'text-purple-700 bg-purple-50 border-purple-200';
  let barColorClass = 'bg-purple-600';
  if (score >= 70) {
    scoreBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    barColorClass = 'bg-emerald-600';
  } else if (score < 40) {
    scoreBadgeClass = 'text-blue-700 bg-blue-50 border-blue-200';
    barColorClass = 'bg-blue-600';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-purple-300 p-5 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col md:flex-row gap-5">
      {/* Thumbnail */}
      <div className="w-full md:w-44 aspect-video md:aspect-square rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            No photo
          </div>
        )}
      </div>

      {/* Main Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Match Score */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              {item.type} Report • {item.category}
            </span>

            <div
              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-black ${scoreBadgeClass}`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-current" />
              {score}% Match Confidence
            </div>
          </div>

          <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>

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
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Matched Attributes:
              </p>
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-purple-600 flex-shrink-0 mt-0.5" />
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

          {item.type === 'found' && (
            <Link
              to={`/items/${item._id}`}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Claim Ownership
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
