import React, { useState, useRef } from 'react';
import { Reel, User, ChatConversation, SocialPost } from '../types';
import { FileUploadWithScan } from './FileUploadWithScan';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Music, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp,
  Plus,
  X,
  Share2,
  Check,
  Copy,
  MapPin,
  ShieldCheck,
  Award,
  MessageSquare
} from 'lucide-react';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  conversations: ChatConversation[];
  onOpenDirectChat: (participantName: string) => void;
  onAddReel: (newReel: Reel) => void;
  onAddSocialPost: (post: SocialPost) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onNavigateView: (view: any) => void;
}

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
}

export const ReelsView: React.FC<ReelsViewProps> = ({ 
  reels, 
  currentUser,
  conversations,
  onOpenDirectChat, 
  onAddReel,
  onAddSocialPost,
  onSendMessage,
  onNavigateView
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoErrorMap, setVideoErrorMap] = useState<Record<string, boolean>>({});

  // Interactive Reel state maps
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({ reel_1: true });
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({
    reel_1: 200,
    reel_2: 345,
    reel_3: 512
  });
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({ reel_2: true });

  // Comments per reel
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({
    reel_1: [
      { id: 'rc_1', authorName: 'Sarah Molefe', authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', text: '100% truth! Hard work and skill development win every time. 🔥', timestamp: '15m ago' },
      { id: 'rc_2', authorName: 'Michael Botha', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', text: 'Great energy Mike! Keep inspiring the youth.', timestamp: '1h ago' }
    ],
    reel_2: [
      { id: 'rc_3', authorName: 'Themba Ndlovu', authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', text: 'Super helpful tip! Saving this for emergency plumbing repairs.', timestamp: '2h ago' }
    ]
  });

  // Modal Control States
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [viewingCreatorProfile, setViewingCreatorProfile] = useState<{
    name: string;
    handle: string;
    avatar: string;
    role?: string;
    location?: string;
    bio?: string;
  } | null>(null);

  // New Reel Form State
  const [newReelVideoUrl, setNewReelVideoUrl] = useState('');
  const [newReelCaption, setNewReelCaption] = useState('');
  const [newReelAudioTrack, setNewReelAudioTrack] = useState('');

  // Comment Input State
  const [commentInput, setCommentInput] = useState('');

  // Share Notification Toast State
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);

  const activeReel = reels[currentIndex] || reels[0];

  const handleToggleLike = (reelId: string) => {
    const currentlyLiked = !!likedMap[reelId];
    setLikedMap(prev => ({ ...prev, [reelId]: !currentlyLiked }));
    setLikesCountMap(prev => ({
      ...prev,
      [reelId]: currentlyLiked ? (prev[reelId] || 0) - 1 : (prev[reelId] || 0) + 1
    }));
  };

  const handleToggleBookmark = (reelId: string) => {
    setBookmarkedMap(prev => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !activeReel) return;
    const newComment: CommentItem = {
      id: `rc_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: commentInput.trim(),
      timestamp: 'Just now'
    };
    setCommentsMap(prev => ({
      ...prev,
      [activeReel.id]: [...(prev[activeReel.id] || []), newComment]
    }));
    setCommentInput('');
  };

  const handlePublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelVideoUrl.trim()) {
      alert('Please upload a video file or paste a video link.');
      return;
    }
    const newReelItem: Reel = {
      id: `reel_${Date.now()}`,
      authorName: currentUser.name,
      authorHandle: `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
      authorAvatar: currentUser.avatar,
      caption: newReelCaption || 'New SkillHub Reel 🚀 #SkillBuilding #YouthDev',
      videoUrl: newReelVideoUrl,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      audioTrack: newReelAudioTrack || `Original Audio - ${currentUser.name}`,
      tags: ['SkillHub', 'Reel']
    };
    onAddReel(newReelItem);
    setIsCreateReelOpen(false);
    setNewReelVideoUrl('');
    setNewReelCaption('');
    setNewReelAudioTrack('');
    setShareSuccessToast('Your Reel has been published successfully!');
    setTimeout(() => setShareSuccessToast(null), 3000);
  };

  const handleShareInChat = (conversation: ChatConversation) => {
    if (!activeReel) return;
    const shareText = `Check out this Reel on SkillHub by ${activeReel.authorName}: "${activeReel.caption}" 📹 ${window.location.origin}/?reel=${activeReel.id}`;
    onSendMessage(conversation.id, shareText);
    setIsShareModalOpen(false);
    setShareSuccessToast(`Shared Reel directly to ${conversation.participantName}!`);
    setTimeout(() => setShareSuccessToast(null), 3000);
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
      content: `Shared a Reel by ${activeReel.authorName}: "${activeReel.caption}"`,
      hashtags: ['ReelShare', 'SkillHub'],
      mediaType: 'video',
      mediaUrl: activeReel.videoUrl,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    };
    onAddSocialPost(feedPost);
    setIsShareModalOpen(false);
    setShareSuccessToast('Reel re-posted to your main SkillHub feed!');
    setTimeout(() => setShareSuccessToast(null), 3000);
  };

  const currentComments = commentsMap[activeReel?.id] || [];

  return (
    <div className="max-w-5xl mx-auto py-1 min-h-[calc(100vh-40px)] flex flex-col justify-center items-center relative select-none">
      
      {/* Success Notification Toast */}
      {shareSuccessToast && (
        <div className="fixed top-20 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{shareSuccessToast}</span>
        </div>
      )}

      {/* Reel & Side Controls Horizontal Wrapper */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full my-auto">

        {/* Reel Outer Card Container (Expanded long portrait video stage) */}
        <div className="w-full max-w-[400px] sm:max-w-[460px] h-[calc(100vh-50px)] min-h-[640px] max-h-[850px] bg-[#121212] rounded-3xl overflow-hidden relative shadow-2xl border border-neutral-800 flex flex-col justify-between shrink-0">
        
        {/* Video Stream Element / Fallback Poster */}
        <div className="absolute inset-0 w-full h-full bg-[#181818] flex items-center justify-center overflow-hidden">
          {videoErrorMap[activeReel?.id] ? (
            <div className="w-full h-full relative">
              <img
                src={activeReel?.authorAvatar || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
                alt=""
                className="w-full h-full object-cover filter brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center p-6 text-center text-white">
                <Music className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <span className="font-extrabold text-sm text-neutral-200">{activeReel?.audioTrack}</span>
              </div>
            </div>
          ) : (
            <video
              key={activeReel?.id}
              src={activeReel?.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => {
                if (activeReel?.id) {
                  setVideoErrorMap(prev => ({ ...prev, [activeReel.id]: true }));
                }
              }}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Top Header Overlay Bar (Sound Toggle) */}
        <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
            <Music className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SkillHub Reels</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all border border-white/10"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom Creator & Caption Info Overlay */}
        <div className="relative z-20 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white space-y-3">
          
          {/* Lower Bottom Left Add Reel Button */}
          <div className="flex items-center justify-start pb-0.5">
            <button
              onClick={() => setIsCreateReelOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Reel</span>
            </button>
          </div>

          {/* Creator Profile Info (Clickable to inspect author's profile info) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewingCreatorProfile({
                  name: activeReel.authorName,
                  handle: activeReel.authorHandle,
                  avatar: activeReel.authorAvatar,
                  role: 'Skills Creator & Youth Ambassador',
                  location: 'South Africa',
                  bio: 'Building real-world skills, sharing trades expertise, and helping South African youth grow!'
                });
              }}
              className="flex items-center gap-2.5 text-left group hover:opacity-90 transition"
              title="Click to view creator profile info"
            >
              <img
                src={activeReel.authorAvatar}
                alt={activeReel.authorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-md group-hover:scale-105 transition-all"
              />
              <div>
                <h4 className="font-extrabold text-xs text-white group-hover:underline flex items-center gap-1">
                  <span>{activeReel.authorName}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">• Profile Info</span>
                </h4>
                <p className="text-[10px] text-neutral-400 font-bold">{activeReel.authorHandle}</p>
              </div>
            </button>

            <button
              onClick={() => onOpenDirectChat(activeReel.authorName)}
              className="ml-auto px-3 py-1 bg-neutral-800/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-neutral-700 font-bold text-[11px] rounded-xl transition-all"
            >
              Message
            </button>
          </div>

          {/* Caption */}
          <p className="text-xs text-neutral-200 font-medium leading-snug line-clamp-2">
            {activeReel.caption}
          </p>

          {/* Audio Ticker */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-300">
            <Music className="w-3.5 h-3.5 animate-spin" />
            <span className="truncate max-w-[240px]">{activeReel.audioTrack}</span>
          </div>

        </div>

        </div>

        {/* Side Control Bar (Action Buttons + Reel Navigation) */}
        <div className="flex sm:flex-col items-center justify-center gap-4 bg-[#1e1e1e]/90 backdrop-blur-md p-3.5 rounded-3xl border border-neutral-800 shadow-2xl shrink-0">
          
          {/* Like Button */}
          <button
            onClick={() => handleToggleLike(activeReel.id)}
            className="flex flex-col items-center gap-1 group text-white"
          >
            <div className={`p-3 rounded-full transition-all shadow-md ${
              likedMap[activeReel.id] ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40' : 'bg-[#121212] text-neutral-300 hover:text-white border border-neutral-700/80 group-hover:scale-110'
            }`}>
              <Heart className={`w-5 h-5 ${likedMap[activeReel.id] ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[10px] font-black">{likesCountMap[activeReel.id] || activeReel.likesCount}</span>
          </button>

          {/* Comments Button */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="flex flex-col items-center gap-1 group text-white"
          >
            <div className="p-3 rounded-full bg-[#121212] text-neutral-300 hover:text-white border border-neutral-700/80 group-hover:scale-110 transition-all shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black">{currentComments.length + activeReel.commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex flex-col items-center gap-1 group text-white"
          >
            <div className="p-3 rounded-full bg-[#121212] text-emerald-400 border border-neutral-700/80 group-hover:scale-110 transition-all shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black">Share</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => handleToggleBookmark(activeReel.id)}
            className="flex flex-col items-center gap-1 group text-white"
          >
            <div className={`p-3 rounded-full border transition-all shadow-md ${
              bookmarkedMap[activeReel.id]
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[#121212] text-neutral-300 hover:text-white border border-neutral-700/80 group-hover:scale-110'
            }`}>
              <Bookmark className={`w-5 h-5 ${bookmarkedMap[activeReel.id] ? 'fill-current' : ''}`} />
            </div>
          </button>

          <div className="w-full h-px bg-neutral-800 my-1 hidden sm:block" />

          {/* Navigation Up/Down */}
          <div className="flex sm:flex-col items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1))}
              className="p-2.5 bg-[#121212] hover:bg-emerald-500 hover:text-slate-950 text-white border border-neutral-700/80 rounded-full transition-all active:scale-95 shadow-md"
              title="Previous Reel"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[11px] font-black text-emerald-400 leading-tight">
                Reel {currentIndex + 1}
              </span>
              <span className="text-[10px] font-extrabold text-neutral-400">
                of {reels.length}
              </span>
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev < reels.length - 1 ? prev + 1 : 0))}
              className="p-2.5 bg-[#121212] hover:bg-emerald-500 hover:text-slate-950 text-white border border-neutral-700/80 rounded-full transition-all active:scale-95 shadow-md"
              title="Next Reel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* =========================================
          1. CREATE REEL MODAL
      ========================================= */}
      {isCreateReelOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-black text-white">Create New Reel</h3>
                <p className="text-xs text-neutral-400">Upload a video or share a link to inspire the community</p>
              </div>
              <button onClick={() => setIsCreateReelOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishReel} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Upload Video from Local Device (Auto Malware Scanned)
                </label>
                <FileUploadWithScan
                  label="Select Video File (MP4, WebM)"
                  onFileSelect={(url) => setNewReelVideoUrl(url)}
                />
              </div>

              <div className="text-[10px] font-black text-neutral-400 text-center uppercase tracking-wider">
                OR PASTE VIDEO WEB LINK
              </div>

              <div>
                <input
                  type="url"
                  placeholder="https://assets.mixkit.co/videos/... or MP4 link"
                  value={newReelVideoUrl}
                  onChange={(e) => setNewReelVideoUrl(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Reel Caption</label>
                <textarea
                  placeholder="Describe your video, tips, or project... #SkillBuilding"
                  value={newReelCaption}
                  onChange={(e) => setNewReelCaption(e.target.value)}
                  rows={2}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">Audio Track Title</label>
                <input
                  type="text"
                  placeholder={`Original Audio - ${currentUser.name}`}
                  value={newReelAudioTrack}
                  onChange={(e) => setNewReelAudioTrack(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateReelOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                >
                  Publish Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          2. CREATOR PROFILE INFO MODAL
      ========================================= */}
      {viewingCreatorProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-sm w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setViewingCreatorProfile(null)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <img
                src={viewingCreatorProfile.avatar}
                alt={viewingCreatorProfile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500/40 mx-auto shadow-xl"
              />
              <div>
                <h3 className="text-base font-black text-white">{viewingCreatorProfile.name}</h3>
                <p className="text-xs font-bold text-emerald-400">{viewingCreatorProfile.handle}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{viewingCreatorProfile.role}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 font-medium text-center leading-relaxed">
              {viewingCreatorProfile.bio}
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{viewingCreatorProfile.location}</span>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setViewingCreatorProfile(null);
                  onOpenDirectChat(viewingCreatorProfile.name);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Direct Message</span>
              </button>

              <button
                onClick={() => {
                  setViewingCreatorProfile(null);
                  onNavigateView('profile');
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition"
              >
                View Full Profile Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          3. REEL COMMENTS MODAL / TRAY
      ========================================= */}
      {isCommentsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1e1e1e] rounded-t-3xl sm:rounded-3xl border border-neutral-800 max-w-md w-full p-5 shadow-2xl space-y-4 text-white max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Reel Comments</h3>
              </div>
              <button onClick={() => setIsCommentsOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none min-h-[160px]">
              {currentComments.length > 0 ? (
                currentComments.map((c) => (
                  <div key={c.id} className="bg-[#121212] p-3 rounded-2xl border border-neutral-800 flex items-start gap-2.5 text-xs">
                    <img src={c.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-400 text-[11px]">{c.authorName}</span>
                        <span className="text-[10px] text-neutral-500">{c.timestamp}</span>
                      </div>
                      <p className="text-neutral-200 font-medium text-[11px] mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 text-xs font-semibold">
                  No comments yet. Be the first to comment on this Reel!
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-[#121212] border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAddComment}
                className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold hover:bg-emerald-400 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          4. IN-APP SHARE MODAL
      ========================================= */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-sm w-full p-5 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Share Reel in SkillHub</h3>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share to Main Feed */}
            <button
              onClick={handleShareToFeed}
              className="w-full flex items-center gap-3 p-3 bg-[#121212] hover:bg-neutral-800 rounded-2xl border border-neutral-800 text-left transition"
            >
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xs block text-white">Repost to Main Feed</span>
                <span className="text-[10px] text-neutral-400">Share this video update with all community members</span>
              </div>
            </button>

            {/* Copy Unique URL Link */}
            <button
              onClick={() => {
                const url = `${window.location.origin}/?reel=${activeReel.id}`;
                navigator.clipboard.writeText(url);
                setIsShareModalOpen(false);
                setShareSuccessToast('Copied unique Reel URL to clipboard!');
                setTimeout(() => setShareSuccessToast(null), 3000);
              }}
              className="w-full flex items-center gap-3 p-3 bg-[#121212] hover:bg-neutral-800 rounded-2xl border border-neutral-800 text-left transition"
            >
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xs block text-white">Copy Unique Reel Link</span>
                <span className="text-[10px] text-neutral-400">ID: {activeReel.id}</span>
              </div>
            </button>

            {/* Send to Direct Chat Contact */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-extrabold text-neutral-400 block uppercase tracking-wider">
                Send in Direct Message
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-none">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleShareInChat(conv)}
                    className="w-full flex items-center justify-between p-2 hover:bg-[#121212] rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={conv.participantAvatar} alt="" className="w-7 h-7 rounded-full object-cover border border-emerald-500/30" />
                      <span className="font-bold text-xs text-white">{conv.participantName}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      Send
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
