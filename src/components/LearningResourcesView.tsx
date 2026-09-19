import React, { useState, useMemo } from 'react';
import { LearningResource, User } from '../types';
import { 
  BookOpen, 
  ThumbsUp, 
  Bookmark, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Video, 
  FileText, 
  Code, 
  Wrench, 
  Book, 
  Globe,
  MessageSquare
} from 'lucide-react';

interface LearningResourcesViewProps {
  resources: LearningResource[];
  currentUser: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleUpvote: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onOpenAddResource: () => void;
}

export const LearningResourcesView: React.FC<LearningResourcesViewProps> = ({
  resources,
  currentUser,
  searchQuery,
  onSearchChange,
  onToggleUpvote,
  onToggleBookmark,
  onOpenAddResource
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchSearch = !searchQuery.trim() ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        res.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || res.category === selectedCategory;
      const matchType = selectedType === 'all' || res.resourceType === selectedType;
      const matchRegion = selectedRegionFilter === 'all' || res.region.toLowerCase().includes(selectedRegionFilter.toLowerCase());

      return matchSearch && matchCategory && matchType && matchRegion;
    });
  }, [resources, searchQuery, selectedCategory, selectedType, selectedRegionFilter]);

  const getFormatIcon = (type: LearningResource['resourceType']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-rose-500" />;
      case 'guide': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'cheatsheet': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'repo': return <Code className="w-4 h-4 text-indigo-600" />;
      case 'tool': return <Wrench className="w-4 h-4 text-teal-600" />;
      case 'book': return <Book className="w-4 h-4 text-blue-600" />;
      default: return <BookOpen className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Knowledge Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Community Learning Resources & Knowledge Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Discover, share, and bookmark free developer guides, video masterclasses, open-source repositories, cheat sheets, and practical tools contributed by creators worldwide.
            </p>
          </div>

          <button
            onClick={onOpenAddResource}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Share Learning Resource</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {[
              { id: 'all', label: 'All Knowledge' },
              { id: 'coding', label: '💻 Coding & Software' },
              { id: 'ai_data', label: '🤖 AI & Data' },
              { id: 'design', label: '🎨 Design & UI' },
              { id: 'trades', label: '⚡ Trades & Solar' },
              { id: 'business', label: '💼 Freelance & Business' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Format Type Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="all">All Resource Formats</option>
              <option value="guide">Articles & Guides</option>
              <option value="video">Video Tutorials</option>
              <option value="repo">Open Source Repos</option>
              <option value="cheatsheet">Cheat Sheets & PDFs</option>
              <option value="tool">Interactive Tools</option>
              <option value="book">E-Books</option>
            </select>

            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="all">All Regions</option>
              <option value="Global">Global / Worldwide</option>
              <option value="South Africa">South Africa</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
            </select>
          </div>

        </div>

      </div>

      {/* Resources Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map(res => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              
              <div className="space-y-3">
                
                {/* Author Info & Upvotes */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={res.authorAvatar}
                      alt={res.authorName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">{res.authorName}</h4>
                      <p className="text-[10px] font-semibold text-slate-400">{res.authorLocation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleUpvote(res.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                      res.isUpvoted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${res.isUpvoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                    <span>{res.upvotes}</span>
                  </button>
                </div>

                {/* Badges Bar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    {getFormatIcon(res.resourceType)}
                    <span className="capitalize">{res.resourceType}</span>
                  </span>

                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    {res.difficulty}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium ml-auto">
                    {res.createdAt}
                  </span>
                </div>

                {/* Resource Title & Description */}
                <div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-extrabold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-2 leading-snug"
                  >
                    {res.title}
                  </a>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5 line-clamp-3">
                    {res.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {res.tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60">
                      #{t}
                    </span>
                  ))}
                </div>

              </div>

              {/* Footer External Link & Bookmark */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onToggleBookmark(res.id)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    res.isBookmarked
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title={res.isBookmarked ? 'Saved to Bookmarks' : 'Save Resource'}
                >
                  <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-current' : ''}`} />
                  <span className="text-[11px]">{res.isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all hover:scale-105"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-sm">No Learning Resources Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first to contribute a tutorial, cheat sheet, or tool link to the global community!
            </p>
            <button
              onClick={onOpenAddResource}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              Share First Resource
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
