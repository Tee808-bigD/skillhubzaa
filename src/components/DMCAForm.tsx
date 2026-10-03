import React, { useState } from 'react';
import { ShieldCheck, Scale, AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import apiClient from '../api/client';

interface DMCAFormProps {
  onBack?: () => void;
}

export const DMCAForm: React.FC<DMCAFormProps> = ({ onBack }) => {
  const [complainantName, setComplainantName] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [copyrightedWork, setCopyrightedWork] = useState('');
  const [infringingUrl, setInfringingUrl] = useState('');
  const [goodFaith, setGoodFaith] = useState(false);
  const [accuracy, setAccuracy] = useState(false);
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goodFaith || !accuracy) {
      setErrorMessage('You must confirm both statutory legal statements before submitting a takedown notice.');
      return;
    }

    if (!signature.trim()) {
      setErrorMessage('Please type your legal electronic signature.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await apiClient.post('dmca/', {
        complainant_name: complainantName.trim(),
        complainant_email: complainantEmail.trim(),
        copyrighted_work: copyrightedWork.trim(),
        infringing_url: infringingUrl.trim(),
        good_faith_statement: goodFaith,
        accuracy_statement: accuracy,
        electronic_signature: signature.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('DMCA submission error:', err);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to submit takedown notice. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Top Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Platform
        </button>
      )}

      {/* Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              ECTA Chapter XI & DMCA Safe Harbor
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Copyright Notice & Takedown Request
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          SkillHub ZA complies with the Electronic Communications and Transactions Act No. 25 of 2002 (ECTA) and the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted artisanal media, photography, course material, or code is being infringed upon, please complete this formal notice.
        </p>
      </div>

      {submitted ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Notice Dispatched to Designated Agent</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Your takedown notice has been logged under reference #{Date.now().toString().slice(-6)}. Our Designated Copyright Agent and moderation counsel will review the claim and take expeditious action under ECTA Chapter XI Safe Harbor guidelines.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Return to Feed
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Claimant Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              1. Claimant Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Full Legal Name of Copyright Owner or Authorized Agent *
                </label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder="e.g. Sipho Ndlovu or Ndlovu Media (Pty) Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Contact Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={complainantEmail}
                  onChange={(e) => setComplainantEmail(e.target.value)}
                  placeholder="legal@company.co.za"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Infringement Specifics */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              2. Alleged Infringement Specifics
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Identification and Description of Copyrighted Work *
              </label>
              <textarea
                rows={3}
                required
                value={copyrightedWork}
                onChange={(e) => setCopyrightedWork(e.target.value)}
                placeholder="Describe the original photograph, tutorial video, architectural blueprint, or software code you own..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Exact URL or In-App Location of Infringing Content *
              </label>
              <input
                type="url"
                required
                value={infringingUrl}
                onChange={(e) => setInfringingUrl(e.target.value)}
                placeholder="https://skillhub.co.za/posts/142 or post ID"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Statutory Statements & Signature */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              3. Legal Attestations & Electronic Signature
            </h3>

            <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={goodFaith}
                  onChange={(e) => setGoodFaith(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="leading-relaxed">
                  <strong>Good Faith Belief:</strong> I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={accuracy}
                  onChange={(e) => setAccuracy(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="leading-relaxed">
                  <strong>Statement Under Penalty of Perjury:</strong> The information in this notification is accurate, and I declare under penalty of perjury that I am the owner, or authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.
                </span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Electronic Signature (Type your full legal name) *
              </label>
              <input
                type="text"
                required
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="/s/ John Doe"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Submitting Notice...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit DMCA / ECTA Takedown Notice</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default DMCAForm;
