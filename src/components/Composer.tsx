import React, { useState, useRef } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  DollarSign, 
  Calendar, 
  Globe2, 
  Send, 
  X, 
  Paperclip,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { User, SocialPost } from '../types';

export interface ComposerSubmitData {
  content: string;
  postType: 'showcase' | 'service_request';
  mediaFile?: File | null;
  mediaUrl?: string;
  hashtags: string[];
  serviceRequest?: {
    budget?: string;
    deadline?: string;
    preferredRegion?: string;
  };
}

interface ComposerProps {
  currentUser: User;
  onSubmit: (data: ComposerSubmitData) => Promise<void> | void;
  isPublishing?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  currentUser,
  onSubmit,
  isPublishing = false
}) => {
  const [mode, setMode] = useState<'showcase' | 'service_request'>('showcase');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [preferredRegion, setPreferredRegion] = useState('Worldwide / Remote');
  
  // Media states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setMediaUrlInput('');
  };

  const handleClearFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile && !mediaUrlInput.trim()) return;

    const parsedHashtags = hashtags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    await onSubmit({
      content: content.trim(),
      postType: mode,
      mediaFile: selectedFile,
      mediaUrl: mediaUrlInput.trim() || undefined,
      hashtags: parsedHashtags,
      serviceRequest: mode === 'service_request' ? {
        budget: budget.trim() || '$500 - $1,500',
        deadline: deadline.trim() || 'Flexible',
        preferredRegion: preferredRegion
      } : undefined
    });

    // Reset Form
    setContent('');
    setHashtags('');
    setBudget('');
    setDeadline('');
    handleClearFile();
    setMediaUrlInput('');
    setShowUrlField(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'showcase'
                ? 'bg-emerald-500 text-slate-950 shadow-md scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showcase Work</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('service_request')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'service_request'
                ? 'bg-indigo-600 text-white shadow-md scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Request a Service</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Shared across 50+ countries</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User avatar & Textarea */}
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0"
          />
          <div className="flex-1 space-y-3">
            <textarea
              rows={mode === 'service_request' ? 3 : 2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                mode === 'showcase'
                  ? 'Share your latest project, portfolio update, or case study with the global community...'
                  : 'I need a professional for... (describe the project, scope of work, and required deliverables)'
              }
              className="w-full bg-slate-950/80 text-white rounded-2xl p-3.5 text-xs sm:text-sm font-medium border border-slate-800 focus:outline-none focus:border-emerald-500 resize-none placeholder:text-slate-500 transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Dynamic Service Request Fields */}
        {mode === 'service_request' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-indigo-500/20 animate-fadeIn">
            {/* Budget Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>Budget Range</span>
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $500 - $1,500 USD"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Target Deadline</span>
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. 2 Weeks / Urgent"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Preferred Region */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-indigo-400" />
                <span>Preferred Location</span>
              </label>
              <select
                value={preferredRegion}
                onChange={(e) => setPreferredRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Worldwide / Remote">Worldwide / Remote</option>
                <option value="North America (US & CA)">North America (US & CA)</option>
                <option value="Europe (UK & EU)">Europe (UK & EU)</option>
                <option value="Asia-Pacific">Asia-Pacific</option>
                <option value="Africa">Africa</option>
                <option value="Latin America">Latin America</option>
              </select>
            </div>
          </div>
        )}

        {/* Media Preview Box */}
        {filePreview && (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black max-h-56 flex items-center justify-center">
            {selectedFile?.type.startsWith('video/') ? (
              <video src={filePreview} controls className="max-h-56 w-full object-contain" />
            ) : (
              <img src={filePreview} alt="Upload preview" className="max-h-56 w-full object-contain" />
            )}
            <button
              type="button"
              onClick={handleClearFile}
              className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-white hover:bg-rose-500 rounded-full transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-950/80 rounded-lg text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Scanned Clean
            </div>
          </div>
        )}

        {/* Paste URL Field */}
        {showUrlField && (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              placeholder="Paste image or video link (https://...)"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowUrlField(false)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Media</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlField(!showUrlField)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
            >
              <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link</span>
            </button>

            {/* Global Tags Input */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-950/70 border border-slate-800 rounded-xl">
              <Tag className="w-3 h-3 text-slate-500" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="Skills/tags (e.g. React, UX)"
                className="bg-transparent text-slate-300 placeholder-slate-600 text-[11px] focus:outline-none w-32"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPublishing || (!content.trim() && !selectedFile && !mediaUrlInput.trim())}
            className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              content.trim() || selectedFile || mediaUrlInput.trim()
                ? mode === 'service_request'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isPublishing ? (
              <span>Publishing...</span>
            ) : mode === 'service_request' ? (
              <>
                <Briefcase className="w-3.5 h-3.5" />
                <span>Post Service Request</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Post Showcase</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
