import React, { useState, useMemo } from 'react';
import { ExternalCourse } from '../types';
import { CourseCard } from './CourseCard';
import { ShareCourseModal } from './ShareCourseModal';
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  RotateCcw, 
  Bookmark, 
  Globe2, 
  Sparkles, 
  SlidersHorizontal,
  ChevronDown,
  Info,
  Flag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CoursesViewProps {
  courses: ExternalCourse[];
  savedCourseIds: string[];
  onToggleSaveCourse: (courseId: string) => void;
  onAddCourse: (newCourse: Partial<ExternalCourse>) => void;
  onViewSavedCourses?: () => void;
  currentUserName?: string;
}

// Quick filter chips matching requirement #2
const QUICK_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'certification', label: 'Certification' },
  { id: 'bootcamp', label: 'Bootcamp' },
];

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  savedCourseIds,
  onToggleSaveCourse,
  onAddCourse,
  onViewSavedCourses,
  currentUserName
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced Filters State
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest'>('popular');

  // Modal & Toast State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [reportModalCourse, setReportModalCourse] = useState<ExternalCourse | null>(null);
  const [reportSuccessToast, setReportSuccessToast] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Link is broken (404 / expired)');

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedProvider !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedDuration !== 'all') count++;
    if (selectedLanguage !== 'all') count++;
    if (selectedRegion !== 'all') count++;
    if (activeChip !== 'all') count++;
    return count;
  }, [
    selectedProvider,
    selectedCategory,
    selectedPriceRange,
    selectedDuration,
    selectedLanguage,
    selectedRegion,
    activeChip
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveChip('all');
    setSelectedProvider('all');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedDuration('all');
    setSelectedLanguage('all');
    setSelectedRegion('all');
  };

  // Filter & Search Logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Text Search (title, skills, provider, category, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesProvider = (course.provider_name || '').toLowerCase().includes(query);
        const matchesCategory = (course.category || '').toLowerCase().includes(query);
        const matchesDesc = (course.description || '').toLowerCase().includes(query);
        const matchesTags = (course.skill_tags || []).some((tag) =>
          tag.toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesProvider && !matchesCategory && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // 2. Quick Chips Filter
      if (activeChip !== 'all') {
        if (activeChip === 'free' && course.price_type !== 'free') return false;
        if (activeChip === 'paid' && course.price_type !== 'paid') return false;
        if (activeChip === 'beginner' && course.level !== 'beginner') return false;
        if (activeChip === 'intermediate' && course.level !== 'intermediate') return false;
        if (activeChip === 'advanced' && course.level !== 'advanced') return false;
        if (activeChip === 'certification' && course.course_type !== 'certification') return false;
        if (activeChip === 'bootcamp' && course.course_type !== 'bootcamp') return false;
      }

      // 3. Provider Filter
      if (selectedProvider !== 'all') {
        const p = (course.provider_name || '').toLowerCase();
        if (selectedProvider === 'cisco' && !p.includes('cisco') && !p.includes('netacad')) return false;
        if (selectedProvider === 'coursera' && !p.includes('coursera')) return false;
        if (selectedProvider === 'udemy' && !p.includes('udemy')) return false;
        if (selectedProvider === 'edx' && !p.includes('edx')) return false;
        if (selectedProvider === 'futurelearn' && !p.includes('futurelearn')) return false;
        if (selectedProvider === 'local' && !p.includes('local') && !p.includes('seta')) return false;
      }

      // 4. Category Filter
      if (selectedCategory !== 'all') {
        if (course.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 5. Price Filter
      if (selectedPriceRange !== 'all') {
        const amount = course.price_amount || 0;
        if (selectedPriceRange === 'free' && course.price_type !== 'free') return false;
        if (selectedPriceRange === 'under_50' && (course.price_type === 'free' || amount >= 50)) return false;
        if (selectedPriceRange === '50_200' && (amount < 50 || amount > 200)) return false;
        if (selectedPriceRange === 'over_200' && amount <= 200) return false;
      }

      // 6. Duration Filter
      if (selectedDuration !== 'all') {
        const dur = (course.duration || '').toLowerCase();
        if (selectedDuration === 'under_1_week' && !dur.includes('day') && !dur.includes('under 1 week')) return false;
        if (selectedDuration === '1_4_weeks' && !dur.includes('week') && !dur.includes('1-4')) return false;
        if (selectedDuration === '1_3_months' && !dur.includes('1-3') && !dur.includes('month')) return false;
        if (selectedDuration === '3_plus_months' && !dur.includes('3+') && !dur.includes('6 month') && !dur.includes('year')) return false;
      }

      // 7. Language Filter
      if (selectedLanguage !== 'all') {
        if ((course.language || 'English').toLowerCase() !== selectedLanguage.toLowerCase()) {
          return false;
        }
      }

      // 8. Region Filter
      if (selectedRegion !== 'all') {
        if ((course.region || 'Global').toLowerCase() !== selectedRegion.toLowerCase()) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      // default: 'popular'
      return (b.enrolled_count || 0) - (a.enrolled_count || 0);
    });
  }, [
    courses,
    searchQuery,
    activeChip,
    selectedProvider,
    selectedCategory,
    selectedPriceRange,
    selectedDuration,
    selectedLanguage,
    selectedRegion,
    sortBy,
  ]);

  const handleReportSubmit = () => {
    if (reportModalCourse) {
      setReportSuccessToast(`Thank you. Link report for "${reportModalCourse.title.slice(0, 35)}..." sent to moderators.`);
      setReportModalCourse(null);
      setTimeout(() => setReportSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {reportSuccessToast && (
        <div className="bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in duration-200 sticky top-4 z-50 border border-neutral-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{reportSuccessToast}</span>
          </div>
          <button 
            onClick={() => setReportSuccessToast(null)} 
            className="text-neutral-400 hover:text-white ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header (Rebranded per specification #1) */}
      <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
              <Globe2 className="w-3.5 h-3.5" />
              <span>GLOBAL DIRECTORY & YELLOW PAGES</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Discover Courses & Bootcamps Worldwide
            </h1>

            <p className="text-sm text-neutral-300 font-medium leading-relaxed">
              Explore thousands of courses from top providers. Find the right one, then enroll directly with the provider.
            </p>

            {/* Small Disclaimer Text */}
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-semibold pt-1">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                SkillHub is a discovery platform. Enrollment and payment are handled by the course provider.
              </span>
            </div>
          </div>

          {/* Action Buttons: "+ Share a Course" & "Saved Courses" */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onViewSavedCourses && (
              <button
                type="button"
                onClick={onViewSavedCourses}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>My Saved Courses</span>
                {savedCourseIds.length > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                    {savedCourseIds.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Share a Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Filters & Search (per specification #2) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        
        {/* Top Search Bar & Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search for courses, skills, or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Recently Added</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </div>

        {/* Quick Filter Tabs / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {QUICK_CHIPS.map((chip) => {
            const isActive = activeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveChip(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Expandable Panel (requirement #2) */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* 1. Provider */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Providers</option>
                <option value="cisco">Cisco Networking Academy</option>
                <option value="coursera">Coursera</option>
                <option value="udemy">Udemy</option>
                <option value="edx">edX</option>
                <option value="futurelearn">FutureLearn</option>
                <option value="local">Local & SETA Providers</option>
              </select>
            </div>

            {/* 2. Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Categories</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Coding">Coding & Networking</option>
                <option value="Design">Design</option>
                <option value="Data">Data Science</option>
                <option value="Marketing">Marketing</option>
                <option value="Trades">Trades & IT Hardware</option>
                <option value="Business">Business</option>
                <option value="Languages">Languages</option>
              </select>
            </div>

            {/* 3. Price */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Price
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Prices</option>
                <option value="free">Free Only</option>
                <option value="under_50">Under $50</option>
                <option value="50_200">$50 - $200</option>
                <option value="over_200">$200+</option>
              </select>
            </div>

            {/* 4. Duration */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Durations</option>
                <option value="under_1_week">Under 1 week</option>
                <option value="1_4_weeks">1-4 weeks</option>
                <option value="1_3_months">1-3 months</option>
                <option value="3_plus_months">3+ months</option>
              </select>
            </div>

            {/* 5. Language */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Languages</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
              </select>
            </div>

            {/* 6. Location / Region */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="all">All Regions</option>
                <option value="global">Global</option>
                <option value="africa">Africa</option>
                <option value="europe">Europe</option>
                <option value="north america">North America</option>
                <option value="asia">Asia</option>
              </select>
            </div>

          </div>
        )}

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>
          Showing <span className="text-slate-900 font-extrabold">{filteredCourses.length}</span> course discovery items
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-emerald-700">
            Filters applied ({activeFiltersCount})
          </span>
        )}
      </div>

      {/* 3. Course Cards Grid (requirement #3) */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              No matching courses found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find any courses matching your specific search or filters. Try adjusting your query or share a new course yourself.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              + Share This Course
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSaved={savedCourseIds.includes(course.id)}
              onToggleSave={onToggleSaveCourse}
              onReportBrokenLink={(c) => setReportModalCourse(c)}
            />
          ))}
        </div>
      )}

      {/* Share Course Modal (requirement #4) */}
      <ShareCourseModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSubmitCourse={onAddCourse}
        currentUserName={currentUserName}
      />

      {/* Report Broken Link Modal (requirement #3 tertiary action) */}
      {reportModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Report Broken Link</span>
              </div>
              <button
                type="button"
                onClick={() => setReportModalCourse(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Report an issue with the link for: <br />
              <strong className="text-slate-900">{reportModalCourse.title}</strong> ({reportModalCourse.provider_name})
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                What is the issue?
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Link is broken (404 / expired)">Link is broken (404 / expired)</option>
                <option value="Course is no longer offered">Course is no longer offered</option>
                <option value="Incorrect price or provider details">Incorrect price or provider details</option>
                <option value="Spam / Inappropriate content">Spam / Inappropriate content</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportModalCourse(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
