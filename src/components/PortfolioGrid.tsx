import React, { useState } from 'react';
import { ExternalLink, Eye, Play, X, Layers, Sparkles } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioGridProps {
  items: PortfolioItem[];
  availableSkills?: string[];
  isOwnProfile?: boolean;
  onAddItem?: () => void;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  items,
  availableSkills = [],
  isOwnProfile,
  onAddItem
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  // Extract all unique skills across all portfolio items combined with profile skills
  const allSkills = ['All', ...Array.from(new Set([
    ...availableSkills,
    ...items.flatMap(item => item.skills || [])
  ])).filter(Boolean)];

  const filteredItems = selectedSkill === 'All'
    ? items
    : items.filter(item => item.skills && item.skills.includes(selectedSkill));

  return (
    <div className="space-y-5">
      {/* Skill Filters Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Skills:
          </span>
          {allSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedSkill === skill
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {isOwnProfile && onAddItem && (
          <button
            onClick={onAddItem}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>+ Add Work</span>
          </button>
        )}
      </div>

      {/* Portfolio Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Video Play Badge */}
                {item.mediaType === 'video' && (
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
                    <Play className="w-3 h-3 fill-white" /> Video Demo
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="px-4 py-2 bg-white/95 text-slate-900 rounded-xl font-extrabold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    View Case Study
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                  {item.client && (
                    <p className="text-[11px] text-slate-500 font-medium mb-2">
                      Client: <span className="text-slate-700 font-semibold">{item.client}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {item.skills.slice(0, 3).map(sk => (
                    <span
                      key={sk}
                      className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      {sk}
                    </span>
                  ))}
                  {item.skills.length > 3 && (
                    <span className="text-[10px] font-bold text-slate-400 self-center">
                      +{item.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <p className="text-xs text-slate-600 font-semibold">
            No portfolio projects found for "{selectedSkill}".
          </p>
          <button
            onClick={() => setSelectedSkill('All')}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Clear filter and view all projects
          </button>
        </div>
      )}

      {/* Lightbox / Case Study Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeModalItem.title}
                </h3>
                {activeModalItem.client && (
                  <p className="text-xs text-slate-500">
                    Client: <span className="text-slate-700 font-semibold">{activeModalItem.client}</span> · {activeModalItem.createdAt}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Media Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
                {activeModalItem.mediaType === 'video' ? (
                  <video
                    src={activeModalItem.mediaUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[360px] object-contain"
                  />
                ) : (
                  <img
                    src={activeModalItem.mediaUrl}
                    alt={activeModalItem.title}
                    className="w-full max-h-[360px] object-cover"
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Project Overview & Scope
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {activeModalItem.description}
                </p>
              </div>

              {/* Skills Used */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Technologies & Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalItem.skills.map(s => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Link or Action */}
              {activeModalItem.liveUrl && (
                <div className="pt-2">
                  <a
                    href={activeModalItem.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <span>View Live Deliverable</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
