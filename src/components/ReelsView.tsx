import React, { useState, useEffect, useMemo } from 'react';
import { Reel, User, ChatConversation, SocialPost } from '../types';
import { FileUploadWithScan } from './FileUploadWithScan';
import { ReelCard } from './ReelCard';
import { CommentDrawer, CommentItem } from './CommentDrawer';
import { ShareModal } from './ShareModal';
import { 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  FolderGit2,
  Film,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const REEL_CATEGORY_TABS = [
  { id: 'for_you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'web_dev', label: 'Web & Dev' },
  { id: 'design', label: 'Design' },
  { id: 'trades', label: 'Trades' },
  { id: 'tutoring', label: 'Tutoring' },
  { id: 'trending', label: 'Trending' }
];

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  conversations: ChatConversation[];
  onOpenDirectChat: (participantName: string) => void;
  onAddReel: (newReel: Reel) => void;
  onAddSocialPost: (post: SocialPost) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onNavigateView: (view: any) => void;
  onOpenProfile?: (user: Partial<User>) => void;
  onHirePro?: (creator: any) => void;
  onDeleteReel?: (reelId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ 
  reels, 
  currentUser,
  conversations,
  onOpenDirectChat, 
  onAddReel,
  onAddSocialPost,
  onSendMessage,
  onNavigateView,
  onOpenProfile,
  onHirePro,
  onDeleteReel
}) => {
  // Read initial category from URL if present (e.g. ?category=web_dev)
  const getInitialCategory = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) return cat.replace('-', '_');
    }
    return 'for_you';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getInitialCategory());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoErrorMap, setVideoErrorMap] = useState<Record<string, boolean>>({});

  // Interactive Reel state maps
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({ reel_1: true });
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({
    reel_1: 428,
    reel_2: 615,
    reel_3: 345,
    reel_4: 289,
    reel_5: 512
  });
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({ reel_2: true });

  // Comments per reel
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({
    reel_1: [
      { id: 'rc_1', authorName: 'Elena Rostova', authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', text: 'Immaculate React architecture Sarah! What state management library did you use for this?', timestamp: '10m ago' },
      { id: 'rc_2', authorName: 'David Kim', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', text: 'Clean sub-millisecond database queries. Excellent work!', timestamp: '1h ago' }
    ],
    reel_2: [
      { id: 'rc_3', authorName: 'Sarah Chen', authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', text: 'The dark-mode tokens and accessibility contrast are spot on. Loving this design system.', timestamp: '30m ago' }
    ],
    reel_3: [
      { id: 'rc_4', authorName: 'Thando Mzobe', authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', text: 'Clean inverter cable routing Michael! That CAD blueprint looks rock solid.', timestamp: '2h ago' }
    ]
  });

  // Modal Control States
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);
  const [reelToDelete, setReelToDelete] = useState<string | null>(null);

  // New Reel / Showcase Form State
  const [newReelVideoUrl, setNewReelVideoUrl] = useState('');
  const [newReelCaption, setNewReelCaption] = useState('');
  const [newReelSkills, setNewReelSkills] = useState('React, TypeScript, Node.js');
  const [newReelCategory, setNewReelCategory] = useState<'web_dev' | 'design' | 'trades' | 'tutoring'>('web_dev');
  const [newReelIsPortfolio, setNewReelIsPortfolio] = useState(true);
  const [newReelAudioTrack, setNewReelAudioTrack] = useState('');

  // Filter reels based on selected category tab
  const filteredReels = useMemo(() => {
    if (selectedCategory === 'for_you' || selectedCategory === 'trending') {
      return reels;
    }
    if (selectedCategory === 'following') {
      return reels.slice(0, 3);
    }
    return reels.filter(r => {
      if (!r.category) return true;
      return r.category.toLowerCase().replace('-', '_') === selectedCategory;
    });
  }, [reels, selectedCategory]);

  // Reset current index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const activeReel = filteredReels[currentIndex] || filteredReels[0] || reels[0];

  const handleToggleLike = (reelId: string) => {
    const currentlyLiked = !!likedMap[reelId];
    setLikedMap(prev => ({ ...prev, [reelId]: !currentlyLiked }));
    setLikesCountMap(prev => ({
      ...prev,
      [reelId]: currentlyLiked ? (prev[reelId] || 0) - 1 : (prev[reelId] || 0) + 1
    }));
  };

  const handleToggleBookmark = (reelId: string) => {
    const currentlySaved = !!bookmarkedMap[reelId];
    setBookmarkedMap(prev => ({ ...prev, [reelId]: !currentlySaved }));
    setShareSuccessToast(currentlySaved ? 'Removed from saved showcases.' : 'Saved to your portfolio bookmarks! 🔖');
    setTimeout(() => setShareSuccessToast(null), 3000);
  };

  const handleAddComment = (text: string) => {
    if (!activeReel) return;
    const newComment: CommentItem = {
      id: `rc_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text,
      timestamp: 'Just now'
    };
    setCommentsMap(prev => ({
      ...prev,
      [activeReel.id]: [newComment, ...(prev[activeReel.id] || [])]
    }));
  };

  const handleShareToFeed = () => {
    if (!activeReel) return;
    const feedPost: SocialPost = {
      id: `post_from_reel_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location,
      createdAt: 'Just now',
      content: `Check out this verified skill showcase by ${activeReel.authorName}: "${activeReel.caption}"`,
      hashtags: ['SkillShowcase', 'HireGlobal'],
      mediaType: 'video',
      mediaUrl: activeReel.videoUrl,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    onAddSocialPost(feedPost);
    setIsShareModalOpen(false);
    setShareSuccessToast('Showcase re-posted to your community feed! 🌟');
    setTimeout(() => setShareSuccessToast(null), 3500);
  };

  const handleShareInChat = (conversation: ChatConversation) => {
    if (!activeReel) return;
    const shareText = `Check out this skill showcase by ${activeReel.authorName}: "${activeReel.caption}" 📹 ${window.location.origin}/?reel=${activeReel.id}`;
    onSendMessage(conversation.id, shareText);
    setIsShareModalOpen(false);
    setShareSuccessToast(`Showcase sent directly to ${conversation.participantName}!`);
    setTimeout(() => setShareSuccessToast(null), 3000);
  };

  const handlePublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelVideoUrl.trim()) {
      alert('Please upload a video or provide a valid video link.');
      return;
    }

    const skillsArray = newReelSkills.split(',').map(s => s.trim()).filter(Boolean);

    const newReelItem: Reel = {
      id: `reel_${Date.now()}`,
      authorName: currentUser.name,
      authorHandle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location || 'Johannesburg, South Africa',
      authorRating: currentUser.rating || 4.95,
      authorVerified: true,
      authorHourlyRate: currentUser.hourlyRate || '$65/hr',
      caption: newReelCaption || 'New verified portfolio skill showcase! 🚀 #SkillHub',
      videoUrl: newReelVideoUrl,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      audioTrack: newReelAudioTrack || `Original Showcase Audio - ${currentUser.name}`,
      tags: skillsArray,
      skills: skillsArray,
      category: newReelCategory,
      isPortfolioPiece: newReelIsPortfolio,
      viewsCount: 1
    };

    onAddReel(newReelItem);
    setIsCreateReelOpen(false);
    setNewReelVideoUrl('');
    setNewReelCaption('');
    setNewReelAudioTrack('');
    setShareSuccessToast('Your Skill Showcase has been published globally! 🚀');
    setTimeout(() => setShareSuccessToast(null), 3500);
  };

  const handleHireCreator = (reel: Reel) => {
    if (onHirePro) {
      onHirePro({
        id: `pro_${reel.authorName.toLowerCase().replace(/\s+/g, '_')}`,
        name: reel.authorName,
        username: reel.authorHandle.replace('@', ''),
        avatar: reel.authorAvatar,
        primarySkill: reel.skills?.[0] || 'Professional Specialist',
        location: reel.authorLocation || 'Global',
        hourlyRate: reel.authorHourlyRate || '$75/hr',
        rating: reel.authorRating || 4.95
      });
    } else {
      onOpenDirectChat(reel.authorName);
    }
  };

  const handleViewProfile = (reel: Reel) => {
    const creatorToView: Partial<User> = {
      id: `user_${reel.authorName.toLowerCase().replace(/\s+/g, '_')}`,
      name: reel.authorName,
      handle: reel.authorHandle,
      avatar: reel.authorAvatar,
      location: reel.authorLocation || 'Global',
      rating: reel.authorRating || 4.95,
      hourlyRate: reel.authorHourlyRate || '$75/hr',
      primarySkill: reel.skills?.[0] || 'Verified Specialist',
      title: reel.skills?.[0] || 'Verified Specialist',
      skills: reel.skills || ['FullStack', 'Design'],
      verified: true
    };
    if (onOpenProfile) {
      onOpenProfile(creatorToView);
    } else {
      onNavigateView('profile');
    }
  };

  const handleConfirmDelete = () => {
    if (!reelToDelete) return;
    if (onDeleteReel) {
      onDeleteReel(reelToDelete);
    }
    // Update active index if needed
    if (currentIndex >= filteredReels.length - 1) {
      setCurrentIndex(Math.max(0, filteredReels.length - 2));
    }
    setReelToDelete(null);
    setShareSuccessToast('Showcase removed from the reels feed.');
    setTimeout(() => setShareSuccessToast(null), 3000);
  };

  const currentComments = commentsMap[activeReel?.id] || [];

  return (
    <div className="max-w-5xl mx-auto py-2 min-h-[calc(100vh-60px)] flex flex-col justify-start items-center relative select-none">
      
      {/* 1. Category Filter Tabs at the Top */}
      <div className="w-full max-w-xl px-4 pb-3 flex items-center justify-center">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur-md shadow-lg">
          {REEL_CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md scale-102'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating "Post a Reel" Button */}
      <div className="fixed bottom-6 left-20 lg:left-72 z-40">
        <button
          type="button"
          onClick={() => setIsCreateReelOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/50 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Post Showcase</span>
        </button>
      </div>

      {/* Share Toast Notification */}
      {shareSuccessToast && (
        <div className="fixed top-20 z-50 bg-emerald-500 text-slate-950 px-5 py-2.5 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{shareSuccessToast}</span>
        </div>
      )}

      {/* Main Reels Center Display with Up/Down Arrows */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 w-full my-auto">
        
        {/* Main Reel Card */}
        {activeReel ? (
          <ReelCard
            reel={activeReel}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            isLiked={!!likedMap[activeReel.id]}
            likesCount={likesCountMap[activeReel.id] || activeReel.likesCount}
            onToggleLike={() => handleToggleLike(activeReel.id)}
            isBookmarked={!!bookmarkedMap[activeReel.id]}
            onToggleBookmark={() => handleToggleBookmark(activeReel.id)}
            commentsCount={currentComments.length + activeReel.commentsCount}
            onOpenComments={() => setIsCommentsOpen(true)}
            onOpenShare={() => setIsShareModalOpen(true)}
            onHireCreator={() => handleHireCreator(activeReel)}
            onViewProfile={() => handleViewProfile(activeReel)}
            videoError={!!videoErrorMap[activeReel.id]}
            onVideoError={() => setVideoErrorMap(prev => ({ ...prev, [activeReel.id]: true }))}
            onDeleteReel={(reelId) => setReelToDelete(reelId)}
            canDelete={true}
          />
        ) : (
          <div className="w-full max-w-[420px] h-[600px] bg-[#1a1a1a] rounded-3xl border border-neutral-800 flex flex-col items-center justify-center p-8 text-center space-y-3 text-white">
            <Film className="w-12 h-12 text-neutral-600 mb-1" />
            <h3 className="font-black text-base">No showcases in this category yet</h3>
            <p className="text-xs text-neutral-400">
              Be the first verified professional to showcase your work here!
            </p>
            <button
              onClick={() => setIsCreateReelOpen(true)}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl mt-2"
            >
              Post a Showcase
            </button>
          </div>
        )}

        {/* Vertical Up / Down Navigation Controls */}
        {filteredReels.length > 1 && (
          <div className="hidden sm:flex flex-col items-center gap-2 bg-[#1e1e1e]/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-800 shadow-xl shrink-0">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredReels.length - 1))}
              className="p-2.5 bg-[#121212] hover:bg-emerald-500 hover:text-slate-950 text-white border border-neutral-700/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md"
              title="Previous Showcase"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center justify-center text-center px-1 py-1">
              <span className="text-[11px] font-black text-emerald-400 leading-tight">
                {currentIndex + 1}
              </span>
              <span className="text-[10px] font-extrabold text-neutral-500">
                / {filteredReels.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev < filteredReels.length - 1 ? prev + 1 : 0))}
              className="p-2.5 bg-[#121212] hover:bg-emerald-500 hover:text-slate-950 text-white border border-neutral-700/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md"
              title="Next Showcase"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>

      {/* Comment Drawer Component */}
      <CommentDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        comments={currentComments}
        currentUser={currentUser}
        onAddComment={handleAddComment}
      />

      {/* Share Modal Component */}
      {activeReel && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reel={activeReel}
          conversations={conversations}
          onShareToFeed={handleShareToFeed}
          onShareInChat={handleShareInChat}
        />
      )}

      {/* 4. "Post a Reel / Showcase" Modal (For Logged-in Professionals) */}
      {isCreateReelOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-neutral-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black text-white">Post Skill Showcase</h3>
                <p className="text-xs text-neutral-400">Highlight your client deliverables, demos, and trade expertise</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateReelOpen(false)} 
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishReel} className="space-y-3.5">
              
              {/* Video upload with virus scan */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Video File (Auto Malware Scanned)
                </label>
                <FileUploadWithScan
                  label="Select MP4 / WebM File"
                  onFileSelect={(url) => setNewReelVideoUrl(url)}
                />
              </div>

              <div className="text-[10px] font-black text-neutral-500 text-center uppercase tracking-wider">
                OR PASTE DIRECT MP4 VIDEO URL
              </div>

              <div>
                <input
                  type="url"
                  placeholder="https://assets.mixkit.co/... or direct video link"
                  value={newReelVideoUrl}
                  onChange={(e) => setNewReelVideoUrl(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Professional Caption & Client Context
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Just deployed a full-stack e-commerce app for a UK client. Check out the dashboard! 🚀 #React #WebDev"
                  value={newReelCaption}
                  onChange={(e) => setNewReelCaption(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Showcased Skills (comma-separated tags)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, AWS"
                  value={newReelSkills}
                  onChange={(e) => setNewReelSkills(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Category Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Category</label>
                  <select
                    value={newReelCategory}
                    onChange={(e) => setNewReelCategory(e.target.value as any)}
                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="web_dev">Web & Dev</option>
                    <option value="design">Design</option>
                    <option value="trades">Trades</option>
                    <option value="tutoring">Tutoring</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Audio Track Title</label>
                  <input
                    type="text"
                    placeholder={`Original Showcase - ${currentUser.name}`}
                    value={newReelAudioTrack}
                    onChange={(e) => setNewReelAudioTrack(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* "This is a portfolio piece" Toggle */}
              <div className="p-3 bg-[#121212] rounded-xl border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Verified Portfolio Piece</span>
                    <span className="text-[10px] text-neutral-400">Display this video on your public profile case studies</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newReelIsPortfolio}
                  onChange={(e) => setNewReelIsPortfolio(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-900 border-neutral-700 cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateReelOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Publish Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove / Delete Showcase Confirmation Modal */}
      {reelToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Remove Showcase</h3>
                <p className="text-xs text-neutral-400">Feed curation & cleanup</p>
              </div>
            </div>
            
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to remove this skill showcase from the reels feed? This action will immediately remove the video from the active carousel.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReelToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-950/40 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Reel</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
