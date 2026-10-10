import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Briefcase, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Music,
  ExternalLink,
  CheckCircle2,
  UserCheck,
  Trash2
} from 'lucide-react';
import { Reel, User } from '../types';

interface ReelCardProps {
  reel: Reel;
  isMuted: boolean;
  onToggleMute: () => void;
  isLiked: boolean;
  likesCount: number;
  onToggleLike: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  commentsCount: number;
  onOpenComments: () => void;
  onOpenShare: () => void;
  onHireCreator: () => void;
  onViewProfile: () => void;
  videoError: boolean;
  onVideoError: () => void;
  onDeleteReel?: (reelId: string) => void;
  canDelete?: boolean;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isMuted,
  onToggleMute,
  isLiked,
  likesCount,
  onToggleLike,
  isBookmarked,
  onToggleBookmark,
  commentsCount,
  onOpenComments,
  onOpenShare,
  onHireCreator,
  onViewProfile,
  videoError,
  onVideoError,
  onDeleteReel,
  canDelete = true
}) => {
  const rating = reel.authorRating || 4.95;
  const isTopRated = rating >= 4.5;
  const location = reel.authorLocation || 'Global 🌐';
  const skills = reel.skills || reel.tags || ['WebDev', 'React'];

  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[460px] h-[calc(100vh-140px)] min-h-[600px] max-h-[820px] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between shrink-0 select-none group">
      
      {/* 1. Background Video / Fallback Visual */}
      <div className="absolute inset-0 w-full h-full bg-[#161616] flex items-center justify-center overflow-hidden">
        {videoError ? (
          <div className="w-full h-full relative">
            <img
              src={reel.authorAvatar || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
              alt=""
              className="w-full h-full object-cover filter brightness-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center p-6 text-center text-white space-y-2">
              <Music className="w-10 h-10 text-emerald-400 animate-bounce" />
              <span className="font-extrabold text-sm text-neutral-200">{reel.audioTrack}</span>
              <span className="text-[11px] text-neutral-400">Video preview active</span>
            </div>
          </div>
        ) : (
          <video
            key={reel.id}
            src={reel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={onVideoError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 2. Top Bar (Category badge + Sound toggle) */}
      <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <div className="flex items-center gap-2">
          {reel.isPortfolioPiece && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-black tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Showcase</span>
            </span>
          )}
          {reel.category && (
            <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
              {reel.category.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onDeleteReel && canDelete && (
            <button
              type="button"
              onClick={() => onDeleteReel(reel.id)}
              className="p-2 bg-black/60 backdrop-blur-md rounded-full text-neutral-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all border border-white/10 cursor-pointer"
              title="Remove Showcase from Feed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all border border-white/10 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Right Interaction Sidebar (Floats over the video) */}
      <div className="absolute right-3.5 bottom-28 z-30 flex flex-col items-center gap-3.5">
        
        {/* Like Button */}
        <button
          type="button"
          onClick={onToggleLike}
          className="flex flex-col items-center gap-1 text-white cursor-pointer group/btn"
          title="Like Showcase"
        >
          <div className={`p-3 rounded-full transition-all shadow-lg backdrop-blur-md ${
            isLiked 
              ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50' 
              : 'bg-black/60 text-white border border-white/15 group-hover/btn:scale-110 hover:bg-black/80'
          }`}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-black text-white/90 drop-shadow">
            {likesCount}
          </span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1 text-white cursor-pointer group/btn"
          title="View Comments & Inquiries"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 group-hover/btn:scale-110 hover:bg-black/80 transition-all shadow-lg">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-white/90 drop-shadow">
            {commentsCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={onOpenShare}
          className="flex flex-col items-center gap-1 text-white cursor-pointer group/btn"
          title="Share Showcase"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 group-hover/btn:scale-110 hover:bg-black/80 transition-all shadow-lg">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-white/90 drop-shadow">
            Share
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className="flex flex-col items-center gap-1 text-white cursor-pointer group/btn"
          title={isBookmarked ? 'Saved to Portfolio' : 'Bookmark Reel'}
        >
          <div className={`p-3 rounded-full transition-all shadow-lg backdrop-blur-md ${
            isBookmarked
              ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50'
              : 'bg-black/60 text-white border border-white/15 group-hover/btn:scale-110 hover:bg-black/80'
          }`}>
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </div>
        </button>

      </div>

      {/* 4. Bottom Creator, Trust Overlay & Prominent CTAs */}
      <div className="relative z-20 p-5 pt-10 bg-gradient-to-t from-black/95 via-black/75 to-transparent text-white space-y-3">
        
        {/* Creator Identity with Trust Badges */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onViewProfile}
            className="relative cursor-pointer shrink-0"
          >
            <img
              src={reel.authorAvatar}
              alt={reel.authorName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 shadow-md hover:scale-105 transition-all"
            />
            {reel.authorVerified && (
              <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-slate-950" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 
                onClick={onViewProfile}
                className="font-black text-sm text-white hover:text-emerald-400 transition-colors cursor-pointer truncate"
              >
                {reel.authorName}
              </h4>

              {/* Verified Pro Badge */}
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Pro</span>
              </span>

              {/* Top Rated Badge */}
              {isTopRated && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded-md">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>Top Rated</span>
                </span>
              )}
            </div>

            {/* Location & Handle */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-semibold mt-0.5">
              <span>{reel.authorHandle}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5 text-neutral-300">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Professional Caption */}
        <p className="text-xs text-neutral-200 font-medium leading-relaxed line-clamp-2 pr-12">
          {reel.caption}
        </p>

        {/* Skills Tags (Pills) */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5 pr-12">
            {skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-extrabold text-neutral-200 border border-white/10"
              >
                {skill.replace('#', '')}
              </span>
            ))}
          </div>
        )}

        {/* Audio Track Ticker */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400/90 pt-0.5">
          <Music className="w-3.5 h-3.5 animate-spin" />
          <span className="truncate max-w-[200px]">{reel.audioTrack}</span>
        </div>

        {/* Prominent CTAs: "Hire Me" (Primary Green) and "View Profile" (Secondary) */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onHireCreator}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Hire Me</span>
            {reel.authorHourlyRate && (
              <span className="text-[10px] font-extrabold opacity-80 ml-1">
                ({reel.authorHourlyRate})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onViewProfile}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/15 transition-all cursor-pointer backdrop-blur-md"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Profile</span>
          </button>
        </div>

      </div>

    </div>
  );
};
