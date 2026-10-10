import React from 'react';
import { 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Globe2,
  MapPin,
  Briefcase,
  Send
} from 'lucide-react';

export interface TopPro {
  id: string;
  username: string;
  name: string;
  avatar: string;
  primarySkill: string;
  location: string;
  country: string;
  rating: number;
  reviewsCount: number;
  isTopRated: boolean;
  verified: boolean;
  hourlyRate: string;
}

interface TopRatedProfessionalsProps {
  onBrowseAll: () => void;
  onSelectPro?: (pro: TopPro) => void;
  onHirePro?: (pro: TopPro) => void;
  onMessagePro?: (pro: TopPro) => void;
  customPros?: TopPro[];
}

export const DEFAULT_TOP_PROS: TopPro[] = [
  {
    id: 'pro_1',
    username: 'sarah_chen',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Lead FullStack Engineer',
    location: 'London',
    country: 'UK 🇬🇧',
    rating: 4.98,
    reviewsCount: 124,
    isTopRated: true,
    verified: true,
    hourlyRate: '$75/hr'
  },
  {
    id: 'pro_2',
    username: 'michael_botha',
    name: 'Michael Botha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Smart Home & Solar Tech',
    location: 'Toronto',
    country: 'Canada 🇨🇦',
    rating: 4.95,
    reviewsCount: 88,
    isTopRated: true,
    verified: true,
    hourlyRate: '$60/hr'
  },
  {
    id: 'pro_3',
    username: 'elena_rostova',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Product & Design Systems',
    location: 'Berlin',
    country: 'Germany 🇩🇪',
    rating: 4.92,
    reviewsCount: 96,
    isTopRated: true,
    verified: true,
    hourlyRate: '$70/hr'
  },
  {
    id: 'pro_4',
    username: 'david_kim',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Cloud & AI Solutions',
    location: 'New York',
    country: 'US 🇺🇸',
    rating: 5.0,
    reviewsCount: 142,
    isTopRated: true,
    verified: true,
    hourlyRate: '$95/hr'
  },
  {
    id: 'pro_5',
    username: 'amara_okafor',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Data Science & BI',
    location: 'Lagos',
    country: 'Nigeria 🇳🇬',
    rating: 4.94,
    reviewsCount: 65,
    isTopRated: true,
    verified: true,
    hourlyRate: '$50/hr'
  },
  {
    id: 'pro_6',
    username: 'liam_vance',
    name: 'Liam Vance',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    primarySkill: 'Renewable Power Specialist',
    location: 'Sydney',
    country: 'Australia 🇦🇺',
    rating: 4.91,
    reviewsCount: 52,
    isTopRated: true,
    verified: true,
    hourlyRate: '$65/hr'
  }
];

export const TopRatedProfessionals: React.FC<TopRatedProfessionalsProps> = ({
  onBrowseAll,
  onSelectPro,
  onHirePro,
  onMessagePro,
  customPros = DEFAULT_TOP_PROS
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
      {/* Header with Title and "Browse All" Link */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">Top Rated Professionals</h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Globe2 className="w-2.5 h-2.5" /> Verified Worldwide
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Vetted experts with proven ratings across 50+ countries</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBrowseAll}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer group"
        >
          <span>Browse All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex items-stretch gap-3.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {customPros.map((pro) => (
          <div
            key={pro.id}
            className="flex flex-col justify-between p-3.5 bg-slate-950/70 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl w-44 sm:w-48 shrink-0 transition-all duration-200 group shadow-md text-center"
          >
            {/* Clickable Profile Header Area */}
            <div
              onClick={() => onSelectPro && onSelectPro(pro)}
              className="cursor-pointer"
              title={`View ${pro.name}'s profile (/profile/${pro.username})`}
            >
              {/* Avatar with Badges */}
              <div className="relative mb-2.5 mx-auto w-16 h-16">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-slate-700 group-hover:ring-emerald-500/60 transition-all duration-200 shadow-md">
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Top Rated Star Overlay */}
                {pro.isTopRated && (
                  <div 
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 p-1 rounded-full shadow-md ring-2 ring-slate-900"
                    title="Top Rated Professional"
                  >
                    <Star className="w-3 h-3 fill-slate-950" />
                  </div>
                )}

                {/* Verified Shield Overlay */}
                {pro.verified && (
                  <div 
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full shadow-md ring-2 ring-slate-900"
                    title="Identity & Credentials Verified"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 fill-slate-950 text-white" />
                  </div>
                )}
              </div>

              {/* Name & Username */}
              <h3 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                {pro.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                @{pro.username}
              </p>

              {/* Primary Skill */}
              <p className="text-[11px] font-semibold text-slate-300 truncate mt-1">
                {pro.primarySkill}
              </p>

              {/* Location */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-1 truncate">
                <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span>{pro.location}, {pro.country}</span>
              </div>

              {/* Rating & Hourly Rate (Clearly Visible) */}
              <div className="flex items-center justify-between w-full mt-2.5 pt-2 border-t border-slate-800/80 text-[10px]">
                <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{pro.rating.toFixed(1)}</span>
                  <span className="text-slate-500 font-normal">({pro.reviewsCount})</span>
                </span>
                <span className="text-emerald-400 font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {pro.hourlyRate}
                </span>
              </div>
            </div>

            {/* Direct Action Buttons: Hire / Message */}
            <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onHirePro) {
                    onHirePro(pro);
                  } else if (onSelectPro) {
                    onSelectPro(pro);
                  }
                }}
                className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                title={`Hire ${pro.name}`}
              >
                <Briefcase className="w-3 h-3" />
                <span>Hire</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMessagePro) {
                    onMessagePro(pro);
                  } else if (onSelectPro) {
                    onSelectPro(pro);
                  }
                }}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-xl border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                title={`Message ${pro.name}`}
              >
                <Send className="w-3 h-3 text-emerald-400" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}

        {/* End of list "Browse All Professionals" Action Card */}
        <div
          onClick={onBrowseAll}
          className="flex flex-col items-center justify-center p-4 bg-slate-950/40 hover:bg-emerald-500/10 border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl w-44 sm:w-48 shrink-0 transition-all duration-200 cursor-pointer group text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-200 shadow-md">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">
            Browse All
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            50+ Categories & Countries
          </span>
        </div>
      </div>
    </div>
  );
};
