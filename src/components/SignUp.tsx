import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Briefcase,
  Check,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserSummary } from '../api/types';
import LegalModal, { LegalDocType } from './LegalModal';

interface SignUpProps {
  onSuccess?: (user?: UserSummary) => void;
  onCancel?: () => void;
  onSwitchToLogin?: () => void;
  isModal?: boolean;
}

export const SignUp: React.FC<SignUpProps> = ({
  onSuccess,
  onCancel,
  onSwitchToLogin,
  isModal = false,
}) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'youth' | 'mentor' | 'employer' | 'trainer'>('youth');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Legal Modal Viewer State
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType | null>(null);

  // Age Gate Calculation
  const ageInfo = useMemo(() => {
    if (!dateOfBirth) return { age: null, isUnder13: false, isMinor: false };
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return {
      age,
      isUnder13: age < 13,
      isMinor: age >= 13 && age < 18,
    };
  }, [dateOfBirth]);

  // Real-time password criteria validation
  const passwordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+=\-{}[\]:;"'<>,.?/\\|`~]/.test(password),
    };
  }, [password]);

  // Overall password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { label: 'Empty', score: 0, color: 'bg-slate-700' };
    const passed = Object.values(passwordCriteria).filter(Boolean).length;
    if (passed <= 2) return { label: 'Weak', score: 1, color: 'bg-rose-500' };
    if (passed === 3) return { label: 'Medium', score: 2, color: 'bg-amber-500' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500' };
  }, [password, passwordCriteria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    if (ageInfo.isUnder13) {
      setErrorMessage('You must be at least 13 years old to register under South African child online safety guidelines.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    if (passwordStrength.score < 3) {
      setErrorMessage('Password must contain at least 8 characters, an uppercase letter, a number, and a special character.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service, Privacy Policy, and Community Guidelines.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        full_name: fullName.trim(),
        role,
      });

      setSuccessMessage('Account created successfully! Welcome to SkillHub ZA.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Registration error:', err);
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your information and try again.';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.username) msg = `Username: ${data.username[0] || data.username}`;
        else if (data.email) msg = `Email: ${data.email[0] || data.email}`;
        else if (data.password) msg = `Password: ${data.password[0] || data.password}`;
        else if (data.date_of_birth) msg = `Date of Birth: ${data.date_of_birth[0] || data.date_of_birth}`;
        else if (data.detail) msg = data.detail;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerContent = (
    <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[660px] animate-fadeIn">
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

      {/* LEFT PANEL: Branding & Community Promise */}
      <div className="lg:col-span-5 relative bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/60">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">
                SkillHub <span className="text-emerald-400">ZA</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80">
                Join the Movement
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              Unlock Your <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Artisan Future
              </span>
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">
              Create your verified profile today. Connect with clients across all 9 provinces, participate in learnerships, and build your digital portfolio under POPIA privacy standards.
            </p>
          </div>

          {/* Verification Badges */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>SETA / TVET Verified Badges</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>POPIA Data Protection by Design</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </div>
              <span>ECTA Chapter XI Safe Harbor Moderation</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>South Africa Youth Empowerment</span>
          <span className="font-mono text-[10px] text-slate-500">POPIA Compliant</span>
        </div>
      </div>

      {/* RIGHT PANEL: Sign Up Form */}
      <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center overflow-y-auto max-h-[85vh]">
        <div className="max-w-md w-full mx-auto space-y-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Create Account</h3>
            <p className="text-xs text-slate-400 mt-1">
              Join thousands of South African youths and certified artisans.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              role="status"
              className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Full Name & Username in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Thando Mzobe"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="thando_artisan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Email Address & Date of Birth in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="thando@skillhub.co.za"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Date of Birth * (Age Gate)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Minor or Age Notice */}
            {ageInfo.isUnder13 && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You must be at least 13 years old to join SkillHub ZA.</span>
              </div>
            )}
            {ageInfo.isMinor && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Minor Account (Age {ageInfo.age}): Parental consent will be recorded for your protection.</span>
              </div>
            )}

            {/* Role Dropdown */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                I am joining as:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="youth">Youth Artisan / Learner</option>
                  <option value="mentor">Senior Mentor / Master Craftsman</option>
                  <option value="employer">Employer / Contractor</option>
                  <option value="trainer">TVET / SETA Training Provider</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Password Strength Meter */}
            {password && (
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={`font-bold ${
                    passwordStrength.score === 3 ? 'text-emerald-400' :
                    passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                  <span className={passwordCriteria.hasLength ? 'text-emerald-400 font-semibold' : ''}>
                    &bull; 8+ Chars
                  </span>
                  <span className={passwordCriteria.hasUpper ? 'text-emerald-400 font-semibold' : ''}>
                    &bull; Uppercase (A-Z)
                  </span>
                  <span className={passwordCriteria.hasNumber ? 'text-emerald-400 font-semibold' : ''}>
                    &bull; Number (0-9)
                  </span>
                  <span className={passwordCriteria.hasSpecial ? 'text-emerald-400 font-semibold' : ''}>
                    &bull; Special (!@#$)
                  </span>
                </div>
              </div>
            )}

            {/* Terms and Privacy Checkbox with Clickable Modals */}
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                <span className="text-[11px] text-slate-300 leading-tight">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal('terms')}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Terms of Service
                  </button>
                  ,{' '}
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal('privacy')}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    POPIA Privacy Policy
                  </button>
                  , and{' '}
                  <button
                    type="button"
                    onClick={() => setActiveLegalModal('community-guidelines')}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Community Guidelines
                  </button>
                  . *
                </span>
              </label>

              {/* Optional Marketing Consent */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/30"
                />
                <span className="text-[11px] text-slate-400 leading-tight">
                  I consent to receive occasional learnership updates, trade tool grants, and promotional communications from SkillHub ZA (Optional).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || ageInfo.isUnder13}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying & Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have a SkillHub account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Legal Modal Popups */}
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

export default SignUp;
