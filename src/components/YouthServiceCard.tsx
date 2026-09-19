import React from 'react';
import { YouthService } from '../types';
import { Star, MapPin, Check, Phone, MessageSquare, ShieldCheck, Tag, Lock } from 'lucide-react';

interface YouthServiceCardProps {
  service: YouthService;
  onContact: (service: YouthService) => void;
  onEscrowPay?: (service: YouthService) => void;
}

export const YouthServiceCard: React.FC<YouthServiceCardProps> = ({ service, onContact, onEscrowPay }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      
      {/* Provider Info & Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={service.providerAvatar}
              alt={service.providerName}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-xs text-slate-900">{service.providerName}</h4>
                {service.verifiedYouth && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{service.providerLocation}, {service.providerProvince}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-black shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{service.rating} ({service.reviewsCount})</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-extrabold text-sm text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => onContact(service)}>
            {service.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2 font-medium">
            {service.description}
          </p>
        </div>

        {/* Deliverables List */}
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Includes</span>
          <div className="space-y-1">
            {service.deliverables.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {service.tags.map(t => (
            <span key={t} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Price & WhatsApp / Escrow Contact */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Rate</span>
          <div className="font-black text-emerald-600 text-sm">
            R{service.priceZar} <span className="text-xs text-slate-400 font-semibold">/ {service.priceUnit}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onEscrowPay && (
            <button
              onClick={() => onEscrowPay(service)}
              className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold text-xs rounded-xl shadow-2xs transition"
              title="Pay safely via Escrow deposit"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Escrow</span>
            </button>
          )}

          <button
            onClick={() => onContact(service)}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition hover:scale-105"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>

    </div>
  );
};
