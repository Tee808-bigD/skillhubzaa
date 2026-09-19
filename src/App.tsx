import React, { useState, useEffect, useMemo } from 'react';
import { 
  MainView, 
  SouthAfricanProvince, 
  Course, 
  Learnership, 
  YouthService, 
  Mentor, 
  User, 
  Notification,
  LearningResource,
  SocialPost,
  Story,
  Reel,
  CommunityEvent,
  ChatConversation
} from './types';
import { 
  currentUser as defaultUser, 
  initialCourses, 
  initialLearnerships, 
  initialYouthServices, 
  initialMentors, 
  initialNotifications,
  initialLearningResources,
  initialSocialPosts,
  initialStories,
  initialReels,
  initialEvents,
  initialChatConversations
} from './data/mockData';

import { SocialSidebar } from './components/SocialSidebar';
import { FeedView } from './components/FeedView';
import { ReelsView } from './components/ReelsView';
import { MessagesView } from './components/MessagesView';
import { CreatePostModal } from './components/CreatePostModal';
import { EventMapView } from './components/EventMapView';
import { LiveAudioSpacesView } from './components/LiveAudioSpacesView';
import { EscrowPaymentModal } from './components/EscrowPaymentModal';
import { EventDetailModal } from './components/EventDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CourseCard } from './components/CourseCard';
import { CourseDetailModal } from './components/CourseDetailModal';
import { LearnershipCard } from './components/LearnershipCard';
import { ApplyLearnershipModal } from './components/ApplyLearnershipModal';
import { YouthServiceCard } from './components/YouthServiceCard';
import { CreateServiceModal } from './components/CreateServiceModal';
import { MentorCard } from './components/MentorCard';
import { BookMentorModal } from './components/BookMentorModal';
import { AICareerAdvisor } from './components/AICareerAdvisor';
import { ProfileView } from './components/ProfileView';
import { NotificationsView } from './components/NotificationsView';
import { LearningResourcesView } from './components/LearningResourcesView';
import { AddResourceModal } from './components/AddResourceModal';

