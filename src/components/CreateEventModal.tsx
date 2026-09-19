import React, { useState } from 'react';
import { CommunityEvent, User } from '../types';
import { FileUploadWithScan } from './FileUploadWithScan';
import { X, Calendar, MapPin, Clock, ShieldCheck, Award, Sparkles, Check } from 'lucide-react';

interface CreateEventModalProps {
  currentUser: User;
  onClose: () => void;
  onAddEvent: (event: CommunityEvent) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  currentUser,
  onClose,
  onAddEvent
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDate, setFullDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Skill Workshop');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('17:00');
  const [rules, setRules] = useState('RSVP required, No disorderly conduct, Respect venue guidelines');
  const [sponsors, setSponsors] = useState('SETA SA, SkillHub Youth Hub');
  const [safetyGuidelines, setSafetyGuidelines] = useState('Certified first-aid station on site, 24/7 venue security team, dedicated emergency assistance booth.');
  
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullDate || !location) return;

    // Format badge from date (e.g. "2026-08-20" -> "Aug 20")
    const dateObj = new Date(fullDate);
    const dateBadge = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Upcoming';

    const newEvent: CommunityEvent = {
      id: `evt_${Date.now()}`,
      title,
      description,
      fullDate,
      dateBadge,
      location,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar,
      attendeesCount: 1,
      isAttending: true,
      category,
      openingTime,
      closingTime,
      rules: rules.split(',').map(r => r.trim()).filter(Boolean),
      sponsors: sponsors.split(',').map(s => s.trim()).filter(Boolean),
      safetyGuidelines,
      mediaType,
      mediaUrl,
      concludedDateISO: new Date(`${fullDate}T${closingTime || '23:59'}:00`).toISOString(),
      isConcluded: false
    };

    onAddEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl relative space-y-5">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base text-white">Create Community Event</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          <div>
            <label className="text-neutral-400 block mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Soweto Solar Installation Masterclass & Festival"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">Date</label>
              <input
                type="date"
                required
                value={fullDate}
                onChange={(e) => setFullDate(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Skill Workshop">Skill Workshop</option>
                <option value="Career Fair">Career Fair</option>
                <option value="Community Festival">Community Festival</option>
                <option value="Tech Hackathon">Tech Hackathon</option>
                <option value="Mentorship Meetup">Mentorship Meetup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">Opening Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Closing Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Location / Venue</label>
            <input
              type="text"
              required
              placeholder="e.g. Vilakazi Street Community Hall, Soweto"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="What can attendees expect?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Event Rules (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. RSVP required, No alcohol without ID, Clear bags only"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Official Sponsors (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. SETA SA, Vodacom Youth, Soweto Hub"
              value={sponsors}
              onChange={(e) => setSponsors(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Attendee Safety Guidelines</label>
            <input
              type="text"
              placeholder="e.g. On-site security personnel, first aid station, emergency contact booth"
              value={safetyGuidelines}
              onChange={(e) => setSafetyGuidelines(e.target.value)}
              className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Optional Event Banner / 10s Video Upload with Malware Scan */}
          <div>
            <label className="text-neutral-400 block mb-1">Optional Event Banner / 10s Video Preview</label>
            <FileUploadWithScan
              label="Upload Event Banner / Video (Auto Malware Scanned)"
              onFileSelect={(url, type) => {
                setMediaUrl(url);
                setMediaType(type);
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-lg transition-all"
          >
            Publish Event
          </button>

        </form>

      </div>
    </div>
  );
};
