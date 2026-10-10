import React from 'react';
import { 
  Filter, 
  X, 
  RotateCcw, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

export interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  location: string;
  availableNowOnly: boolean;
}

export const CATEGORY_OPTIONS = [
  { key: 'web-dev', label: 'Web & Mobile Dev', count: 48 },
  { key: 'ui-ux', label: 'UI/UX & Product Design', count: 34 },
  { key: 'devops', label: 'DevOps & Cloud Systems', count: 22 },
  { key: 'solar', label: 'Electrical & Solar Tech', count: 19 },
  { key: 'ai-data', label: 'AI & Data Science', count: 27 },
  { key: 'security', label: 'Cybersecurity & Auditing', count: 14 },
  { key: 'business', label: 'Business & Marketing', count: 18 }
];

export const LOCATION_OPTIONS = [
  { key: 'all', label: 'Anywhere / Remote 🌐' },
  { key: 'remote', label: 'Remote Only' },
  { key: 'north-america', label: 'North America 🇺🇸 🇨🇦' },
  { key: 'europe', label: 'Europe 🇩🇪 🇫🇷 🇳🇱' },
  { key: 'united-kingdom', label: 'United Kingdom 🇬🇧' },
  { key: 'asia-pacific', label: 'Asia-Pacific 🇯🇵 🇸🇬 🇦🇺' },
  { key: 'africa', label: 'South Africa & MEA 🇿🇦' },
  { key: 'latin-america', label: 'Latin America 🇧🇷 🇲🇽' }
];

interface FilterSidebarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  totalResultsCount?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChangeFilters,
  onClearFilters,
  isMobileOpen = false,
  onCloseMobile,
  totalResultsCount
}) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(true);
  const [isPriceOpen, setIsPriceOpen] = React.useState(true);
  const [isRatingOpen, setIsRatingOpen] = React.useState(true);
  const [isLocationOpen, setIsLocationOpen] = React.useState(true);

  const toggleCategory = (catKey: string) => {
    const exists = filters.categories.includes(catKey);
    const updated = exists
      ? filters.categories.filter(c => c !== catKey)
      : [...filters.categories, catKey];
    onChangeFilters({ ...filters, categories: updated });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 250 ||
    filters.minRating > 0 ||
    (filters.location !== 'all' && filters.location !== '') ||
    filters.availableNowOnly;

  const content = (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h3 className="font-black text-sm text-white tracking-wide uppercase">
            Filters
          </h3>
          {typeof totalResultsCount === 'number' && (
            <span className="text-xs text-slate-400 font-semibold">
              ({totalResultsCount})
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Availability Status Toggle */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-white">
              Available Now Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={filters.availableNowOnly}
            onChange={(e) => onChangeFilters({ ...filters, availableNowOnly: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer accent-emerald-500"
          />
        </label>
      </div>

      {/* 2. Categories Filter */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-white uppercase tracking-wider cursor-pointer"
        >
          <span>Categories</span>
          {isCategoriesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isCategoriesOpen && (
          <div className="space-y-2 pt-1">
            {CATEGORY_OPTIONS.map((cat) => {
              const isChecked = filters.categories.includes(cat.key);
              return (
                <label
                  key={cat.key}
                  className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.key)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                    />
                    <span className={isChecked ? 'font-bold text-white' : 'font-medium'}>
                      {cat.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {cat.count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Hourly Rate Range Filter */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-white uppercase tracking-wider cursor-pointer"
        >
          <span>Hourly Rate ($/hr)</span>
          {isPriceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isPriceOpen && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Min Rate</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="5"
                    value={filters.minPrice}
                    onChange={(e) => onChangeFilters({ ...filters, minPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Max Rate</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    step="5"
                    value={filters.maxPrice}
                    onChange={(e) => onChangeFilters({ ...filters, maxPrice: Number(e.target.value) || 250 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Price Shortcuts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'Under $50', min: 0, max: 50 },
                { label: '$50 - $100', min: 50, max: 100 },
                { label: '$100+', min: 100, max: 300 }
              ].map((p) => {
                const isActive = filters.minPrice === p.min && filters.maxPrice === p.max;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, minPrice: p.min, maxPrice: p.max })}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Minimum Rating Filter */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-white uppercase tracking-wider cursor-pointer"
        >
          <span>Client Rating</span>
          {isRatingOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isRatingOpen && (
          <div className="space-y-1.5 pt-1">
            {[
              { val: 4.8, label: '4.8+ Top Rated Only' },
              { val: 4.5, label: '4.5+ Stars' },
              { val: 4.0, label: '4.0+ Stars' },
              { val: 0, label: 'Any Rating' }
            ].map((r) => {
              const isSelected = filters.minRating === r.val;
              return (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, minRating: r.val })}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className={`w-3.5 h-3.5 ${r.val > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                    <span>{r.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Location / Region Filter */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className="w-full flex items-center justify-between text-xs font-black text-white uppercase tracking-wider cursor-pointer"
        >
          <span>Location & Region</span>
          {isLocationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isLocationOpen && (
          <div className="pt-1">
            <select
              value={filters.location}
              onChange={(e) => onChangeFilters({ ...filters, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.key} value={loc.key} className="bg-slate-900 text-white">
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto shadow-2xl z-10 space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-black text-white text-sm">Filter Search Results</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
