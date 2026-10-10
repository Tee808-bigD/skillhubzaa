import React, { useState, useMemo } from 'react';
import { User, Mentor, LiveSession, SessionTab, SessionCategory } from '../types';
import { initialLiveSessions } from '../data/mockLiveSessions';
import { SessionCard } from './SessionCard';
import { ActiveSessionRoom } from './ActiveSessionRoom';
import { HostSessionModal } from './HostSessionModal';
import { 
  Radio, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  Play, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  Users,
  Briefcase,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface LiveAudioSpacesViewProps {
  currentUser: User;
  mentors: Mentor[];
  onOpenProfile?: (user: Partial<User>) => void;
  onBookService?: (serviceId: string) => void;
}

export const LiveAudioSpacesView: React.FC<LiveAudioSpacesViewProps> = ({
  currentUser,
  mentors,
  onOpenProfile,
  onBookService
}) => {
  // State
  const [sessions, setSessions] = useState<LiveSession[]>(() => {
    try {
      const saved = localStorage.getItem('skillhub_live_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
    return initialLiveSessions;
  });

  const [activeTab, setActiveTab] = useState<SessionTab>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SessionCategory>('All');
  const [sortBy, setSortBy] = useState<'starting_soon' | 'most_listeners' | 'top_rated'>('starting_soon');
  const [activeRoom, setActiveRoom] = useState<LiveSession | null>(null);

  // Host modal state
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [hostModalType, setHostModalType] = useState<'free' | 'paid'>('free');

  // Followed host IDs state
  const [followedHostIds, setFollowedHostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skillhub_followed_hosts');
      return saved ? JSON.parse(saved) : ['usr_sbusiso_solar', 'usr_thandiwe_dr'];
    } catch {
      return ['usr_sbusiso_solar', 'usr_thandiwe_dr'];
    }
  });

  // Notified session IDs state
  const [notifiedSessionIds, setNotifiedSessionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('skillhub_notified_sessions');
      return saved ? JSON.parse(saved) : ['session_upcoming_2'];
    } catch {
      return ['session_upcoming_2'];
    }
  });

  // Save changes to localStorage
  const saveSessions = (updated: LiveSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem('skillhub_live_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  };

  const handleToggleFollowHost = (hostId: string) => {
    setFollowedHostIds(prev => {
      const next = prev.includes(hostId) ? prev.filter(id => id !== hostId) : [...prev, hostId];
      try {
        localStorage.setItem('skillhub_followed_hosts', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setSessions(prev =>
      prev.map(s => {
        if (s.hostId === hostId) {
          return { ...s, isFollowed: !s.isFollowed };
        }
        return s;
      })
    );
  };

  const handleToggleNotify = (sessionId: string) => {
    setNotifiedSessionIds(prev => {
      const next = prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId];
      try {
        localStorage.setItem('skillhub_notified_sessions', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const isNotified = !s.isNotified;
          alert(isNotified ? 'Subscribed! You will receive a notification when this session starts.' : 'Unsubscribed from session alerts.');
          return { ...s, isNotified };
        }
        return s;
      })
    );
  };

  const handleCreateSession = (newSessionData: Partial<LiveSession>) => {
    const newSession: LiveSession = {
      id: `session_${Date.now()}`,
      title: newSessionData.title || 'Live Session',
      subtitle: newSessionData.subtitle || '',
      description: newSessionData.description || '',
      category: newSessionData.category || 'Tech',
      agenda: newSessionData.agenda || ['Core insights and discussion'],
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostUsername: currentUser.handle?.replace('@', '') || currentUser.name.toLowerCase().replace(/\s+/g, '_'),
      hostAvatar: currentUser.avatar,
      hostRole: currentUser.title || currentUser.bio || 'Verified Host',
      hostRating: currentUser.rating || 5.0,
      hostVerified: true,
      isTopRated: true,
      status: newSessionData.status || 'live',
      speakersCount: 1,
      listenersCount: newSessionData.status === 'live' ? 1 : 0,
      duration: newSessionData.duration || '60 mins',
      scheduledFor: newSessionData.scheduledFor,
      scheduledDateFormatted: newSessionData.scheduledDateFormatted || 'Just scheduled',
      startsInText: newSessionData.status === 'live' ? 'Live Now' : 'Scheduled',
      isPaid: !!newSessionData.isPaid,
      priceAmount: newSessionData.priceAmount || 0,
      priceCurrency: '$',
      speakers: newSessionData.speakers || [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'Host',
          isSpeaking: true
        }
      ],
      listeners: []
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setIsHostModalOpen(false);

    if (newSession.status === 'live') {
      setActiveRoom(newSession);
    } else {
      setActiveTab('upcoming');
      alert('Upcoming session scheduled! Registration is now live on SkillHub.');
    }
  };

  // Filtered & Sorted Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // 1. Tab Match
      if (activeTab === 'live' && session.status !== 'live') return false;
      if (activeTab === 'upcoming' && session.status !== 'upcoming') return false;
      if (activeTab === 'replays' && session.status !== 'replay') return false;
      if (activeTab === 'my_spaces') {
        const isHosting = session.hostId === currentUser.id;
        const isAttending = session.isNotified || followedHostIds.includes(session.hostId);
        if (!isHosting && !isAttending) return false;
      }

      // 2. Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = session.title.toLowerCase().includes(q);
        const matchesHost = session.hostName.toLowerCase().includes(q);
        const matchesTopic = (session.subtitle || '').toLowerCase().includes(q);
        const matchesAgenda = session.agenda.some(a => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesHost && !matchesTopic && !matchesAgenda) return false;
      }

      // 3. Category Filter
      if (selectedCategory === 'Free' && session.isPaid) return false;
      if (selectedCategory === 'Paid' && !session.isPaid) return false;
      if (
        selectedCategory !== 'All' && 
        selectedCategory !== 'Free' && 
        selectedCategory !== 'Paid' && 
        session.category !== selectedCategory
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'most_listeners') {
        return (b.listenersCount + (b.replayViewsCount || 0)) - (a.listenersCount + (a.replayViewsCount || 0));
      }
      if (sortBy === 'top_rated') {
        return (b.hostRating || 0) - (a.hostRating || 0);
      }
      // Default: starting_soon / active
      return 0;
    });
  }, [sessions, activeTab, searchQuery, selectedCategory, sortBy, currentUser.id, followedHostIds]);

  const liveCount = sessions.filter(s => s.status === 'live').length;
  const upcomingCount = sessions.filter(s => s.status === 'upcoming').length;
  const replaysCount = sessions.filter(s => s.status === 'replay').length;
  const mySpacesCount = sessions.filter(s => s.hostId === currentUser.id || s.isNotified || followedHostIds.includes(s.hostId)).length;

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="bg-[#18181b] p-6 md:p-8 rounded-3xl border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Live Sessions & Masterclasses
            </h1>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 font-medium">
            Join live discussions, learn from industry experts, and network with professionals worldwide.
          </p>
        </div>

        {/* Action Buttons: Start Free Space & Host Paid Masterclass */}
        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={() => {
              setHostModalType('free');
              setIsHostModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-2xl border border-neutral-700 shadow-lg transition hover:scale-105"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Start a Free Space</span>
          </button>

          <button
            onClick={() => {
              setHostModalType('paid');
              setIsHostModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition hover:scale-105"
          >
            <DollarSign className="w-4 h-4 -mr-1" />
            <span>Host a Paid Masterclass</span>
          </button>
        </div>
      </div>

      {/* 2. Active Stage View (If user joined a room) */}
      {activeRoom && (
        <ActiveSessionRoom
          session={activeRoom}
          currentUser={currentUser}
          onLeave={() => setActiveRoom(null)}
          onOpenProfile={onOpenProfile}
          onBookService={onBookService}
        />
      )}

      {/* 3. Discovery Tabs: Live Now, Upcoming, Replays, My Spaces */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition shrink-0 ${
            activeTab === 'live'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Live Now</span>
          <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded text-[10px]">
            {liveCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition shrink-0 ${
            activeTab === 'upcoming'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming</span>
          <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('replays')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition shrink-0 ${
            activeTab === 'replays'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Replays</span>
          <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px]">
            {replaysCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_spaces')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition shrink-0 ${
            activeTab === 'my_spaces'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Spaces</span>
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px]">
            {mySpacesCount}
          </span>
        </button>
      </div>

      {/* 4. Search, Categories & Sort Controls */}
      <div className="bg-[#18181b] p-4 rounded-3xl border border-neutral-800 space-y-4">
        
        {/* Search bar & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sessions, hosts, or topics (e.g. solar inverter, figma, next.js)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-xs font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="starting_soon">Starting Soon</option>
              <option value="most_listeners">Most Listeners</option>
              <option value="top_rated">Top Rated Hosts</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neutral-800/80">
          {(['All', 'Tech', 'Design', 'Trades', 'Business', 'Career', 'Free', 'Paid'] as SessionCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat === 'Paid' ? '💰 Paid Masterclasses' : cat === 'Free' ? '🎁 Free Sessions' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* 5. Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentUser={currentUser}
              onJoinSession={(s) => setActiveRoom(s)}
              onToggleNotify={handleToggleNotify}
              onToggleFollowHost={handleToggleFollowHost}
              onOpenProfile={onOpenProfile}
              onBookService={onBookService}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Radio className="w-7 h-7 text-neutral-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">No sessions found</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {searchQuery
                ? `No sessions match "${searchQuery}". Try a different keyword or category.`
                : activeTab === 'my_spaces'
                ? "You haven't hosted or bookmarked any sessions yet."
                : "No active sessions currently scheduled in this category."}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={() => {
                setHostModalType('free');
                setIsHostModalOpen(true);
              }}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md"
            >
              Host the First Session
            </button>
          </div>
        </div>
      )}

      {/* 6. Host Session Modal */}
      {isHostModalOpen && (
        <HostSessionModal
          currentUser={currentUser}
          initialType={hostModalType}
          onClose={() => setIsHostModalOpen(false)}
          onSubmit={handleCreateSession}
        />
      )}

    </div>
  );
};
