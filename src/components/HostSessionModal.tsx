import React, { useState } from 'react';
import { User, LiveSession } from '../types';
import { X, Calendar, DollarSign, Clock, Users, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface HostSessionModalProps {
  currentUser: User;
  initialType?: 'free' | 'paid';
  onClose: () => void;
  onSubmit: (sessionData: Partial<LiveSession>) => void;
}

export const HostSessionModal: React.FC<HostSessionModalProps> = ({
  currentUser,
  initialType = 'free',
  onClose,
  onSubmit
}) => {
  const [isPaid, setIsPaid] = useState<boolean>(initialType === 'paid');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Tech' | 'Design' | 'Trades' | 'Business' | 'Career'>('Tech');
  const [priceAmount, setPriceAmount] = useState<number>(25);
  const [duration, setDuration] = useState('60 mins');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [isLiveNow, setIsLiveNow] = useState(true);
  const [agendaInput, setAgendaInput] = useState('');
  const [agendas, setAgendas] = useState<string[]>([
    'Core framework & foundational breakdown',
    'Real-world case study & hands-on walkthrough',
    'Live Q&A, feedback, and networking'
  ]);

  const handleAddAgenda = () => {
    if (agendaInput.trim()) {
      setAgendas(prev => [...prev, agendaInput.trim()]);
      setAgendaInput('');
    }
  };

  const handleRemoveAgenda = (idx: number) => {
    setAgendas(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a session title.');
      return;
    }

    const scheduledDateFormatted = scheduledDate
      ? `${scheduledDate} • ${scheduledTime} SAST`
      : 'Starting soon';

    const newSessionData: Partial<LiveSession> = {
      title,
      subtitle: subtitle || description.slice(0, 100),
      description: description || title,
      category,
      agenda: agendas.length > 0 ? agendas : [title],
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostUsername: currentUser.handle?.replace('@', '') || currentUser.name.toLowerCase().replace(/\s+/g, '_'),
      hostAvatar: currentUser.avatar,
      hostRole: currentUser.title || currentUser.bio || 'Verified Host',
      hostRating: currentUser.rating || 5.0,
      hostVerified: true,
      isTopRated: true,
      status: isLiveNow ? 'live' : 'upcoming',
      speakersCount: 1,
      listenersCount: isLiveNow ? 1 : 0,
      duration,
      scheduledFor: scheduledDate ? `${scheduledDate}T${scheduledTime}:00Z` : undefined,
      scheduledDateFormatted: isLiveNow ? 'Live Right Now' : scheduledDateFormatted,
      startsInText: isLiveNow ? 'Live Now' : 'Scheduled Soon',
      isPaid,
      priceAmount: isPaid ? priceAmount : 0,
      priceCurrency: '$',
      speakers: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'Host',
          isSpeaking: true
        }
      ],
      listeners: []
    };

    onSubmit(newSessionData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181b] border border-neutral-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#141414] px-6 py-4 border-b border-neutral-800 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-800 text-neutral-300'
              }`}>
                {isPaid ? 'Paid Masterclass' : 'Free Community Space'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {isPaid ? 'Host a Paid Masterclass' : 'Start a Free Audio Space'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Format Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-900 rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setIsPaid(false)}
              className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                !isPaid
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Free Community Space</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPaid(true)}
              className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                isPaid
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Paid Masterclass</span>
            </button>
          </div>

          {/* Pricing settings if Paid */}
          {isPaid && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Set Ticket Price</h4>
                  <p className="text-[11px] text-neutral-400">Attendees pay through SkillHub Escrow before entering stage.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-700">
                  <span className="text-emerald-400 font-bold">$</span>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    className="w-16 bg-transparent text-white font-black text-sm text-right focus:outline-none"
                  />
                  <span className="text-neutral-400 font-semibold text-[10px]">USD</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                ✨ SkillHub creator earnings are disbursed to your verified bank or crypto wallet with 0% platform fee during early access.
              </div>
            </div>
          )}

          {/* Session Title */}
          <div>
            <label className="block font-bold text-neutral-300 mb-1.5">Session Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., PV Inverter Sizing & Load-Shedding Backup Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Subtitle / Hook */}
          <div>
            <label className="block font-bold text-neutral-300 mb-1.5">Subtitle / Value Proposition</label>
            <input
              type="text"
              placeholder="e.g., How to calculate peak load, battery sizing, and SANS wiring compliance."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
                <option value="Trades">Trades</option>
                <option value="Business">Business</option>
                <option value="Career">Career</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-300 mb-1.5">Expected Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="45 mins">45 minutes</option>
                <option value="60 mins">60 minutes</option>
                <option value="75 mins">75 minutes</option>
                <option value="90 mins">90 minutes</option>
                <option value="2 hours">2 hours</option>
              </select>
            </div>
          </div>

          {/* When to start: Live Now vs Upcoming */}
          <div>
            <label className="block font-bold text-neutral-300 mb-1.5">Timing</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsLiveNow(true)}
                className={`py-2.5 rounded-xl font-bold border transition text-center ${
                  isLiveNow
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                🔴 Go Live Immediately
              </button>
              <button
                type="button"
                onClick={() => setIsLiveNow(false)}
                className={`py-2.5 rounded-xl font-bold border transition text-center ${
                  !isLiveNow
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                📅 Schedule for Later
              </button>
            </div>
          </div>

          {/* Schedule Date & Time picker if upcoming */}
          {!isLiveNow && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
              <div>
                <label className="block font-semibold text-neutral-400 mb-1">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-400 mb-1">Time (SAST)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-neutral-300 mb-1.5">Overview & Description</label>
            <textarea
              rows={3}
              placeholder="What will be discussed? Who is this session best suited for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Agenda / What You'll Learn (Bulleted List) */}
          <div>
            <label className="block font-bold text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>Agenda / Key Takeaways ({agendas.length})</span>
              <span className="text-[10px] text-neutral-500 font-normal">Add bullets for session preview</span>
            </label>

            <div className="space-y-2 mb-2">
              {agendas.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-800">
                  <span className="text-neutral-300 text-xs truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(idx)}
                    className="text-neutral-500 hover:text-rose-400 text-xs shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Sizing formulas for hybrid inverters"
                value={agendaInput}
                onChange={(e) => setAgendaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgenda();
                  }
                }}
                className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAgenda}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs"
              >
                Add Bullet
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              {isLiveNow ? 'Launch Session Now' : 'Publish & Open Registration'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
