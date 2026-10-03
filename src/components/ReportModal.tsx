import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment' | 'message' | 'user';
  contentId: string | number;
  contentPreview?: string;
  onSuccess?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentPreview,
  onSuccess,
}) => {
  const [reason, setReason] = useState('hate_speech');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await apiClient.post('reports/', {
        content_type: contentType,
        content_id: String(contentId),
        reason,
        comment: comment.trim(),
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSubmitted(false);
        setComment('');
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Report submission error:', err);
      setErrorMessage(
        err.response?.data?.detail || 'Failed to submit report. Please ensure you are logged in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Report Content</h3>
            <p className="text-xs text-slate-400">
              ECTA Chapter XI Safe Harbor Moderation Desk
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-300">
              Thank you. Our South African moderation team will review this {contentType} within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {contentPreview && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 italic line-clamp-2">
                "{contentPreview}"
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Reason Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="hate_speech">Hate Speech & Discrimination</option>
                <option value="harassment">Harassment, Bullying or Doxxing</option>
                <option value="spam">Spam, Phishing or Fraudulent Scheme</option>
                <option value="misinformation">Dangerous Misinformation</option>
                <option value="copyright">Copyright Infringement</option>
                <option value="other">Other Community Guideline Breach</option>
              </select>
            </div>

            {/* Optional Comment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why this content violates community rules..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