import { 
  GraduationCap, 
  Briefcase, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  Plus, 
  Bookmark, 
  Filter, 
  Search,
  CheckCircle2,
  BookOpen,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // Navigation State (default to social media feed)
  const [currentView, setCurrentView] = useState<MainView>('feed');
  const [viewedProfileUser, setViewedProfileUser] = useState<User | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<SouthAfricanProvince>('All South Africa');

  const handleOpenUserProfile = (targetUser?: Partial<User> | null) => {
    if (!targetUser || targetUser.id === user.id || targetUser.name === user.name) {
      setViewedProfileUser(null);
    } else {
      const fullUser: User = {
        id: targetUser.id || `user_${Date.now()}`,
        name: targetUser.name || 'SkillHub Member',
        handle: targetUser.handle || `@${(targetUser.name || 'member').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: targetUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: targetUser.bio || 'Active Community Member in SkillHub ZA.',
        location: targetUser.location || 'South Africa',
        province: targetUser.province || 'Gauteng',
        verified: true,
        setaVerified: true,
        role: targetUser.role || 'youth',
        skills: targetUser.skills || ['Trades & Skills', 'Youth Mentorship'],
        educationLevel: targetUser.educationLevel || 'Matric / Diploma',
        enrolledCourseIds: [],
        savedLearnershipIds: [],
        savedServiceIds: [],
        savedResourceIds: [],
        certificatesCount: 2,
        badge: targetUser.badge || 'Verified Member'
      };
      setViewedProfileUser(fullUser);
    }
    setCurrentView('profile');
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Persistence State
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('skillhub_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return defaultUser;
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('skillhub_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSocialPosts;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('skillhub_stories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialStories;
  });

  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem('skillhub_reels');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialReels;
  });

  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    const saved = localStorage.getItem('skillhub_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialEvents;
  });

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('skillhub_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialChatConversations;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('skillhub_courses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialCourses;
  });

  const [learnerships, setLearnerships] = useState<Learnership[]>(() => {
    const saved = localStorage.getItem('skillhub_learnerships');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialLearnerships;
  });

  const [services, setServices] = useState<YouthService[]>(() => {
    const saved = localStorage.getItem('skillhub_services');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialYouthServices;
  });

  const [mentors, setMentors] = useState<Mentor[]>(() => {
    const saved = localStorage.getItem('skillhub_mentors');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialMentors;
  });

  const [resources, setResources] = useState<LearningResource[]>(() => {
    const saved = localStorage.getItem('skillhub_resources');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialLearningResources;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('skillhub_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialNotifications;
  });

  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('skillhub_saved_post_ids');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return ['post_1'];
  });

  useEffect(() => {
    localStorage.setItem('skillhub_saved_post_ids', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  // Modal Control States
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);
  const [applyLearnershipModal, setApplyLearnershipModal] = useState<Learnership | null>(null);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState<boolean>(false);
  const [bookMentorModal, setBookMentorModal] = useState<Mentor | null>(null);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState<boolean>(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [escrowServiceModal, setEscrowServiceModal] = useState<YouthService | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<CommunityEvent | null>(null);
  const [activeChatParticipantName, setActiveChatParticipantName] = useState<string>('');

  // Auto-filtering of concluded events
  const activeEvents = useMemo(() => {
    const now = Date.now();
    return events.filter(evt => {
      if (evt.isConcluded) return false;
      if (evt.concludedDateISO) {
        const concludedTime = new Date(evt.concludedDateISO).getTime();
        if (!isNaN(concludedTime) && concludedTime < now) return false;
      }
      return true;
    });
  }, [events]);

  // Social Handlers
  const handleToggleBookmarkPost = (postId: string) => {
    setSavedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    setSocialPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== postId));
    setSavedPostIds(prev => prev.filter(id => id !== postId));
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleRSVPEvent = (eventId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const isAttending = !evt.isAttending;
        return {
          ...evt,
          isAttending,
          attendeesCount: isAttending ? evt.attendeesCount + 1 : Math.max(0, evt.attendeesCount - 1)
        };
      }
      return evt;
    }));
  };

  // Safe LocalStorage Helper to prevent QuotaExceededError crashes with video/media files
  const safeSetLocalStorageItem = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[LocalStorage] Quota warning when saving ${key}:`, err);
      try {
        if (Array.isArray(value)) {
          const sanitized = value.map(item => {
            if (item && typeof item === 'object') {
              const newItem = { ...item };
              if (typeof newItem.mediaUrl === 'string' && newItem.mediaUrl.length > 200000) {
                newItem.mediaUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
              }
              if (typeof newItem.videoUrl === 'string' && newItem.videoUrl.length > 200000) {
                newItem.videoUrl = '';
              }
              return newItem;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(sanitized));
        }
      } catch (fallbackErr) {
        console.error(`[LocalStorage] Fallback save failed for ${key}:`, fallbackErr);
      }
    }
  };

  // Persist local state changes
  useEffect(() => {
    safeSetLocalStorageItem('skillhub_user', user);
  }, [user]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_posts', socialPosts);
  }, [socialPosts]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_stories', stories);
  }, [stories]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_chats', chatConversations);
  }, [chatConversations]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_events', events);
  }, [events]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_services', services);
  }, [services]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_resources', resources);
  }, [resources]);

  useEffect(() => {
    safeSetLocalStorageItem('skillhub_reels', reels);
  }, [reels]);

  // Social Handlers
  const handleAddReel = (newReel: Reel) => {
    setReels(prev => [newReel, ...prev]);
  };
  const handleLikePost = (postId: string) => {
    setSocialPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1
        };
      }
      return post;
    }));
  };

  const handleAddSocialPost = (newPost: SocialPost) => {
    setSocialPosts(prev => [newPost, ...prev]);
  };

  const handleAddStory = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
  };

  const handleAddEvent = (newEvent: CommunityEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleOpenDirectChat = (participantName: string) => {
    setActiveChatParticipantName(participantName);
    setChatConversations(prev => {
      const exists = prev.some(c => c.participantName.toLowerCase() === participantName.toLowerCase());
      if (!exists) {
        const id = `chat_${participantName.toLowerCase().replace(/\s+/g, '_')}`;
        const newChat: ChatConversation = {
          id,
          participantId: id,
          participantName,
          participantHandle: `@${participantName.toLowerCase().replace(/\s+/g, '_')}`,
          participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          online: true,
          lastMessage: 'Conversation started',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: []
        };
        return [newChat, ...prev];
      }
      return prev;
    });
    setCurrentView('messages');
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const userMsg = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatConversations(prev => {
      const exists = prev.some(chat => chat.id === conversationId);
      if (!exists) {
        const newChat: ChatConversation = {
          id: conversationId,
          participantId: conversationId,
          participantName: conversationId.replace('chat_', '').replace(/_/g, ' '),
          participantHandle: `@${conversationId.replace('chat_', '').toLowerCase()}`,
          participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
          online: true,
          lastMessage: text,
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: [userMsg]
        };
        return [newChat, ...prev];
      }
      return prev.map(chat => {
        if (chat.id === conversationId) {
          return {
            ...chat,
            lastMessage: text,
            lastMessageTime: 'Just now',
            messages: [...chat.messages, userMsg]
          };
        }
        return chat;
      });
    });

    // Auto-reply simulation
    setTimeout(() => {
      const replies = [
        "Thanks for reaching out! I'm reviewing the details right now.",
        "That sounds like a fantastic opportunity. Let's schedule a call!",
        "Got it! I'll send over the project specifications in a bit."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg = {
        id: `reply_${Date.now()}`,
        senderId: conversationId,
        senderName: conversationId.replace('chat_', '').replace(/_/g, ' '),
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };

      setChatConversations(prev => prev.map(chat => {
        if (chat.id === conversationId) {
          return {
            ...chat,
            lastMessage: randomReply,
            lastMessageTime: 'Just now',
            messages: [...chat.messages, replyMsg]
          };
        }
        return chat;
      }));
    }, 1200);
  };

  // Other Platform Handlers
  const handleEnrollCourse = (courseId: string) => {
    if (user.enrolledCourseIds.includes(courseId)) return;
    setUser(prev => ({ ...prev, enrolledCourseIds: [...prev.enrolledCourseIds, courseId] }));
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      type: 'course',
      title: 'Course Enrolled Successfully',
      message: 'You have enrolled in the SETA accredited bootcamp. Check your profile to start lessons.',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleToggleBookmarkLearnership = (learnershipId: string) => {
    setUser(prev => {
      const exists = prev.savedLearnershipIds.includes(learnershipId);
      return {
        ...prev,
        savedLearnershipIds: exists
          ? prev.savedLearnershipIds.filter(id => id !== learnershipId)
          : [...prev.savedLearnershipIds, learnershipId]
      };
    });
  };

  const handleToggleUpvoteResource = (resourceId: string) => {
    setResources(prev => prev.map(res => {
      if (res.id === resourceId) {
        const isUpvoted = !res.isUpvoted;
        return {
          ...res,
          isUpvoted,
          upvotes: isUpvoted ? res.upvotes + 1 : res.upvotes - 1
        };
      }
      return res;
    }));
  };

  const handleToggleBookmarkResource = (resourceId: string) => {
    setResources(prev => prev.map(res => {
      if (res.id === resourceId) {
        return { ...res, isBookmarked: !res.isBookmarked };
      }
      return res;
    }));
  };

  const handleAddResource = (newResource: LearningResource) => {
    setResources(prev => [newResource, ...prev]);
  };

  const handleSubmitLearnershipApp = (learnershipId: string) => {
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      type: 'learnership',
      title: 'Learnership Application Submitted',
      message: 'Your CV & Matric certificate have been transmitted to the SETA employer desk.',
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
    alert('Application submitted successfully to SETA Employer Desk!');
    setApplyLearnershipModal(null);
  };

  const handleCreateService = (newService: YouthService) => {
    setServices(prev => [newService, ...prev]);
    setIsCreateServiceOpen(false);
  };

  const handleContactWhatsApp = (service: YouthService) => {
    handleOpenDirectChat(service.providerName);
  };

  const handleConfirmMentorBooking = (mentorId: string, slot: string) => {
    alert(`Mentor session confirmed for ${slot}! Details sent to your email & notifications.`);
    setBookMentorModal(null);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Filtered views
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = !searchQuery.trim() || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [courses, searchQuery, selectedCategory]);

  const filteredLearnerships = useMemo(() => {
    return learnerships.filter(l => {
      const matchSearch = !searchQuery.trim() ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.skillsGained.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchProvince = selectedProvince === 'All South Africa' || l.province === selectedProvince;
      return matchSearch && matchProvince;
    });
  }, [learnerships, searchQuery, selectedProvince]);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchSearch = !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProvince = selectedProvince === 'All South Africa' || s.providerProvince === selectedProvince;
      return matchSearch && matchProvince;
    });
  }, [services, searchQuery, selectedProvince]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 flex">
      
      {/* Left Social Navigation Sidebar */}
      <SocialSidebar
        currentView={currentView}
        onSelectView={(v) => {
          if (v === 'profile') setViewedProfileUser(null);
          setCurrentView(v);
        }}
        currentUser={user}
        unreadMessagesCount={1}
        unreadNotifsCount={unreadNotifCount}
        onOpenCreate={() => setIsCreatePostModalOpen(true)}
      />

      {/* Main View Area offset by sidebar */}
      <div className="flex-1 ml-16 lg:ml-64 min-h-screen pb-16">
        
        {/* Main Content View Switch */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
          
          {/* Feed View */}
          {(currentView === 'feed' || currentView === 'home') && (
            <FeedView
              posts={socialPosts.map(p => ({ ...p, isBookmarked: savedPostIds.includes(p.id) }))}
              stories={stories}
              events={activeEvents}
              currentUser={user}
              onLikePost={handleLikePost}
              onAddPost={handleAddSocialPost}
              onAddStory={handleAddStory}
              onToggleBookmarkPost={handleToggleBookmarkPost}
              onDeletePost={handleDeletePost}
              onOpenDirectChat={handleOpenDirectChat}
              onSelectView={setCurrentView}
              onOpenCreateEvent={() => setIsCreatePostModalOpen(true)}
              onSelectEvent={setSelectedEventModal}
              onOpenProfile={handleOpenUserProfile}
            />
          )}

          {/* Reels View */}
          {currentView === 'reels' && (
            <ReelsView
              reels={reels}
              currentUser={user}
              conversations={chatConversations}
              onOpenDirectChat={handleOpenDirectChat}
              onAddReel={handleAddReel}
              onAddSocialPost={handleAddSocialPost}
              onSendMessage={handleSendMessage}
              onNavigateView={setCurrentView}
              onOpenProfile={handleOpenUserProfile}
            />
          )}

          {/* Interactive Map View */}
          {currentView === 'map' && (
            <EventMapView
              events={activeEvents}
              services={services}
            />
          )}

          {/* Live Audio Spaces View */}
          {currentView === 'audio_spaces' && (
            <LiveAudioSpacesView
              currentUser={user}
              mentors={mentors}
            />
          )}

          {/* Messages View */}
          {currentView === 'messages' && (
            <MessagesView
              conversations={chatConversations}
              currentUser={user}
              onSendMessage={handleSendMessage}
              activeChatParticipantName={activeChatParticipantName}
              onOpenProfile={handleOpenUserProfile}
            />
          )}

          {/* Courses & SETA */}
          {currentView === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 shadow-xl">
                <div>
                  <h1 className="text-xl font-black text-white">SETA Accredited Courses & Bootcamps</h1>
                  <p className="text-xs text-neutral-400 font-medium">Free, funded online courses with digital certificates recognized across SA</p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {['all', 'coding', 'renewable', 'digital', 'data', 'agri'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl border transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                          : 'bg-[#121212] text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={user.enrolledCourseIds.includes(course.id)}
                    onSelectCourse={setSelectedCourseModal}
                    onEnroll={handleEnrollCourse}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Learnerships */}
          {currentView === 'learnerships' && (
            <div className="space-y-6">
              <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white">South African SETA Learnerships & Internships</h1>
                  <p className="text-xs text-neutral-400 font-medium">Monthly stipends ranging from R4,200 to R7,000 across Gauteng, Cape Town, KZN, & EC</p>
                </div>

                <div className="bg-emerald-500/20 text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  Active Region: {selectedProvince}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredLearnerships.map(learn => (
                  <LearnershipCard
                    key={learn.id}
                    learnership={learn}
                    isBookmarked={user.savedLearnershipIds.includes(learn.id)}
                    onBookmark={handleToggleBookmarkLearnership}
                    onApply={setApplyLearnershipModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Youth Service Marketplace */}
          {currentView === 'services' && (
            <div className="space-y-6">
              <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white">Youth Freelance & Service Marketplace</h1>
                  <p className="text-xs text-neutral-400 font-medium">Support South African youth entrepreneurs or list your own service to start earning</p>
                </div>

                <button
                  onClick={() => setIsCreateServiceOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Your Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <YouthServiceCard
                    key={service.id}
                    service={service}
                    onContact={handleContactWhatsApp}
                    onEscrowPay={setEscrowServiceModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mentors Network */}
          {currentView === 'mentors' && (
            <div className="space-y-6">
              <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-neutral-800 shadow-xl">
                <h1 className="text-xl font-black text-white">1-on-1 Industry Mentors</h1>
                <p className="text-xs text-neutral-400 font-medium">Connect directly with cloud architects, engineering directors, and venture founders</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map(mentor => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onBook={setBookMentorModal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Community Learning Resources Hub */}
          {currentView === 'resources' && (
            <LearningResourcesView
              resources={resources}
              currentUser={user}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleUpvote={handleToggleUpvoteResource}
              onToggleBookmark={handleToggleBookmarkResource}
              onOpenAddResource={() => setIsAddResourceOpen(true)}
            />
          )}

          {/* AI Career & CV Advisor */}
          {currentView === 'ai_advisor' && (
            <AICareerAdvisor
              currentUser={user}
              onNavigateView={setCurrentView}
            />
          )}

          {/* User Profile */}
          {currentView === 'profile' && (
            <ProfileView
              currentUser={user}
              viewedUser={viewedProfileUser}
              onUpdateUser={setUser}
              enrolledCourses={courses.filter(c => (viewedProfileUser || user).enrolledCourseIds?.includes(c.id))}
              savedLearnerships={learnerships.filter(l => (viewedProfileUser || user).savedLearnershipIds?.includes(l.id))}
              userServices={services.filter(s => s.providerName === (viewedProfileUser || user).name || s.providerId === (viewedProfileUser || user).id)}
              userPosts={socialPosts.filter(p => p.authorName === (viewedProfileUser || user).name || p.authorHandle === (viewedProfileUser || user).handle || p.authorId === (viewedProfileUser || user).id)}
              savedPosts={!viewedProfileUser ? socialPosts.filter(p => savedPostIds.includes(p.id)) : []}
              onDeletePost={handleDeletePost}
              onDeleteService={handleDeleteService}
              onToggleBookmarkPost={handleToggleBookmarkPost}
              onNavigateView={setCurrentView}
              onOpenDirectChat={handleOpenDirectChat}
              onBackToOwnProfile={() => setViewedProfileUser(null)}
            />
          )}

          {/* Notifications */}
          {currentView === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onNavigateView={setCurrentView}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      {isCreatePostModalOpen && (
        <CreatePostModal
          currentUser={user}
          onClose={() => setIsCreatePostModalOpen(false)}
          onAddPost={handleAddSocialPost}
          onAddStory={handleAddStory}
          onAddEvent={handleAddEvent}
        />
      )}

      {selectedCourseModal && (
        <CourseDetailModal
          course={selectedCourseModal}
          isEnrolled={user.enrolledCourseIds.includes(selectedCourseModal.id)}
          onClose={() => setSelectedCourseModal(null)}
          onEnroll={handleEnrollCourse}
        />
      )}

      {applyLearnershipModal && (
        <ApplyLearnershipModal
          learnership={applyLearnershipModal}
          currentUser={user}
          onClose={() => setApplyLearnershipModal(null)}
          onSubmitApplication={handleSubmitLearnershipApp}
        />
      )}

      {isCreateServiceOpen && (
        <CreateServiceModal
          currentUser={user}
          onClose={() => setIsCreateServiceOpen(false)}
          onCreateService={handleCreateService}
        />
      )}

      {bookMentorModal && (
        <BookMentorModal
          mentor={bookMentorModal}
          currentUser={user}
          onClose={() => setBookMentorModal(null)}
          onConfirmBooking={handleConfirmMentorBooking}
        />
      )}

      {isAddResourceOpen && (
        <AddResourceModal
          currentUser={user}
          onClose={() => setIsAddResourceOpen(false)}
          onAddResource={handleAddResource}
        />
      )}

      {escrowServiceModal && (
        <EscrowPaymentModal
          service={escrowServiceModal}
          currentUser={user}
          onClose={() => setEscrowServiceModal(null)}
          onConfirmEscrow={(details) => {
            alert(`Escrow Deposit Confirmed! Transaction ID: ${details.transactionId}. Funds held securely until work approval.`);
            setEscrowServiceModal(null);
          }}
        />
      )}

      {selectedEventModal && (
        <EventDetailModal
          event={selectedEventModal}
          onClose={() => setSelectedEventModal(null)}
          onRSVP={handleRSVPEvent}
        />
      )}

      <OfflineIndicator />

    </div>
  );
}
