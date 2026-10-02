import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Send, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  MessageCircle,
  Volume2,
  VolumeX,
  Film
} from 'lucide-react';
import { Story, StorySlide, User } from '../types';

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: Story[];
  initialStoryId?: string;
  currentUser: User;
  onClose: () => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (storyId: string, slideId: string) => void;
  onSelectProfile?: (authorName: string) => void;
}

const SLIDE_DURATION_MS = 5000;
const TICK_INTERVAL_MS = 50;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialStoryId,
  currentUser,
  onClose,
  onAddSlide,
  onDeleteSlide,
  onSelectProfile
}) => {
  // Normalize stories so all have at least one valid slide
  const activeStories = useMemo(() => {
    return stories.filter(s => {
      const slides = s.slides || [];
      return slides.length > 0 || !!s.mediaUrl;
    }).map(s => {
      const slides: StorySlide[] = (s.slides && s.slides.length > 0)
        ? s.slides
        : [{ id: s.id, mediaUrl: s.mediaUrl, createdAt: s.createdAt, caption: '' }];
      return {
        ...s,
        slides
      };
    });
  }, [stories]);

  const [storyIndex, setStoryIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyToast, setShowReplyToast] = useState(false);
  const [storyLikes, setStoryLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [showComments, setShowComments] = useState(false);
  const [storyComments, setStoryComments] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync initial story when opening
  useEffect(() => {
    if (isOpen && activeStories.length > 0) {
      if (initialStoryId) {
        const idx = activeStories.findIndex(s => s.id === initialStoryId || (initialStoryId === 'story_me' && (s.authorName === 'Your Story' || s.authorName.toLowerCase() === currentUser.name.toLowerCase())));
        if (idx >= 0) {
          setStoryIndex(idx);
        } else {
          setStoryIndex(0);
        }
      } else {
        setStoryIndex(0);
      }
      setSlideIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialStoryId, activeStories, currentUser.name]);

  const currentStory: Story | undefined = activeStories[storyIndex];
  const slides: StorySlide[] = currentStory?.slides || [];
  const currentSlide: StorySlide | undefined = slides[slideIndex] || slides[0];

  const isVideo = useMemo(() => {
    if (!currentSlide?.mediaUrl) return false;
    const url = currentSlide.mediaUrl.trim().toLowerCase();
    return url.startsWith('data:video') ||
           url.startsWith('blob:') ||
           url.includes('.mp4') ||
           url.includes('.webm') ||
           url.includes('.mov') ||
           url.includes('.mkv') ||
           url.includes('.avi') ||
           url.includes('/video/') ||
           url.includes('video');
  }, [currentSlide]);

  const isMyStory = useMemo(() => {
    if (!currentStory) return false;
    return currentStory.authorName === 'Your Story' || 
      currentStory.authorName.toLowerCase() === currentUser.name.toLowerCase();
  }, [currentStory, currentUser.name]);

  // Navigate forward
  const handleNext = useCallback(() => {
    if (!currentStory) return;
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
      setProgress(0);
    } else if (storyIndex < activeStories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setSlideIndex(0);
      setProgress(0);
    } else {
      // Last slide of last story -> close viewer
      onClose();
    }
  }, [slideIndex, slides.length, storyIndex, activeStories.length, currentStory, onClose]);

  // Navigate backward
  const handlePrev = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex(prev => prev - 1);
      setProgress(0);
    } else if (storyIndex > 0) {
      const prevStory = activeStories[storyIndex - 1];
      const prevSlides = prevStory?.slides || [];
      setStoryIndex(prev => prev - 1);
      setSlideIndex(Math.max(0, prevSlides.length - 1));
      setProgress(0);
    }
  }, [slideIndex, storyIndex, activeStories]);

  // Timer progression effect (for static images; videos use onTimeUpdate & onEnded)
  useEffect(() => {
    if (!isOpen || isPaused || !currentSlide || isVideo) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const step = (TICK_INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        if (prev + step >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentSlide, handleNext, isVideo]);

  // Sync video play/pause
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, isVideo, currentSlide]);

  // Reset video progress when changing slide
  useEffect(() => {
    setProgress(0);
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      if (!isPaused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentSlide, isVideo]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || !currentStory || !currentSlide) return null;

  const currentLike = storyLikes[currentSlide.id] || { count: 6, isLiked: false };

  const handleToggleLike = () => {
    setStoryLikes(prev => ({
      ...prev,
      [currentSlide.id]: {
        count: currentLike.isLiked ? currentLike.count - 1 : currentLike.count + 1,
        isLiked: !currentLike.isLiked
      }
    }));
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    const comment = {
      id: `sc_${Date.now()}`,
      author: currentUser.name,
      text: replyText.trim(),
      time: 'Just now'
    };

    setStoryComments(prev => ({
      ...prev,
      [currentSlide.id]: [...(prev[currentSlide.id] || []), comment]
    }));

    setReplyText('');
    setShowReplyToast(true);
    setTimeout(() => setShowReplyToast(false), 2500);
  };

  const handleQuickReaction = (emoji: string) => {
    const comment = {
      id: `sc_${Date.now()}`,
      author: currentUser.name,
      text: emoji,
      time: 'Just now'
    };

    setStoryComments(prev => ({
      ...prev,
      [currentSlide.id]: [...(prev[currentSlide.id] || []), comment]
    }));

    setShowReplyToast(true);
    setTimeout(() => setShowReplyToast(false), 2000);
  };

  const hasPrev = storyIndex > 0 || slideIndex > 0;
  const hasNext = storyIndex < activeStories.length - 1 || slideIndex < slides.length - 1;

  return (
    <div 
      id="story-viewer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none"
    >
      {/* Top Bar Branding & Close Button */}
      <div className="fixed top-4 inset-x-4 max-w-5xl mx-auto flex items-center justify-between pointer-events-none z-50">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-black text-sm tracking-wide text-white bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
            SkillHub <span className="text-emerald-400">Stories</span>
          </span>
        </div>
        <button
          id="close-story-viewer-btn"
          type="button"
          onClick={onClose}
          className="p-2.5 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-white pointer-events-auto transition hover:scale-105 border border-white/10"
          title="Close Stories (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container with Instagram Desktop Style Floating Arrows */}
      <div className="relative flex items-center justify-center w-full px-4">
        
        {/* Floating Left Chevron (Previous Slide / Story) */}
        {hasPrev && (
          <button
            id="story-prev-arrow-btn"
            type="button"
            onClick={handlePrev}
            className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-40 hidden sm:flex items-center justify-center w-11 h-11 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full shadow-2xl transition border border-white/10 hover:scale-110 active:scale-95"
            title="Previous Story (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Story Window Card */}
        <div 
          id="active-story-card"
          className="relative w-full max-w-[420px] h-[680px] max-h-[88vh] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800/80"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Section: Segmented Progress Bars & Author Details */}
          <div className="absolute top-0 inset-x-0 z-30 pt-3 px-3.5 pb-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
            
            {/* Multi-Slide Segmented Bars (Instagram Style) */}
            <div className="flex items-center gap-1.5 w-full mb-3">
              {slides.map((slide, idx) => {
                let fillPercent = 0;
                if (idx < slideIndex) fillPercent = 100;
                else if (idx === slideIndex) fillPercent = progress;

                return (
                  <div 
                    key={slide.id || idx}
                    className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideIndex(idx);
                      setProgress(0);
                    }}
                    title={`Slide ${idx + 1} of ${slides.length}`}
                  >
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Author Info Bar */}
            <div className="flex items-center justify-between text-white">
              <div 
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition group"
                onClick={() => {
                  if (onSelectProfile) {
                    onClose();
                    onSelectProfile(currentStory.authorName);
                  }
                }}
              >
                <img 
                  src={currentStory.authorAvatar} 
                  alt={currentStory.authorName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white group-hover:underline">
                      {isMyStory ? 'Your Story' : currentStory.authorName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {currentSlide.createdAt || currentStory.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {slideIndex + 1} / {slides.length} {slides.length > 1 ? 'slides' : 'slide'}
                    </span>
                    {isVideo && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Film className="w-3 h-3 text-amber-400" /> Video
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-1.5">
                {/* Add Slide button if it's the user's story */}
                {isMyStory && onAddSlide && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPaused(true);
                      onAddSlide();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow transition"
                    title="Add another slide to your story"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Slide</span>
                  </button>
                )}

                {/* Delete Slide Button if it's the user's story */}
                {isMyStory && onDeleteSlide && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this slide from your story?')) {
                        onDeleteSlide(currentStory.id, currentSlide.id);
                        if (slides.length <= 1) {
                          onClose();
                        } else {
                          handlePrev();
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-lg transition"
                    title="Delete this slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Pause / Play Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(p => !p);
                  }}
                  className="p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition"
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
                </button>

                {/* Video Mute Toggle */}
                {isVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(m => !m);
                    }}
                    className="p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Content with Tap-Zones */}
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentSlide.mediaUrl}
                autoPlay
                playsInline
                muted={isMuted}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration && !isNaN(v.duration) && v.duration > 0) {
                    setProgress((v.currentTime / v.duration) * 100);
                  }
                }}
                onEnded={handleNext}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentSlide.mediaUrl}
                alt={`${currentStory.authorName}'s story`}
                className="w-full h-full object-cover"
              />
            )}

            {/* Invisible Tap Zones: Left 35% (Prev) / Right 65% (Next) */}
            <div 
              className="absolute inset-y-0 left-0 w-[35%] z-10 cursor-pointer"
              onClick={handlePrev}
              title="Previous slide"
            />
            <div 
              className="absolute inset-y-0 right-0 w-[65%] z-10 cursor-pointer"
              onClick={handleNext}
              title="Next slide"
            />

            {/* Optional Slide Caption Banner */}
            {currentSlide.caption && (
              <div className="absolute bottom-24 inset-x-4 z-20 pointer-events-none flex justify-center">
                <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs font-semibold text-center max-w-[90%] shadow-lg">
                  {currentSlide.caption}
                </div>
              </div>
            )}

            {/* Reply Toast Notification */}
            {showReplyToast && (
              <div className="absolute top-20 inset-x-4 z-40 flex justify-center animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
                <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5">
                  <span>✓ Reaction sent to {currentStory.authorName}!</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Reply Input, Likes & Quick Reactions */}
          <div className="relative z-30 p-3.5 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/10 space-y-2">
            
            {/* Emoji Quick Reactions Strip */}
            <div className="flex items-center justify-around px-1 py-1">
              {['🔥', '❤️', '👏', '🚀', '💯', '✨'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleQuickReaction(emoji)}
                  className="text-lg hover:scale-130 active:scale-95 transition-transform"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Reply Input Form & Heart Like Button */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder={`Reply to ${currentStory.authorName}...`}
                className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-emerald-400 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-neutral-400 focus:outline-none transition"
              />

              {replyText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-emerald-500 text-slate-950 rounded-full hover:bg-emerald-400 transition hover:scale-105 active:scale-95 font-bold"
                  title="Send Reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition flex items-center gap-1.5"
                  title="Like this story"
                >
                  <Heart 
                    className={`w-5 h-5 transition-transform ${
                      currentLike.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white hover:text-rose-400'
                    }`} 
                  />
                  <span className="text-xs font-bold">{currentLike.count}</span>
                </button>
              )}

              {/* View Comments Toggle */}
              <button
                type="button"
                onClick={() => setShowComments(s => !s)}
                className={`p-2.5 rounded-full transition ${showComments ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                title="View Comments"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </form>

            {/* Slide-out Comments Drawer */}
            {showComments && (
              <div className="mt-2 p-2.5 bg-neutral-900/95 border border-white/10 rounded-2xl max-h-36 overflow-y-auto space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] font-bold text-neutral-400">
                  <span>Comments & Reactions</span>
                  <span>{(storyComments[currentSlide.id] || []).length} total</span>
                </div>
                {(storyComments[currentSlide.id] || []).length === 0 ? (
                  <p className="text-[11px] text-neutral-500 text-center py-2">No reactions yet. Be the first!</p>
                ) : (
                  (storyComments[currentSlide.id] || []).map(c => (
                    <div key={c.id} className="bg-black/50 p-1.5 rounded-lg text-xs flex justify-between gap-2">
                      <div>
                        <span className="font-bold text-emerald-400 block text-[11px]">{c.author}</span>
                        <p className="text-neutral-200 text-[11px]">{c.text}</p>
                      </div>
                      <span className="text-[9px] text-neutral-500">{c.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Right Chevron (Next Slide / Story) */}
        {hasNext && (
          <button
            id="story-next-arrow-btn"
            type="button"
            onClick={handleNext}
            className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-40 hidden sm:flex items-center justify-center w-11 h-11 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full shadow-2xl transition border border-white/10 hover:scale-110 active:scale-95"
            title="Next Story (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

      </div>
    </div>
  );
};
