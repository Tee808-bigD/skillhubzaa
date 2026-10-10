import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  MapPin, 
  Radio, 
  LogOut, 
  Pin, 
  PinOff, 
  Menu, 
  ShieldCheck, 
  FileText, 
  Bookmark,
  Layers,
  Settings,
  Plus,
  Compass,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export interface SidebarProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  currentUser: User;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  onOpenCreate: () => void;
  isAuthenticated?: boolean;
  userRole?: 'buyer' | 'client' | 'professional' | 'creator' | 'youth' | 'mentor' | 'employer' | 'trainer';
  onOpenLogin?: () => void;
  onOpenSignUp?: () => void;
  onLogout?: () => void;
  onOpenLegalDoc?: (type: 'terms' | 'privacy' | 'community-guidelines') => void;
  onPostJob?: () => void;
  onSelectProfileTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  unreadMessagesCount,
  unreadNotifsCount,
  onOpenCreate,
  isAuthenticated = false,
  userRole,
  onOpenLogin,
  onOpenSignUp,
  onLogout,
  onOpenLegalDoc,
  onPostJob,
  onSelectProfileTab
}) => {
  // Determine role: prop takes precedence, otherwise fallback to currentUser.role
  const resolvedRole = userRole || currentUser.role || 'youth';
  const isBuyer = resolvedRole === 'buyer' || resolvedRole === 'client' || resolvedRole === 'employer';
  const isCreatorOrPro = resolvedRole === 'creator' || resolvedRole === 'professional' || resolvedRole === 'youth' || resolvedRole === 'mentor';

  // Hover & Pin States
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isExpanded = isHovered || isPinned;
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Group 1: Primary Navigation
  const primaryNavItems = [
    { id: 'feed' as MainView, label: 'Home', icon: Home },
    { id: 'search' as MainView, label: 'Search', icon: Search },
    { 
      id: 'messages' as MainView, 
      label: 'Messages', 
      icon: Send, 
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
    },
    { 
      id: 'notifications' as MainView, 
      label: 'Notifications', 
      icon: Heart, 
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined 
    },
  ];

  // Group 2: Discovery
  const discoveryNavItems = [
    { id: 'reels' as MainView, label: 'Reels (Showcase)', icon: Film },
    { id: 'audio_spaces' as MainView, label: 'Live Sessions', icon: Radio },
    { id: 'courses' as MainView, label: 'Courses', icon: GraduationCap },
    { id: 'map' as MainView, label: 'Interactive Map', icon: MapPin },
    { id: 'ai_advisor' as MainView, label: 'AI Career Coach', icon: Sparkles },
  ];

  // Group 3: Marketplace Actions (for logged-in users)
  const marketplaceNavItems: Array<{ id: MainView; label: string; icon: any; action?: () => void }> = [
    { id: 'jobs_orders' as MainView, label: 'My Jobs / Orders', icon: Briefcase },
    { id: 'profile' as MainView, label: 'My Profile', icon: UserIcon },
    ...(isCreatorOrPro ? [{
      id: 'profile' as MainView,
      label: 'My Portfolio',
      icon: Layers,
      action: () => {
        onSelectView('profile');
        if (onSelectProfileTab) onSelectProfileTab('portfolio');
      }
    }] : [])
  ];

  return (
    <>
      {/* Invisible Proximity Trigger Zone on Left Edge */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        className="fixed top-0 left-0 w-4 h-screen z-30 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Main Hover-Expandable & Pinned Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMoreMenu(false);
        }}
        className={`fixed top-0 left-0 z-40 h-screen bg-[#121212] border-r border-neutral-800/80 transition-all duration-300 ease-in-out flex flex-col justify-between py-4 select-none ${
          isExpanded 
            ? 'w-64 shadow-2xl shadow-black/80 px-3' 
            : 'w-[72px] px-2 shadow-lg shadow-black/40'
        }`}
      >
        <div className="space-y-4">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div 
              onClick={() => onSelectView('feed')}
              className="flex items-center gap-3 cursor-pointer group"
              title="SkillHub Marketplace"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-all">
                S
              </div>
              {isExpanded && (
                <div className="overflow-hidden transition-all duration-200">
                  <span className="font-black text-lg text-white tracking-tight block leading-tight">SkillHub</span>
                  <span className="text-[10px] font-bold text-emerald-400 block -mt-0.5">Global Marketplace</span>
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

          {/* CTA Area for Logged-Out vs Logged-In Users */}
          {!isAuthenticated ? (
            <div className={`space-y-2 ${isExpanded ? 'px-1' : 'flex flex-col items-center'}`}>
              <button
                onClick={() => {
                  onSelectView('search');
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                  isExpanded ? 'py-2.5 px-3' : 'p-2.5'
                }`}
                title="Hire a Pro"
              >
                <Briefcase className="w-4 h-4 shrink-0 text-slate-950" />
                {isExpanded && <span className="whitespace-nowrap">Hire a Pro</span>}
              </button>

              {isExpanded ? (
                <button
                  onClick={() => {
                    if (onOpenSignUp) onOpenSignUp();
                    else if (onOpenLogin) onOpenLogin();
                  }}
                  className="w-full py-1.5 text-center text-xs font-bold text-neutral-300 hover:text-emerald-400 border border-neutral-800 hover:border-emerald-500/30 rounded-xl bg-neutral-900/60 transition-colors"
                >
                  Join as a Pro
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (onOpenSignUp) onOpenSignUp();
                    else if (onOpenLogin) onOpenLogin();
                  }}
                  className="p-2 text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 rounded-xl transition-colors"
                  title="Join as a Professional"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Logged In Action: Role-based "Post a Job" or "Create" */
            <div className={`${isExpanded ? 'px-1' : 'flex justify-center'}`}>
              {isBuyer ? (
                <button
                  onClick={() => {
                    if (onPostJob) onPostJob();
                    else onOpenCreate();
                  }}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isExpanded ? 'py-2.5 px-3' : 'p-2.5'
                  }`}
                  title="Post a Job"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  {isExpanded && <span className="whitespace-nowrap">Post a Job</span>}
                </button>
              ) : (
                <button
                  onClick={onOpenCreate}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isExpanded ? 'py-2.5 px-3' : 'p-2.5'
                  }`}
                  title="Create"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  {isExpanded && <span className="whitespace-nowrap">Create</span>}
                </button>
              )}
            </div>
          )}

          {/* Navigation Groups Container */}
          <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5 scrollbar-thin scrollbar-thumb-neutral-800">
            
            {/* GROUP 1: Primary Navigation */}
            <div className="space-y-1">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-bold text-sm transition-all text-left relative group ${
                      !isExpanded ? 'justify-center' : ''
                    } ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : ''}`} />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black min-w-4 h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#121212] shadow-sm animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isExpanded && <span className="animate-fadeIn whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/60 my-2 mx-1" />

            {/* GROUP 2: Discovery */}
            <div className="space-y-1">
              {isExpanded && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 pb-1">
                  Discovery
                </p>
              )}
              {discoveryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-bold text-sm transition-all text-left relative group ${
                      !isExpanded ? 'justify-center' : ''
                    } ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : ''}`} />
                    </div>
                    {isExpanded && <span className="animate-fadeIn whitespace-nowrap">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* GROUP 3: Marketplace Actions (Logged-in only) */}
            {isAuthenticated && (
              <>
                <div className="border-t border-neutral-800/60 my-2 mx-1" />
                <div className="space-y-1">
                  {isExpanded && (
                    <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 pb-1">
                      Marketplace
                    </p>
                  )}
                  {marketplaceNavItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={`${item.id}_${idx}`}
                        onClick={() => {
                          if (item.action) item.action();
                          else onSelectView(item.id);
                        }}
                        title={item.label}
                        className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-bold text-sm transition-all text-left relative group ${
                          !isExpanded ? 'justify-center' : ''
                        } ${
                          isActive 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-xs' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-emerald-400' : ''}`} />
                        </div>
                        {isExpanded && <span className="animate-fadeIn whitespace-nowrap">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Utilities / PWA install for logged out or collapsed mode */}
            {!isExpanded && (
              <div className="pt-2 flex justify-center">
                <PWAInstallButton />
              </div>
            )}
          </nav>
        </div>

        {/* Footer: User Profile, Auth, & More Menu */}
        <div className="space-y-2 border-t border-neutral-800/80 pt-3 relative">
          
          {/* Popover "More" Menu - Cleaned up (no leaks, no duplicate sign in) */}
          {showMoreMenu && (
            <div 
              ref={moreMenuRef}
              className="absolute bottom-full left-2 mb-2 w-60 bg-neutral-900 border border-neutral-700/90 rounded-2xl shadow-2xl p-2 z-50 text-xs font-semibold text-neutral-200 animate-fadeIn divide-y divide-neutral-800"
            >
              {/* Profile & Items */}
              <div className="pb-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    onSelectView('profile');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition-colors"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Settings & Profile</span>
                </button>

                <button
                  onClick={() => {
                    onSelectView('saved_courses');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-800 text-left transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Saved Items</span>
                </button>
              </div>

              {/* Legal & Policy Links */}
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

              {/* Log Out Action */}
              {isAuthenticated && (
                <div className="pt-1.5">
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
                </div>
              )}
            </div>
          )}

          {/* Quick Sign In / User Status */}
          {isAuthenticated ? (
            <div 
              onClick={() => onSelectView('profile')}
              className={`w-full flex items-center rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-neutral-800/60 transition-all cursor-pointer group ${
                isExpanded ? 'px-3 py-2 justify-between' : 'p-2 justify-center'
              }`}
              title={`View Profile: ${currentUser.name}`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                />
                {isExpanded && (
                  <div className="truncate text-left">
                    <p className="font-bold text-xs text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-400 truncate font-mono">{currentUser.handle}</p>
                  </div>
                )}
              </div>
              {isExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLogout) onLogout();
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className={`w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-all border border-neutral-700/80 cursor-pointer ${
                isExpanded ? 'px-3 py-2.5' : 'p-2'
              }`}
              title="Sign In / Register"
            >
              <UserIcon className="w-4 h-4 shrink-0 text-emerald-400" />
              {isExpanded && <span className="whitespace-nowrap">Sign In / Register</span>}
            </button>
          )}

          {/* More Options Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More Options"
            className={`w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-neutral-800/50 transition-colors ${
              !isExpanded ? 'justify-center' : ''
            }`}
          >
            <MoreHorizontal className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="animate-fadeIn">More</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export const SocialSidebar = Sidebar;
export default Sidebar;
