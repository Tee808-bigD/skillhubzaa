import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SocialPost, Story, StorySlide, CommunityEvent, User } from '../types';
import { FileUploadWithScan } from './FileUploadWithScan';
import { StoryViewerModal } from './StoryViewerModal';
import { ReportModal } from './ReportModal';
import { HeroSection } from './HeroSection';
import { TopRatedProfessionals } from './TopRatedProfessionals';
import { Composer, ComposerSubmitData } from './Composer';
import { RightWidgets } from './RightWidgets';
import { getPosts, createPost, toggleLikePost, addComment } from '../api/posts';
import { PostData } from '../api/types';
import { 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Share2, 
  Image, 
  Video, 
  Film,
  Plus, 
  Calendar, 
  Briefcase, 
  User as UserIcon, 
  Eye, 
  Sparkles, 
  MoreHorizontal,
  X,
  Heart,
  Flag,
  UserX,
  UserCheck,
  Star,
  Info,
  ExternalLink,
  Copy,
  Code,
  Trash2,
  Check,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Server,
  RefreshCw,
  Globe2,
  DollarSign,
  Clock
} from 'lucide-react';

interface FeedViewProps {
  posts: SocialPost[];
  stories: Story[];
  events: CommunityEvent[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onAddPost: (post: SocialPost) => void;
  onAddStory?: (story: Story) => void;
  onDeleteStorySlide?: (storyId: string, slideId: string) => void;
  onReactToStorySlide?: (storyId: string, slideId: string, emoji: string) => void;
  onToggleBookmarkPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onOpenDirectChat: (participantName: string) => void;
  onSelectView: (view: any) => void;
  onOpenCreateEvent: () => void;
  onSelectEvent?: (event: CommunityEvent) => void;
  onOpenProfile?: (user: Partial<User>) => void;
  onOpenDjangoBackend?: () => void;
  isAuthenticated?: boolean;
  onOpenLogin?: () => void;
  onOpenSignUp?: () => void;
  onSelectCategory?: (category: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  stories,
  events,
  currentUser,
  onLikePost,
  onAddPost,
  onAddStory,
  onDeleteStorySlide,
  onReactToStorySlide,
  onToggleBookmarkPost,
  onDeletePost,
  onOpenDirectChat,
  onSelectView,
  onOpenCreateEvent,
  onSelectEvent,
  onOpenProfile,
  onOpenDjangoBackend,
  isAuthenticated = false,
  onOpenLogin,
  onOpenSignUp,
  onSelectCategory
}) => {
  const [composerText, setComposerText] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [composerHashtags, setComposerHashtags] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
    setComposerMediaUrl('');
  };

  const handleClearSelectedFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 3-Dot Options & Modals State
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<SocialPost | null>(null);
  const [reportingPost, setReportingPost] = useState<SocialPost | null>(null);
  const [unfollowedUsers, setUnfollowedUsers] = useState<string[]>([]);
  const [favoritedPostIds, setFavoritedPostIds] = useState<string[]>([]);
  const [aboutAccountModalPost, setAboutAccountModalPost] = useState<SocialPost | null>(null);
  const [embedModalPost, setEmbedModalPost] = useState<SocialPost | null>(null);
  const [shareModalPost, setShareModalPost] = useState<SocialPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Django REST Framework Live Posts & API State
  const [apiPosts, setApiPosts] = useState<SocialPost[]>(posts);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [postsSource, setPostsSource] = useState<'django' | 'cached'>('cached');

