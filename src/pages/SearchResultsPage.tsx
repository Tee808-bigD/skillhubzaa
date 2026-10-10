import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  Send, 
  ArrowRight, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  SearchX, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  X,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { TopPro, DEFAULT_TOP_PROS } from '../components/TopRatedProfessionals';
import { ProfessionalServiceItem, User } from '../types';
import { FilterSidebar, FilterState, CATEGORY_OPTIONS, LOCATION_OPTIONS } from '../components/FilterSidebar';
import { ServiceCard } from '../components/ServiceCard';
import { initialProfessionalServices } from '../data/mockData';

// Extended global pool of professionals for rich search results
export const EXPANDED_GLOBAL_PROS: TopPro[] = [
  ...DEFAULT_TOP_PROS,
  {
    id: 'pro_4',
    username: 'thando_dev',
    name: 'Thando Mzobe',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    primarySkill: 'Full-Stack Software Development',
    location: 'Johannesburg',
    country: 'South Africa 🇿🇦',
    rating: 4.95,
    reviewsCount: 38,
    isTopRated: true,
    verified: true,
    hourlyRate: '$65/hr'
  },
  {
    id: 'pro_5',
    username: 'amara_ai',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    primarySkill: 'AI Engineer & PyTorch Specialist',
    location: 'Lagos',
    country: 'Nigeria 🇳🇬 (Remote)',
    rating: 4.89,
    reviewsCount: 29,
    isTopRated: true,
    verified: true,
    hourlyRate: '$60/hr'
  },
  {
    id: 'pro_6',
    username: 'sofia_mobile',
    name: 'Sofia Morales',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    primarySkill: 'Senior iOS & React Native Developer',
    location: 'Madrid',
    country: 'Spain 🇪🇸',
    rating: 4.93,
    reviewsCount: 52,
    isTopRated: true,
    verified: true,
    hourlyRate: '$70/hr'
  },
  {
    id: 'pro_7',
    username: 'marcus_sec',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    primarySkill: 'Cloud Security & Penetration Testing',
    location: 'Austin',
    country: 'USA 🇺🇸',
    rating: 4.96,
    reviewsCount: 44,
    isTopRated: true,
    verified: true,
    hourlyRate: '$95/hr'
  }
];

export const EXPANDED_GLOBAL_SERVICES: ProfessionalServiceItem[] = [
  ...initialProfessionalServices,
  {
    id: 'serv_pro_4',
    userId: 'usr_sarah',
    title: 'Full-Stack Architecture & Production App Delivery',
    description: 'Turnkey React + TypeScript web app with secure Node.js backend, automated tests, and CI/CD deployment.',
    price: '$850',
    deliveryDays: '5-7 days',
    features: ['TypeScript strict mode', 'REST/GraphQL APIs', 'Authentication & JWT', '100% test coverage for critical paths'],
    category: 'Web & Mobile Dev'
  },
  {
    id: 'serv_pro_5',
    userId: 'usr_elena',
    title: 'Complete Brand Identity & Modern Logo System',
    description: 'Distinctive visual identity, vector logo variations, color hierarchy, typography tokens, and social media kit.',
    price: '$450',
    deliveryDays: '4 days',
    features: ['3 distinct creative directions', 'Vector master files (SVG, AI, PDF)', 'Style guide documentation', 'Full commercial rights'],
    category: 'UI/UX & Product Design'
  },
  {
    id: 'serv_pro_6',
    userId: 'usr_michael',
    title: 'Residential & Commercial Solar Design & System Audit',
    description: 'Photovoltaic load calculations, inverter sizing, shading simulations, and municipal regulatory compliance blueprint.',
    price: '$450',
    deliveryDays: '3 days',
    features: ['Yield simulation report', 'Inverter & battery sizing', 'ROI & payback forecast', 'Equipment bill of materials'],
    category: 'Electrical & Solar Tech'
  },
  {
    id: 'serv_pro_7',
    userId: 'usr_amara',
    title: 'Custom AI Agent & LLM Workflow Automation',
    description: 'Integration of LLMs, function calling, vector embeddings, and LangChain pipelines tailored to business databases.',
    price: '$700',
    deliveryDays: '5 days',
    features: ['Custom RAG pipeline', 'Vector database integration', 'OpenAI/Claude/Gemini APIs', 'REST endpoint delivery'],
    category: 'AI & Data Science'
  }
];

