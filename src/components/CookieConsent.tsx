import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  // Granular preference state
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        // Show banner after brief delay
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const saveConsent = (choice: 'all' | 'essential' | 'custom') => {
    const preferences = {
      essential: true, // Always required for JWT HttpOnly & CSRF cookies
      analytics: choice === 'all' ? true : choice === 'essential' ? false : analyticsConsent,
      marketing: choice === 'all' ? true : choice === 'essential' ? false : marketingConsent,
      timestamp: new Date().toISOString(),
      choice,
    };

    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    // Also set lightweight cookie so backend or proxies can read it
    document.cookie = `cookie_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-slideUp">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 text-white">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight">POPIA & Cookie Privacy Notice</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              SkillHub ZA uses essential security cookies (JWT authentication & CSRF protection) and optional analytics to provide an accredited artisan experience in South Africa.
            </p>
          </div>
        </div>

        {showCustomize && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Essential Security Cookies</span>
                <p className="text-[11px] text-slate-400">Required for HttpOnly login sessions and CSRF tokens.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <div>
                <span className="font-semibold text-white">Platform Analytics</span>
                <p className="text-[11px] text-slate-400">Helps us improve learnership recommendations.</p>
              </div>
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <div>
                <span className="font-semibold text-white">Partner & Artisan Marketing</span>
                <p className="text-[11px] text-slate-400">Updates regarding youth apprentice grants and tools.</p>
              </div>
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => saveConsent('all')}
            className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={() => saveConsent('essential')}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={() => {
              if (showCustomize) {
                saveConsent('custom');
              } else {
                setShowCustomize(true);
              }
            }}
            className="py-2 px-3 bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>{showCustomize ? 'Save Custom' : 'Customize'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
