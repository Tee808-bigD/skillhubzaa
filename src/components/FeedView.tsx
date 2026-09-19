import React, { useState } from 'react';
import { SocialPost, Story, CommunityEvent, User } from '../types';
import { FileUploadWithScan } from './FileUploadWithScan';
import { 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Share2, 
  Image, 
  Video, 
  Plus, 
  Calendar, 
  Briefcase, 
  User as UserIcon, 
  Eye, 
  Sparkles, 
  MoreHorizontal,
  X,
  Heart
} from 'lucide-react';

interface FeedViewProps {
  posts: SocialPost[];
  stories: Story[];
  events: CommunityEvent[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onAddPost: (post: SocialPost) => void;
  onAddStory?: (story: Story) => void;
  onToggleBookmarkPost?: (postId: string) => void;
  onOpenDirectChat: (participantName: string) => void;
  onSelectView: (view: any) => void;
  onOpenCreateEvent: () => void;
  onSelectEvent?: (event: CommunityEvent) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  stories,
  events,
  currentUser,
  onLikePost,
  onAddPost,
  onAddStory,
  onToggleBookmarkPost,
  onOpenDirectChat,
  onSelectView,
  onOpenCreateEvent,
  onSelectEvent
}) => {
  const [composerText, setComposerText] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [composerHashtags, setComposerHashtags] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  
  // Story modal & creation state
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryMediaUrl, setNewStoryMediaUrl] = useState('');
  
  // Interactive story likes and comments
  const [storyLikes, setStoryLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({
    story_1: { count: 14, isLiked: false },
    story_2: { count: 9, isLiked: true },
    story_3: { count: 21, isLiked: false }
  });
  const [storyComments, setStoryComments] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({
    story_1: [{ id: 'sc1', author: 'Michael Botha', text: 'Clean execution! 🔥', time: '10m ago' }]
  });
  const [storyCommentInput, setStoryCommentInput] = useState('');

  // Comment state per post
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, { id: string; author: string; text: string; date: string }[]>>({
    post_1: [
      { id: 'c1', author: 'Michael Botha', text: 'Clean work Sarah! What pressure rating valve did you use?', date: '1h ago' },
      { id: 'c2', author: 'Thando Mzobe', text: 'Awesome turn around time! 🚀', date: '30m ago' }
    ],
    post_2: [
      { id: 'c1', author: 'Lisa Khumalo', text: 'The wood grain finish looks incredible Michael!', date: '2h ago' }
    ]
  });
  const [newCommentInput, setNewCommentInput] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !composerMediaUrl.trim()) return;

    const hashtags = composerHashtags
      .split(',')
      .map(h => h.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location,
      createdAt: 'Just now',
      content: composerText.trim() || 'Shared a media update with the community.',
      hashtags: hashtags.length > 0 ? hashtags : ['SkillHub', 'YouthWorker'],
      mediaType: composerMediaUrl ? 'image' : undefined,
      mediaUrl: composerMediaUrl || undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false
    };

    onAddPost(newPost);
    setComposerText('');
    setComposerMediaUrl('');
    setComposerHashtags('');
    setShowMediaInput(false);
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentInput.trim()) return;
    const comment = {
      id: `c_${Date.now()}`,
      author: currentUser.name,
      text: newCommentInput,
      date: 'Just now'
    };
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }));
    setNewCommentInput('');
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-2">
      
      {/* Main Feed Column (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Stories Centered Horizontal Carousel (Max 16) */}
        <div className="bg-[#1e1e1e]/60 p-4 rounded-3xl border border-neutral-800/80 shadow-lg">
          <div className="flex items-center justify-center gap-4 overflow-x-auto pb-1 scrollbar-none max-w-full mx-auto">
            
            {/* Add Story Button ("Your Story") */}
            <button
              onClick={() => setIsCreateStoryOpen(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="relative w-16 h-16 rounded-full p-0.5 ring-2 ring-emerald-500 transition-all group-hover:scale-105">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover border-2 border-[#121212]"
                />
                <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-slate-950 rounded-full ring-2 ring-[#121212] shadow-md">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 max-w-[75px] truncate text-center">
                + Your Story
              </span>
            </button>

            {/* Other Users' Stories (Max 16) */}
            {stories.slice(0, 16).map((story) => (
              <button
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div className={`w-16 h-16 rounded-full p-0.5 transition-all group-hover:scale-105 ${
                  story.hasUnseen
                    ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 p-[2px]'
                    : 'ring-2 ring-neutral-700'
                }`}>
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-full h-full rounded-full object-cover border-2 border-[#121212]"
                  />
                </div>
                <span className="text-[11px] font-bold text-neutral-300 max-w-[75px] truncate text-center">
                  {story.authorName}
                </span>
              </button>
            ))}

          </div>
        </div>

        {/* Post Composer Card */}
        <div className="bg-[#1e1e1e] rounded-3xl p-5 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-start gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div className="flex-1 space-y-3">
              <textarea
                rows={2}
                placeholder="Share something useful with your community..."
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                className="w-full bg-[#121212] text-white rounded-2xl p-3 text-xs sm:text-sm font-medium border border-neutral-800 focus:outline-none focus:border-emerald-500/50 resize-none placeholder:text-neutral-500"
              />

              {showMediaInput && (
                <div className="space-y-3 animate-in fade-in duration-150 p-3 bg-[#141414] rounded-2xl border border-neutral-800">
                  <FileUploadWithScan
                    label="Upload File from Device (Malware & Virus Scanned)"
                    onFileSelect={(url) => {
                      setComposerMediaUrl(url);
                    }}
                  />

                  <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider text-center">OR PASTE WEB URL</div>

                  <input
                    type="text"
                    placeholder="Paste Image or Video URL (e.g. https://images.unsplash.com/...)"
                    value={composerMediaUrl.startsWith('data:') ? '[Uploaded file data attached]' : composerMediaUrl}
                    onChange={(e) => setComposerMediaUrl(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white rounded-xl px-3 py-2 text-xs font-semibold border border-neutral-800 focus:outline-none focus:border-emerald-500"
                  />

                  <input
                    type="text"
                    placeholder="Hashtags (comma separated: PlumberLife, Soweto)"
                    value={composerHashtags}
                    onChange={(e) => setComposerHashtags(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white rounded-xl px-3 py-2 text-xs font-semibold border border-neutral-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Inline Media Thumbnail Preview */}
              {composerMediaUrl && (
                <div className="relative w-fit group border border-emerald-500/40 rounded-2xl overflow-hidden shadow-md">
                  <img src={composerMediaUrl} alt="Preview attachment" className="h-28 w-auto max-w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setComposerMediaUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-black text-white rounded-full transition"
                    title="Remove media attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
                  >
                    <Image className="w-4 h-4 text-emerald-400" />
                    <span>Media Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Video</span>
                  </button>
                </div>

                <button
                  onClick={handlePostSubmit}
                  disabled={!composerText.trim()}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md"
                >
                  Publish Post
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Posts Stream */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 shadow-xl overflow-hidden"
            >
              
              {/* Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-none">{post.authorName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium mt-1">
                      <span>{post.createdAt}</span>
                      <span>•</span>
                      <span>{post.authorLocation}</span>
                    </div>
                  </div>
                </div>

                <button className="text-neutral-400 hover:text-white p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Text Content */}
              <div className="px-4 sm:px-5 pb-3">
                <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Media Attachment */}
              {post.mediaUrl && (
                <div className="w-full max-h-[480px] bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={post.mediaUrl}
                    alt="Post media attachment"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="p-4 sm:p-5 bg-[#181818] border-t border-neutral-800/80 space-y-3">
                
                <div className="flex items-center justify-between">
                  
                  <div className="flex items-center gap-4">
                    
                    {/* Like Action */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-extrabold transition-all ${
                        post.isLiked ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-amber-400' : ''}`} />
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Comment Action */}
                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-400 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{(postComments[post.id]?.length || 0) + post.commentsCount}</span>
                    </button>

                    {/* Direct Message Action */}
                    <button
                      onClick={() => onOpenDirectChat(post.authorName)}
                      className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-400 hover:text-emerald-400 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Message</span>
                    </button>

                  </div>

                  <div className="flex items-center gap-2 text-neutral-400">
                    <button
                      onClick={() => onToggleBookmarkPost && onToggleBookmarkPost(post.id)}
                      className={`p-1.5 rounded-xl transition-all ${
                        post.isBookmarked
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'hover:text-white hover:bg-neutral-800'
                      }`}
                      title={post.isBookmarked ? 'Saved to Profile' : 'Save Post to Profile'}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-emerald-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/?post=${post.id}`;
                        navigator.clipboard.writeText(shareUrl);
                        alert(`Copied unique post URL to clipboard!\n\nLink: ${shareUrl}\nPost ID: ${post.id}`);
                      }}
                      className="p-1.5 rounded-xl hover:text-white hover:bg-neutral-800 transition-all text-neutral-400"
                      title="Share Post with Unique URL ID"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Top Comment Quick Preview (When drawer closed) */}
                {activeCommentPostId !== post.id && postComments[post.id] && postComments[post.id].length > 0 && (
                  <div
                    onClick={() => setActiveCommentPostId(post.id)}
                    className="pt-2 border-t border-neutral-800/60 cursor-pointer group"
                  >
                    <div className="bg-[#222222] group-hover:bg-[#282828] rounded-xl p-2.5 text-xs transition">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-400">{postComments[post.id][postComments[post.id].length - 1].author}</span>
                        <span className="text-[10px] text-neutral-500 font-bold">{postComments[post.id][postComments[post.id].length - 1].date}</span>
                      </div>
                      <p className="text-neutral-300 text-[11px] font-medium line-clamp-1 mt-0.5">
                        {postComments[post.id][postComments[post.id].length - 1].text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comment Drawer / Input */}
                {activeCommentPostId === post.id && (
                  <div className="pt-3 border-t border-neutral-800/80 space-y-3 animate-in fade-in duration-150">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(postComments[post.id] || []).map(comment => (
                        <div key={comment.id} className="bg-[#242424] rounded-xl p-2.5 text-xs">
                          <span className="font-extrabold text-emerald-400 block">{comment.author}</span>
                          <span className="text-neutral-200 font-medium">{comment.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 bg-[#121212] border border-neutral-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </article>
          ))}
        </div>

      </div>

      {/* Right Column (4 cols) - Quick Actions & Events */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Quick Actions Card */}
        <div className="bg-[#1e1e1e] rounded-3xl p-5 border border-neutral-800 shadow-xl space-y-4">
          <div>
            <h3 className="font-black text-white text-lg">Quick Actions</h3>
            <div className="w-10 h-0.5 bg-emerald-500 mt-1 rounded-full" />
            <p className="text-xs text-neutral-400 font-medium mt-1">Manage your presence</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onSelectView('services')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121212] border border-rose-500/40 hover:border-rose-500 text-rose-400 font-bold text-xs transition-all text-left"
            >
              <Briefcase className="w-4 h-4 text-rose-400" />
              <span>My Services</span>
            </button>

            <button
              onClick={() => onSelectView('profile')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#121212] border border-rose-500/40 hover:border-rose-500 text-rose-400 font-bold text-xs transition-all text-left"
            >
              <UserIcon className="w-4 h-4 text-rose-400" />
              <span>My Profile</span>
            </button>

            <button
              onClick={onOpenCreateEvent}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-all shadow-md text-left"
            >
              <Calendar className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-[#1e1e1e] rounded-3xl p-5 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-lg">Upcoming Events</h3>
              <div className="w-10 h-0.5 bg-emerald-500 mt-1 rounded-full" />
            </div>
            <button
              onClick={() => onSelectView('feed')}
              className="text-xs font-bold text-rose-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#121212] rounded-2xl p-4 border border-neutral-800/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{ev.title}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{ev.description}</p>
                  </div>
                  <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                    {ev.dateBadge}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={ev.hostAvatar}
                    alt={ev.hostName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-neutral-300 font-semibold">{ev.hostName}</span>
                </div>

                <button
                  onClick={() => onSelectEvent ? onSelectEvent(ev) : alert(`Event details for ${ev.title}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-rose-500/50 hover:bg-rose-500/10 text-rose-400 font-extrabold text-xs transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Event Details</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Story Fullscreen Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121212] rounded-3xl border border-neutral-800 overflow-hidden relative space-y-3">
            
            <div className="relative h-[480px]">
              <img
                src={activeStory.mediaUrl}
                alt={activeStory.authorName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between text-white">
                
                {/* Author Profile Info (Clickable to view Profile) */}
                <button
                  onClick={() => {
                    setActiveStory(null);
                    onSelectView('profile');
                  }}
                  className="flex items-center gap-3 hover:opacity-80 transition text-left group"
                  title="Click to view user profile info"
                >
                  <img src={activeStory.authorAvatar} alt="" className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover" />
                  <div>
                    <span className="font-extrabold text-xs block group-hover:underline text-white">{activeStory.authorName}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">View Profile Info • {activeStory.createdAt}</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 bg-black/60 hover:bg-black rounded-full text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Floating Story Likes Overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                <button
                  onClick={() => {
                    const current = storyLikes[activeStory.id] || { count: 8, isLiked: false };
                    setStoryLikes(prev => ({
                      ...prev,
                      [activeStory.id]: {
                        count: current.isLiked ? current.count - 1 : current.count + 1,
                        isLiked: !current.isLiked
                      }
                    }));
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold transition"
                >
                  <Heart className={`w-4 h-4 ${storyLikes[activeStory.id]?.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  <span className="text-white">{storyLikes[activeStory.id]?.count || 12}</span>
                </button>
              </div>
            </div>

            {/* Story Comments & Replies Section */}
            <div className="p-4 space-y-3 bg-[#181818] border-t border-neutral-800">
              <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-none">
                {(storyComments[activeStory.id] || []).map((c) => (
                  <div key={c.id} className="bg-[#222222] p-2 rounded-xl text-xs flex justify-between gap-2">
                    <div>
                      <span className="font-bold text-emerald-400 block text-[11px]">{c.author}</span>
                      <p className="text-neutral-200 text-[11px]">{c.text}</p>
                    </div>
                    <span className="text-[9px] text-neutral-500">{c.time}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Comment on ${activeStory.authorName}'s story...`}
                  value={storyCommentInput}
                  onChange={(e) => setStoryCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && storyCommentInput.trim()) {
                      const newC = {
                        id: `sc_${Date.now()}`,
                        author: currentUser.name,
                        text: storyCommentInput,
                        time: 'Just now'
                      };
                      setStoryComments(prev => ({
                        ...prev,
                        [activeStory.id]: [...(prev[activeStory.id] || []), newC]
                      }));
                      setStoryCommentInput('');
                    }
                  }}
                  className="flex-1 bg-[#121212] border border-neutral-700 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    if (!storyCommentInput.trim()) return;
                    const newC = {
                      id: `sc_${Date.now()}`,
                      author: currentUser.name,
                      text: storyCommentInput,
                      time: 'Just now'
                    };
                    setStoryComments(prev => ({
                      ...prev,
                      [activeStory.id]: [...(prev[activeStory.id] || []), newC]
                    }));
                    setStoryCommentInput('');
                  }}
                  className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-bold hover:bg-emerald-400 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create Story Modal (60s Video / Image from Link or Local Device) */}
      {isCreateStoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-md w-full p-6 shadow-2xl space-y-4 text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-black text-white">Add 60s Story</h3>
                <p className="text-xs text-neutral-400">Share a 60-second video or image update with your community</p>
              </div>
              <button onClick={() => setIsCreateStoryOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Upload 60s Story / Image from Device (Auto Malware Scanned)
                </label>
                <FileUploadWithScan
                  label="Select Local Media File"
                  onFileSelect={(url) => setNewStoryMediaUrl(url)}
                />
              </div>

              <div className="text-[10px] font-black text-neutral-400 text-center uppercase tracking-wider">
                OR PASTE MEDIA WEB LINK
              </div>

              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or 60s video URL"
                  value={newStoryMediaUrl}
                  onChange={(e) => setNewStoryMediaUrl(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {newStoryMediaUrl && (
                <div className="rounded-2xl overflow-hidden max-h-40 border border-emerald-500/40">
                  <img src={newStoryMediaUrl} alt="Story preview" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateStoryOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newStoryMediaUrl.trim()) {
                    alert('Please select or paste a media file for your story.');
                    return;
                  }
                  const newS: Story = {
                    id: `story_${Date.now()}`,
                    authorName: currentUser.name,
                    authorAvatar: currentUser.avatar,
                    mediaUrl: newStoryMediaUrl,
                    createdAt: 'Just now',
                    hasUnseen: true
                  };
                  if (onAddStory) {
                    onAddStory(newS);
                  }
                  setIsCreateStoryOpen(false);
                  setNewStoryMediaUrl('');
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
