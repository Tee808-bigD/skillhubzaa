import React, { useState } from 'react';
import { CommunityEvent, YouthService } from '../types';
import { MapPin, Navigation, Calendar, Users, Star, ArrowRight, Layers, PhoneCall, ShieldCheck } from 'lucide-react';

interface EventMapViewProps {
  events: CommunityEvent[];
  services: YouthService[];
  onSelectEvent?: (event: CommunityEvent) => void;
  onSelectService?: (service: YouthService) => void;
}

interface MapLocationPin {
  id: string;
  type: 'event' | 'service';
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  xPct: number; // percentage on custom visual map canvas
  yPct: number;
  province: string;
  rating?: number;
  data: CommunityEvent | YouthService;
}

export const EventMapView: React.FC<EventMapViewProps> = ({
  events,
  services,
  onSelectEvent,
  onSelectService
}) => {
  const [filterType, setFilterType] = useState<'all' | 'events' | 'services'>('all');
  const [selectedPin, setSelectedPin] = useState<MapLocationPin | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(25);

  // South Africa visual pins mapping onto realistic map positions
  const mapPins: MapLocationPin[] = [
    // Events
    ...events.map((e, idx) => {
      const positions = [
        { xPct: 62, yPct: 35, lat: -26.2678, lng: 27.8585 }, // Soweto / JHB
        { xPct: 22, yPct: 82, lat: -33.9249, lng: 18.4241 }, // Cape Town
        { xPct: 82, yPct: 58, lat: -29.8587, lng: 31.0218 }, // Durban KZN
        { xPct: 64, yPct: 28, lat: -25.7479, lng: 28.2293 }  // Pretoria
      ];
      const pos = positions[idx % positions.length];
      return {
        id: `map_evt_${e.id}`,
        type: 'event' as const,
        title: e.title,
        subtitle: `${e.dateBadge} • ${e.location}`,
        lat: pos.lat,
        lng: pos.lng,
        xPct: pos.xPct,
        yPct: pos.yPct,
        province: e.location,
        data: e
      };
    }),
    // Services
    ...services.map((s, idx) => {
      const positions = [
        { xPct: 58, yPct: 38, lat: -26.2041, lng: 28.0473 }, // Johannesburg CBD
        { xPct: 28, yPct: 78, lat: -33.9608, lng: 18.4721 }, // Rondebosch CT
        { xPct: 78, yPct: 62, lat: -29.8833, lng: 30.9833 }, // Umhlanga KZN
        { xPct: 68, yPct: 45, lat: -29.1183, lng: 26.2249 }  // Bloemfontein
      ];
      const pos = positions[idx % positions.length];
      return {
        id: `map_srv_${s.id}`,
        type: 'service' as const,
        title: s.title,
        subtitle: `${s.providerName} • R${s.priceZar}`,
        lat: pos.lat,
        lng: pos.lng,
        xPct: pos.xPct,
        yPct: pos.yPct,
        province: s.providerProvince,
        rating: s.rating,
        data: s
      };
    })
  ];

  const filteredPins = mapPins.filter(pin => {
    if (filterType === 'events') return pin.type === 'event';
    if (filterType === 'services') return pin.type === 'service';
    return true;
  });

  return (
    <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl text-white">
      
      {/* Map Control Header */}
      <div className="p-4 bg-[#141414] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Nearby Interactive Skill & Event Map</h2>
            <p className="text-[11px] text-neutral-400">Discover local meetups & verified trade freelancers across South Africa</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex bg-[#121212] p-1 rounded-xl border border-neutral-800 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-neutral-400 hover:text-white'}`}
            >
              All Pins ({mapPins.length})
            </button>
            <button
              onClick={() => setFilterType('events')}
              className={`px-3 py-1 rounded-lg transition-all ${filterType === 'events' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-neutral-400 hover:text-white'}`}
            >
              Events
            </button>
            <button
              onClick={() => setFilterType('services')}
              className={`px-3 py-1 rounded-lg transition-all ${filterType === 'services' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-neutral-400 hover:text-white'}`}
            >
              Services
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#121212] border border-neutral-800 rounded-xl text-xs text-neutral-300 font-bold">
            <span>Radius:</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-black focus:outline-none"
            >
              <option value={10} className="bg-[#1e1e1e]">10 km</option>
              <option value={25} className="bg-[#1e1e1e]">25 km</option>
              <option value={50} className="bg-[#1e1e1e]">50 km</option>
              <option value={100} className="bg-[#1e1e1e]">100 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Canvas View */}
      <div className="relative w-full h-[420px] bg-[#121619] overflow-hidden select-none">
        
        {/* Map Dark Styling Mesh / Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#263238_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-transparent to-cyan-950/20"></div>

        {/* SA Geographic Outline Mock SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-20 stroke-neutral-600 fill-none" strokeWidth="1">
          <path d="M 120 280 Q 200 380 420 300 Q 480 180 320 120 Q 180 140 120 280 Z" />
        </svg>

        {/* Map Pins */}
        {filteredPins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          return (
            <div
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              style={{ left: `${pin.xPct}%`, top: `${pin.yPct}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-10 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              {/* Pulse ripple */}
              <div className={`absolute -inset-2 rounded-full animate-ping opacity-30 ${pin.type === 'event' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

              {/* Pin Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-2xl font-black text-xs border backdrop-blur-md transition-all ${
                pin.type === 'event'
                  ? 'bg-rose-500/90 text-white border-rose-400'
                  : 'bg-emerald-500/90 text-slate-950 border-emerald-400'
              }`}>
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">{pin.title}</span>
              </div>
            </div>
          );
        })}

        {/* Map Compass / Controls overlay */}
        <div className="absolute top-4 right-4 bg-[#141414]/90 backdrop-blur-md border border-neutral-800 p-2 rounded-2xl flex flex-col gap-2 text-neutral-400">
          <button title="Current Location" className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition">
            <Navigation className="w-4 h-4 text-emerald-400" />
          </button>
          <button title="Toggle Layers" className="p-2 hover:text-white hover:bg-neutral-800 rounded-xl transition">
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Location Card Popover */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-[#1e1e1e]/95 backdrop-blur-md border border-neutral-700 p-4 rounded-2xl shadow-2xl text-white animate-in slide-in-from-bottom-4 duration-200 z-40">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                selectedPin.type === 'event' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedPin.type === 'event' ? 'Community Event' : 'Verified Freelancer'}
              </span>
              <button onClick={() => setSelectedPin(null)} className="text-neutral-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            <h4 className="font-extrabold text-sm text-white">{selectedPin.title}</h4>
            <p className="text-xs text-neutral-300 mt-1">{selectedPin.subtitle}</p>

            <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-400" />
                GPS: {selectedPin.lat.toFixed(2)}, {selectedPin.lng.toFixed(2)}
              </span>

              <button
                onClick={() => {
                  alert(`Getting turn-by-turn directions to ${selectedPin.title} (${selectedPin.province})`);
                }}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-md transition"
              >
                <span>Directions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
