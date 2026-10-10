import React, { useState } from 'react';
import { LiveSession, User } from '../types';
import { 
  X, 
  Volume2, 
  Users, 
  Mic, 
  MicOff, 
  Hand, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Award, 
  DollarSign, 
  ExternalLink,
  Heart,
  Share2
} from 'lucide-react';

interface ActiveSessionRoomProps {
  session: LiveSession;
  currentUser: User;
  onLeave: () => void;
  onOpenProfile?: (user: Partial<User>) => void;
  onBookService?: (serviceId: string) => void;
}

export const ActiveSessionRoom: React.FC<ActiveSessionRoomProps> = ({
  session,
  currentUser,
  onLeave,
  onOpenProfile,
  onBookService
}) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isStageFollowed, setIsStageFollowed] = useState(session.isFollowed || false);
  const [roomMessages, setRoomMessages] = useState<Array<{
    id: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    timestamp: string;
    isHost?: boolean;
  }>>([
    {
      id: 'msg_1',
      senderName: session.hostName,
      senderAvatar: session.hostAvatar,
      text: `Welcome everyone to "${session.title}"! Drop questions in the chat or raise your hand to speak.`,
      timestamp: '2 mins ago',
      isHost: true
    },
    {
      id: 'msg_2',
      senderName: 'Lerato K.',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      text: 'Super excited for the sizing walkthrough!',
      timestamp: '1 min ago'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setRoomMessages(prev => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: chatInput.trim(),
        timestamp: 'Just now',
        isHost: currentUser.id === session.hostId
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="bg-[#18181b] rounded-3xl border border-rose-500/40 p-5 md:p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in duration-300 text-white">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 font-black text-[10px] rounded-md uppercase tracking-wider border border-rose-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE AUDIO STAGE
            </span>
            <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 font-bold text-[10px] rounded-md">
              {session.category}
            </span>
            {session.isPaid && (
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] rounded-md border border-emerald-500/30">
                PAID MASTERCLASS ({session.priceCurrency || '$'}{session.priceAmount})
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{session.title}</h2>
          {session.subtitle && (
            <p className="text-xs text-neutral-400 font-medium">{session.subtitle}</p>
          )}
        </div>

        {/* Leave Room & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Session invite link copied to clipboard!');
              }
            }}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition"
            title="Share Room Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onLeave}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-200 text-xs font-bold rounded-xl transition border border-neutral-700"
          >
            Leave Stage
          </button>
        </div>
      </div>

      {/* Main Stage Grid: Speakers + Live Chat Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Speakers Stage & Audience */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Speakers Stage Grid */}
          <div className="bg-[#121214] p-5 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Speakers on Stage ({session.speakers.length})</span>
              </h3>
              <span className="text-[11px] text-neutral-500">Live Voice Broadcast</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {session.speakers.map((spk) => (
                <div
                  key={spk.id}
                  className="bg-[#18181b] border border-neutral-800/90 p-3.5 rounded-2xl flex flex-col items-center text-center relative hover:border-neutral-700 transition"
                >
                  {/* Speaker Glow Ring */}
                  <div className={`relative mb-2.5 ${spk.isSpeaking ? 'ring-4 ring-emerald-500 rounded-full animate-pulse' : ''}`}>
                    <img 
                      src={spk.avatar} 
                      alt={spk.name} 
                      className="w-14 h-14 rounded-full object-cover border border-neutral-700" 
                    />
                    {spk.isSpeaking && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#18181b] rounded-full"></span>
                    )}
                  </div>
                  <h4 className="font-black text-xs text-white truncate max-w-full">{spk.name}</h4>
                  <span className="text-[10px] font-bold text-neutral-400 mt-0.5 truncate max-w-full">{spk.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Marketplace Spotlight Card */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-neutral-900 border border-emerald-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={session.hostAvatar} 
                alt={session.hostName} 
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenProfile?.({ id: session.hostId, name: session.hostName, avatar: session.hostAvatar })}
                    className="font-extrabold text-xs text-white hover:text-emerald-400 underline underline-offset-2 transition"
                  >
                    {session.hostName}
                  </button>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded">
                    ★ {session.hostRating || 4.9}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">{session.hostRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStageFollowed(!isStageFollowed)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isStageFollowed 
                    ? 'bg-neutral-800 text-neutral-300' 
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isStageFollowed ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isStageFollowed ? 'Following Host' : 'Follow Host'}</span>
              </button>

              <button
                onClick={() => onOpenProfile?.({ id: session.hostId, name: session.hostName, avatar: session.hostAvatar })}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* Audience Section */}
          <div className="bg-[#121214] p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Audience Stage ({session.listenersCount} Listening)</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {session.listeners.length > 0 ? (
                session.listeners.map((lst) => (
                  <div key={lst.id} className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] border border-neutral-800 rounded-full text-xs font-bold text-neutral-300">
                    <img src={lst.avatar} alt={lst.name} className="w-4 h-4 rounded-full object-cover" />
                    <span>{lst.name}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-neutral-500 italic">No public audience members yet. You are the first listener!</span>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Live Chat & Q&A */}
        <div className="bg-[#121214] p-4 rounded-2xl border border-neutral-800 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Session Live Chat</span>
            </h4>
            <span className="text-[10px] text-neutral-500 font-semibold">{roomMessages.length} messages</span>
          </div>

          {/* Messages scroll list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs scrollbar-thin scrollbar-thumb-neutral-800">
            {roomMessages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <img src={msg.senderAvatar} alt={msg.senderName} className="w-4 h-4 rounded-full object-cover" />
                  <span className="font-bold text-white text-[11px]">{msg.senderName}</span>
                  {msg.isHost && (
                    <span className="px-1 py-0.2 bg-rose-500/20 text-rose-400 font-black text-[9px] rounded uppercase">
                      Host
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 ml-auto">{msg.timestamp}</span>
                </div>
                <p className="text-neutral-300 pl-5 text-xs leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question or share thoughts..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Audio Interaction Dock */}
      <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              isMicOn 
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicOn ? 'Mic Unmuted (Speaking)' : 'Mic Muted'}</span>
          </button>

          <button
            onClick={() => {
              setHasRaisedHand(!hasRaisedHand);
              alert(hasRaisedHand ? 'Lowered hand.' : 'Hand raised! The host has been notified that you wish to speak.');
            }}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              hasRaisedHand 
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20' 
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand to Speak'}</span>
          </button>
        </div>

        <div className="text-xs text-neutral-400 font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SkillHub Encrypted Audio Active</span>
        </div>
      </div>

    </div>
  );
};
