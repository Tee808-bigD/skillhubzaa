import React from 'react';
import { CommunityEvent } from '../types';
import { X, Calendar, Clock, MapPin, ShieldCheck, Award, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

interface EventDetailModalProps {
  event: CommunityEvent;
  onClose: () => void;
  onRSVP: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onRSVP
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl relative">
        
        {/* Media / Header Banner */}
        {event.mediaUrl ? (
          <div className="relative h-48 w-full bg-black overflow-hidden">
            {event.mediaType === 'video' ? (
              <video src={event.mediaUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
            ) : (
              <img src={event.mediaUrl} alt={event.title} className="w-full h-full object-cover" />
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 left-3 px-3 py-1 bg-rose-500 text-white font-black text-[10px] uppercase rounded-lg shadow-md">
              {event.category}
            </span>
          </div>
        ) : (
          <div className="p-5 bg-[#141414] border-b border-neutral-800 flex items-center justify-between">
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-xs rounded-lg uppercase">
              {event.category}
            </span>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          
          {/* Title & Host */}
          <div>
            <h2 className="text-xl font-black text-white">{event.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <img src={event.hostAvatar} alt={event.hostName} className="w-6 h-6 rounded-full object-cover border border-emerald-400" />
              <span className="text-xs font-bold text-neutral-300">Hosted by {event.hostName}</span>
            </div>
          </div>

          {/* Time & Venue Matrix */}
          <div className="grid grid-cols-2 gap-3 bg-[#141414] p-3.5 rounded-2xl border border-neutral-800 text-xs font-bold">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Date</span>
                <span className="text-white">{event.fullDate || event.dateBadge}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Hours (Open / Close)</span>
                <span className="text-white">{event.openingTime || '09:00'} - {event.closingTime || '17:00'}</span>
              </div>
            </div>

            <div className="col-span-2 flex items-start gap-2 pt-2 border-t border-neutral-800">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Location</span>
                <span className="text-white">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-1">About Event</h4>
              <p className="text-xs text-neutral-200 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Rules */}
          {event.rules && event.rules.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider">Event Entry Rules</h4>
              <ul className="space-y-1">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0"></span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official Sponsors */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Official Sponsors</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.sponsors.map((spons, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#121212] border border-neutral-800 rounded-xl text-xs font-bold text-amber-300">
                    {spons}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendee Safety Guidelines */}
          {event.safetyGuidelines && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                <ShieldCheck className="w-4 h-4" />
                <span>Attendee Safety & Emergency Protocol</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">{event.safetyGuidelines}</p>
            </div>
          )}

          {/* RSVP Footer */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-bold">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{event.attendeesCount} Attending</span>
            </div>

            <button
              onClick={() => {
                onRSVP(event.id);
                onClose();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                event.isAttending
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{event.isAttending ? 'RSVP Confirmed' : 'RSVP to Attend'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
