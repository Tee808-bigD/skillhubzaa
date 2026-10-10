import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Globe, 
  ExternalLink, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Tag, 
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';
import { CourseLevel, CourseType, ExternalCourse, PriceType } from '../types';

interface ShareCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCourse: (course: Partial<ExternalCourse>) => void;
  currentUserName?: string;
}

const COMMON_TAG_SUGGESTIONS = [
  'Cybersecurity', 'Networking', 'CCNA', 'React', 'Python', 'JavaScript', 'SQL', 'TypeScript', 
  'Figma', 'UI/UX', 'Node.js', 'AWS', 'Data Analytics', 'Packet Tracer',
  'Machine Learning', 'SEO', 'Solar PV', 'Trades', 'Business'
];

const CATEGORIES = [
  'Cybersecurity',
  'Coding',
  'Design',
  'Data',
  'Marketing',
  'Trades',
  'Business',
  'Languages',
  'Other'
];

export const ShareCourseModal: React.FC<ShareCourseModalProps> = ({
  isOpen,
  onClose,
  onSubmitCourse,
  currentUserName = 'Community Member'
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState('Coding');
  const [courseType, setCourseType] = useState<CourseType>('course');
  const [priceType, setPriceType] = useState<PriceType>('free');
  const [priceAmount, setPriceAmount] = useState<string>('');
  const [duration, setDuration] = useState('4-8 weeks');
  const [level, setLevel] = useState<CourseLevel>('beginner');
  const [language, setLanguage] = useState('English');
  const [region, setRegion] = useState('Global');
  const [description, setDescription] = useState('');
  const [skillTags, setSkillTags] = useState<string[]>(['React', 'Coding']);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-detect provider name from URL if pasted
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setErrorMsg(null);

    const lower = newUrl.toLowerCase();
    if (!providerName || providerName === 'Coursera' || providerName === 'Udemy' || providerName === 'edX' || providerName === 'FutureLearn') {
      if (lower.includes('coursera.org')) {
        setProviderName('Coursera');
      } else if (lower.includes('udemy.com')) {
        setProviderName('Udemy');
      } else if (lower.includes('edx.org')) {
        setProviderName('edX');
      } else if (lower.includes('futurelearn.com')) {
        setProviderName('FutureLearn');
      } else if (lower.includes('freecodecamp.org')) {
        setProviderName('freeCodeCamp');
        setPriceType('free');
      } else if (lower.includes('harvard.edu')) {
        setProviderName('Harvard Online');
      } else if (lower.includes('mit.edu')) {
        setProviderName('MIT OpenCourseWare');
      } else if (lower.includes('amazon.com') || lower.includes('aws.')) {
        setProviderName('AWS Skill Builder');
      } else if (lower.includes('netacad.com') || lower.includes('cisco.com')) {
        setProviderName('Cisco Networking Academy');
        setPriceType('free');
        if (lower.includes('cybersecurity')) {
          setCategory('Cybersecurity');
        } else if (lower.includes('data')) {
          setCategory('Data');
        } else if (lower.includes('programming')) {
          setCategory('Coding');
        }
      }
    }
  };

  // Mock auto-fetch simulation to help users populate metadata
  const handleAutoFetch = () => {
    if (!url) {
      setErrorMsg('Please enter a course URL first');
      return;
    }

    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const slug = pathParts[pathParts.length - 1] || 'course';
      
      const generatedTitle = slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (!title) {
        setTitle(generatedTitle);
      }
      if (!description) {
        setDescription(`Comprehensive course covering in-demand skills hosted on ${parsed.hostname}. Verified by SkillHub community.`);
      }
    } catch {
      // Invalid URL syntax fallback
      setErrorMsg('Could not auto-fetch from URL. Please fill in the details manually.');
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags([...skillTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSkillTags(skillTags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Course URL is required');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Course title is required');
      return;
    }
    if (!providerName.trim()) {
      setErrorMsg('Provider name is required');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('A brief description is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

    const newCourseData: Partial<ExternalCourse> = {
      title: title.trim(),
      provider_name: providerName.trim(),
      external_url: formattedUrl,
      description: description.trim(),
      category,
      course_type: courseType,
      price_type: priceType,
      price_amount: priceType === 'paid' ? (parseFloat(priceAmount) || 29) : 0,
      duration: duration.trim() || 'Flexible',
      level,
      language,
      region,
      skill_tags: skillTags.length > 0 ? skillTags : [category],
      rating: 5.0,
      reviews_count: 1,
      enrolled_count: 1,
      submitted_by: 'current_user',
      submitted_by_name: currentUserName,
      is_approved: false, // Moderated by admin!
      is_flagged: false,
      banner_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    };

    setTimeout(() => {
      onSubmitCourse(newCourseData);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
        // Reset form
        setUrl('');
        setTitle('');
        setProviderName('');
        setDescription('');
        setPriceAmount('');
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Share a Course with the Community
              </h2>
              <p className="text-xs text-slate-500">
                Found a great learning program? Submit it to the global discovery catalog.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Submitted for Moderator Review!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for contributing to SkillHub. Our curation team will verify the provider details and publish it to the global directory.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Course URL (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Website URL <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required
                      placeholder="https://www.coursera.org/learn/example or udemy.com/..."
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFetch}
                    className="px-3 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Auto-detect title and provider"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-fill</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Link directly to where students explore and enroll with the external provider.
                </span>
              </div>

              {/* 2. Title & Provider Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS50 Intro to Computer Science"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coursera, edX, Udemy, MICT SETA"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* 3. Category & Course Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Program Format
                  </label>
                  <select
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value as CourseType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-800"
                  >
                    <option value="course">Standard Course</option>
                    <option value="bootcamp">Intensive Bootcamp</option>
                    <option value="certification">Professional Certification</option>
                    <option value="workshop">Short Workshop</option>
                  </select>
                </div>
              </div>

              {/* 4. Price (Free / Paid) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pricing Model
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="priceType"
                      checked={priceType === 'free'}
                      onChange={() => setPriceType('free')}
                      className="accent-emerald-600"
                    />
                    <span>Free Course / Funded</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="radio"
                      name="priceType"
                      checked={priceType === 'paid'}
                      onChange={() => setPriceType('paid')}
                      className="accent-emerald-600"
                    />
                    <span>Paid / Subscription</span>
                  </label>
                </div>

                {priceType === 'paid' && (
                  <div className="pt-2">
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Estimated amount (USD)"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Level & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevel)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 weeks, 3 months, Self-paced"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>

              {/* 6. Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide a concise 2-line summary of what learners will gain..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
                />
              </div>

              {/* 7. Skill Tags (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills Covered (Tags)
                </label>
                
                {/* Active Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skillTags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600 transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input for custom tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom skill (e.g. Docker, SEO)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                  >
                    Add
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Suggestions:</span>
                  {COMMON_TAG_SUGGESTIONS.slice(0, 7).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddTag(s)}
                      className="text-[10px] text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60 transition"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderation Notice */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Moderated Directory:</strong> SkillHub does not process payments or host courses. Submissions are reviewed by community moderators before appearing in public searches.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit for Review</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
