import React, { useState } from 'react';
import { Learnership, User } from '../types';
import { X, CheckCircle2, FileText, Upload, Send, ShieldCheck } from 'lucide-react';

interface ApplyLearnershipModalProps {
  learnership: Learnership;
  currentUser: User;
  onClose: () => void;
  onSubmitApplication: (learnershipId: string) => void;
}

export const ApplyLearnershipModal: React.FC<ApplyLearnershipModalProps> = ({
  learnership,
  currentUser,
  onClose,
  onSubmitApplication
}) => {
  const [fullName, setFullName] = useState(currentUser.name);
  const [saIdNumber, setSaIdNumber] = useState('0204125890087');
  const [phone, setPhone] = useState(currentUser.phone || '+27 72 345 6789');
  const [province, setProvince] = useState(currentUser.province);
  const [coverNote, setCoverNote] = useState(
    `I am applying for the ${learnership.title} role. I have completed relevant skills training on SkillHub ZA and hold a ${currentUser.educationLevel}. I am eager to gain practical workplace experience in ${learnership.location}.`
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitApplication(learnership.id);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/40">
              {learnership.setaCategory}
            </span>
            <h3 className="font-extrabold text-sm text-white">{learnership.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Application Submitted Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your application has been logged for <strong className="text-slate-900">{learnership.company}</strong>. We've attached your SkillHub ZA Verified Profile and Certificate credentials.
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
              Tracking ID: #SA-LEARN-2026-{Math.floor(1000 + Math.random() * 9000)}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Funded Stipend: {learnership.stipendZar}</span>
                <span className="text-[11px] text-emerald-700">Location: {learnership.location}, {learnership.province}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Full Name (as on SA ID)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">South African ID / Passport No.</label>
                <input
                  type="text"
                  required
                  value={saIdNumber}
                  onChange={(e) => setSaIdNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Contact Mobile (WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Province Residence</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Application Motivation / Cover Note</label>
              <textarea
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Attached Credentials Badge */}
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">SkillHub Verified CV & Certificates</span>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">
                Attached
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
