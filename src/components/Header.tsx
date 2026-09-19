import React from 'react';
import { MainView, SouthAfricanProvince, User } from '../types';
import { 
  GraduationCap, 
  Briefcase, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  Bell, 
  User as UserIcon, 
  MapPin, 
  Bookmark, 
  Search,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  selectedProvince: SouthAfricanProvince;
  onSelectProvince: (province: SouthAfricanProvince) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  unreadCount: number;
  currentUser: User;
}

const provincesList: SouthAfricanProvince[] = [
  'All Regions / Global',
  'All South Africa',
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape'
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  selectedProvince,
  onSelectProvince,
  searchQuery,
  onSearchChange,
  unreadCount,
  currentUser
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Flag Badge */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onSelectView('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">SkillHub</span>
                <span className="bg-gradient-to-r from-emerald-400 via-yellow-400 to-indigo-400 bg-clip-text text-transparent font-black text-lg">ZA</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                  🇿🇦 SA YOUTH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Skills • SETA Learnerships • Freelance Services</p>
            </div>
          </div>

          {/* Desktop Search Bar & Location Filter */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, learnerships, services, or mentors..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/80 text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-400"
              />
            </div>
            
            <div className="relative shrink-0">
              <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400" />
              <select
                value={selectedProvince}
                onChange={(e) => onSelectProvince(e.target.value as SouthAfricanProvince)}
                className="bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer font-medium"
              >
                {provincesList.map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-bold text-xs">
            <button
              onClick={() => onSelectView('courses')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'courses' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => onSelectView('learnerships')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'learnerships' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Learnerships</span>
            </button>

            <button
              onClick={() => onSelectView('services')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'services' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Youth Marketplace</span>
            </button>

            <button
              onClick={() => onSelectView('mentors')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'mentors' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mentors</span>
            </button>

            <button
              onClick={() => onSelectView('resources')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'resources' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Learning Hub</span>
            </button>

            <button
              onClick={() => onSelectView('ai_advisor')}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border ${
                currentView === 'ai_advisor'
                  ? 'border-amber-400 text-amber-300 font-extrabold'
                  : 'border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>AI Career & CV</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectView('bookmarks')}
              className={`p-2 rounded-xl transition-all ${
                currentView === 'bookmarks'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Saved Items"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectView('notifications')}
              className="relative p-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectView('profile')}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700/80 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/50"
              />
              <span className="hidden sm:inline font-extrabold text-xs text-slate-200">{currentUser.name.split(' ')[0]}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-2">
            <div className="px-2 mb-3">
              <input
                type="text"
                placeholder="Search courses, learnerships, services..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs p-2.5 rounded-xl border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => { onSelectView('courses'); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${currentView === 'courses' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <GraduationCap className="w-4 h-4" /> Courses
              </button>
              <button
                onClick={() => { onSelectView('learnerships'); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${currentView === 'learnerships' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <Briefcase className="w-4 h-4" /> Learnerships
              </button>
              <button
                onClick={() => { onSelectView('services'); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${currentView === 'services' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <ShoppingBag className="w-4 h-4" /> Youth Marketplace
              </button>
              <button
                onClick={() => { onSelectView('mentors'); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${currentView === 'mentors' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <Users className="w-4 h-4" /> Mentors
              </button>
              <button
                onClick={() => { onSelectView('resources'); setMobileMenuOpen(false); }}
                className={`p-2.5 rounded-xl flex items-center gap-2 ${currentView === 'resources' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}
              >
                <BookOpen className="w-4 h-4" /> Learning Hub
              </button>
            </div>

            <button
              onClick={() => { onSelectView('ai_advisor'); setMobileMenuOpen(false); }}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Career & CV Builder
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
