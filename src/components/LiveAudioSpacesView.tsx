import React, { useState } from 'react';
import { User, Mentor } from '../types';
import { Mic, MicOff, Radio, Volume2, Users, Hand, MessageSquare, Plus, Sparkles, ShieldCheck } from 'lucide-react';

interface AudioRoom {
  id: string;
  title: string;
  topic: string;
  hostName: string;
  hostAvatar: string;
  hostRole: string;
  speakersCount: number;
  listenersCount: number;
  isLive: boolean;
  speakers: { id: string; name: string; avatar: string; role: string; isSpeaking: boolean }[];
  listeners: { id: string; name: string; avatar: string }[];
}

interface LiveAudioSpacesViewProps {
  currentUser: User;
  mentors: Mentor[];
}

export const LiveAudioSpacesView: React.FC<LiveAudioSpacesViewProps> = ({
  currentUser,
  mentors
}) => {
  const [activeRoom, setActiveRoom] = useState<AudioRoom | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);

  // Mock audio rooms
  const initialRooms: AudioRoom[] = [
    {
      id: 'room_1',
      title: 'Solar Installation & Electrical Trade Office Hours',
      topic: 'Clean Energy & PV Inverter Sizing in SA Townships',
      hostName: 'Sbusiso Dlamini',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      hostRole: 'Master Solar Technician',
      speakersCount: 3,
      listenersCount: 42,
      isLive: true,
      speakers: [
        { id: 'spk_1', name: 'Sbusiso Dlamini', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', role: 'Host', isSpeaking: true },
        { id: 'spk_2', name: 'Nomvula Sithole', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Solar Engineer', isSpeaking: false },
        { id: 'spk_3', name: 'Kevin Van Zyl', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', role: 'SETA Assessor', isSpeaking: false }
      ],
      listeners: [
        { id: 'lst_1', name: 'Thabo M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
        { id: 'lst_2', name: 'Lerato K.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
        { id: 'lst_3', name: 'Zizipho B.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' }
      ]
    },
    {
      id: 'room_2',
      title: 'Junior Tech Resume & Portfolio Teardown',
      topic: 'How to land remote software internships from KZN & Gauteng',
      hostName: 'Dr. Thandiwe Khumalo',
      hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      hostRole: 'Engineering Director & Mentor',
      speakersCount: 2,
      listenersCount: 88,
      isLive: true,
      speakers: [
        { id: 'spk_4', name: 'Dr. Thandiwe Khumalo', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', role: 'Host', isSpeaking: true },
        { id: 'spk_5', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', role: 'Tech Lead', isSpeaking: false }
      ],
      listeners: [
        { id: 'lst_4', name: 'Ayo B.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80' }
      ]
    }
  ];

  return (
    <div className="space-y-6 text-white">
      
      {/* Title Header */}
      <div className="bg-[#1e1e1e] p-5 rounded-3xl border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-xl font-black text-white">SkillHub Live Audio Spaces</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Drop-in audio conversations, trade office hours, and mentor Q&As</p>
        </div>

        <button
          onClick={() => {
            const newRoom: AudioRoom = {
              id: `room_${Date.now()}`,
              title: `${currentUser.name}'s Skill Stage`,
              topic: 'Q&A & Career Discussion',
              hostName: currentUser.name,
              hostAvatar: currentUser.avatar,
              hostRole: currentUser.bio || 'SkillHub Creator',
              speakersCount: 1,
              listenersCount: 1,
              isLive: true,
              speakers: [{ id: 'me', name: currentUser.name, avatar: currentUser.avatar, role: 'Host', isSpeaking: true }],
              listeners: []
            };
            setActiveRoom(newRoom);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Start Audio Space</span>
        </button>
      </div>

      {/* Active Room View */}
      {activeRoom ? (
        <div className="bg-[#1e1e1e] rounded-3xl border border-rose-500/30 p-6 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
            <div>
              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 font-black text-[10px] rounded-md uppercase tracking-wider border border-rose-500/30">
                🔴 LIVE AUDIO STAGE
              </span>
              <h2 className="text-lg font-black text-white mt-2">{activeRoom.title}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{activeRoom.topic}</p>
            </div>

            <button
              onClick={() => setActiveRoom(null)}
              className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 rounded-xl"
            >
              Leave Room
            </button>
          </div>

          {/* Speakers Stage Grid */}
          <div>
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Speakers Stage ({activeRoom.speakers.length})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeRoom.speakers.map((spk) => (
                <div
                  key={spk.id}
                  className="bg-[#141414] border border-neutral-800 p-4 rounded-2xl flex flex-col items-center text-center relative group"
                >
                  {/* Speaker Glow Ring */}
                  <div className={`relative mb-2 ${spk.isSpeaking ? 'ring-4 ring-emerald-500 rounded-full animate-pulse' : ''}`}>
                    <img src={spk.avatar} alt={spk.name} className="w-16 h-16 rounded-full object-cover" />
                    {spk.isSpeaking && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#141414] rounded-full"></span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-xs text-white truncate max-w-full">{spk.name}</h4>
                  <span className="text-[10px] font-bold text-neutral-400 mt-0.5">{spk.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Section */}
          <div>
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Audience ({activeRoom.listenersCount} Listening)</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {activeRoom.listeners.map((lst) => (
                <div key={lst.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121212] border border-neutral-800 rounded-full">
                  <img src={lst.avatar} alt={lst.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-xs font-bold text-neutral-300">{lst.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Audio Controls */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isMicOn ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span>{isMicOn ? 'Mic Unmuted' : 'Muted'}</span>
              </button>

              <button
                onClick={() => {
                  setHasRaisedHand(!hasRaisedHand);
                  alert(hasRaisedHand ? 'Lowered hand' : 'Hand raised! Host notified.');
                }}
                className={`p-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
                  hasRaisedHand ? 'bg-amber-500 text-slate-950 font-black' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>{hasRaisedHand ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            </div>

            <div className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SkillHub End-to-End Audio Active</span>
            </div>
          </div>

        </div>
      ) : (
        /* List of Available Live Rooms */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {initialRooms.map((room) => (
            <div
              key={room.id}
              className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 p-6 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 font-black text-[10px] rounded-md uppercase tracking-wider border border-rose-500/30 flex items-center gap-1 w-fit">
                    <Radio className="w-3 h-3 animate-pulse" />
                    LIVE STAGE
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-2 group-hover:text-emerald-400 transition">{room.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{room.topic}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#121212] p-3 rounded-2xl border border-neutral-800">
                <img src={room.hostAvatar} alt={room.hostName} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" />
                <div>
                  <h4 className="text-xs font-black text-white">{room.hostName}</h4>
                  <p className="text-[11px] text-neutral-400">{room.hostRole}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    {room.speakersCount} Speakers
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-cyan-400" />
                    {room.listenersCount} Listening
                  </span>
                </div>

                <button
                  onClick={() => setActiveRoom(room)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition hover:scale-105"
                >
                  Join Audio Stage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
