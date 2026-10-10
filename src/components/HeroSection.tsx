import React, { useState } from 'react';
import { User } from '../types';
import { 
  Globe2, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Briefcase, 
  Sparkles, 
  MessageSquare, 
  Eye, 
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  X,
  Lock
} from 'lucide-react';

interface HeroSectionProps {
  currentUser?: User | null;
  isAuthenticated: boolean;
  onHirePro: () => void;
  onJoinAsPro: () => void;
  onCompleteProfile?: () => void;
  onUpdateAvailability?: () => void;
  onSearch?: (query: string, location: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentUser,
  isAuthenticated,
  onHirePro,
  onJoinAsPro,
  onCompleteProfile,
  onUpdateAvailability,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('Anywhere');
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery, searchLocation);
    } else {
      onHirePro();
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Background Media with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
            alt="Global professionals collaborating in modern office"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-75 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-indigo-950/70" />
          <div className="absolute inset-0 bg-radial-at-t from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          
          {/* Top pill badges with Escrow Tooltip/Modal Link */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Global Marketplace · 50+ Countries</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[11px] font-medium backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Escrow Protected</span>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setIsEscrowModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer transition-colors"
                title="Learn how milestone escrow guarantees safe payments"
              >
                How escrow works?
              </button>
            </div>
          </div>

          {/* Dynamic State Branch */}
          {!isAuthenticated ? (
            /* ================= LOGGED OUT STATE ================= */
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  Find Trusted Professionals{' '}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                    Globally.
                  </span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
                  Connect with top-rated experts or showcase your skills to the world. Secure escrow milestones, verified credentials, and instant borderless collaboration.
                </p>
              </div>

              {/* Global Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="w-full bg-slate-950/85 backdrop-blur-md border border-slate-700/90 hover:border-emerald-500/50 rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for skills, services, or professionals..."
                    className="bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium w-full focus:outline-none"
                  />
                </div>

                <div className="h-6 w-px bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl w-full sm:w-auto shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="Anywhere" className="bg-slate-900 text-white">Anywhere</option>
                    <option value="Remote" className="bg-slate-900 text-white">Remote</option>
                    <option value="North America" className="bg-slate-900 text-white">North America</option>
                    <option value="Europe" className="bg-slate-900 text-white">Europe</option>
                    <option value="Asia-Pacific" className="bg-slate-900 text-white">Asia-Pacific</option>
                    <option value="United Kingdom" className="bg-slate-900 text-white">United Kingdom</option>
                    <option value="Africa" className="bg-slate-900 text-white">Africa</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </form>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onHirePro}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Hire a Pro</span>
                </button>

                <button
                  type="button"
                  onClick={onJoinAsPro}
                  className="px-6 py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-sm"
                >
                  <span>Join as a Professional</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>

              {/* Micro Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800/80 max-w-lg">
                <div>
                  <div className="text-lg font-black text-white">15,000+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Verified Pros</div>
                </div>
                <div>
                  <div className="text-lg font-black text-white">4.9 / 5.0</div>
                  <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Client Rating
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Payment Protection</div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= LOGGED IN STATE ================= */
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Welcome back,{' '}
                    <span className="text-emerald-400">{currentUser?.name || currentUser?.handle || 'Professional'}</span>
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
                    <span>Your global profile is live and searchable in 50+ countries.</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Available for Hire
                    </span>
                  </p>
                </div>

                {currentUser?.avatar && (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0 shadow-lg hidden sm:block"
                  />
                )}
              </div>

              {/* Global Search Bar (Also handy for logged in pros) */}
              <form
                onSubmit={handleSearchSubmit}
                className="w-full bg-slate-950/85 backdrop-blur-md border border-slate-700/90 hover:border-emerald-500/50 rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 px-3 py-2 w-full flex-1">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for skills, services, or professionals..."
                    className="bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium w-full focus:outline-none"
                  />
                </div>

                <div className="h-6 w-px bg-slate-800 hidden sm:block" />

                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl w-full sm:w-auto shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="Anywhere" className="bg-slate-900 text-white">Anywhere</option>
                    <option value="Remote" className="bg-slate-900 text-white">Remote</option>
                    <option value="North America" className="bg-slate-900 text-white">North America</option>
                    <option value="Europe" className="bg-slate-900 text-white">Europe</option>
                    <option value="Asia-Pacific" className="bg-slate-900 text-white">Asia-Pacific</option>
                    <option value="United Kingdom" className="bg-slate-900 text-white">United Kingdom</option>
                    <option value="Africa" className="bg-slate-900 text-white">Africa</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search</span>
                </button>
              </form>

              {/* Activity Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-base font-black text-white">3</div>
                    <div className="text-[10px] text-slate-400 font-medium">Unread Messages</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-base font-black text-white">42</div>
                    <div className="text-[10px] text-slate-400 font-medium">Profile Views This Week</div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-base font-black text-white">98%</div>
                    <div className="text-[10px] text-slate-400 font-medium">Job Success Score</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {onCompleteProfile && (
                  <button
                    type="button"
                    onClick={onCompleteProfile}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Complete Your Profile</span>
                  </button>
                )}

                {onUpdateAvailability && (
                  <button
                    type="button"
                    onClick={onUpdateAvailability}
                    className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Update Availability</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onHirePro}
                  className="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border border-indigo-500/40 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Post Service Request</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Escrow Educational Modal ("How Escrow Works") */}
      {isEscrowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">How Milestone Escrow Works</h3>
                  <p className="text-xs text-slate-400">100% financial protection for clients and freelancers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEscrowModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white">Client Funds Escrow</h4>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Step 1
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    Before work commences, the client deposits project milestone funds into secure, neutral escrow. The freelancer is immediately notified that payment is locked and guaranteed.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-black text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white">Freelancer Does the Work</h4>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      Step 2
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    The verified professional works with total peace of mind, collaborating with the client, sharing milestones, and submitting deliverables safely.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-white">Client Approves & Funds Are Released</h4>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Step 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    The client reviews deliverables. Once satisfied, the client approves the milestone and funds are immediately released to the professional. Zero chargeback risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Zero platform dispute fees</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEscrowModalOpen(false)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md cursor-pointer hover:scale-105"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
