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
  Film,
  Sparkles,
  Flame,
  Smile,
  Check
} from 'lucide-react';
import { Story, StorySlide, StorySlideReaction, User } from '../types';

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: Story[];
  initialStoryId?: string;
  currentUser: User;
  onClose: () => void;
  onAddSlide?: () => void;
  onDeleteSlide?: (storyId: string, slideId: string) => void;
  onSelectProfile?: (authorName: string) => void;
  onReactToSlide?: (storyId: string, slideId: string, emoji: string) => void;
}

const SLIDE_DURATION_MS = 5000;
const TICK_INTERVAL_MS = 50;

// Engagement emojis
export const STORY_EMOJIS = [
  { emoji: '❤️', label: 'Heart' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '💯', label: '100' },
  { emoji: '😍', label: 'Love' },
  { emoji: '⚡', label: 'Energy' }
];

interface FloatingReactionParticle {
  id: number;
  emoji: string;
  x: number; // percentage
  size: number;
  rotation: number;
  drift: number;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialStoryId,
  currentUser,
  onClose,
  onAddSlide,
  onDeleteSlide,
  onSelectProfile,
  onReactToSlide
}) => {
  // Normalize stories so all have at least one valid slide
  const activeStories = useMemo(() => {
    return stories.filter(s => {
      const slides = s.slides || [];
      return slides.length > 0 || !!s.mediaUrl;
    }).map(s => {
      const slides: StorySlide[] = (s.slides && s.slides.length > 0)
        ? s.slides
        : [{ id: s.id, mediaUrl: s.mediaUrl, createdAt: s.createdAt, caption: '', reactions: [] }];
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
  const [showReplyToast, setShowReplyToast] = useState<string | null>(null);

  // Local state for slide reactions (keyed by slideId)
  const [slideReactionsMap, setSlideReactionsMap] = useState<Record<string, StorySlideReaction[]>>({});
  
  // Floating animation particles
  const [floatingParticles, setFloatingParticles] = useState<FloatingReactionParticle[]>([]);
  
  // Drawer / modal states
  const [showReactionsSheet, setShowReactionsSheet] = useState(false);
  const [reactionsFilter, setReactionsFilter] = useState<string>('all');
  const [showComments, setShowComments] = useState(false);
  const [storyComments, setStoryComments] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({});
  
  // Big double-tap heart indicator
  const [showBigHeart, setShowBigHeart] = useState(false);
  const lastTapRef = useRef<number>(0);

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
      setShowReactionsSheet(false);
      setShowComments(false);
    }
  }, [isOpen, initialStoryId, activeStories, currentUser.name]);

  const currentStory: Story | undefined = activeStories[storyIndex];
  const slides: StorySlide[] = currentStory?.slides || [];
  const currentSlide: StorySlide | undefined = slides[slideIndex] || slides[0];

  // Initialize or fetch current slide reactions
  const currentSlideReactions: StorySlideReaction[] = useMemo(() => {
    if (!currentSlide) return [];
    if (slideReactionsMap[currentSlide.id]) {
      return slideReactionsMap[currentSlide.id];
    }
    return currentSlide.reactions || [];
  }, [currentSlide, slideReactionsMap]);

  // Group reactions by emoji to calculate counts
  const reactionGroups = useMemo(() => {
    const groups: Record<string, { count: number; users: { name: string; avatar?: string }[] }> = {};
    for (const r of currentSlideReactions) {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, users: [] };
      }
      groups[r.emoji].count += 1;
      groups[r.emoji].users.push({ name: r.userName, avatar: r.userAvatar });
    }
    return groups;
  }, [currentSlideReactions]);

  // Set of emojis user has already reacted with on this slide
  const userReactedEmojis = useMemo(() => {
    const set = new Set<string>();
    for (const r of currentSlideReactions) {
      if (r.userId === currentUser.id || r.userName.toLowerCase() === currentUser.name.toLowerCase()) {
        set.add(r.emoji);
      }
    }
    return set;
  }, [currentSlideReactions, currentUser.id, currentUser.name]);

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
    if (!isOpen || isPaused || !currentSlide || isVideo || showReactionsSheet) return;

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
  }, [isOpen, isPaused, currentSlide, handleNext, isVideo, showReactionsSheet]);

  // Sync video play/pause
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    if (isPaused || showReactionsSheet) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, isVideo, currentSlide, showReactionsSheet]);

  // Reset video progress when changing slide
  useEffect(() => {
    setProgress(0);
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0;
      if (!isPaused && !showReactionsSheet) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentSlide, isVideo, showReactionsSheet]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        if (showReactionsSheet) {
          setShowReactionsSheet(false);
        } else {
          onClose();
        }
      } else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, showReactionsSheet]);

  // Floating particles generator
  const spawnFloatingParticles = (emoji: string) => {
    const burstCount = 5;
    const newParticles: FloatingReactionParticle[] = Array.from({ length: burstCount }).map((_, i) => ({
      id: Date.now() + Math.random() + i,
      emoji,
      x: 35 + (Math.random() * 30), // spawn near center 35%-65%
      size: 26 + (Math.random() * 16), // 26px to 42px
      rotation: (Math.random() - 0.5) * 40,
      drift: (Math.random() - 0.5) * 60
    }));

    setFloatingParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.some(n => n.id === p.id)));
    }, 1600);
  };

  // React with emoji to current slide
  const handleReactToSlide = (emoji: string) => {
    if (!currentStory || !currentSlide) return;

    const newReaction: StorySlideReaction = {
      id: `react_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      createdAt: 'Just now'
    };

    // Update local state map
    setSlideReactionsMap(prev => ({
      ...prev,
      [currentSlide.id]: [...(prev[currentSlide.id] || currentSlide.reactions || []), newReaction]
    }));

    // Trigger parent callback
    if (onReactToSlide) {
      onReactToSlide(currentStory.id, currentSlide.id, emoji);
    }

    // Trigger floating burst
    spawnFloatingParticles(emoji);

    // Toast feedback
    setShowReplyToast(`Reacted with ${emoji}!`);
    setTimeout(() => setShowReplyToast(null), 2000);
  };

  // Double tap to like with ❤️ burst
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleReactToSlide('❤️');
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !currentSlide) return;

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
    setShowReplyToast(`Reply sent to ${currentStory?.authorName}!`);
    setTimeout(() => setShowReplyToast(null), 2500);
  };

  if (!isOpen || !currentStory || !currentSlide) return null;

  const hasPrev = storyIndex > 0 || slideIndex > 0;
  const hasNext = storyIndex < activeStories.length - 1 || slideIndex < slides.length - 1;

  // Filtered reactions for the reactions sheet
  const filteredReactions = reactionsFilter === 'all'
    ? currentSlideReactions
    : currentSlideReactions.filter(r => r.emoji === reactionsFilter);

  return (
    <div 
      id="story-viewer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none"
    >
      {/* Floating CSS animation stylesheet for smooth reaction particles */}
      <style>{`
        @keyframes storyParticleFloat {
          0% {
            transform: translateY(0px) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.15) rotate(5deg);
          }
          70% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-280px) scale(1) rotate(-15deg);
            opacity: 0;
          }
        }
        .story-particle-animate {
          animation: storyParticleFloat 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform, opacity;
        }
        @keyframes heartPulseScale {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        .story-big-heart-animate {
          animation: heartPulseScale 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Top Bar Branding & Close Button */}
      <div className="fixed top-4 inset-x-4 max-w-5xl mx-auto flex items-center justify-between pointer-events-none z-50">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="font-black text-sm tracking-wide text-white bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
            <span>SkillHub</span> 
            <span className="text-emerald-400">Stories</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 ml-0.5" />
          </span>
        </div>
        <button
          id="close-story-viewer-btn"
          type="button"
          onClick={onClose}
          className="p-2.5 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-white pointer-events-auto transition hover:scale-105 border border-white/10 shadow-xl cursor-pointer"
          title="Close Stories (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container with Floating Arrow Buttons */}
      <div className="relative flex items-center justify-center w-full px-4">
        
        {/* Floating Left Chevron */}
        {hasPrev && (
          <button
            id="story-prev-arrow-btn"
            type="button"
            onClick={handlePrev}
            className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-40 hidden sm:flex items-center justify-center w-11 h-11 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full shadow-2xl transition border border-white/10 hover:scale-110 active:scale-95 cursor-pointer"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Story Window Card */}
        <div 
          id="active-story-card"
          className="relative w-full max-w-[420px] h-[720px] max-h-[90vh] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-neutral-800/80"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Section: Segmented Progress Bars & Author Details */}
          <div className="absolute top-0 inset-x-0 z-30 pt-3 px-3.5 pb-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
            
            {/* Multi-Slide Segmented Bars */}
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
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow transition cursor-pointer"
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
                    className="p-1.5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
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
                  className="p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition cursor-pointer"
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
                    className="p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden p-1.5 bg-black/40 hover:bg-black/70 rounded-full text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Content with Tap-Zones & Floating Particles Overlay */}
          <div 
            className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleDoubleTap}
          >
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

            {/* Tap Zones: Left 30% (Prev) / Right 70% (Next) */}
            <div 
              className="absolute inset-y-0 left-0 w-[30%] z-10"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Previous slide"
            />
            <div 
              className="absolute inset-y-0 right-0 w-[70%] z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Next slide"
            />

            {/* Big Heart Popup on Double-Tap */}
            {showBigHeart && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="story-big-heart-animate text-rose-500 filter drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]">
                  <Heart className="w-24 h-24 fill-current stroke-white stroke-[1.5]" />
                </div>
              </div>
            )}

            {/* Floating Reaction Particles Burst Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              {floatingParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute bottom-16 story-particle-animate select-none pointer-events-none"
                  style={{
                    left: `${particle.x}%`,
                    fontSize: `${particle.size}px`,
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'
                  }}
                >
                  {particle.emoji}
                </div>
              ))}
            </div>

            {/* Slide Caption Banner */}
            {currentSlide.caption && (
              <div className="absolute bottom-28 inset-x-4 z-20 pointer-events-none flex justify-center">
                <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs font-semibold text-center max-w-[90%] shadow-lg">
                  {currentSlide.caption}
                </div>
              </div>
            )}

            {/* Reactions Summary Pill on Slide (Click to view breakdown) */}
            {currentSlideReactions.length > 0 && (
              <div className="absolute bottom-20 left-4 z-20 flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                    setShowReactionsSheet(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-black/60 hover:bg-black/85 backdrop-blur-md rounded-full border border-white/15 text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
                  title="View slide reactions"
                >
                  <div className="flex items-center -space-x-1">
                    {Object.keys(reactionGroups).slice(0, 3).map((emoji) => (
                      <span key={emoji} className="text-xs group-hover:scale-110 transition-transform">
                        {emoji}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-white ml-0.5">
                    {currentSlideReactions.length}
                  </span>
                  <span className="text-[10px] text-neutral-300 font-semibold hidden sm:inline">
                    {currentSlideReactions.length === 1 ? 'reaction' : 'reactions'}
                  </span>
                </button>
              </div>
            )}

            {/* Reply Toast Notification */}
            {showReplyToast && (
              <div className="absolute top-20 inset-x-4 z-40 flex justify-center animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
                <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 border border-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{showReplyToast}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Quick Reaction Strip & Interactive Form */}
          <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10 space-y-2.5">
            
            {/* Quick Emoji Reactions Bar (Heart, Clap, Fire, Rocket, Party, 100, Love, Energy) */}
            <div className="flex items-center justify-between px-1.5 py-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              {STORY_EMOJIS.map(({ emoji, label }) => {
                const count = reactionGroups[emoji]?.count || 0;
                const hasReacted = userReactedEmojis.has(emoji);

                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReactToSlide(emoji)}
                    className={`relative p-1.5 rounded-xl transition-all transform hover:scale-135 active:scale-90 flex flex-col items-center justify-center cursor-pointer ${
                      hasReacted 
                        ? 'bg-white/15 scale-105 ring-1 ring-emerald-400/50' 
                        : 'hover:bg-white/10'
                    }`}
                    title={`React ${label} ${emoji}`}
                  >
                    <span className="text-xl sm:text-2xl filter drop-shadow">
                      {emoji}
                    </span>
                    {count > 0 && (
                      <span className="text-[9px] font-black text-neutral-300 mt-0.5 leading-none">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Reply Input Form & Reactions Sheet Toggle */}
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder={`Reply to ${currentStory.authorName}...`}
                className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-emerald-400 rounded-full px-4 py-2 text-xs text-white placeholder:text-neutral-400 focus:outline-none transition font-medium"
              />

              {replyText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-emerald-500 text-slate-950 rounded-full hover:bg-emerald-400 transition hover:scale-105 active:scale-95 font-bold cursor-pointer shrink-0"
                  title="Send Reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReactToSlide('❤️')}
                  className={`p-2.5 rounded-full transition flex items-center justify-center cursor-pointer shrink-0 ${
                    userReactedEmojis.has('❤️')
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="React Heart"
                >
                  <Heart className={`w-4 h-4 ${userReactedEmojis.has('❤️') ? 'fill-current' : ''}`} />
                </button>
              )}

              {/* View Reactions Breakdown Sheet Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsPaused(true);
                  setShowReactionsSheet(s => !s);
                  setShowComments(false);
                }}
                className={`p-2.5 rounded-full transition cursor-pointer relative shrink-0 ${
                  showReactionsSheet 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="View Reactions"
              >
                <Smile className="w-4 h-4" />
                {currentSlideReactions.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black">
                    {currentSlideReactions.length > 9 ? '9+' : currentSlideReactions.length}
                  </span>
                )}
              </button>

              {/* View Comments Toggle */}
              <button
                type="button"
                onClick={() => {
                  setShowComments(s => !s);
                  setShowReactionsSheet(false);
                }}
                className={`p-2.5 rounded-full transition cursor-pointer shrink-0 ${
                  showComments 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="View Replies & Inquiries"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </form>

            {/* Slide-out Reactions Breakdown Sheet */}
            {showReactionsSheet && (
              <div className="p-3 bg-neutral-900/95 border border-white/15 rounded-2xl max-h-48 overflow-y-auto space-y-2.5 animate-in fade-in duration-150 backdrop-blur-md">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Slide Reactions</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {currentSlideReactions.length} total
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReactionsSheet(false)}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter Tabs by Reaction Emoji */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setReactionsFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition shrink-0 cursor-pointer ${
                      reactionsFilter === 'all'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    All ({currentSlideReactions.length})
                  </button>
                  {Object.entries(reactionGroups).map(([emoji, group]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setReactionsFilter(emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition shrink-0 cursor-pointer ${
                        reactionsFilter === emoji
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{group.count}</span>
                    </button>
                  ))}
                </div>

                {/* List of reacting users */}
                <div className="space-y-1.5">
                  {filteredReactions.length === 0 ? (
                    <p className="text-[11px] text-neutral-500 text-center py-3 font-semibold">
                      No reactions in this category yet.
                    </p>
                  ) : (
                    filteredReactions.map((r) => (
                      <div 
                        key={r.id} 
                        className="bg-black/60 p-2 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                          />
                          <span className="font-bold text-white text-xs truncate">
                            {r.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-neutral-500">
                            {r.createdAt}
                          </span>
                          <span className="text-base">
                            {r.emoji}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Slide-out Replies & Comments Drawer */}
            {showComments && (
              <div className="p-3 bg-neutral-900/95 border border-white/15 rounded-2xl max-h-40 overflow-y-auto space-y-1.5 animate-in fade-in backdrop-blur-md">
                <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] font-bold text-neutral-400">
                  <span>Replies & Inquiries</span>
                  <span>{(storyComments[currentSlide.id] || []).length} total</span>
                </div>
                {(storyComments[currentSlide.id] || []).length === 0 ? (
                  <p className="text-[11px] text-neutral-500 text-center py-2 font-medium">
                    No text replies yet. Send an inquiry!
                  </p>
                ) : (
                  (storyComments[currentSlide.id] || []).map(c => (
                    <div key={c.id} className="bg-black/50 p-2 rounded-lg text-xs flex justify-between gap-2">
                      <div>
                        <span className="font-bold text-emerald-400 block text-[11px]">{c.author}</span>
                        <p className="text-neutral-200 text-[11px] leading-relaxed">{c.text}</p>
                      </div>
                      <span className="text-[9px] text-neutral-500 shrink-0">{c.time}</span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

        {/* Floating Right Chevron */}
        {hasNext && (
          <button
            id="story-next-arrow-btn"
            type="button"
            onClick={handleNext}
            className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-40 hidden sm:flex items-center justify-center w-11 h-11 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full shadow-2xl transition border border-white/10 hover:scale-110 active:scale-95 cursor-pointer"
            title="Next Slide (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

      </div>
    </div>
  );
};
