import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatters';

const ItemCard = ({ item }) => {
  const thumbnail = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col h-full">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-xs">No photograph provided</span>
          </div>
        )}

        {/* Type Ribbon */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm ${
              item.type === 'lost'
                ? 'bg-rose-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.status} size="xs" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center text-xs font-semibold text-blue-600 mb-1.5 space-x-2">
            <span className="flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-blue-500" />
              {item.category}
            </span>
            {item.brand && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">{item.brand}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 text-base">
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5 text-xs text-slate-500 mb-4">
            <div className="flex items-center text-slate-600 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{item.locationDescription}</span>
            </div>
            <div className="flex items-center text-slate-500">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
              <span>
                {item.type === 'lost' ? 'Lost on' : 'Found on'} {formatDate(item.incidentDate)}
                {item.incidentTime && ` • ${item.incidentTime}`}
              </span>
            </div>
          </div>

          <Link
            to={`/items/${item._id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-xs rounded-xl transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white shadow-sm"
          >
            <span>{item.type === 'found' ? 'View Details & Claim' : 'View Lost Report'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
