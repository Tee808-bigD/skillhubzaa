import React from 'react';
import { Learnership } from '../types';
import { MapPin, Calendar, Briefcase, Bookmark, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';

interface LearnershipCardProps {
  learnership: Learnership;
  isBookmarked: boolean;
  onBookmark: (id: string) => void;
  onApply: (learnership: Learnership) => void;
}

export const LearnershipCard: React.FC<LearnershipCardProps> = ({
  learnership,
  isBookmarked,
  onBookmark,
  onApply
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all space-y-4">
      
      {/* Top Header & SETA Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
            {learnership.setaCategory.split(' ')[0]}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-emerald-200">
                {learnership.setaCategory}
              </span>
              <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded">
                {learnership.duration}
              </span>
            </div>

            <h3 className="font-extrabold text-sm text-slate-900 leading-snug hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => onApply(learnership)}>
              {learnership.title}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{learnership.company}</p>
          </div>
        </div>

        <button
          onClick={() => onBookmark(learnership.id)}
          className={`p-2 rounded-xl transition-all shrink-0 ${
            isBookmarked
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-50 text-slate-400 hover:text-slate-700'
          }`}
          title={isBookmarked ? 'Remove Bookmark' : 'Save Opportunities'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
        {learnership.description}
      </p>

      {/* Requirements Tags */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Key Requirements</h4>
        <div className="flex flex-wrap gap-1.5">
          {learnership.requirements.slice(0, 3).map((req, i) => (
            <span key={i} className="text-[10px] font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{req}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Meta Details & Apply Button */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            <DollarSign className="w-3.5 h-3.5" />
            {learnership.stipendZar}
          </span>

          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {learnership.location}, {learnership.province}
          </span>

          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            Closes {learnership.closingDate}
          </span>
        </div>

        <button
          onClick={() => onApply(learnership)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all hover:scale-105 flex items-center gap-1.5 ml-auto"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
