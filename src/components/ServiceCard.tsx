import React from 'react';
import { Check, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { ProfessionalServiceItem } from '../types';

interface ServiceCardProps {
  service: ProfessionalServiceItem;
  onBookNow: (service: ProfessionalServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookNow }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header & Price */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-snug">
              {service.title}
            </h3>
            {service.category && (
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block mt-0.5">
                {service.category}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <span className="text-lg font-black text-slate-900 block leading-tight">
              {service.price}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Fixed / Escrow
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {service.description}
        </p>

        {/* Delivery Timeline */}
        {service.deliveryDays && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold pt-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery in {service.deliveryDays}</span>
          </div>
        )}

        {/* Included Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block">
              What's Included:
            </span>
            <ul className="space-y-1">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Booking Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Escrow Protected</span>
        </div>

        <button
          onClick={() => onBookNow(service)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
