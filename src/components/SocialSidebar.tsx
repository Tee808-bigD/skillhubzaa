import React, { useState, useRef } from 'react';
import { MainView, User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Home, 
  Film, 
  Send, 
  Search, 
  Heart, 
  PlusCircle, 
  Briefcase, 
  User as UserIcon, 
  MoreHorizontal, 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  Award,
  MapPin,
  Radio,
  Server,
  Lock,
  LogOut,
  Pin,
  PinOff,
  Menu,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';

interface SocialSidebarProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  currentUser: User;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  onOpenCreate: () => void;
  onOpenDjangoBackend?: () => void;
  isAuthenticated?: boolean;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenLegalDoc?: (type: 'terms' | 'privacy' | 'community-guidelines') => void;
}

export const SocialSidebar: React.FC<SocialSidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  unreadMessagesCount,
  unreadNotifsCount,
  onOpenCreate,
  onOpenDjangoBackend,
  isAuthenticated = false,
  onOpenLogin,
  onLogout,
  onOpenLegalDoc,
}) => {
  // Hover & Expand States
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Expanded if hovered or pinned
  const isExpanded = isHovered || isPinned;

  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { id: 'feed' as MainView, label: 'Home', icon: Home },
    { id: 'reels' as MainView, label: 'Reels', icon: Film },
    { 
      id: 'messages' as MainView, 
      label: 'Messages', 
      icon: Send, 
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
    },
    { id: 'search' as MainView, label: 'Search', icon: Search },
    { id: 'map' as MainView, label: 'Interactive Map', icon: MapPin },
    { id: 'audio_spaces' as MainView, label: 'Live Audio Spaces', icon: Radio },
    { 
      id: 'notifications' as MainView, 
      label: 'Notifications', 
      icon: Heart, 
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined 
    },
    { id: 'create', label: 'Create', icon: PlusCircle, isAction: true },
    { id: 'services' as MainView, label: 'Services', icon: Briefcase },
    { id: 'courses' as MainView, label: 'Courses & SETA', icon: GraduationCap },
    { id: 'resources' as MainView, label: 'Learning Hub', icon: BookOpen },
    { id: 'ai_advisor' as MainView, label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <>
      {/* Invisible Proximity Trigger Zone on Left Edge to catch mouse approach */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        className="fixed top-0 left-0 w-4 h-screen z-30 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Main Hover-Expandable Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMoreMenu(false);
        }}
        className={`fixed top-0 left-0 z-40 h-screen bg-[#121212] border-r border-neutral-800/80 transition-all duration-300 ease-in-out flex flex-col justify-between py-5 select-none ${
          isExpanded 
            ? 'w-64 shadow-2xl shadow-black/80 px-3' 
            : 'w-[72px] px-2 shadow-lg shadow-black/40'
        }`}
      >
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div 
              onClick={() => onSelectView('feed')}
              className="flex items-center gap-3 cursor-pointer group"
              title="SkillHub Home"
            >
              {/* Rounded Green 'S' Icon matching user's Image 1 */}
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-all">
                S
              </div>
              {isExpanded && (
                <div className="overflow-hidden transition-all duration-200">
                  <span className="font-black text-lg text-white tracking-tight block leading-tight">SkillHub</span>
                  <span className="text-[10px] font-bold text-emerald-400 block -mt-0.5">Social & Freelance</span>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <PWAInstallButton />
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned 
                      ? 'text-emerald-400 bg-emerald-500/15' 
                      : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                  }`}
                  title={isPinned ? 'Unpin Sidebar (Hover to expand)' : 'Pin Sidebar Open'}
                >
                  {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5 scrollbar-thin scrollbar-thumb-neutral-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              if (item.isAction) {
                return (
                  <button
                    key={item.id}
                    onClick={onOpenCreate}
                    title={item.label}
                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-2xl text-emerald-400 hover:bg-emerald-500/10 font-bold text-sm transition-all text-left group ${
                      !isExpanded ? 'justify-center' : ''
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    {isExpanded && <span className="animate-fadeIn whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id as MainView)}
                  title={item.label}
                  className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-2xl font-bold text-sm transition-all text-left relative group ${
                    !isExpanded ? 'justify-center' : ''
                  } ${
                    isActive 
                      ? 'bg-neutral-800 text-white shadow-xs' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : ''}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#121212]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {isExpanded && <span className="animate-fadeIn whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile, Auth (Login/Logout), & More Actions */}
        <div className="space-y-2 border-t border-neutral-800/80 pt-3 relative">
          
          {/* Popover "More" Menu (matching user's Image 2 & 3) */}
          {showMoreMenu && (
            <div 
              ref={moreMenuRef}
              className={`absolute bottom-full left-2 mb-2 w-56 bg-neutral-900 border border-neutral-700/90 rounded-2xl shadow-2xl p-2 z-50 text-xs font-semibold text-neutral-200 animate-fadeIn divide-y divide-neutral-800`}
            >
              <div className="pb-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    onSelectView('profile');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span>Profile & Certificates</span>
                </button>

                {onOpenDjangoBackend && (
                  <button
                    onClick={() => {
                      onOpenDjangoBackend();
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left text-neutral-300 hover:text-emerald-400 transition-colors"
                  >
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Django DRF Console</span>
                  </button>
                )}
              </div>

              {/* Legal & Policy Links matching Image 3 */}
              <div className="py-1.5 space-y-0.5 text-neutral-400">
                <button
                  onClick={() => {
                    if (onOpenLegalDoc) onOpenLegalDoc('privacy');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-neutral-800 hover:text-white text-left text-[11px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>POPIA Privacy Policy</span>
                </button>
                <button
                  onClick={() => {
                    if (onOpenLegalDoc) onOpenLegalDoc('terms');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-neutral-800 hover:text-white text-left text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Terms of Service</span>
                </button>
              </div>

              {/* Login / Logout Action */}
              <div className="pt-1.5">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 text-left transition-colors font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out ({currentUser.name})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      if (onOpenLogin) onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-left transition-colors font-bold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Sign In to SkillHub</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Primary Quick Login / Logout Action */}
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className={`w-full flex items-center rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all cursor-pointer group ${
                isExpanded ? 'px-3 py-2 justify-between' : 'p-2 justify-center'
              }`}
              title="Signed In: Click to Log Out"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                {isExpanded && (
                  <span className="font-mono text-[11px] font-bold text-emerald-400 truncate">
                    {currentUser.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-rose-400 font-semibold">
                <LogOut className="w-4 h-4 shrink-0" />
                {isExpanded && <span>Logout</span>}
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                isExpanded ? 'px-3 py-2.5' : 'p-2'
              }`}
              title="Sign In / Register"
            >
              <Lock className="w-4 h-4 shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">Sign In / Register</span>}
            </button>
          )}

          {/* Profile Button */}
          <button
            onClick={() => onSelectView('profile')}
            title={`Profile: ${currentUser.name}`}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-2xl transition-all ${
              !isExpanded ? 'justify-center' : ''
            } ${
              currentView === 'profile' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/50'
            }`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            {isExpanded && (
              <div className="text-left overflow-hidden animate-fadeIn">
                <h4 className="font-extrabold text-xs text-white truncate">{currentUser.name}</h4>
                <p className="text-[10px] text-neutral-400 truncate">{currentUser.handle}</p>
              </div>
            )}
          </button>

          {/* More Menu (Three lines / Hamburger as seen in Image 2) */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className={`w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-neutral-800/50 transition-colors ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="animate-fadeIn">More</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SocialSidebar;
