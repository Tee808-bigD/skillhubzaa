import React, { useState } from 'react';
import { ExternalCourse } from '../types';
import { 
  Bookmark, 
  ExternalLink, 
  Trash2, 
  Search, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Star, 
  ShieldCheck,
  Compass
} from 'lucide-react';

interface SavedCoursesViewProps {
  savedCourses: ExternalCourse[];
  onRemoveFromSaved: (courseId: string) => void;
  onNavigateToDiscovery?: () => void;
}

export const SavedCoursesView: React.FC<SavedCoursesViewProps> = ({
  savedCourses,
  onRemoveFromSaved,
  onNavigateToDiscovery
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [removedToast, setRemovedToast] = useState<string | null>(null);

  const filteredCourses = savedCourses.filter(course => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = course.title.toLowerCase().includes(q);
    const providerMatch = (course.provider_name || '').toLowerCase().includes(q);
    const tagsMatch = (course.skill_tags || []).some(t => t.toLowerCase().includes(q));
    const catMatch = (course.category || '').toLowerCase().includes(q);
    return titleMatch || providerMatch || tagsMatch || catMatch;
  });

  const handleRemove = (courseId: string, courseTitle: string) => {
    onRemoveFromSaved(courseId);
    setRemovedToast(`Removed "${courseTitle.slice(0, 30)}..." from saved`);
    setTimeout(() => setRemovedToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {removedToast && (
        <div className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in duration-200 sticky top-4 z-40 border border-neutral-700">
          <span>{removedToast}</span>
          <button 
            onClick={() => setRemovedToast(null)}
            className="text-neutral-400 hover:text-white ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
            <Bookmark className="w-6 h-6 fill-amber-500/20 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">
                My Saved Courses & Wishlist
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                {savedCourses.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Keep track of programs you want to explore. Direct enrollment is handled on each provider's platform.
            </p>
          </div>
        </div>

        {onNavigateToDiscovery && (
          <button
            onClick={onNavigateToDiscovery}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Courses</span>
          </button>
        )}
      </div>

      {/* Search inside saved list if there are saved courses */}
      {savedCourses.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search saved courses by title, provider, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
        </div>
      )}

      {/* Saved Courses Grid / List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              {savedCourses.length === 0 ? 'No courses saved yet' : 'No matching saved courses found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {savedCourses.length === 0 
                ? 'Explore the global directory and tap "Save" on any course card to bookmark it for later review.' 
                : 'Try adjusting your search keyword to find other saved courses.'}
            </p>
          </div>
          {onNavigateToDiscovery && (
            <button
              onClick={onNavigateToDiscovery}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <span>Explore Course Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const externalUrl = course.external_url || 'https://www.google.com/search?q=' + encodeURIComponent(course.title);
            const isFree = course.price_type === 'free' || (course as any).price?.toLowerCase().includes('free');
            const priceLabel = isFree ? 'Free' : (course.price_amount ? `$${course.price_amount}` : 'Paid');

            return (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Banner or top bar */}
                {course.banner_image_url ? (
                  <div className="h-28 w-full overflow-hidden relative bg-slate-100">
                    <img 
                      src={course.banner_image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 shadow-xs">
                      {priceLabel}
                    </span>
                  </div>
                ) : null}

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Provider */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                      <span className="uppercase tracking-wider text-[11px] text-emerald-700 font-black">
                        {course.provider_name}
                      </span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-semibold capitalize">
                        {course.course_type || 'course'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug mb-1">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[10px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {course.duration || 'Flexible'}
                      </span>
                      <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md capitalize">
                        {course.level || 'Beginner'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(course.rating || 4.8).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Continue to Provider */}
                    <a
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition group/btn"
                    >
                      <span>Continue to Provider</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(course.id, course.title)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Remove from saved courses"
                      aria-label="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