interface SearchResultsPageProps {
  initialQuery?: string;
  initialCategory?: string;
  initialLocation?: string;
  onOpenProfile: (pro: Partial<User>) => void;
  onOpenDirectChat?: (participantName: string) => void;
  onHirePro?: (proOrService: any) => void;
  onNavigateHome?: () => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  initialQuery = '',
  initialCategory = '',
  initialLocation = 'all',
  onOpenProfile,
  onOpenDirectChat,
  onHirePro,
  onNavigateHome
}) => {
  // Read and initialize state from URL query parameters (e.g. ?q=react&category=web-dev&location=europe)
  const getUrlParams = () => {
    if (typeof window === 'undefined') {
      return { q: initialQuery, category: initialCategory, location: initialLocation };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || initialQuery || '',
      category: params.get('category') || initialCategory || '',
      location: params.get('location') || initialLocation || 'all'
    };
  };

  const initialParams = getUrlParams();
  const [searchQuery, setSearchQuery] = useState(initialParams.q);
  const [activeTab, setActiveTab] = useState<'all' | 'pros' | 'services'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'newest'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    categories: initialParams.category ? [initialParams.category] : [],
    minPrice: 0,
    maxPrice: 250,
    minRating: 0,
    location: initialParams.location || 'all',
    availableNowOnly: false
  });

  // Sync state if URL changes externally (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const p = getUrlParams();
      setSearchQuery(p.q);
      if (p.category) {
        setFilters(prev => ({ ...prev, categories: [p.category], location: p.location || 'all' }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state to URL without reloading page
  const updateUrlParams = (q: string, cats: string[], loc: string) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cats.length > 0) params.set('category', cats[0]);
    if (loc && loc !== 'all') params.set('location', loc);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(searchQuery, filters.categories, filters.location);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      minPrice: 0,
      maxPrice: 250,
      minRating: 0,
      location: 'all',
      availableNowOnly: false
    });
    setSearchQuery('');
    updateUrlParams('', [], 'all');
  };

  // Helper to extract numeric price from "$75/hr" or "$500"
  const parseRate = (rateStr?: string): number => {
    if (!rateStr) return 50;
    const match = rateStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 50;
  };

  // Helper category matcher
  const matchesCategory = (skillOrCat: string, selectedCats: string[]): boolean => {
    if (selectedCats.length === 0) return true;
    const s = skillOrCat.toLowerCase();
    return selectedCats.some(cat => {
      if (cat === 'web-dev' && (s.includes('web') || s.includes('react') || s.includes('fullstack') || s.includes('mobile') || s.includes('frontend') || s.includes('software'))) return true;
      if (cat === 'ui-ux' && (s.includes('design') || s.includes('ui') || s.includes('ux') || s.includes('brand') || s.includes('figma'))) return true;
      if (cat === 'devops' && (s.includes('cloud') || s.includes('devops') || s.includes('docker') || s.includes('architect') || s.includes('aws'))) return true;
      if (cat === 'solar' && (s.includes('solar') || s.includes('electrical') || s.includes('energy') || s.includes('smart home'))) return true;
      if (cat === 'ai-data' && (s.includes('ai') || s.includes('data') || s.includes('pytorch') || s.includes('ml') || s.includes('model'))) return true;
      if (cat === 'security' && (s.includes('security') || s.includes('audit') || s.includes('penetration'))) return true;
      if (cat === 'business' && (s.includes('business') || s.includes('marketing') || s.includes('manager'))) return true;
      return false;
    });
  };

  // Helper location matcher
  const matchesLocation = (proLocation: string, proCountry: string, filterLoc: string): boolean => {
    if (filterLoc === 'all' || !filterLoc) return true;
    const text = `${proLocation} ${proCountry}`.toLowerCase();
    if (filterLoc === 'remote' && text.includes('remote')) return true;
    if (filterLoc === 'north-america' && (text.includes('usa') || text.includes('canada') || text.includes('toronto') || text.includes('austin') || text.includes('san francisco'))) return true;
    if (filterLoc === 'europe' && (text.includes('germany') || text.includes('berlin') || text.includes('spain') || text.includes('madrid') || text.includes('uk') || text.includes('london'))) return true;
    if (filterLoc === 'united-kingdom' && (text.includes('uk') || text.includes('london') || text.includes('britain'))) return true;
    if (filterLoc === 'africa' && (text.includes('south africa') || text.includes('johannesburg') || text.includes('nigeria') || text.includes('lagos') || text.includes('durban'))) return true;
    if (filterLoc === 'asia-pacific' && (text.includes('singapore') || text.includes('japan') || text.includes('australia'))) return true;
    if (filterLoc === 'latin-america' && (text.includes('brazil') || text.includes('mexico'))) return true;
    return false;
  };

  // Filtered Professionals
  const filteredPros = useMemo(() => {
    return EXPANDED_GLOBAL_PROS.filter(pro => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pro.name.toLowerCase().includes(q);
        const matchesSkill = pro.primarySkill.toLowerCase().includes(q);
        const matchesLoc = pro.location.toLowerCase().includes(q) || pro.country.toLowerCase().includes(q);
        if (!matchesName && !matchesSkill && !matchesLoc) return false;
      }

      // Categories
      if (!matchesCategory(pro.primarySkill, filters.categories)) return false;

      // Price Range
      const rate = parseRate(pro.hourlyRate);
      if (rate < filters.minPrice || rate > filters.maxPrice) return false;

      // Rating
      if (filters.minRating > 0 && pro.rating < filters.minRating) return false;

      // Location
      if (!matchesLocation(pro.location, pro.country, filters.location)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return EXPANDED_GLOBAL_SERVICES.filter(service => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = service.title.toLowerCase().includes(q);
        const matchesDesc = service.description.toLowerCase().includes(q);
        const matchesCat = (service.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      if (filters.categories.length > 0) {
        const catMatch = matchesCategory(service.category || service.title, filters.categories);
        if (!catMatch) return false;
      }

      const price = parseRate(service.price);
      if (filters.minPrice > 0 && price < filters.minPrice) return false;

      return true;
    });
  }, [searchQuery, filters]);

  // Sorted Results
  const sortedPros = useMemo(() => {
    const list = [...filteredPros];
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => parseRate(a.hourlyRate) - parseRate(b.hourlyRate));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => parseRate(b.hourlyRate) - parseRate(a.hourlyRate));
    } else if (sortBy === 'newest') {
      list.reverse();
    }
    return list;
  }, [filteredPros, sortBy]);

  const sortedServices = useMemo(() => {
    const list = [...filteredServices];
    if (sortBy === 'price_asc') {
      list.sort((a, b) => parseRate(a.price) - parseRate(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => parseRate(b.price) - parseRate(a.price));
    }
    return list;
  }, [filteredServices, sortBy]);

  const totalResults = sortedPros.length + sortedServices.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/80 border border-slate-700/80 focus-within:border-emerald-500 rounded-2xl w-full flex-1 transition-all">
            <Search className="w-5 h-5 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills (e.g. React, UI/UX, Solar, Python), services, or names..."
              className="bg-transparent text-white placeholder-slate-400 text-sm font-semibold w-full focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </form>

        {/* Quick Popular Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <span className="text-xs font-bold text-slate-400 shrink-0">Popular:</span>
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = filters.categories.includes(cat.key);
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? filters.categories.filter(c => c !== cat.key)
                    : [cat.key];
                  setFilters({ ...filters, categories: updated });
                  updateUrlParams(searchQuery, updated, filters.location);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex items-start gap-6">
        
        {/* Left Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onChangeFilters={(newF) => {
            setFilters(newF);
            updateUrlParams(searchQuery, newF.categories, newF.location);
          }}
          onClearFilters={handleClearFilters}
          isMobileOpen={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          totalResultsCount={totalResults}
        />

        {/* Right Results Content Area */}
        <div className="flex-1 min-w-0 space-y-5">
          
          {/* Results Header: Count, Type Tabs, Sort & View Toggles */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Header Title & Result Count */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Global Professionals'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {totalResults} found
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified talent with secure milestone escrow protection
              </p>
            </div>

            {/* Controls: Type Tabs, Mobile Filter Button, Sort Dropdown, View Toggle */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Filters</span>
              </button>

              {/* Type Tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({totalResults})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pros')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'pros' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pros ({sortedPros.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'services' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Services ({sortedServices.length})
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="relevance" className="bg-slate-900 text-white">Relevance</option>
                  <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
                  <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                  <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                  <option value="newest" className="bg-slate-900 text-white">Newest</option>
                </select>
              </div>

              {/* View Mode Toggle: Grid vs List */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Results Grid / List Display */}
          {totalResults > 0 ? (
            <div className="space-y-6">
              
              {/* Section 1: Professionals */}
              {(activeTab === 'all' || activeTab === 'pros') && sortedPros.length > 0 && (
                <div className="space-y-3">
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between pb-1">
                      <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verified Professionals ({sortedPros.length})</span>
                      </h2>
                    </div>
                  )}

                  <div className={
                    viewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                      : "space-y-3"
                  }>
                    {sortedPros.map((pro) => (
                      <div
                        key={pro.id}
                        className={`group bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-emerald-500/50 p-4 transition-all duration-200 hover:shadow-xl relative flex flex-col justify-between ${
                          viewMode === 'list' ? 'sm:flex-row sm:items-center gap-4' : 'space-y-4'
                        }`}
                      >
                        {/* Pro Info & Avatar */}
                        <div 
                          onClick={() => onOpenProfile({
                            id: pro.id,
                            name: pro.name,
                            handle: `@${pro.username}`,
                            avatar: pro.avatar,
                            primarySkill: pro.primarySkill,
                            title: pro.primarySkill,
                            location: pro.location,
                            country: pro.country,
                            rating: pro.rating,
                            reviewsCount: pro.reviewsCount,
                            hourlyRate: pro.hourlyRate,
                            isTopRated: pro.isTopRated,
                            verified: pro.verified
                          })}
                          className={`flex items-start gap-3.5 cursor-pointer ${viewMode === 'list' ? 'flex-1' : ''}`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={pro.avatar}
                              alt={pro.name}
                              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all"
                            />
                            {pro.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-slate-950" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-black text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                                {pro.name}
                              </h3>
                              {pro.isTopRated && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded-md">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> Top Rated
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-slate-300 mt-0.5 line-clamp-1">
                              {pro.primarySkill}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                <span>{pro.location}, {pro.country}</span>
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{pro.rating.toFixed(2)}</span>
                                <span className="text-slate-500 font-medium">({pro.reviewsCount})</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rate & Action Buttons */}
                        <div className={`flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80 ${
                          viewMode === 'list' ? 'sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end sm:justify-center' : ''
                        }`}>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Starting at</span>
                            <span className="text-base font-black text-white">{pro.hourlyRate}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {onOpenDirectChat && (
                              <button
                                type="button"
                                onClick={() => onOpenDirectChat(pro.name)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                title="Send Message"
                              >
                                <Send className="w-3 h-3 text-emerald-400" />
                                <span className="hidden sm:inline">Message</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (onHirePro) onHirePro(pro);
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition hover:scale-105 cursor-pointer flex items-center gap-1.5"
                            >
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>Hire</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Packaged Services */}
              {(activeTab === 'all' || activeTab === 'services') && sortedServices.length > 0 && (
                <div className="space-y-3 pt-4">
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between pb-1 border-t border-slate-800 pt-6">
                      <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <span>Fixed-Price Escrow Services ({sortedServices.length})</span>
                      </h2>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBookNow={(s) => {
                          if (onHirePro) onHirePro(s);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* 5. Friendly "No Results" State */
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                <SearchX className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">
                  No matching professionals or services found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  We couldn't find any results matching your search terms or active filters. Try adjusting your query or exploring our most popular categories below.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>

                {onNavigateHome && (
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Browse Home Feed
                  </button>
                )}
              </div>

              {/* Suggestions Chips */}
              <div className="pt-6 border-t border-slate-800/80 max-w-lg mx-auto">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  Or explore high-demand categories:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {CATEGORY_OPTIONS.slice(0, 4).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({ ...filters, categories: [c.key] });
                        updateUrlParams('', [c.key], filters.location);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition cursor-pointer"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
