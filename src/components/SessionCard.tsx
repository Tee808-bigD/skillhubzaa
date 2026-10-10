import React, { useState } from 'react';
import { LiveSession, User } from '../types';
import { 
  Radio, 
  Clock, 
  Play, 
  Volume2, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Award, 
  Bell, 
  Heart, 
  Briefcase, 
  Share2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SessionCardProps {
  session: LiveSession;
  currentUser: User;
  onJoinSession: (session: LiveSession) => void;
  onToggleNotify: (sessionId: string) => void;
  onToggleFollowHost: (hostId: string) => void;
  onOpenProfile?: (user: Partial<User>) => void;
  onBookService?: (serviceId: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  currentUser,
  onJoinSession,
  onToggleNotify,
  onToggleFollowHost,
  onOpenProfile,
  onBookService
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const isHost = currentUser.id === session.hostId;

  return (
    <div className="bg-[#18181b] rounded-3xl border border-neutral-800 p-5 md:p-6 shadow-xl hover:border-neutral-700 transition-all flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Badge Bar: Status & Price */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {session.status === 'live' && (
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 font-black text-[10px] rounded-md uppercase tracking-wider border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3" />
                LIVE NOW
              </span>
            )}
            {session.status === 'upcoming' && (
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 font-extrabold text-[10px] rounded-md uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {session.startsInText || 'UPCOMING'}
              </span>
            )}
            {session.status === 'replay' && (
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-400 font-extrabold text-[10px] rounded-md uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1">
                <Play className="w-3 h-3" />
                RECORDED REPLAY
              </span>
            )}
            <span className="text-[10px] font-bold text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
              {session.category}
            </span>
          </div>

          {/* Pricing Badge */}
          <div>
            {session.isPaid ? (
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-black text-[10px] rounded-md uppercase tracking-wider border border-emerald-500/40 flex items-center gap-0.5">
                <DollarSign className="w-3 h-3 -mr-0.5" />
                PAID {session.priceCurrency || '$'}{session.priceAmount}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 font-extrabold text-[10px] rounded-md uppercase tracking-wider border border-neutral-700">
                FREE
              </span>
            )}
          </div>
        </div>

        {/* Host Section: Avatar + Name + Badges + Clickable Profile */}
        <div className="flex items-center justify-between gap-3 bg-[#121214] p-3 rounded-2xl border border-neutral-800/80 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onOpenProfile?.({ id: session.hostId, name: session.hostName, avatar: session.hostAvatar })}
              className="relative shrink-0 group-hover:scale-105 transition"
              title={`View ${session.hostName}'s profile`}
            >
              <img 
                src={session.hostAvatar} 
                alt={session.hostName} 
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" 
              />
              {session.hostVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 bg-[#121214] rounded-full absolute -bottom-0.5 -right-0.5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onOpenProfile?.({ id: session.hostId, name: session.hostName, avatar: session.hostAvatar })}
                  className="text-xs font-black text-white hover:text-emerald-400 truncate transition text-left"
                >
                  {session.hostName}
                </button>
                {session.hostVerified && (
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase">
                    Verified Host
                  </span>
                )}
                {session.isTopRated && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-black rounded uppercase flex items-center gap-0.5">
                    ★ Top Rated
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 truncate">{session.hostRole}</p>
            </div>
          </div>

          {/* Follow Host Button */}
          {!isHost && (
            <button
              onClick={() => onToggleFollowHost(session.hostId)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shrink-0 ${
                session.isFollowed
                  ? 'bg-neutral-800 text-neutral-300'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
              }`}
              title={session.isFollowed ? 'Following host' : 'Follow host for updates'}
            >
              <Heart className={`w-3 h-3 ${session.isFollowed ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{session.isFollowed ? 'Following' : 'Follow'}</span>
            </button>
          )}
        </div>

        {/* Title & Subtitle / Hook */}
        <div className="space-y-1.5 mb-3">
          <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition leading-snug">
            {session.title}
          </h3>
          {session.subtitle && (
            <p className="text-xs text-neutral-300 leading-relaxed font-medium line-clamp-2">
              {session.subtitle}
            </p>
          )}
        </div>

        {/* Agenda / What You'll Learn (Bulleted List) */}
        {session.agenda && session.agenda.length > 0 && (
          <div className="bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800/80 mb-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
              What You'll Learn:
            </span>
            <ul className="space-y-1 text-xs text-neutral-300">
              {session.agenda.slice(0, 3).map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                  <span className="line-clamp-1">{bullet}</span>
                </li>
              ))}
              {session.agenda.length > 3 && (
                <li className="text-[10px] text-neutral-500 font-semibold pl-3.5">
                  + {session.agenda.length - 3} more key takeaway topics
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Stats Row: Speakers, Listeners, Duration */}
        <div className="flex items-center gap-4 text-xs text-neutral-400 font-bold mb-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            {session.speakersCount} {session.speakersCount === 1 ? 'Speaker' : 'Speakers'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            {session.status === 'replay' ? `${session.replayViewsCount || 120} Listened` : `${session.listenersCount} Listening`}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-neutral-400" />
            {session.duration}
          </span>
        </div>

        {/* Scheduled Info for Upcoming */}
        {session.status === 'upcoming' && session.scheduledDateFormatted && (
          <div className="text-xs text-indigo-300 font-semibold mb-4 bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-500/20 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{session.scheduledDateFormatted}</span>
          </div>
        )}

        {/* Replay Audio Preview Widget */}
        {session.status === 'replay' && session.recordingAudioPreview && (
          <div className="mb-4 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  isPlayingAudio ? 'bg-emerald-500 text-slate-950' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </button>
              <span className="font-semibold text-[11px]">Audio Recording ({session.replayDuration || session.duration})</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">HQ Master</span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
        {/* Marketplace Upsell: Book Service */}
        {session.linkedServiceTitle ? (
          <button
            onClick={() => onBookService?.(session.linkedServiceId || 'srv_2')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group/svc"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px] sm:max-w-none">Book Service</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenProfile?.({ id: session.hostId, name: session.hostName, avatar: session.hostAvatar })}
            className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <span>View Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dynamic Action Button based on Tab Status */}
        <div>
          {session.status === 'live' && (
            <button
              onClick={() => onJoinSession(session)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition hover:scale-105 flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{session.isPaid ? `Join Stage ($${session.priceAmount})` : 'Join Audio Stage'}</span>
            </button>
          )}

          {session.status === 'upcoming' && (
            <button
              onClick={() => onToggleNotify(session.id)}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                session.isNotified
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:scale-105'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${session.isNotified ? 'fill-neutral-400 text-neutral-400' : ''}`} />
              <span>{session.isNotified ? 'Subscribed' : 'Notify Me'}</span>
            </button>
          )}

          {session.status === 'replay' && (
            <button
              onClick={() => onJoinSession(session)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Play Recording</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
