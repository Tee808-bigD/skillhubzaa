import React, { useState } from 'react';
import { Mentor } from '../types';
import { Star, MapPin, Calendar, Clock, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onBook: (mentor: Mentor) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onBook }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      
      <div className="space-y-3">
        {/* Avatar & Info */}
        <div className="flex items-center gap-3">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900">{mentor.name}</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            </div>
            <p className="text-xs font-bold text-slate-600">{mentor.title}</p>
            <p className="text-[11px] font-semibold text-slate-400">{mentor.company} • {mentor.province}</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
          {mentor.bio}
        </p>

        {/* Expertise Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {mentor.expertise.map(exp => (
            <span key={exp} className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              {exp}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Booking Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{mentor.rating} ({mentor.bookingCount} Sessions)</span>
        </div>

        <button
          onClick={() => onBook(mentor)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all shadow-xs hover:scale-105 flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Book Session ({mentor.feeZar})</span>
        </button>
      </div>

    </div>
  );
};