  const fetchPostsFromApi = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await getPosts();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: SocialPost[] = data.map((p: any) => ({
          id: p.id,
          authorId: p.author?.id || currentUser.id,
          authorName: p.author?.full_name || p.author?.username || 'SkillHub Creator',
          authorHandle: p.author?.username ? `@${p.author.username}` : '@creator',
          authorAvatar: p.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          authorLocation: p.author?.location || 'South Africa',
          createdAt: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          content: p.content,
          category: p.category,
          hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
          mediaType: p.media_type === 'video' ? 'video' : (p.media_url ? 'image' : undefined),
          mediaUrl: p.media_url || p.video_url || undefined,
          likesCount: p.likes_count || 0,
          commentsCount: p.comments_count || (p.comments ? p.comments.length : 0),
          sharesCount: 2,
          isLiked: !!p.is_liked,
        }));
        setApiPosts(mapped);
        setPostsSource('django');
      } else {
        setApiPosts(posts);
      }
    } catch (err) {
      console.warn('Connecting to API fallback:', err);
      setApiPosts(posts);
      setPostsSource('cached');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPostsFromApi();
  }, []);

  useEffect(() => {
    if (apiPosts.length === 0 && posts.length > 0) {
      setApiPosts(posts);
    }
  }, [posts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleFollowUser = (authorName: string) => {
    if (unfollowedUsers.includes(authorName)) {
      setUnfollowedUsers(prev => prev.filter(u => u !== authorName));
      showToast(`Now following ${authorName}`);
    } else {
      setUnfollowedUsers(prev => [...prev, authorName]);
      showToast(`Unfollowed ${authorName}`);
    }
  };

  const toggleFavoritePost = (postId: string) => {
    if (onToggleBookmarkPost) {
      onToggleBookmarkPost(postId);
    }
    if (favoritedPostIds.includes(postId)) {
      setFavoritedPostIds(prev => prev.filter(id => id !== postId));
      showToast('Removed from favorites');
    } else {
      setFavoritedPostIds(prev => [...prev, postId]);
      showToast('Added to favorites');
    }
  };
  
  // Story modal & creation state
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>(undefined);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [newStoryMediaUrl, setNewStoryMediaUrl] = useState('');
  const [newStoryCaption, setNewStoryCaption] = useState('');

  // Group stories by author so each user has exactly ONE circle on the home page with multiple slides
  const { myStory, otherStories } = useMemo(() => {
    let mine: Story | undefined = undefined;
    const othersMap = new Map<string, Story>();

    for (const s of stories) {
      const isMe = s.authorName === 'Your Story' || s.authorName.toLowerCase() === currentUser.name.toLowerCase();
      const slides: StorySlide[] = (s.slides && s.slides.length > 0)
        ? s.slides
        : [{ id: s.id, mediaUrl: s.mediaUrl, createdAt: s.createdAt, caption: '' }];

      if (isMe) {
        if (!mine) {
          mine = {
            ...s,
            id: s.id || 'story_me',
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar,
            slides: [...slides]
          };
        } else {
          const currentMine: Story = mine;
          const currentSlides: StorySlide[] = currentMine.slides || [];
          const combined: StorySlide[] = [...currentSlides];
          for (const sl of slides) {
            if (!combined.some((cs: StorySlide) => (cs.id && cs.id === sl.id) || (cs.mediaUrl && cs.mediaUrl === sl.mediaUrl))) {
              combined.push(sl);
            }
          }
          mine = {
            ...currentMine,
            hasUnseen: currentMine.hasUnseen || s.hasUnseen,
            mediaUrl: slides[slides.length - 1]?.mediaUrl || currentMine.mediaUrl,
            slides: combined
          };
        }
      } else {
        const key = s.authorName.trim().toLowerCase();
        if (othersMap.has(key)) {
          const existing: Story = othersMap.get(key)!;
          const currentSlides: StorySlide[] = existing.slides || [];
          const combined: StorySlide[] = [...currentSlides];
          for (const sl of slides) {
            if (!combined.some((cs: StorySlide) => (cs.id && cs.id === sl.id) || (cs.mediaUrl && cs.mediaUrl === sl.mediaUrl))) {
              combined.push(sl);
            }
          }
          othersMap.set(key, {
            ...existing,
            hasUnseen: existing.hasUnseen || s.hasUnseen,
            mediaUrl: slides[slides.length - 1]?.mediaUrl || existing.mediaUrl,
            slides: combined
          });
        } else {
          othersMap.set(key, {
            ...s,
            slides: [...slides]
          });
        }
      }
    }

    return {
      myStory: mine,
      otherStories: Array.from(othersMap.values())
    };
  }, [stories, currentUser.name, currentUser.avatar]);

  // Combined list for story viewer modal so user can advance seamlessly between stories
  const allActiveStories = useMemo(() => {
    const list: Story[] = [];
    if (myStory && myStory.slides && myStory.slides.length > 0) {
      list.push(myStory);
    }
    return [...list, ...otherStories];
  }, [myStory, otherStories]);

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

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !composerMediaUrl.trim() && !selectedFile) return;

    const hashtags = composerHashtags
      .split(',')
      .map(h => h.trim().replace(/^#/, ''))
      .filter(Boolean);

    const isVideo = selectedFile
      ? selectedFile.type.startsWith('video/')
      : (composerMediaUrl.startsWith('data:video') || /\.(mp4|webm|mov)($|\?)/i.test(composerMediaUrl));

    setIsPublishing(true);
    try {
      let created: any;
      if (selectedFile) {
        // Construct FormData for Django REST Framework MultiPartParser
        const formData = new FormData();
        formData.append('content', composerText.trim() || 'Shared a media update with SkillHub.');
        formData.append('category', 'Tech & Skills');
        if (hashtags.length > 0) {
          formData.append('hashtags', JSON.stringify(hashtags));
        }
        if (isVideo) {
          formData.append('video_file', selectedFile);
        } else {
          formData.append('media_file', selectedFile);
        }
        created = await createPost(formData);
      } else {
        // Direct API Call with JSON payload
        created = await createPost({
          content: composerText.trim(),
          media_type: isVideo ? 'video' : (composerMediaUrl ? 'image' : 'text'),
          media_url: isVideo ? undefined : (composerMediaUrl || undefined),
          video_url: isVideo ? composerMediaUrl : undefined,
          category: 'Tech & Skills',
          hashtags: hashtags.length > 0 ? hashtags : ['SkillHubZA', 'YouthInTech']
        });
      }

      const mediaDisplayUrl = created.media_url || created.video_url || filePreviewUrl || composerMediaUrl || undefined;

      const formattedPost: SocialPost = {
        id: created.id || `post_${Date.now()}`,
        authorId: created.author?.id || currentUser.id,
        authorName: created.author?.full_name || currentUser.name,
        authorHandle: created.author?.username ? `@${created.author.username}` : currentUser.handle,
        authorAvatar: created.author?.avatar || currentUser.avatar,
        authorLocation: created.author?.location || currentUser.location,
        createdAt: 'Just now',
        content: created.content || composerText.trim(),
        hashtags: created.hashtags || hashtags,
        mediaType: isVideo ? 'video' : (mediaDisplayUrl ? 'image' : undefined),
        mediaUrl: mediaDisplayUrl,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false
      };

      setApiPosts(prev => [formattedPost, ...prev]);
      onAddPost(formattedPost);
      showToast('Post & file uploaded to Django REST Framework! 🚀');
    } catch (err: any) {
      console.warn('API post creation failed, falling back to local optimistic post:', err);
      const fallbackUrl = filePreviewUrl || composerMediaUrl || undefined;
      const fallbackPost: SocialPost = {
        id: `post_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        authorLocation: currentUser.location,
        createdAt: 'Just now',
        content: composerText.trim() || 'Shared a media update with the community.',
        hashtags: hashtags.length > 0 ? hashtags : ['SkillHub', 'YouthWorker'],
        mediaType: isVideo ? 'video' : (fallbackUrl ? 'image' : undefined),
        mediaUrl: fallbackUrl,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false
      };
      setApiPosts(prev => [fallbackPost, ...prev]);
      onAddPost(fallbackPost);
      showToast('Post saved locally.');
    } finally {
      setIsPublishing(false);
      setComposerText('');
      setComposerMediaUrl('');
      setComposerHashtags('');
      handleClearSelectedFile();
      setShowMediaInput(false);
    }
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

  const handleComposerSubmit = async (data: ComposerSubmitData) => {
    setIsPublishing(true);
    try {
      let created: any;
      if (data.mediaFile) {
        const formData = new FormData();
        formData.append('content', data.content || (data.postType === 'service_request' ? 'Posted a service request' : 'Showcased work'));
        formData.append('category', data.postType === 'service_request' ? 'Service Request' : 'Tech & Skills');
        if (data.hashtags.length > 0) {
          formData.append('hashtags', JSON.stringify(data.hashtags));
        }
        if (data.mediaFile.type.startsWith('video/')) {
          formData.append('video_file', data.mediaFile);
        } else {
          formData.append('media_file', data.mediaFile);
        }
        created = await createPost(formData);
      } else {
        created = await createPost({
          content: data.content,
          media_type: data.mediaUrl ? 'image' : 'text',
          media_url: data.mediaUrl,
          category: data.postType === 'service_request' ? 'Service Request' : 'Tech & Skills',
          hashtags: data.hashtags.length > 0 ? data.hashtags : ['SkillHubGlobal', 'RemotePro']
        });
      }

      const mediaDisplayUrl = created.media_url || created.video_url || (data.mediaFile ? URL.createObjectURL(data.mediaFile) : data.mediaUrl);

      const formattedPost: SocialPost = {
        id: created.id || `post_${Date.now()}`,
        authorId: created.author?.id || currentUser.id,
        authorName: created.author?.full_name || currentUser.name,
        authorHandle: created.author?.username ? `@${created.author.username}` : currentUser.handle,
        authorAvatar: created.author?.avatar || currentUser.avatar,
        authorLocation: created.author?.location || currentUser.location,
        authorCountry: currentUser.country || 'Global 🌐',
        authorRating: currentUser.rating || 4.95,
        authorVerified: true,
        authorPrimarySkill: currentUser.primarySkill || currentUser.skills?.[0] || 'Professional Expert',
        createdAt: 'Just now',
        content: created.content || data.content,
        hashtags: created.hashtags || data.hashtags,
        mediaType: data.mediaFile?.type.startsWith('video/') ? 'video' : (mediaDisplayUrl ? 'image' : undefined),
        mediaUrl: mediaDisplayUrl,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        postType: data.postType,
        serviceRequest: data.serviceRequest
      };

      setApiPosts(prev => [formattedPost, ...prev]);
      onAddPost(formattedPost);
      showToast(data.postType === 'service_request' ? 'Service request published globally! 🚀' : 'Project showcased to global feed! 🌟');
    } catch (err: any) {
      console.warn('API post creation fallback:', err);
      const mediaDisplayUrl = data.mediaFile ? URL.createObjectURL(data.mediaFile) : data.mediaUrl;
      const fallbackPost: SocialPost = {
        id: `post_${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        authorLocation: currentUser.location,
        authorCountry: currentUser.country || 'Worldwide 🌐',
        authorRating: 4.95,
        authorVerified: true,
        authorPrimarySkill: currentUser.primarySkill || currentUser.skills?.[0] || 'Professional Expert',
        createdAt: 'Just now',
        content: data.content,
        hashtags: data.hashtags.length > 0 ? data.hashtags : ['SkillHubGlobal'],
        mediaType: data.mediaFile?.type.startsWith('video/') ? 'video' : (mediaDisplayUrl ? 'image' : undefined),
        mediaUrl: mediaDisplayUrl,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        postType: data.postType,
        serviceRequest: data.serviceRequest
      };
      setApiPosts(prev => [fallbackPost, ...prev]);
      onAddPost(fallbackPost);
      showToast(data.postType === 'service_request' ? 'Service request saved locally.' : 'Showcase saved locally.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-2">
      
      {/* Main Feed Column (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Dynamic Hero Section (Replaces old developer banner) */}
        <HeroSection
          currentUser={currentUser}
          isAuthenticated={!!isAuthenticated}
          onHirePro={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/search');
            }
            onSelectView('search');
          }}
          onJoinAsPro={onOpenSignUp || (() => onSelectView('profile'))}
          onCompleteProfile={() => onSelectView('profile')}
          onUpdateAvailability={() => {
            showToast('Your availability is updated: Open for Global Contracts! 🌐');
          }}
          onSearch={(query, location) => {
            if (onSelectCategory && query) {
              onSelectCategory(query);
            }
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (location && location !== 'Anywhere') params.set('location', location.toLowerCase().replace(/\s+/g, '-'));
              window.history.pushState({}, '', `/search${params.toString() ? '?' + params.toString() : ''}`);
            }
            onSelectView('search');
          }}
        />

        {/* Top Rated Professionals Carousel (Replaces old stories) */}
        <TopRatedProfessionals
          onBrowseAll={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/search');
            }
            onSelectView('search');
          }}
          onSelectPro={(pro) => {
            if (onOpenProfile) {
              onOpenProfile({ 
                name: pro.name, 
                location: `${pro.location}, ${pro.country}`, 
                avatar: pro.avatar,
                skills: [pro.primarySkill]
              });
            } else {
              onSelectView('profile');
            }
          }}
          onHirePro={(pro) => {
            onOpenDirectChat(pro.name);
            showToast(`Opening direct hire request with ${pro.name}...`);
          }}
          onMessagePro={(pro) => {
            onOpenDirectChat(pro.name);
          }}
        />

        {/* Dual-Purpose Global Post Composer (Showcase Work | Request a Service) */}
        <Composer
          currentUser={currentUser}
          onSubmit={handleComposerSubmit}
          isPublishing={isPublishing}
        />

        {/* Posts Stream Header */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-300">
              Live Community Feed
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({(apiPosts.length > 0 ? apiPosts : posts).length} posts)
            </span>
          </div>
          <button
            onClick={fetchPostsFromApi}
            disabled={isLoadingPosts}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Refresh community feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Posts Stream */}
        <div className="space-y-6">
          {(apiPosts.length > 0 ? apiPosts : posts).map((post) => (
            <article
              key={post.id}
              className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 shadow-xl overflow-hidden"
            >
              
              {/* Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onOpenProfile) {
                      onOpenProfile({
                        id: post.authorId,
                        name: post.authorName,
                        handle: post.authorHandle,
                        avatar: post.authorAvatar,
                        location: post.authorLocation
                      });
                    } else {
                      onSelectView('profile');
                    }
                  }}
                  className="flex items-center gap-3 text-left group hover:opacity-90 transition cursor-pointer"
                  title={`View ${post.authorName}'s profile`}
                >
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:scale-105 transition"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-white leading-none group-hover:text-emerald-400 transition">
                        {post.authorName}
                      </h3>
                      {post.authorVerified && (
                        <span className="inline-flex items-center text-emerald-400" title="Verified Professional">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-400/20" />
                        </span>
                      )}
                      {((post.authorRating && post.authorRating >= 4.5) || post.authorRating === undefined) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>Top Rated</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium mt-1">
                      <span>{post.createdAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-emerald-400/80 shrink-0" />
                        <span>
                          {post.authorLocation}
                          {post.authorCountry ? `, ${post.authorCountry}` : ''}
                        </span>
                      </span>
                      {post.authorPrimarySkill && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-slate-400 hidden sm:inline font-normal">{post.authorPrimarySkill}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* 3-Dot Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                    className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/80 transition"
                    title="More options"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {openMenuPostId === post.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenuPostId(null)}
                      />
                      <div className="absolute right-0 top-10 z-50 w-60 bg-[#262626] border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden py-1.5 text-xs font-semibold text-neutral-200 animate-in fade-in zoom-in-95 duration-100 divide-y divide-neutral-800/60">
                        
                        <div className="py-0.5">
                          {/* Report */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              setReportingPost(post);
                            }}
                            className="w-full px-4 py-2.5 text-left text-rose-500 hover:bg-neutral-800/80 font-bold flex items-center justify-between transition"
                          >
                            <span>Report</span>
                            <Flag className="w-4 h-4 text-rose-500" />
                          </button>

                          {/* Unfollow / Follow */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              toggleFollowUser(post.authorName);
                            }}
                            className="w-full px-4 py-2.5 text-left text-rose-500 hover:bg-neutral-800/80 font-bold flex items-center justify-between transition"
                          >
                            <span>{unfollowedUsers.includes(post.authorName) ? `Follow ${post.authorName}` : `Unfollow`}</span>
                            {unfollowedUsers.includes(post.authorName) ? (
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-rose-500" />
                            )}
                          </button>
                        </div>

                        <div className="py-0.5">
                          {/* Add to favorites */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              toggleFavoritePost(post.id);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>{favoritedPostIds.includes(post.id) ? 'Remove from favorites' : 'Add to favorites'}</span>
                            <Star className={`w-4 h-4 ${favoritedPostIds.includes(post.id) ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'}`} />
                          </button>

                          {/* About this account */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              setAboutAccountModalPost(post);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>About this account</span>
                            <Info className="w-4 h-4 text-neutral-400" />
                          </button>

                          {/* Go to post */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              const shareUrl = `${window.location.origin}/?post=${post.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              showToast('Link copied. Navigated to post.');
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>Go to post</span>
                            <ExternalLink className="w-4 h-4 text-neutral-400" />
                          </button>

                          {/* Share to... */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              setShareModalPost(post);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>Share to...</span>
                            <Share2 className="w-4 h-4 text-neutral-400" />
                          </button>

                          {/* Copy link */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              const shareUrl = `${window.location.origin}/?post=${post.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              showToast('Link copied to clipboard');
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>Copy link</span>
                            <Copy className="w-4 h-4 text-neutral-400" />
                          </button>

                          {/* Embed */}
                          <button
                            onClick={() => {
                              setOpenMenuPostId(null);
                              setEmbedModalPost(post);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800/80 flex items-center justify-between transition"
                          >
                            <span>Embed</span>
                            <Code className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>

                        {/* Delete option - ONLY SHOWN FOR AUTHOR */}
                        {(post.authorName === currentUser.name || post.authorHandle === currentUser.handle || post.authorId === currentUser.id) && (
                          <div className="py-0.5">
                            <button
                              onClick={() => {
                                setOpenMenuPostId(null);
                                setPostToDelete(post);
                              }}
                              className="w-full px-4 py-2.5 text-left text-rose-500 hover:bg-neutral-800/80 font-bold flex items-center justify-between transition"
                            >
                              <span>Delete</span>
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </button>
                          </div>
                        )}

                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="px-4 sm:px-5 pb-3">
                <p className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Media Attachment */}
              {post.mediaUrl && (
                <div className="w-full bg-black/90 overflow-hidden flex items-center justify-center border-y border-neutral-800/60">
                  {post.mediaType === 'video' || post.mediaUrl.startsWith('data:video') || /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(post.mediaUrl) ? (
                    <video
                      src={post.mediaUrl}
                      controls
                      playsInline
                      className="w-full max-h-[650px] object-contain bg-black"
                      onError={(e) => {
                        console.warn('Video failed to load:', e);
                      }}
                    />
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt="Post media attachment"
                      className="w-full max-h-[650px] object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="p-4 sm:p-5 bg-[#181818] border-t border-neutral-800/80 space-y-3">
                
                <div className="flex items-center justify-between">
                  
                  <div className="flex items-center gap-4">
                    
                    {/* Like Action */}
                    <button
                      onClick={async () => {
                        setApiPosts(prev => prev.map(p => {
                          if (p.id === post.id) {
                            const nextLiked = !p.isLiked;
                            return {
                              ...p,
                              isLiked: nextLiked,
                              likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
                            };
                          }
                          return p;
                        }));
                        onLikePost(post.id);
                        try {
                          await toggleLikePost(post.id);
                        } catch (err) {
                          console.warn('API like sync:', err);
                        }
                      }}
                      className={`flex items-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer ${
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
                      className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-400 hover:text-emerald-400 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </button>

                    {/* Commerce Action: Hire Me or Request Quote */}
                    <button
                      onClick={() => onOpenDirectChat(post.authorName)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title={post.postType === 'service_request' ? `Submit proposal to ${post.authorName}` : `Hire or request quote from ${post.authorName}`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{post.postType === 'service_request' ? 'Submit Proposal' : 'Hire Me / Request Quote'}</span>
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

      {/* Right Column (4 cols) - Global Marketplace Widgets */}
      <div className="lg:col-span-4 space-y-6">
        <RightWidgets
          currentUser={currentUser}
          isAuthenticated={!!isAuthenticated}
          events={events}
          onSelectView={onSelectView}
          onOpenCreateEvent={onOpenCreateEvent}
          onSelectEvent={onSelectEvent}
          onSelectCategory={onSelectCategory}
          onJoinAsPro={onOpenSignUp || (() => onSelectView('profile'))}
          onHirePro={() => onSelectView('services')}
        />
      </div>

      {/* Multi-Slide Fullscreen Story Viewer Modal (All stories in single viewer window) */}
      <StoryViewerModal
        isOpen={isStoryViewerOpen}
        stories={allActiveStories}
        initialStoryId={selectedStoryId}
        currentUser={currentUser}
        onClose={() => setIsStoryViewerOpen(false)}
        onAddSlide={() => setIsCreateStoryOpen(true)}
        onDeleteSlide={onDeleteStorySlide}
        onReactToSlide={onReactToStorySlide}
        onSelectProfile={(authorName) => {
          if (onOpenProfile) {
            onOpenProfile({ name: authorName });
          } else {
            onSelectView('profile');
          }
        }}
      />

      {/* Create Story Modal (60s Video / Image from Link or Local Device) */}
      {isCreateStoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-md w-full shadow-2xl text-white animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Post Short Video / Story Slide</h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Video className="w-3 h-3" /> Max 60s
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">Post a short video or photo slide to your single story window</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateStoryOpen(false)} 
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
              {/* Local File Upload */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center justify-between">
                  <span>Upload Short Video / Media from Device</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Auto Malware Scanned</span>
                </label>
                <FileUploadWithScan
                  label="Select Short Video (MP4/WebM) or Photo"
                  accept="video/*,image/*"
                  onFileSelect={(url) => setNewStoryMediaUrl(url)}
                />
              </div>

              {/* Or Web Link */}
              <div>
                {newStoryMediaUrl.startsWith('data:') ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-emerald-400" />
                      <span>Device media attached ({newStoryMediaUrl.startsWith('data:video') ? 'Short Video Story' : 'Photo Story'})</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewStoryMediaUrl('')} 
                      className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                      title="Clear attached media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                      Or Paste Video / Photo Web URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://.../video.mp4 or web image link"
                      value={newStoryMediaUrl}
                      onChange={(e) => setNewStoryMediaUrl(e.target.value)}
                      className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Quick Sample Video Clips */}
              {!newStoryMediaUrl && (
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Or Try Sample Short Videos:
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewStoryMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4')}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold border border-neutral-700 transition flex items-center justify-center gap-1.5 text-center"
                    >
                      <Film className="w-3 h-3 text-emerald-400" />
                      <span>Coding Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewStoryMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-keyboard-41314-large.mp4')}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold border border-neutral-700 transition flex items-center justify-center gap-1.5 text-center"
                    >
                      <Film className="w-3 h-3 text-emerald-400" />
                      <span>Keyboard Video</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Story Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Working late on the new feature! ⚡"
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* External URL preview (only when web URL entered, avoiding duplicate when FileUploadWithScan already renders clean safe player) */}
              {!newStoryMediaUrl.startsWith('data:') && newStoryMediaUrl.trim() && (
                <div className="rounded-2xl overflow-hidden max-h-48 border border-emerald-500/40 bg-black flex items-center justify-center">
                  {(newStoryMediaUrl.toLowerCase().includes('.mp4') ||
                    newStoryMediaUrl.toLowerCase().includes('.webm') ||
                    newStoryMediaUrl.toLowerCase().includes('video')) ? (
                    <video 
                      src={newStoryMediaUrl} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      className="w-full max-h-48 object-contain" 
                    />
                  ) : (
                    <img 
                      src={newStoryMediaUrl} 
                      alt="Story preview" 
                      className="w-full max-h-48 object-cover" 
                    />
                  )}
                </div>
              )}
            </div>

            {/* Modal Fixed Footer - NEVER cut off */}
            <div className="p-4 border-t border-neutral-800/80 bg-[#171717] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-neutral-400 font-medium">
                {newStoryMediaUrl ? (
                  (newStoryMediaUrl.startsWith('data:video') ||
                   newStoryMediaUrl.toLowerCase().includes('.mp4') ||
                   newStoryMediaUrl.toLowerCase().includes('.webm') ||
                   newStoryMediaUrl.toLowerCase().includes('video'))
                    ? 'Ready to post video story slide'
                    : 'Ready to post photo story slide'
                ) : 'Select a video or image to post'}
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateStoryOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newStoryMediaUrl.trim()}
                  onClick={() => {
                    if (!newStoryMediaUrl.trim()) {
                      alert('Please select or paste a media file for your story slide.');
                      return;
                    }
                    const newS: Story = {
                      id: `story_${Date.now()}`,
                      authorName: currentUser.name,
                      authorAvatar: currentUser.avatar,
                      mediaUrl: newStoryMediaUrl,
                      createdAt: 'Just now',
                      hasUnseen: true,
                      slides: [{
                        id: `slide_${Date.now()}`,
                        mediaUrl: newStoryMediaUrl,
                        createdAt: 'Just now',
                        caption: newStoryCaption.trim()
                      }]
                    };
                    if (onAddStory) {
                      onAddStory(newS);
                    }
                    setIsCreateStoryOpen(false);
                    setNewStoryMediaUrl('');
                    setNewStoryCaption('');
                    showToast('Short video story posted to your story window!');
                  }}
                  className={`px-5 py-2.5 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 ${
                    newStoryMediaUrl.trim()
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-102'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Post to Story</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-emerald-500/40 text-emerald-400 font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* About Account Modal */}
      {aboutAccountModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-white space-y-5 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="font-extrabold text-base text-white">About this account</h3>
              <button onClick={() => setAboutAccountModalPost(null)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <img
                src={aboutAccountModalPost.authorAvatar}
                alt={aboutAccountModalPost.authorName}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/30"
              />
              <div className="flex items-center gap-1.5 font-black text-lg">
                <span>{aboutAccountModalPost.authorName}</span>
                <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-neutral-400 font-medium flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{aboutAccountModalPost.authorLocation || 'Gauteng, South Africa'}</span>
              </p>
            </div>

            <div className="space-y-3 bg-[#121212] border border-neutral-800/80 rounded-2xl p-4 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-400">Date joined</span>
                <span className="font-bold">January 2024</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300 border-t border-neutral-800/60 pt-2.5">
                <span className="text-neutral-400">Account location</span>
                <span className="font-bold">South Africa 🇿🇦</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300 border-t border-neutral-800/60 pt-2.5">
                <span className="text-neutral-400">Verification status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SETA Verified
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-300 border-t border-neutral-800/60 pt-2.5">
                <span className="text-neutral-400">Former usernames</span>
                <span className="font-bold">0 changes</span>
              </div>
            </div>

            <button
              onClick={() => setAboutAccountModalPost(null)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {embedModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-extrabold text-base text-white">Embed Post</h3>
              <button onClick={() => setEmbedModalPost(null)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">Copy and paste this HTML snippet to embed this post on external websites.</p>

            <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-3 text-[11px] font-mono text-emerald-400 break-all select-all">
              {`<blockquote className="skillhub-post" data-post-id="${embedModalPost.id}"><a href="${window.location.origin}/?post=${embedModalPost.id}">Post by ${embedModalPost.authorName} on SkillHub</a></blockquote><script async src="${window.location.origin}/embed.js"></script>`}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEmbedModalPost(null)}
                className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const code = `<blockquote className="skillhub-post" data-post-id="${embedModalPost.id}"><a href="${window.location.origin}/?post=${embedModalPost.id}">Post by ${embedModalPost.authorName} on SkillHub</a></blockquote><script async src="${window.location.origin}/embed.js"></script>`;
                  navigator.clipboard.writeText(code);
                  setCopiedEmbed(true);
                  setTimeout(() => setCopiedEmbed(false), 2000);
                  showToast('Embed code copied to clipboard!');
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                {copiedEmbed ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmbed ? 'Copied!' : 'Copy Embed Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share To Modal */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-white space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-extrabold text-base text-white">Share Post</h3>
              <button onClick={() => setShareModalPost(null)} className="p-1 text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  const text = `Check out this post by ${shareModalPost.authorName} on SkillHub: ${window.location.origin}/?post=${shareModalPost.id}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  setShareModalPost(null);
                }}
                className="flex flex-col items-center justify-center p-4 bg-[#121212] hover:bg-neutral-800/80 border border-neutral-800 rounded-2xl gap-2 text-xs font-bold transition"
              >
                <span className="text-2xl">💬</span>
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  const text = `Check out this post on SkillHub! ${window.location.origin}/?post=${shareModalPost.id}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  setShareModalPost(null);
                }}
                className="flex flex-col items-center justify-center p-4 bg-[#121212] hover:bg-neutral-800/80 border border-neutral-800 rounded-2xl gap-2 text-xs font-bold transition"
              >
                <span className="text-2xl">🌐</span>
                <span>X / Twitter</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/?post=${shareModalPost.id}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                  setShareModalPost(null);
                }}
                className="flex flex-col items-center justify-center p-4 bg-[#121212] hover:bg-neutral-800/80 border border-neutral-800 rounded-2xl gap-2 text-xs font-bold transition"
              >
                <span className="text-2xl">💼</span>
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/?post=${shareModalPost.id}`;
                  navigator.clipboard.writeText(url);
                  setShareModalPost(null);
                  showToast('Post link copied!');
                }}
                className="flex flex-col items-center justify-center p-4 bg-[#121212] hover:bg-neutral-800/80 border border-neutral-800 rounded-2xl gap-2 text-xs font-bold transition"
              >
                <Copy className="w-6 h-6 text-emerald-400" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-white space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-white">Delete Post?</h3>
              <p className="text-xs text-neutral-400">This action cannot be undone. This post will be permanently removed from your feed.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePost) {
                    onDeletePost(postToDelete.id);
                  }
                  setPostToDelete(null);
                  showToast('Post deleted successfully');
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPost && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportingPost(null)}
          contentType="post"
          contentId={reportingPost.id}
          contentPreview={reportingPost.content}
          onSuccess={() => showToast('Thank you. Our moderation team will review this content.')}
        />
      )}

    </div>
  );
};
