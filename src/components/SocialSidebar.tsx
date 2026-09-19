import React from 'react';
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
  Radio
} from 'lucide-react';

interface SocialSidebarProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  currentUser: User;
  unreadMessagesCount: number;
  unreadNotifsCount: number;
  onOpenCreate: () => void;
}

export const SocialSidebar: React.FC<SocialSidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  unreadMessagesCount,
  unreadNotifsCount,
  onOpenCreate
}) => {
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
    <aside className="w-16 lg:w-64 bg-[#121212] border-r border-neutral-800/80 min-h-screen flex flex-col justify-between py-6 px-3 shrink-0 fixed top-0 left-0 z-40">
      
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3">
          <div 
            onClick={() => onSelectView('feed')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              S
            </div>
            <div className="hidden lg:block">
              <span className="font-black text-lg text-white tracking-tight block">SkillHub</span>
              <span className="text-[10px] font-bold text-emerald-400 block -mt-1">Social & Freelance</span>
            </div>
          </div>

          <div className="hidden lg:block">
            <PWAInstallButton />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onOpenCreate}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-emerald-400 hover:bg-emerald-500/10 font-bold text-sm transition-all text-left"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id as MainView)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl font-bold text-sm transition-all text-left relative ${
                  isActive 
                    ? 'bg-neutral-800 text-white shadow-xs' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : ''}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#121212]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Footer Actions */}
      <div className="space-y-2 border-t border-neutral-800/80 pt-4">
        <button
          onClick={() => onSelectView('profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all ${
            currentView === 'profile' ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/50'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="hidden lg:block text-left overflow-hidden">
            <h4 className="font-extrabold text-xs text-white truncate">{currentUser.name}</h4>
            <p className="text-[10px] text-neutral-400 truncate">{currentUser.handle}</p>
          </div>
        </button>

        <button
          onClick={() => onSelectView('profile')}
          className="w-full hidden lg:flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white text-xs font-semibold rounded-xl"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More Settings</span>
        </button>
      </div>

    </aside>
  );
};
