import React from 'react';
import { 
  User, 
  CommunityEvent 
} from '../types';
import { 
  Briefcase, 
  User as UserIcon, 
  Calendar, 
  TrendingUp, 
  Globe2, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Code, 
  Palette, 
  Zap, 
  Cpu, 
  GraduationCap, 
  Search,
  Sparkles,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface RightWidgetsProps {
  currentUser?: User | null;
  isAuthenticated: boolean;
  events: CommunityEvent[];
  onSelectView: (view: string) => void;
  onOpenCreateEvent: () => void;
  onSelectEvent?: (event: CommunityEvent) => void;
  onSelectCategory?: (category: string) => void;
  onJoinAsPro?: () => void;
  onHirePro?: () => void;
}

export const POPULAR_GLOBAL_CATEGORIES = [
  { name: 'Web & Mobile Dev', icon: Code, count: '3.4k Pros', key: 'web_dev' },
  { name: 'UI/UX & Brand Design', icon: Palette, count: '2.1k Pros', key: 'graphic_design' },
  { name: 'Electrical & Smart Home', icon: Zap, count: '1.8k Pros', key: 'solar_repair' },
  { name: 'AI & Data Solutions', icon: Cpu, count: '1.2k Pros', key: 'ai_data' },
  { name: 'Global Tech Tutoring', icon: GraduationCap, count: '940 Pros', key: 'tutoring' },
  { name: 'Digital Growth & SEO', icon: TrendingUp, count: '870 Pros', key: 'marketing' },
];

export const TRENDING_GLOBAL_TOPICS = [
  { tag: '#FullStackRemote', count: '2.4k posts', category: 'Engineering' },
  { tag: '#SmartHomeWiring', count: '1.8k requests', category: 'Trades' },
  { tag: '#FigmaDesignSystems', count: '1.1k posts', category: 'Design' },
  { tag: '#SolarPVInstallers', count: '890 projects', category: 'Renewables' },
  { tag: '#CrossBorderEscrow', count: '650 discussions', category: 'Security' },
];

export const RightWidgets: React.FC<RightWidgetsProps> = ({
  currentUser,
  isAuthenticated,
  events,
  onSelectView,
  onOpenCreateEvent,
  onSelectEvent,
  onSelectCategory,
  onJoinAsPro,
  onHirePro
}) => {
  const formatInternationalDate = (dateBadge?: string, fullDate?: string): string => {
    const monthMap: Record<string, string> = {
      Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
      May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
      Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December'
    };
    if (dateBadge) {
      const parts = dateBadge.trim().split(/\s+/);
      if (parts.length >= 2 && monthMap[parts[0]]) {
        return `${monthMap[parts[0]]} ${parts[1].replace(/[^0-9]/g, '')}, 2026`;
      }
    }
    if (fullDate) {
      for (const [abbr, full] of Object.entries(monthMap)) {
        const regex = new RegExp(`(${abbr}[a-z]*)\\s+(\\d{1,2})`, 'i');
        const match = fullDate.match(regex);
        if (match) {
          return `${full} ${match[2]}, 2026`;
        }
      }
    }
    return 'August 20, 2026';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Dashboard or Get Started Card */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        {isAuthenticated && currentUser ? (
          /* ================= LOGGED IN: YOUR DASHBOARD ================= */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base tracking-tight">Your Dashboard</h3>
                <div className="w-8 h-0.5 bg-emerald-500 mt-1 rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Pro Member
              </span>
            </div>

            {/* Profile Completeness Bar */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Profile Completeness</span>
                <span className="font-bold text-emerald-400">85%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[85%] rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500">Add 2 more certifications to achieve 100% verified status.</p>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onSelectView('services')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>My Listed Services</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onSelectView('profile')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  <span>Public Profile & Reviews</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onOpenCreateEvent}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer hover:scale-102"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Host Global Event</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= LOGGED OUT: GET STARTED ================= */
          <div className="space-y-3.5">
            <div>
              <h3 className="font-black text-white text-base tracking-tight">Get Started</h3>
              <div className="w-8 h-0.5 bg-emerald-500 mt-1 rounded-full" />
              <p className="text-xs text-slate-400 font-medium mt-1">Join the global network of top talent</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onJoinAsPro}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join as a Professional</span>
              </button>

              <button
                type="button"
                onClick={onHirePro}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Post a Job / Request</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Milestone escrow & 0% sign-up fee</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Popular Categories Widget */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-base tracking-tight">Popular Categories</h3>
            <div className="w-8 h-0.5 bg-indigo-500 mt-1 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('all');
              onSelectView('search');
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/search');
              }
            }}
            className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
          >
            All
          </button>
        </div>

        <div className="space-y-2">
          {POPULAR_GLOBAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.name}
                href={`/search?category=${encodeURIComponent(cat.key)}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectCategory) onSelectCategory(cat.key);
                  onSelectView('search');
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/search?category=${encodeURIComponent(cat.key)}`);
                  }
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-colors cursor-pointer group block no-underline"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 group-hover:text-emerald-400 transition-colors">
                  {cat.count}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* 3. Trending Globally Widget */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-white text-base tracking-tight">Trending Globally</h3>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-8 h-0.5 bg-emerald-500 mt-1 rounded-full" />
          <p className="text-[11px] text-slate-400 mt-1">High-demand skills and discussions worldwide</p>
        </div>

        <div className="space-y-2.5">
          {TRENDING_GLOBAL_TOPICS.map((item) => (
            <div
              key={item.tag}
              onClick={() => onSelectView('feed')}
              className="p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                <span>{item.category}</span>
                <span>{item.count}</span>
              </div>
              <div className="text-xs font-black text-slate-200 hover:text-emerald-400 transition-colors">
                {item.tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Global Networking Events Widget */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-base tracking-tight">Global Networking Events</h3>
            <div className="w-8 h-0.5 bg-emerald-500 mt-1 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => onSelectView('feed')}
            className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {events.slice(0, 3).map((ev) => {
            const formattedDate = formatInternationalDate(ev.dateBadge, ev.fullDate);

            return (
              <div
                key={ev.id}
                className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-white text-xs sm:text-sm line-clamp-1">{ev.title}</h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                    Virtual
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <img
                    src={ev.hostAvatar}
                    alt={ev.hostName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <span className="font-medium truncate">{ev.hostName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectEvent ? onSelectEvent(ev) : alert(`Event details for ${ev.title}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Event Details</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
