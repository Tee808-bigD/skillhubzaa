import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isSimulatedPromptOpen, setIsSimulatedPromptOpen] = useState(false);

  // If running as standalone, show active app badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed App</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#1e1e1e] border border-neutral-800 p-6 text-white shadow-2xl relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-extrabold text-white mb-2">Install SkillHub on iPhone / iPad</h3>
              <p className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                1. Tap the <strong className="text-emerald-400">Share</strong> button in your Safari browser bar.<br />
                2. Scroll down and tap <strong className="text-emerald-400">Add to Home Screen</strong>.<br />
                3. Launch SkillHub instantly like a native app anytime!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback interactive prompt launcher for preview testing
  return (
    <>
      <button
        onClick={() => setIsSimulatedPromptOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {isSimulatedPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#1e1e1e] border border-neutral-800 p-6 text-white shadow-2xl relative">
            <button 
              onClick={() => setIsSimulatedPromptOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-black text-white mb-1">Install SkillHub PWA</h3>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Fast, offline-ready skill platform right on your home screen with zero app store downloads.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSimulatedPromptOpen(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('SkillHub shortcut added to home screen!');
                  setIsSimulatedPromptOpen(false);
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
