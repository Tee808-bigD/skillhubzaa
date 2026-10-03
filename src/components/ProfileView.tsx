import React, { useState, useRef } from 'react';
import { User, Course, Learnership, YouthService, SocialPost } from '../types';
import { Edit3, CheckCircle2, ShieldCheck, Award, BookOpen, Briefcase, ShoppingBag, MapPin, Phone, Calendar, Trash2, MessageSquare, ThumbsUp, Send, Bookmark, ArrowLeft, UserPlus, UserCheck, Camera, RefreshCw, Download, AlertTriangle, Shield } from 'lucide-react';
import { uploadAvatar, logout } from '../api/auth';
import apiClient from '../api/client';

interface ProfileViewProps {
  currentUser: User;
  viewedUser?: User | null;
  onUpdateUser: (user: User) => void;
  enrolledCourses: Course[];
  savedLearnerships: Learnership[];
  userServices: YouthService[];
  userPosts: SocialPost[];
  savedPosts?: SocialPost[];
  onDeletePost: (postId: string) => void;
  onDeleteService?: (serviceId: string) => void;
  onToggleBookmarkPost?: (postId: string) => void;
  onNavigateView: (view: any) => void;
  onOpenDirectChat?: (participantName: string) => void;
  onBackToOwnProfile?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  viewedUser,
  onUpdateUser,
  enrolledCourses,
  savedLearnerships,
  userServices,
  userPosts,
  savedPosts = [],
  onDeletePost,
  onDeleteService,
  onToggleBookmarkPost,
  onNavigateView,
  onOpenDirectChat,
  onBackToOwnProfile
}) => {
  const isOwnProfile = !viewedUser || viewedUser.id === currentUser.id || viewedUser.name === currentUser.name;
  const targetUser = isOwnProfile ? currentUser : viewedUser!;

  const [activeTab, setActiveTab] = useState<'my_posts' | 'saved_posts' | 'courses' | 'saved_learnerships' | 'my_services' | 'privacy'>('my_posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [name, setName] = useState(targetUser.name);
  const [bio, setBio] = useState(targetUser.bio || '');
  const [skills, setSkills] = useState(targetUser.skills.join(', '));
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever targetUser changes (e.g. after registration or profile switch)
  React.useEffect(() => {
    setName(targetUser.name);
    setBio(targetUser.bio || '');
    setSkills(targetUser.skills ? targetUser.skills.join(', ') : '');
  }, [targetUser.id, targetUser.name, targetUser.bio, targetUser.skills]);

  // POPIA Data Subject Rights State
  const [isExportingData, setIsExportingData] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDownloadData = async () => {
    setIsExportingData(true);
    try {
      const res = await apiClient.get('users/data-export/', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillHub_ZA_POPIA_Data_${(currentUser.handle || currentUser.name).replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.warn('API data export fallback:', err);
      const fallbackData = {
        popia_statement: "Personal Data Export under Section 23 of POPIA (South Africa)",
        user: currentUser,
        posts: userPosts,
        services: userServices,
        courses: enrolledCourses,
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(fallbackData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillHub_ZA_POPIA_Data_${currentUser.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      await apiClient.post('users/delete-account/', { confirmation: 'DELETE' });
      await logout();
      window.location.reload();
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setDeleteError(err.response?.data?.error || 'Failed to erase account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await uploadAvatar(file);
      onUpdateUser({
        ...currentUser,
        avatar: updatedUser.avatar || currentUser.avatar,
      });
      setAvatarToast('Avatar uploaded & saved to Django media/avatars/! 📸');
      setTimeout(() => setAvatarToast(null), 3000);
    } catch (err: any) {
      console.warn('Avatar upload fallback to local preview:', err);
      const localPreview = URL.createObjectURL(file);
      onUpdateUser({
        ...currentUser,
        avatar: localPreview,
      });
      setAvatarToast('Avatar updated locally.');
      setTimeout(() => setAvatarToast(null), 3000);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Back Banner when viewing someone else's profile */}
      {!isOwnProfile && (
        <div className="flex items-center justify-between bg-[#1e1e1e] border border-neutral-800 p-4 rounded-3xl shadow-xl">
          <button
            onClick={onBackToOwnProfile}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to My Profile</span>
          </button>
          <span className="text-xs font-bold text-neutral-300">
            Viewing <span className="text-emerald-400">{targetUser.name}</span>'s Profile
          </span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 relative" />

        {/* Toast Alert */}
        {avatarToast && (
          <div className="bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <span>{avatarToast}</span>
            <button onClick={() => setAvatarToast(null)} className="ml-2 hover:opacity-80">✕</button>
          </div>
        )}

        <div className="p-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            {/* Avatar with click-to-upload */}
            <div 
              className={`relative group rounded-2xl ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={() => isOwnProfile && !isUploadingAvatar && avatarInputRef.current?.click()}
              title={isOwnProfile ? 'Click to upload and change avatar photo' : undefined}
            >
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white ring-2 ring-emerald-500/30 group-hover:brightness-95 transition-all"
              />

              {isOwnProfile && (
                <div className="absolute inset-0 bg-slate-950/50 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Change</span>
                </div>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mb-1" />
                  <span className="text-[9px] font-bold text-white">Saving...</span>
                </div>
              )}

              {/* Hidden file input for avatar upload */}
              {isOwnProfile && (
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              )}
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {onOpenDirectChat && (
                  <button
                    onClick={() => onOpenDirectChat(targetUser.name)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                )}
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl font-extrabold text-xs transition-all ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {isFollowing ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Bio / Profile Headline</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{targetUser.name}</h1>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {targetUser.badge || (targetUser.role === 'mentor' ? 'Certified Mentor' : targetUser.role === 'employer' ? 'Accredited Employer' : 'Verified SETA Youth')}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                  {targetUser.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                <span>{targetUser.handle}</span>
                <span>•</span>
                <span>{targetUser.location}</span>
                {targetUser.email && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 font-mono text-[11px]">{targetUser.email}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed max-w-2xl font-medium">{targetUser.bio}</p>

              {/* Skills Badges */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {targetUser.skills.map(skill => (
                  <span key={skill} className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 text-center">
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-black text-slate-900 text-base">{userPosts.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Public Posts</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-black text-slate-900 text-base">{targetUser.certificatesCount || 2}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Digital Certificates</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-black text-slate-900 text-base">{userServices.length}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Marketplace Services</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-t border-slate-100 px-6 font-bold text-xs bg-slate-50 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('my_posts')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'my_posts' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {isOwnProfile ? 'My Posts & Activity' : `${targetUser.name}'s Posts`} ({userPosts.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved_posts')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'saved_posts' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved Posts ({savedPosts.length})
            </button>
          )}

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'courses' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              My Courses ({enrolledCourses.length})
            </button>
          )}

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved_learnerships')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'saved_learnerships' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Saved Learnerships ({savedLearnerships.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('my_services')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'my_services' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isOwnProfile ? 'My Services' : `${targetUser.name}'s Services`} ({userServices.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'privacy' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              POPIA & Privacy
            </button>
          )}
        </div>

      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'my_posts' && (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{post.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{post.createdAt}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                      title="Permanently Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Post</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.content}</p>

                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden max-h-48 bg-slate-100 border border-slate-200">
                      <img src={post.mediaUrl} alt="Post attachment" className="w-full h-48 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      {post.likesCount} Likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      {post.commentsCount} Comments
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">You haven't posted any updates yet.</p>
                <button
                  onClick={() => onNavigateView('feed')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved_posts' && (
          <div className="space-y-4">
            {savedPosts.length > 0 ? (
              savedPosts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-500/30" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{post.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{post.createdAt} • ID: {post.id}</span>
                      </div>
                    </div>

                    {onToggleBookmarkPost && (
                      <button
                        onClick={() => onToggleBookmarkPost(post.id)}
                        className="flex items-center gap-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold text-xs transition"
                        title="Remove from Saved"
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-emerald-600" />
                        <span>Saved</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.content}</p>

                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden max-h-48 bg-slate-100 border border-slate-200">
                      <img src={post.mediaUrl} alt="Post attachment" className="w-full h-48 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                        {post.likesCount} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        {post.commentsCount} Comments
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?post=${post.id}`;
                        navigator.clipboard.writeText(url);
                        alert(`Copied post link to clipboard!\n${url}`);
                      }}
                      className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1"
                    >
                      Copy Share Link
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">No saved posts yet. Click the bookmark icon on any post in the feed to save it here!</p>
                <button
                  onClick={() => onNavigateView('feed')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  Explore Feed
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-3">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map(course => (
                <div key={course.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={course.bannerImage} alt={course.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600">{course.setaAccreditation}</span>
                      <h4 className="font-extrabold text-xs text-slate-900">{course.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{course.provider}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateView('courses')}
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400 shrink-0"
                  >
                    Continue Course
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">You haven't enrolled in any SkillHub courses yet.</p>
                <button
                  onClick={() => onNavigateView('courses')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  Browse Free Courses
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved_learnerships' && (
          <div className="space-y-3">
            {savedLearnerships.length > 0 ? (
              savedLearnerships.map(learn => (
                <div key={learn.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">{learn.setaCategory}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-1">{learn.title}</h4>
                    <p className="text-[11px] text-slate-500">{learn.company} • Stipend: {learn.stipendZar}</p>
                  </div>

                  <button
                    onClick={() => onNavigateView('learnerships')}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 shrink-0"
                  >
                    View Opportunity
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No saved learnerships yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'my_services' && (
          <div className="space-y-3">
            {userServices.length > 0 ? (
              userServices.map(serv => (
                <div key={serv.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{serv.title}</h4>
                    <p className="text-[11px] text-emerald-600 font-bold">R{serv.priceZar} / {serv.priceUnit}</p>
                  </div>

                  <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-1 rounded-lg">
                    Active Marketplace Listing
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">You haven't published any freelance service listings.</p>
                <button
                  onClick={() => onNavigateView('services')}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
                >
                  List a Freelance Skill
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-fadeIn">
            {/* POPIA Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">POPIA Data Protection Rights (South Africa)</h3>
                  <p className="text-xs text-slate-500">Protection of Personal Information Act No. 4 of 2013</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a registered SkillHub ZA member, you possess statutory rights regarding how your personal information is stored, processed, and safeguarded. Below, you can exercise your Right of Access (Section 23) and Right of Erasure (Section 24).
              </p>
            </div>

            {/* Download Data Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Download My Personal Information (JSON)
                </h4>
                <p className="text-xs text-slate-500 max-w-lg">
                  Export an official, machine-readable dossier containing your profile attributes, qualifications, posts, comments, and direct message records pursuant to POPIA Section 23.
                </p>
                {exportSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Personal data file downloaded successfully!
                  </span>
                )}
              </div>

              <button
                onClick={handleDownloadData}
                disabled={isExportingData}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isExportingData ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Dossier...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export My Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Erasure Section */}
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Erase Account & Personal Records
                </h4>
                <p className="text-xs text-rose-700/80 max-w-lg">
                  Permanently destroy all personal records, revoke active tokens, and anonymize user history in accordance with POPIA Section 24. This action is irreversible.
                </p>
              </div>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Erase All Account Data?</h3>
                <p className="text-xs text-slate-500">POPIA Section 24 Statutory Erasure</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will scrub your name, contact details, trade certifications, and active listings from SkillHub ZA servers. Outstanding sessions will be terminated immediately.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-rose-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmation('');
                    setDeleteError(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || deleteConfirmation !== 'DELETE'}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {isDeletingAccount ? 'Erasing Data...' : 'Confirm Erasure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
