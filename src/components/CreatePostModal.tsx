import React, { useState, useRef } from 'react';
import { SocialPost, Story, CommunityEvent, User } from '../types';
import { X, Image, Video, Calendar, Sparkles, Send, Upload } from 'lucide-react';
import { AICaptionGenerator } from './AICaptionGenerator';
import { FileUploadWithScan } from './FileUploadWithScan';
import { createPost } from '../api/posts';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onAddPost: (post: SocialPost) => void;
  onAddStory: (story: Story) => void;
  onAddEvent: (event: CommunityEvent) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onAddPost,
  onAddStory,
  onAddEvent
}) => {
  const [tab, setTab] = useState<'post' | 'story' | 'event'>('post');

  // Post form
  const [postText, setPostText] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postHashtags, setPostHashtags] = useState('');
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postFilePreview, setPostFilePreview] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Story form
  const [storyMediaUrl, setStoryMediaUrl] = useState('');

  // Event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateBadge, setEventDateBadge] = useState('Aug 28');
  const [eventFullDate, setEventFullDate] = useState('Friday, Aug 28 • 15:00 PM');
  const [eventLocation, setEventLocation] = useState('Soweto Community Centre');
  const [eventDesc, setEventDesc] = useState('');

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (postFilePreview) {
      URL.revokeObjectURL(postFilePreview);
    }
    setPostFile(file);
    setPostFilePreview(URL.createObjectURL(file));
    setPostMediaUrl('');
  };

  const handleClearModalFile = () => {
    if (postFilePreview) {
      URL.revokeObjectURL(postFilePreview);
    }
    setPostFile(null);
    setPostFilePreview(null);
    if (modalFileInputRef.current) {
      modalFileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !postMediaUrl.trim() && !postFile) return;

    const hashtags = postHashtags
      .split(',')
      .map(h => h.trim().replace(/^#/, ''))
      .filter(Boolean);

    const isVideo = postFile
      ? postFile.type.startsWith('video/')
      : (postMediaUrl.startsWith('data:video') || /\.(mp4|webm|mov)($|\?)/i.test(postMediaUrl));

    const mediaDisplay = postFilePreview || postMediaUrl || undefined;

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatar,
      authorLocation: currentUser.location,
      createdAt: 'Just now',
      content: postText.trim() || 'Shared a media update with the SkillHub community.',
      hashtags: hashtags.length > 0 ? hashtags : ['SkillHub', 'Community'],
      mediaType: isVideo ? 'video' : (mediaDisplay ? 'image' : undefined),
      mediaUrl: mediaDisplay,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true
    };

    onAddPost(newPost);
    onClose();

    // Asynchronously sync with Django REST Framework API
    try {
      if (postFile) {
        const formData = new FormData();
        formData.append('content', postText.trim() || 'Shared a media update with SkillHub.');
        formData.append('category', 'Community');
        if (hashtags.length > 0) formData.append('hashtags', JSON.stringify(hashtags));
        if (isVideo) {
          formData.append('video_file', postFile);
        } else {
          formData.append('media_file', postFile);
        }
        await createPost(formData);
      } else {
        await createPost({
          content: postText.trim(),
          media_type: isVideo ? 'video' : (postMediaUrl ? 'image' : 'text'),
          media_url: isVideo ? undefined : (postMediaUrl || undefined),
          video_url: isVideo ? postMediaUrl : undefined,
          category: 'Community',
          hashtags: hashtags.length > 0 ? hashtags : ['SkillHubZA']
        });
      }
    } catch (err) {
      console.warn('Backend sync failed, post saved locally:', err);
    }
  };

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaUrl.trim()) return;

    const newStory: Story = {
      id: `story_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      mediaUrl: storyMediaUrl,
      createdAt: 'Just now',
      hasUnseen: true,
      slides: [{
        id: `slide_${Date.now()}`,
        mediaUrl: storyMediaUrl,
        createdAt: 'Just now',
        caption: ''
      }]
    };

    onAddStory(newStory);
    onClose();
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim()) return;

    const newEvent: CommunityEvent = {
      id: `event_${Date.now()}`,
      title: eventTitle,
      description: eventDesc,
      dateBadge: eventDateBadge,
      fullDate: eventFullDate,
      location: eventLocation,
      hostName: currentUser.name,
      hostAvatar: currentUser.avatar,
      attendeesCount: 1,
      isAttending: true,
      category: 'Community'
    };

    onAddEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Header Tabs */}
        <div className="p-4 bg-[#141414] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('post')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                tab === 'post' ? 'bg-emerald-500 text-slate-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Post
            </button>
            <button
              onClick={() => setTab('story')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                tab === 'story' ? 'bg-emerald-500 text-slate-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setTab('event')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                tab === 'event' ? 'bg-emerald-500 text-slate-950' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Event
            </button>
          </div>

          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Forms */}
        <div className="p-6">
          {tab === 'post' && (
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <AICaptionGenerator
                onApplyCaption={(caption, hashtags) => {
                  setPostText(caption);
                  setPostHashtags(hashtags);
                }}
              />

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Post Content</label>
                <textarea
                  rows={3}
                  placeholder="Share a work update, project milestone, or skill tip..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Upload Photo / Video File</label>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File from Device</span>
                  </button>
                  {postFile && (
                    <span className="text-xs text-slate-300 font-mono truncate max-w-[200px]">
                      {postFile.name}
                    </span>
                  )}
                </div>

                {postFile && postFilePreview && (
                  <div className="relative mt-2 w-fit border border-emerald-500/40 rounded-xl overflow-hidden bg-black p-1">
                    {postFile.type.startsWith('video/') ? (
                      <video src={postFilePreview} controls className="h-32 w-auto max-w-full rounded-lg object-contain" />
                    ) : (
                      <img src={postFilePreview} alt="Selected preview" className="h-28 w-auto max-w-full rounded-lg object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={handleClearModalFile}
                      className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-full transition"
                      title="Clear selected file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Or Media Web URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={postMediaUrl}
                  onChange={(e) => setPostMediaUrl(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {postMediaUrl && (
                <div className="relative w-fit group border border-emerald-500/40 rounded-2xl overflow-hidden shadow-md bg-black">
                  {postMediaUrl.startsWith('data:video') || /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(postMediaUrl) ? (
                    <video src={postMediaUrl} controls className="h-32 w-auto max-w-full object-contain" />
                  ) : (
                    <img src={postMediaUrl} alt="Post Attachment Preview" className="h-28 w-auto max-w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPostMediaUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-black text-white rounded-full transition z-10"
                    title="Remove media attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Hashtags (comma separated)</label>
                <input
                  type="text"
                  placeholder="PlumberLife, Soweto, Craftsmanship"
                  value={postHashtags}
                  onChange={(e) => setPostHashtags(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-neutral-400">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md">
                  Publish Post
                </button>
              </div>
            </form>
          )}

          {tab === 'story' && (
            <form onSubmit={handleSubmitStory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Upload Story Media from Device (Auto Virus Scanned)</label>
                <FileUploadWithScan
                  label="Upload Story Image / Video"
                  onFileSelect={(url) => setStoryMediaUrl(url)}
                />
              </div>

              <div>
                {!storyMediaUrl.startsWith('data:') ? (
                  <>
                    <label className="text-xs font-bold text-neutral-400 block mb-1">OR Story Image / Video Web URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={storyMediaUrl}
                      onChange={(e) => setStoryMediaUrl(e.target.value)}
                      className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span>Device story file attached ({storyMediaUrl.startsWith('data:video') ? 'Video' : 'Image'})</span>
                    <button type="button" onClick={() => setStoryMediaUrl('')} className="hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-neutral-500">Stories are visible for 24 hours to your followers and community members.</p>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-neutral-400">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md">
                  Add to Story
                </button>
              </div>
            </form>
          )}

          {tab === 'event' && (
            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mambisa fest or Cape Town Tech Meetup"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-1">Date Badge</label>
                  <input
                    type="text"
                    required
                    placeholder="Aug 28"
                    value={eventDateBadge}
                    onChange={(e) => setEventDateBadge(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Soweto Youth Centre"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the meetup, lineup, or workshop details..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-neutral-400">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl shadow-md">
                  Create Event
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
