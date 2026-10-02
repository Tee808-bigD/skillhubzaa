import React, { useState } from 'react';
import { login } from '../api/auth';
import { UserSummary } from '../api/types';
import { Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Key } from 'lucide-react';

interface LoginProps {
  onSuccess: (user?: UserSummary) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onCancel, isModal = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await login(username, password);
      onSuccess(data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail 
        || err.response?.data?.non_field_errors?.[0]
        || 'Invalid credentials. Please verify your username and password, or test with the demo account.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  const content = (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 mx-auto shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          Sign In to <span className="text-emerald-400">SkillHub</span> <span className="text-amber-400">ZA</span>
        </h2>
        <p className="text-xs text-slate-400">
          Authenticate with Django REST Framework SimpleJWT
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Username / Handle
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. thando_dev"
              className="w-full bg-slate-950 text-white text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 text-white text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Authenticating with JWT...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Sign In & Obtain JWT Token</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Quick Demo Credentials */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
          Quick-Fill Test Accounts:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('thando_dev', 'SkillHubZA2026!')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs"
          >
            <span className="font-bold text-emerald-400 block truncate">@thando_dev</span>
            <span className="text-[10px] text-slate-400 block">Full-Stack Creator</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('lerato_solar', 'SkillHubZA2026!')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs"
          >
            <span className="font-bold text-teal-400 block truncate">@lerato_solar</span>
            <span className="text-[10px] text-slate-400 block">Solar PV Artisan</span>
          </button>
        </div>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
        >
          Continue as Guest
        </button>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {content}
    </div>
  );
};
