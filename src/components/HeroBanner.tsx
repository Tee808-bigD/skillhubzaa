import React from 'react';
import { GraduationCap, Briefcase, ShoppingBag, Sparkles, Award, ArrowRight, CheckCircle2, BookOpen, Globe } from 'lucide-react';
import { MainView } from '../types';

interface HeroBannerProps {
  onSelectView: (view: MainView) => void;
  onOpenAiAdvisor: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectView, onOpenAiAdvisor }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl mb-8">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Top Flag / Global Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Global Youth Skills, SETA Learnerships & Knowledge Sharing Platform</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
          Share Your Skills & Knowledge, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Offer Services & Learn Worldwide</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6 max-w-2xl">
          Connect with creators around the world. Share learning resources, tutorials, and tools; apply for funded SETA learnerships; monetize your services on the global freelance marketplace; and build a professional CV with AI.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => onSelectView('resources')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Community Learning Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onSelectView('courses')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-105"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Explore Courses</span>
          </button>

          <button
            onClick={() => onSelectView('learnerships')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all hover:scale-105"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>SETA Learnerships</span>
          </button>

          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>AI Career Advisor</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">12,400+</div>
              <div className="text-slate-400 text-[11px]">Youth Trained</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">R3.2M+</div>
              <div className="text-slate-400 text-[11px]">Stipends Paid</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">98 SETAs</div>
              <div className="text-slate-400 text-[11px]">Partner Bootcamps</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm">450+</div>
              <div className="text-slate-400 text-[11px]">Verified Gigs</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
