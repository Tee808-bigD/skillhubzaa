import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={review.reviewerAvatar}
            alt={review.reviewerName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 leading-tight">
                {review.reviewerName}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified Client
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{review.reviewerRole || 'Client'}</span>
              {review.reviewerCountry && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{review.reviewerCountry}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{review.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg shrink-0">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(review.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-black text-amber-900 ml-1">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {review.projectTitle && (
        <div className="mb-2">
          <span className="text-xs font-bold text-slate-800">
            Project: <span className="text-emerald-700 font-semibold">{review.projectTitle}</span>
          </span>
        </div>
      )}

      <p className="text-xs text-slate-700 leading-relaxed font-medium">
        "{review.comment}"
      </p>
    </div>
  );
};
