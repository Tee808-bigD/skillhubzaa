import React, { useState } from 'react';
import { YouthService, User, SouthAfricanProvince } from '../types';
import { X, Plus, Sparkles, DollarSign, MapPin, CheckCircle2 } from 'lucide-react';

interface CreateServiceModalProps {
  currentUser: User;
  onClose: () => void;
  onCreateService: (newService: YouthService) => void;
}

export const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  currentUser,
  onClose,
  onCreateService
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<YouthService['category']>('web_dev');
  const [priceZar, setPriceZar] = useState<number>(500);
  const [priceUnit, setPriceUnit] = useState<'project' | 'hour' | 'day'>('project');
  const [deliveryTime, setDeliveryTime] = useState('2 - 3 Days');
  const [location, setLocation] = useState(currentUser.location);
  const [province, setProvince] = useState<SouthAfricanProvince>(currentUser.province);
  const [phone, setPhone] = useState(currentUser.phone || '+27 72 345 6789');
  const [description, setDescription] = useState('');
  const [deliverablesText, setDeliverablesText] = useState('Fast delivery, 100% satisfaction guarantee, Quality work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const deliverables = deliverablesText.split(',').map(d => d.trim()).filter(Boolean);

    const newService: YouthService = {
      id: `serv_${Date.now()}`,
      title,
      providerId: currentUser.id,
      providerName: currentUser.name,
      providerAvatar: currentUser.avatar,
      providerLocation: location,
      providerProvince: province,
      category,
      priceZar: Number(priceZar),
      priceUnit,
      deliveryTime,
      rating: 5.0,
      reviewsCount: 1,
      description,
      deliverables,
      phone,
      tags: [category.replace('_', ' '), province, 'Youth Freelance'],
      verifiedYouth: true
    };

    onCreateService(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">List Your Freelance Skill or Service</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Service Title / Heading</label>
            <input
              type="text"
              required
              placeholder="e.g. Website & E-Commerce Store Design for SA Startups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="web_dev">Web & Software Development</option>
                <option value="graphic_design">Graphic Design & Branding</option>
                <option value="solar_repair">Solar Installation & Electrical</option>
                <option value="tutoring">High School / Matric Tutoring</option>
                <option value="phone_repair">Phone & Electronics Repair</option>
                <option value="catering">Catering & Event Services</option>
                <option value="photography">Photography & Media</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Price (ZAR Rands)</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={priceZar}
                  onChange={(e) => setPriceZar(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="w-28">
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Pricing Rate</label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="project">Per Project</option>
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Town / Metro Area</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Service Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe what you offer, your background, and why SA clients should hire you..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1">Key Deliverables (comma separated)</label>
            <input
              type="text"
              placeholder="Mobile responsive site, WhatsApp integration, Free 1-month support"
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
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
              <Plus className="w-4 h-4" />
              <span>Publish Service Listing</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
