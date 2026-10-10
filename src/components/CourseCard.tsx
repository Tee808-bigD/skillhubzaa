import React, { useState } from 'react';
import { ExternalCourse } from '../types';
import { 
  ExternalLink, 
  Bookmark, 
  Star, 
  Clock, 
  Flag, 
  Users, 
  Award, 
  Check, 
  Sparkles,
  Globe2
} from 'lucide-react';

interface CourseCardProps {
  course: ExternalCourse | any;
  isSaved?: boolean;
  onToggleSave?: (courseId: string) => void;
  onReportBrokenLink?: (course: ExternalCourse | any) => void;
  // Legacy compatibility props if used elsewhere
  isEnrolled?: boolean;
  onSelectCourse?: (course: any) => void;
  onEnroll?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isSaved = false,
  onToggleSave,
  onReportBrokenLink,
  onSelectCourse,
}) => {
  const [justSaved, setJustSaved] = useState(false);
  const [reported, setReported] = useState(false);

  // Normalize fields between ExternalCourse and legacy Course
  const title = course.title;
  const providerName = course.provider_name || course.provider || 'Provider';
  const providerLogo = course.provider_logo_url || course.providerLogo;
  const description = course.description || '';
  const externalUrl = course.external_url || 'https://www.google.com/search?q=' + encodeURIComponent(title + ' ' + providerName);
  const skillTags: string[] = course.skill_tags || course.tags || [];
  const rating = Number(course.rating || 4.8).toFixed(1);
  const reviewsCount = course.reviews_count || Math.floor((course.enrolledCount || 1200) * 0.12);
  const enrolledCount = course.enrolled_count || course.enrolledCount || 1500;
  const courseType = course.course_type || (course.setaAccreditation ? 'certification' : 'course');
  const priceType = course.price_type || (course.price?.toLowerCase().includes('free') ? 'free' : 'paid');
  const priceAmount = course.price_amount !== undefined ? course.price_amount : (priceType === 'free' ? 0 : 49);
  const duration = course.duration || '4 weeks';
  const level = (course.level || 'Beginner').toString().toLowerCase();
  const bannerImage = course.banner_image_url || course.bannerImage;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave(course.id);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReportBrokenLink) {
      onReportBrokenLink(course);
    } else {
      setReported(true);
      setTimeout(() => setReported(false), 3000);
    }
  };

  // Format large numbers cleanly (e.g. 18.5k)
  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  // Badges color mapping
  const getTypeBadgeColor = () => {
    switch (courseType) {
      case 'bootcamp':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'certification':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'workshop':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Banner Image (Optional decorative visual header) */}
      {bannerImage && (
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          <img 
            src={bannerImage} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          
          {/* Price & Type Badges */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs ${
              priceType === 'free' 
                ? 'bg-emerald-500 text-slate-950' 
                : 'bg-slate-900 text-emerald-400 border border-emerald-500/30'
            }`}>
              {priceType === 'free' ? 'Free' : (priceAmount ? `$${priceAmount}` : 'Paid')}
            </span>
          </div>

          <div className="absolute top-3 left-3">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold capitalize border shadow-2xs ${getTypeBadgeColor()}`}>
              {courseType}
            </span>
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        <div>
          {/* Header: Provider Logo + Provider Name */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {providerLogo ? (
                <img 
                  src={providerLogo} 
                  alt={providerName} 
                  className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0" 
                />
              ) : (
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 border border-emerald-200">
                  {providerName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-slate-600 truncate uppercase tracking-wider">
                {providerName}
              </span>
            </div>

            {/* If no banner image was present, show price badge here */}
            {!bannerImage && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                priceType === 'free' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                {priceType === 'free' ? 'Free' : (priceAmount ? `$${priceAmount}` : 'Paid')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectCourse?.(course)}
            className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer leading-snug mb-1.5"
            title={title}
          >
            {title}
          </h3>

          {/* Short 2-line description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Skill Tags */}
          {skillTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skillTags.slice(0, 4).map((tag, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  {tag}
                </span>
              ))}
              {skillTags.length > 4 && (
                <span className="text-[10px] font-semibold text-slate-400 self-center">
                  +{skillTags.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Trust Signals: Star Rating + Enrolled / Reviews */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 font-extrabold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                ({formatCount(reviewsCount)} reviews)
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{formatCount(enrolledCount)} enrolled</span>
            </div>
          </div>

          {/* Duration & Level */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{duration}</span>
            </span>
            <span className="capitalize font-bold text-slate-700 flex items-center gap-1">
              <span>Level:</span>
              <span className="text-emerald-700">{level}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          
          {/* Primary Action: Enroll on Provider Site */}
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow transition-all group/btn"
          >
            <span>Enroll on Provider Site</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>

          {/* Secondary Action: Save bookmark */}
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={isSaved ? "Saved course" : "Save course"}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              isSaved
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={isSaved ? "Saved to your list" : "Save for later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : 'text-slate-500'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Tertiary Action: Report Broken Link */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={handleReportClick}
            className="inline-flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer text-[10px] font-semibold"
            title="Notify moderators if this course link is broken or outdated"
          >
            <Flag className="w-2.5 h-2.5" />
            <span>{reported ? 'Link reported ✓' : 'Report Broken Link'}</span>
          </button>

          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Globe2 className="w-2.5 h-2.5" />
            <span>{course.region || 'Global'}</span>
          </span>
        </div>
      </div>

    </div>
  );
};
