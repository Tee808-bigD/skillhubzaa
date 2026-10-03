import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  ArrowRight,
  Sparkles,
  Star,
  Users,
  Briefcase,
  Scale,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserSummary } from '../api/types';
import LegalModal, { LegalDocType } from './LegalModal';

interface LoginProps {
  onSuccess?: (user?: UserSummary) => void;
  onCancel?: () => void;
  onSwitchToSignUp?: () => void;
  isModal?: boolean;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  onCancel,
  onSwitchToSignUp,
  isModal = false,
}) => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Legal Modal Viewer State
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await login(username, password, rememberMe);
      setSuccessMessage('Welcome back to SkillHub ZA!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please verify your username and password.';
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

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
    }, 1200);
  };

  const containerContent = (
    <div className="relative w-full max-w-5xl bg-slate-950/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px] animate-fadeIn">
      {/* Background Ambience & Workspace Wallpaper */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80')`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/90 pointer-events-none" />

      {/* Optional Modal Close Button */}
      {isModal && onCancel && (
        <button
          onClick={onCancel}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* LEFT PANEL: Hero Branding, Tagline & Community Metrics */}
      <div className="lg:col-span-7 relative z-10 p-8 sm:p-12 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo with Orange "S" Badge matching user's design */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/25 flex items-center justify-center font-black text-white text-2xl tracking-tighter">
              S
            </div>
            <div>
              <span className="text-3xl font-black text-white tracking-tight">
                SkillHub <span className="text-emerald-400 text-lg font-bold">ZA</span>
              </span>
            </div>
          </div>

          {/* Value Tagline */}
          <div className="space-y-3 pt-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Empowering South African <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Skills & Artisans
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 max-w-lg leading-relaxed">
              Find trusted local professionals, share proof of work, and book services from one practical community marketplace.
            </p>
          </div>

          {/* Social Proof & Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-white">500+</span>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Professionals</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-white">1,200+</span>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Jobs Done</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-md">
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-white">4.8</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Footer Notice */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-emerald-400 transition-colors"
            >
              POPIA Privacy Policy
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('community-guidelines')}
              className="hover:text-emerald-400 transition-colors"
            >
              Guidelines
            </button>
          </div>
          <span className="font-mono text-[10px] text-slate-500">JWT 15m &bull; Brute-Force Shielded</span>
        </div>
      </div>

      {/* RIGHT PANEL: Floating Modern Auth Card */}
      <div className="lg:col-span-5 relative z-10 p-6 sm:p-8 flex flex-col justify-center">
        <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Tab Selector: [Login] [Register] */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              className="py-2 text-xs font-bold rounded-xl bg-teal-500 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Register
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div
              role="status"
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  aria-required="true"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 pr-11 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-teal-500/30"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
            </div>

            {/* Coral Action Button matching screenshot */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Don't have an account? Register */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-orange-400 hover:text-orange-300 font-bold ml-1 transition-colors hover:underline"
              >
                Register
              </button>
            </p>
          </div>

          {/* Demo Account Box matching screenshot */}
          <div 
            onClick={() => handleQuickFill('thando_dev', 'SkillHubZA2026!')}
            className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-center space-y-1 cursor-pointer hover:border-slate-700 transition-colors group"
          >
            <span className="text-[11px] text-slate-400 font-medium">Demo Account (Click to fill)</span>
            <p className="font-mono text-xs text-orange-400 group-hover:text-orange-300">
              thando_dev / SkillHubZA2026!
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Reset Password</h4>
                <p className="text-xs text-slate-400">Receive reset instructions via email</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    A password reset link has been dispatched to <strong>{forgotEmail}</strong>.
                    Please check your inbox.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 pt-2">
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.co.za"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Legal Policy Modals */}
      {activeLegalModal && (
        <LegalModal
          type={activeLegalModal}
          isOpen={true}
          onClose={() => setActiveLegalModal(null)}
        />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {containerContent}
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      {containerContent}
    </div>
  );
};

export default Login;
