import React, { useState, useRef, useMemo } from 'react';
import { User, Course, Learnership, YouthService, SocialPost, Review, PortfolioItem, ProfessionalServiceItem, ExternalCourse } from '../types';
import { SavedCoursesView } from './SavedCoursesView';
import { 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Briefcase, 
  Award, 
  BookOpen, 
  ShoppingBag, 
  Camera, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  Shield, 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Bookmark, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  ThumbsUp, 
  DollarSign, 
  Check, 
  X, 
  FolderGit2, 
  Layers, 
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { uploadAvatar, logout } from '../api/auth';
import apiClient from '../api/client';
import { ReviewCard } from './ReviewCard';
import { PortfolioGrid } from './PortfolioGrid';
import { ServiceCard } from './ServiceCard';
import { initialReviews, initialPortfolioItems, initialProfessionalServices } from '../data/mockData';

interface ProfileViewProps {
  currentUser: User;
  viewedUser?: User | null;
  onUpdateUser: (user: User) => void;
  enrolledCourses: Course[];
  savedLearnerships: Learnership[];
  userServices: YouthService[];
  userPosts: SocialPost[];
  savedPosts?: SocialPost[];
  reviews?: Review[];
  portfolioItems?: PortfolioItem[];
  professionalServices?: ProfessionalServiceItem[];
  savedExternalCourses?: ExternalCourse[];
  onRemoveFromSavedCourses?: (courseId: string) => void;
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
  reviews: initialReviewsProp,
  portfolioItems: initialPortfolioProp,
  professionalServices: initialServicesProp,
  savedExternalCourses = [],
  onRemoveFromSavedCourses,
  onDeletePost,
  onDeleteService,
  onToggleBookmarkPost,
  onNavigateView,
  onOpenDirectChat,
  onBackToOwnProfile
}) => {
  const isOwnProfile = !viewedUser || viewedUser.id === currentUser.id || viewedUser.name === currentUser.name;
  const targetUser = isOwnProfile ? currentUser : viewedUser!;

  // Primary active tab
  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'reviews' | 'posts' | 'courses' | 'saved_courses' | 'saved_learnerships' | 'saved_posts' | 'privacy'>('portfolio');

  // Interactive Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [name, setName] = useState(targetUser.name);
  const [title, setTitle] = useState(targetUser.title || targetUser.primarySkill || 'Professional Specialist');
  const [bio, setBio] = useState(targetUser.bio || '');
  const [skills, setSkills] = useState(targetUser.skills ? targetUser.skills.join(', ') : '');
  const [hourlyRate, setHourlyRate] = useState(targetUser.hourlyRate || '$65/hr');
  const [availability, setAvailability] = useState(targetUser.availability || 'Available Now');

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [bookingService, setBookingService] = useState<ProfessionalServiceItem | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [bookingConfirmedToast, setBookingConfirmedToast] = useState<string | null>(null);

  // Write Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewProjectTitle, setReviewProjectTitle] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);

  // Booking Modal Form State
  const [bookingTimeline, setBookingTimeline] = useState('Immediate (within 48 hours)');
  const [bookingScope, setBookingScope] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // New Portfolio Item Form State
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortMedia, setNewPortMedia] = useState('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80');
  const [newPortSkills, setNewPortSkills] = useState('React, TypeScript, Tailwind');
  const [newPortClient, setNewPortClient] = useState('');

  // Synchronize state whenever viewed targetUser changes
  React.useEffect(() => {
    setName(targetUser.name);
    setTitle(targetUser.title || targetUser.primarySkill || 'Professional Specialist');
    setBio(targetUser.bio || '');
    setSkills(targetUser.skills ? targetUser.skills.join(', ') : '');
    setHourlyRate(targetUser.hourlyRate || '$65/hr');
    setAvailability(targetUser.availability || 'Available Now');
  }, [targetUser.id, targetUser.name, targetUser.bio, targetUser.skills, targetUser.title, targetUser.hourlyRate]);

  // Derived Dynamic Data for Reviews, Portfolio, and Services tailored to the targetUser
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    if (initialReviewsProp && initialReviewsProp.length > 0) return initialReviewsProp;
    return initialReviews;
  });

  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(() => {
    if (initialPortfolioProp && initialPortfolioProp.length > 0) return initialPortfolioProp;

    // Tailor portfolio to specific top professionals if viewed
    if (targetUser.name.toLowerCase().includes('sarah chen')) {
      return [
        {
          id: 'port_sc_1',
          userId: targetUser.id,
          title: 'High-Frequency Financial Trading Terminal',
          description: 'Multi-threaded React 18 & TypeScript trading portal with WebSocket streaming, sub-millisecond order books, and real-time market depth.',
          mediaUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          client: 'FinTech Capital UK',
          category: 'Web Development',
          skills: ['React', 'TypeScript', 'WebSockets', 'Tailwind CSS'],
          liveUrl: 'https://example.com/demo/terminal',
          createdAt: 'August 2026'
        },
        {
          id: 'port_sc_2',
          userId: targetUser.id,
          title: 'Healthcare EHR Micro-Frontend Suite',
          description: 'HIPAA-compliant modular clinical portal used by 45,000 clinicians across NHS trust partner hospitals.',
          mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          client: 'NHS Health Innovation',
          category: 'Cloud Engineering',
          skills: ['Node.js', 'React', 'Docker', 'GraphQL'],
          liveUrl: 'https://example.com/demo/ehr',
          createdAt: 'July 2026'
        }
      ];
    } else if (targetUser.name.toLowerCase().includes('elena rostova')) {
      return [
        {
          id: 'port_er_1',
          userId: targetUser.id,
          title: 'FinTech Brand Identity & Iconography System',
          description: 'Comprehensive brand guidelines, geometric logo mark, custom typography pairing, and marketing design token system.',
          mediaUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          client: 'London FinTech Venture',
          category: 'Brand Design',
          skills: ['Brand Identity', 'Figma', 'UI/UX Design', 'Design Systems'],
          liveUrl: 'https://example.com/demo/branding',
          createdAt: 'August 2026'
        },
        {
          id: 'port_er_2',
          userId: targetUser.id,
          title: 'Modern Mobile Banking UI Architecture',
          description: 'Cross-platform iOS/Android application visual design system with micro-interactions, dark mode, and design system tokens.',
          mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          client: 'Berlin NeoBank',
          category: 'Mobile UI/UX',
          skills: ['Figma', 'Prototyping', 'Mobile UI', 'WCAG AA'],
          liveUrl: 'https://example.com/demo/neobank',
          createdAt: 'July 2026'
        }
      ];
    } else if (targetUser.name.toLowerCase().includes('michael botha')) {
      return [
        {
          id: 'port_mb_1',
          userId: targetUser.id,
          title: 'Commercial Solar Microgrid & Inverter Array',
          description: 'Engineered an 85kW rooftop photovoltaic system with smart inverters, emergency battery backup, and grid telemetry integration.',
          mediaUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
          mediaType: 'image',
          client: 'CleanPower Ontario',
          category: 'Renewable Energy',
          skills: ['Solar PV', 'Smart Inverters', 'Grid Integration', 'CAD'],
          liveUrl: 'https://example.com/demo/solar',
          createdAt: 'August 2026'
        }
      ];
    }

    return initialPortfolioItems;
  });

  const [servicesList, setServicesList] = useState<ProfessionalServiceItem[]>(() => {
    if (initialServicesProp && initialServicesProp.length > 0) return initialServicesProp;

    if (targetUser.name.toLowerCase().includes('sarah chen')) {
      return [
        {
          id: 'serv_sc_1',
          userId: targetUser.id,
          title: 'Full-Stack Architecture & Production App Delivery',
          description: 'Turnkey React + TypeScript web app with secure Node.js backend, automated tests, and CI/CD deployment.',
          price: '$850',
          deliveryDays: '5-7 days',
          features: ['TypeScript strict mode', 'REST/GraphQL APIs', 'Authentication & JWT', '100% test coverage for critical paths'],
          category: 'Engineering'
        },
        {
          id: 'serv_sc_2',
          userId: targetUser.id,
          title: 'Real-time WebSocket & Performance Tuning Audit',
          description: 'Diagnose bottlenecks, reduce load latency, and implement high-concurrency event messaging.',
          price: '$500',
          deliveryDays: '3 days',
          features: ['Lighthouse 95+ guarantee', 'WebSocket server architecture', 'Database indexing', 'Memory leak prevention'],
          category: 'Performance'
        }
      ];
    } else if (targetUser.name.toLowerCase().includes('elena rostova')) {
      return [
        {
          id: 'serv_er_1',
          userId: targetUser.id,
          title: 'Complete Brand Identity & Modern Logo System',
          description: 'Distinctive visual identity, vector logo variations, color hierarchy, typography tokens, and social media kit.',
          price: '$450',
          deliveryDays: '4 days',
          features: ['3 distinct creative directions', 'Vector master files (SVG, AI, PDF)', 'Style guide documentation', 'Full commercial rights'],
          category: 'Design'
        },
        {
          id: 'serv_er_2',
          userId: targetUser.id,
          title: 'End-to-End SaaS & Mobile UI/UX Design System',
          description: 'Production-ready Figma components, user journey wireframes, and interactive prototype.',
          price: '$650',
          deliveryDays: '6 days',
          features: ['100% auto-layout components', 'WCAG AA accessible contrast', 'Interactive prototype', 'Developer handoff specs'],
          category: 'UI/UX'
        }
      ];
    } else if (targetUser.name.toLowerCase().includes('michael botha')) {
      return [
        {
          id: 'serv_mb_1',
          userId: targetUser.id,
          title: 'Residential & Commercial Solar Design & System Audit',
          description: 'Photovoltaic load calculations, inverter sizing, shading simulations, and municipal regulatory compliance blueprint.',
          price: '$450',
          deliveryDays: '3 days',
          features: ['Yield simulation report', 'Inverter & battery sizing', 'ROI & payback forecast', 'Equipment bill of materials'],
          category: 'Solar Energy'
        }
      ];
    }

    return initialProfessionalServices;
  });

  // Country Flag & Location formatter
  const formattedLocation = useMemo(() => {
    const loc = targetUser.location || 'Global';
    const c = targetUser.country || '';
    if (loc.toLowerCase().includes('berlin') || c.toLowerCase().includes('germany')) {
      return '🇩🇪 Berlin, Germany';
    }
    if (loc.toLowerCase().includes('london') || c.toLowerCase().includes('uk') || c.toLowerCase().includes('united kingdom')) {
      return '🇬🇧 London, United Kingdom';
    }
    if (loc.toLowerCase().includes('toronto') || c.toLowerCase().includes('canada')) {
      return '🇨🇦 Toronto, Canada';
    }
    if (loc.toLowerCase().includes('johannesburg') || loc.toLowerCase().includes('soweto') || c.toLowerCase().includes('south africa')) {
      return '🇿🇦 Johannesburg, South Africa';
    }
    if (targetUser.flagEmoji) {
      return `${targetUser.flagEmoji} ${loc}${c ? `, ${c}` : ''}`;
    }
    return `🌐 ${loc}${c ? `, ${c}` : ''}`;
  }, [targetUser.location, targetUser.country, targetUser.flagEmoji]);

  // POPIA Data Subject Rights Handlers
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
      link.download = `SkillHub_Data_${(currentUser.handle || currentUser.name).replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.warn('API data export fallback:', err);
      const fallbackData = {
        statement: "Personal Data Export (GDPR & POPIA compliant)",
        user: currentUser,
        portfolio: portfolioList,
        services: servicesList,
        reviews: reviewsList,
        posts: userPosts,
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(fallbackData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkillHub_Data_${currentUser.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      setAvatarToast('Profile photo updated successfully! 📸');
      setTimeout(() => setAvatarToast(null), 3000);
    } catch (err: any) {
      console.warn('Avatar upload fallback to local preview:', err);
      const localPreview = URL.createObjectURL(file);
      onUpdateUser({
        ...currentUser,
        avatar: localPreview,
      });
      setAvatarToast('Profile photo updated locally.');
      setTimeout(() => setAvatarToast(null), 3000);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      title,
      bio,
      hourlyRate,
      availability,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  // Submit a client review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      reviewerCountry: currentUser.country ? `${currentUser.flagEmoji || ''} ${currentUser.country}` : 'Verified Client',
      reviewerRole: 'Client',
      revieweeId: targetUser.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      projectTitle: reviewProjectTitle.trim() || 'Custom Consultation & Delivery',
      createdAt: 'Just now'
    };

    setTimeout(() => {
      setReviewsList(prev => [newRev, ...prev]);
      setReviewSubmitting(false);
      setIsWriteReviewOpen(false);
      setReviewComment('');
      setReviewProjectTitle('');
      setReviewRating(5);
      setBookingConfirmedToast('Review submitted and published with 5-star verified badge!');
      setTimeout(() => setBookingConfirmedToast(null), 4000);
    }, 400);
  };

  // Confirm booking with Escrow
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);

    setTimeout(() => {
      setBookingSubmitting(false);
      const bookedServiceTitle = bookingService ? bookingService.title : `Direct Engagement with ${targetUser.name}`;
      setBookingService(null);
      setIsHireModalOpen(false);
      setBookingConfirmedToast(`Escrow contract funded for "${bookedServiceTitle}". Details sent to your inbox & messages.`);
      setTimeout(() => setBookingConfirmedToast(null), 5000);
    }, 600);
  };

  // Add new portfolio item
  const handleAddPortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortTitle.trim()) return;

    const newItem: PortfolioItem = {
      id: `port_${Date.now()}`,
      userId: currentUser.id,
      title: newPortTitle.trim(),
      description: newPortDesc.trim(),
      mediaUrl: newPortMedia.trim(),
      mediaType: 'image',
      client: newPortClient.trim() || 'Direct Client',
      skills: newPortSkills.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: 'Just now'
    };

    setPortfolioList(prev => [newItem, ...prev]);
    setIsAddPortfolioOpen(false);
    setNewPortTitle('');
    setNewPortDesc('');
    setNewPortClient('');
    setBookingConfirmedToast('Portfolio project published to your global showcase!');
    setTimeout(() => setBookingConfirmedToast(null), 4000);
  };

  // Impactful stats
  const calculatedRating = targetUser.rating || 4.95;
  const calculatedReviewsCount = reviewsList.length > 0 ? reviewsList.length : (targetUser.reviewsCount || 38);
  const calculatedJobsCompleted = targetUser.jobsCompleted || 34;
  const calculatedExperience = targetUser.yearsOfExperience || '5+ years';
  const calculatedResponseTime = targetUser.responseTime || '< 1 hour';
  const userHourlyRate = targetUser.hourlyRate || '$65/hr';
  const isTopRatedPro = calculatedRating >= 4.5 || targetUser.isTopRated;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {(bookingConfirmedToast || avatarToast) && (
        <div className="bg-emerald-500 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 sticky top-4 z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{bookingConfirmedToast || avatarToast}</span>
          </div>
          <button 
            onClick={() => { setBookingConfirmedToast(null); setAvatarToast(null); }} 
            className="ml-3 hover:opacity-75 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
          <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <span>Viewing Verified Profile:</span>
            <span className="text-emerald-400 font-extrabold">{targetUser.name}</span>
          </div>
        </div>
      )}

      {/* Profile Header (Hero Section) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        {/* Banner with modern mesh gradient */}
        <div className="h-36 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        <div className="p-6 pt-0 relative">
          {/* Top row: Avatar & Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-14 mb-4 gap-4">
            
            {/* Photo & Avatar */}
            <div 
              className={`relative group rounded-3xl ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={() => isOwnProfile && !isUploadingAvatar && avatarInputRef.current?.click()}
              title={isOwnProfile ? 'Click to change avatar photo' : undefined}
            >
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white ring-2 ring-emerald-500/20 group-hover:brightness-95 transition-all"
              />

              {isOwnProfile && (
                <div className="absolute inset-0 bg-slate-950/60 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Change</span>
                </div>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/80 rounded-3xl flex flex-col items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mb-1" />
                  <span className="text-[9px] font-bold text-white">Saving...</span>
                </div>
              )}

              {/* Hidden file input */}
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

            {/* Action Buttons: Hire Me (Primary Green), Message (Secondary), Bookmark */}
            <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto w-full sm:w-auto justify-end">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
                </button>
              ) : (
                <>
                  {/* Primary "Hire Me" Green Button */}
                  <button
                    onClick={() => setIsHireModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Hire Me</span>
                  </button>

                  {/* Secondary "Message" Button */}
                  {onOpenDirectChat && (
                    <button
                      onClick={() => onOpenDirectChat(targetUser.name)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Message</span>
                    </button>
                  )}

                  {/* Bookmark / Save Icon */}
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark professional'}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600' : ''}`} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name, Verification Badges, Title, Location & Hourly Rate */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Primary Role / Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead FullStack Engineer"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hourly Rate</label>
                  <input
                    type="text"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g. $75/hr"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Availability Status</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="Available Now">Available Now</option>
                    <option value="Available in 1 week">Available in 1 week</option>
                    <option value="Available in 2 weeks">Available in 2 weeks</option>
                    <option value="Booked (Inquire for dates)">Booked (Inquire for dates)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Professional Bio & Overview</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {/* Header Title & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                      {targetUser.name}
                    </h1>

                    {/* Prominent Verified Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Pro
                    </span>

                    {/* Prominent Top Rated Badge if rating >= 4.5 */}
                    {isTopRatedPro && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-lg shadow-2xs">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        Top Rated
                      </span>
                    )}
                  </div>

                  {/* Primary Role / Title */}
                  <p className="text-sm font-extrabold text-slate-700 mt-1">
                    {targetUser.title || targetUser.primarySkill || 'Full-Stack Software Engineer & Solutions Architect'}
                  </p>
                </div>

                {/* Prominent Hourly Rate Display */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Starting at
                  </span>
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {userHourlyRate}
                  </div>
                </div>
              </div>

              {/* Location & Availability Indicator */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-semibold pt-0.5">
                <div className="flex items-center gap-1 text-slate-700">
                  <span>{formattedLocation}</span>
                </div>

                <span className="text-slate-300" aria-hidden="true">·</span>

                {/* Availability status with pulsating green dot */}
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{targetUser.availability || 'Available Now'}</span>
                </div>

                <span className="text-slate-300" aria-hidden="true">·</span>

                <div className="flex items-center gap-1 text-slate-500">
                  <span>{targetUser.handle}</span>
                </div>
              </div>

              {/* Bio Summary */}
              {targetUser.bio && (
                <p className="text-xs text-slate-700 leading-relaxed font-medium max-w-3xl pt-1">
                  {targetUser.bio}
                </p>
              )}

              {/* Skills Tags */}
              {targetUser.skills && targetUser.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {targetUser.skills.map(sk => (
                    <span
                      key={sk}
                      className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}

              {/* 2. Impactful Stats (Replaced empty stats) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-2 border-t border-slate-100">
                
                {/* Jobs Completed */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {calculatedJobsCompleted}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Jobs Completed
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {calculatedExperience}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Experience
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                  <div className="text-lg font-black text-slate-900 leading-tight">
                    {calculatedResponseTime}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Response Time
                  </div>
                </div>

                {/* Rating & Total Reviews */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-lg font-black text-emerald-900 leading-tight flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{calculatedRating.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                    {calculatedReviewsCount} Client Reviews
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-t border-slate-100 px-6 font-bold text-xs bg-slate-50 overflow-x-auto scrollbar-none gap-2">
          
          {/* Portfolio Tab */}
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Portfolio & Work</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/80 rounded-md text-slate-700">
              {portfolioList.length}
            </span>
          </button>

          {/* Services Tab */}
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Services Offered</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/80 rounded-md text-slate-700">
              {servicesList.length}
            </span>
          </button>

          {/* Reviews Tab */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Client Reviews</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/80 rounded-md text-slate-700">
              {reviewsList.length}
            </span>
          </button>

          {/* Community Posts */}
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Feed</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/80 rounded-md text-slate-700">
              {userPosts.length}
            </span>
          </button>

          {/* Saved Courses Tab */}
          <button
            onClick={() => setActiveTab('saved_courses')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'saved_courses'
                ? 'border-emerald-600 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved Courses</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200/80 rounded-md text-slate-700">
              {savedExternalCourses.length}
            </span>
          </button>

          {/* Privacy & POPIA (when own profile) */}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Data & Privacy</span>
            </button>
          )}

        </div>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* 4. Portfolio & Work Showcase Section */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Featured Work & Case Studies
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive showcase of client projects, architectures, and deliverables.
                </p>
              </div>
            </div>

            <PortfolioGrid
              items={portfolioList}
              availableSkills={targetUser.skills}
              isOwnProfile={isOwnProfile}
              onAddItem={() => setIsAddPortfolioOpen(true)}
            />
          </div>
        )}

        {/* 5. Services Offered Section */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Packaged Services & Engagements
                </h2>
                <p className="text-xs text-slate-500">
                  Fixed-scope professional services backed by SkillHub milestone escrow guarantee.
                </p>
              </div>
            </div>

            {servicesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {servicesList.map(serv => (
                  <ServiceCard
                    key={serv.id}
                    service={serv}
                    onBookNow={(s) => setBookingService(s)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">
                  No packaged services currently listed for this professional.
                </p>
                <button
                  onClick={() => setIsHireModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Request a Custom Quote
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Reviews & Testimonials Section */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    Client Testimonials & Ratings
                  </h2>
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    ⭐ {calculatedRating.toFixed(2)} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Verified reviews submitted by clients upon successful escrow project completion.
                </p>
              </div>

              {/* "Write a Review" Button */}
              <button
                onClick={() => setIsWriteReviewOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Reviews List */}
            {reviewsList.length > 0 ? (
              <div className="space-y-3">
                {reviewsList.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <p className="text-xs text-slate-500 font-semibold">
                  No client reviews yet for this professional.
                </p>
                <button
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Be the first client to submit a verified review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Community Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={post.authorAvatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20" />
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{post.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{post.createdAt}</span>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.content}</p>

                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden max-h-56 bg-slate-100 border border-slate-200">
                      <img src={post.mediaUrl} alt="Post attachment" className="w-full h-56 object-cover" />
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
                <p className="text-xs text-slate-500 font-semibold">No community posts yet.</p>
                {isOwnProfile && (
                  <button
                    onClick={() => onNavigateView('feed')}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Create a Post on the Live Feed
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* POPIA & Privacy (Only on own profile) */}
        {activeTab === 'privacy' && isOwnProfile && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Data Protection & Privacy Center</h3>
                  <p className="text-xs text-slate-500">Statutory Access & Erasure Controls (GDPR & POPIA Compliant)</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                SkillHub adheres to international data privacy standards and Section 23/24 of the Protection of Personal Information Act. You may download your complete account dossier or request irreversible account erasure at any time.
              </p>
            </div>

            {/* Download Data Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Account Dossier (JSON)
                </h4>
                <p className="text-xs text-slate-500 max-w-lg">
                  Export machine-readable records of your portfolio, reviews, services, messaging records, and activity timestamps.
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
                  Permanently destroy all personal records, revoke active sessions, and anonymize user history.
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

        {/* Saved Courses Tab Panel */}
        {activeTab === 'saved_courses' && (
          <SavedCoursesView
            savedCourses={savedExternalCourses}
            onRemoveFromSaved={(id) => onRemoveFromSavedCourses?.(id)}
            onNavigateToDiscovery={() => onNavigateView('courses')}
          />
        )}

      </div>

      {/* MODAL 1: Hire Me / Escrow Direct Booking Modal */}
      {(isHireModalOpen || bookingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {bookingService ? `Book Service: ${bookingService.title}` : `Hire ${targetUser.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    SkillHub 100% Escrow Protected Engagement
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsHireModalOpen(false); setBookingService(null); }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              {/* Service or Hourly Summary */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Agreed Terms
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {bookingService ? bookingService.title : `Hourly Rate: Starting at ${userHourlyRate}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-950">
                    {bookingService ? bookingService.price : userHourlyRate}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    Held in Escrow
                  </span>
                </div>
              </div>

              {/* 3-Step Escrow Guarantee Summary */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>How Escrow Protects Your Funds:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Funds are secured in escrow upfront. {targetUser.name} delivers the work. You review the deliverable and authorize payout only when 100% satisfied.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Project Scope & Requirements:
                </label>
                <textarea
                  required
                  rows={3}
                  value={bookingScope}
                  onChange={(e) => setBookingScope(e.target.value)}
                  placeholder={`Describe what you need ${targetUser.name} to accomplish...`}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Expected Timeline / Completion:
                </label>
                <select
                  value={bookingTimeline}
                  onChange={(e) => setBookingTimeline(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="Immediate (within 48 hours)">Immediate (within 48 hours)</option>
                  <option value="1 week milestone">1 week milestone</option>
                  <option value="2-3 weeks project">2-3 weeks project</option>
                  <option value="Ongoing monthly retainer">Ongoing monthly retainer</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsHireModalOpen(false); setBookingService(null); }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {bookingSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Funding Escrow...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Fund Escrow & Confirm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Write a Client Review Modal */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Write a Verified Review
                </h3>
                <p className="text-xs text-slate-500">
                  Reviewing {targetUser.name} as a verified client
                </p>
              </div>
              <button
                onClick={() => setIsWriteReviewOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-black text-slate-900 ml-2">
                    {reviewRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Project Title / Service Completed:
                </label>
                <input
                  type="text"
                  required
                  value={reviewProjectTitle}
                  onChange={(e) => setReviewProjectTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Web Application Delivery"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Client Testimonial:
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={`Describe your experience working with ${targetUser.name}. Was communication prompt? Was the deliverable high quality?`}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {reviewSubmitting ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Portfolio Item Modal (Own Profile) */}
      {isAddPortfolioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Add Work to Showcase
                </h3>
                <p className="text-xs text-slate-500">
                  Highlight your best case studies to prospective global clients
                </p>
              </div>
              <button
                onClick={() => setIsAddPortfolioOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPortfolioSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Project Title:
                </label>
                <input
                  type="text"
                  required
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  placeholder="e.g. Real-Time Telemetry Dashboard"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Client / Company:
                </label>
                <input
                  type="text"
                  value={newPortClient}
                  onChange={(e) => setNewPortClient(e.target.value)}
                  placeholder="e.g. FinStudio London"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Image Thumbnail URL:
                </label>
                <input
                  type="url"
                  required
                  value={newPortMedia}
                  onChange={(e) => setNewPortMedia(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Skills Used (comma-separated):
                </label>
                <input
                  type="text"
                  value={newPortSkills}
                  onChange={(e) => setNewPortSkills(e.target.value)}
                  placeholder="React, TypeScript, GraphQL"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Project Scope & Results:
                </label>
                <textarea
                  required
                  rows={3}
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  placeholder="Summarize the core technical challenges solved and the client impact."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddPortfolioOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Erase All Account Data?</h3>
                <p className="text-xs text-slate-500">Statutory Erasure Request</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will scrub your name, contact details, certifications, and active listings from SkillHub servers. Outstanding sessions will be terminated immediately.
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
