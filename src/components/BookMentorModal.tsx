import React, { useState } from 'react';
import { Mentor, User } from '../types';
import { X, Calendar, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BookMentorModalProps {
  mentor: Mentor;
  currentUser: User;
  onClose: () => void;
  onConfirmBooking: (mentorId: string, slot: string) => void;
}

export const BookMentorModal: React.FC<BookMentorModalProps> = ({
  mentor,
  currentUser,
  onClose,
  onConfirmBooking
}) => {
  const [selectedSlot, setSelectedSlot] = useState(mentor.availableSlots[0] || 'Mon 17:00');
  const [topic, setTopic] = useState('Career advice on tech learnerships & software engineering portfolio');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onConfirmBooking(mentor.id, selectedSlot);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">Book 1-on-1 Mentorship</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Mentorship Session Confirmed!</h3>
            <p className="text-xs text-slate-600">
              Your session with <strong className="text-slate-900">{mentor.name}</strong> for <strong className="text-emerald-700">{selectedSlot}</strong> has been booked. A calendar invite & Zoom link has been sent.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <img src={mentor.avatar} alt={mentor.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">{mentor.name}</h4>
                <p className="text-[11px] text-slate-500">{mentor.title} at {mentor.company}</p>
                <span className="text-[10px] font-black text-emerald-600">{mentor.feeZar}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Available Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {mentor.availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                      selectedSlot === slot
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Session Goal / Discussion Topics</label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Booking</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
