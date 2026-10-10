export type SouthAfricanProvince = 
  | 'All Regions / Global'
  | 'Gauteng'
  | 'Western Cape'
  | 'KwaZulu-Natal'
  | 'Eastern Cape'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Free State'
  | 'Northern Cape'
  | 'All South Africa';

export type GlobalRegion = 
  | 'Global / Worldwide'
  | 'South Africa'
  | 'North America'
  | 'Europe'
  | 'Asia Pacific'
  | 'Latin America'
  | 'Middle East & Africa';

export interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatar: string;
  bio?: string;
  location: string;
  country?: string;
  city?: string;
  flagEmoji?: string;
  province?: SouthAfricanProvince;
  verified?: boolean;
  setaVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  isTopRated?: boolean;
  primarySkill?: string;
  title?: string;
  hourlyRate?: string;
  role: 'youth' | 'mentor' | 'employer' | 'trainer';
  skills: string[];
  educationLevel: string;
  matricYear?: number;
  badge?: string;
  enrolledCourseIds: string[];
  savedExternalCourseIds?: string[];
  savedLearnershipIds: string[];
  savedServiceIds: string[];
  savedResourceIds: string[];
  certificatesCount: number;
  phone?: string;
  // Professional Marketplace stats & attributes
  jobsCompleted?: number;
  yearsOfExperience?: string;
  responseTime?: string;
  availability?: string;
  // Privacy-first Business Location (public only if show_on_map is true)
  business_name?: string;
  business_address?: string;
  business_latitude?: number | null;
  business_longitude?: number | null;
  show_on_map?: boolean;
}

export interface MapPin {
  id: string;
  type: 'business' | 'service' | 'event';
  title: string;
  business_name?: string;
  owner_name?: string;
  avatar?: string;
  category: string;
  rating?: number;
  lat: number;
  lng: number;
  address?: string;
  priceZar?: number;
  username?: string;
  data?: any;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerCountry?: string;
  reviewerRole?: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  projectTitle?: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  client?: string;
  category?: string;
  skills: string[];
  liveUrl?: string;
  createdAt: string;
}

export interface ProfessionalServiceItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: string;
  deliveryDays?: string;
  features?: string[];
  category?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: 'coding' | 'design' | 'business' | 'trades' | 'career' | 'ai_data' | 'languages';
  resourceType: 'video' | 'guide' | 'cheatsheet' | 'repo' | 'tool' | 'book';
  url: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  upvotes: number;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  region: string;
  createdAt: string;
  commentsCount: number;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessonsCount: number;
  summary: string;
  completed?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  providerLogo?: string;
  setaAccreditation: string; // e.g., 'MICT SETA Accredited (NQF Level 5)'
  category: 'coding' | 'renewable' | 'digital' | 'data' | 'business' | 'agri' | 'trades';
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  outcomes: string[];
  modules: CourseModule[];
  quiz?: QuizQuestion[];
  enrolledCount: number;
  rating: number;
  bannerImage: string;
  price: string; // 'Free (SDF Funded)' or 'R750'
  tags: string[];
  isFeatured?: boolean;
}

export type CourseType = 'course' | 'bootcamp' | 'certification' | 'workshop';
export type PriceType = 'free' | 'paid';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExternalCourse {
  id: string;
  title: string;
  provider_name: string; // e.g., "Coursera"
  provider_logo_url?: string;
  external_url: string; // Where users go to enroll
  description: string;
  category: string;
  skill_tags: string[];
  course_type: CourseType;
  price_type: PriceType;
  price_amount?: number | null;
  duration: string; // e.g., "3 months"
  level: CourseLevel;
  language: string; // default "English"
  region: string; // default "Global"
  rating: number; // default 0.00
  reviews_count: number;
  enrolled_count: number;
  submitted_by?: string | null;
  submitted_by_name?: string | null;
  is_approved: boolean;
  is_flagged?: boolean;
  banner_image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface SavedCourse {
  id: string;
  user_id: string;
  course_id: string;
  course: ExternalCourse;
  saved_at: string;
}

export interface Learnership {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  setaCategory: 'MICT SETA' | 'merSETA' | 'CETA' | 'BankSETA' | 'EWSETA' | 'AgriSETA' | 'Services SETA' | 'SASSETA';
  location: string;
  province: SouthAfricanProvince;
  stipendZar: string; // e.g. 'R5,500 / month'
  duration: string; // e.g. '12 Months'
  closingDate: string;
  requirements: string[];
  description: string;
  skillsGained: string[];
  applicationUrl?: string;
  applicantsCount: number;
  isBookmarked?: boolean;
}

export interface YouthService {
  id: string;
  title: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerLocation: string;
  providerProvince: SouthAfricanProvince;
  category: 'web_dev' | 'graphic_design' | 'solar_repair' | 'tutoring' | 'phone_repair' | 'catering' | 'photography';
  priceZar: number; // e.g., 1200 for R1,200
  priceUnit: 'project' | 'hour' | 'day';
  deliveryTime: string;
  rating: number;
  reviewsCount: number;
  description: string;
  deliverables: string[];
  phone: string;
  tags: string[];
  verifiedYouth: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  province: SouthAfricanProvince;
  expertise: string[];
  bio: string;
  avatar: string;
  availableSlots: string[];
  bookingCount: number;
  rating: number;
  feeZar: string; // 'Free Youth Mentorship' or 'R150 / session'
}

export interface Notification {
  id: string;
  type: 'learnership' | 'course' | 'service_booking' | 'mentor' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type MainView = 
  | 'home' 
  | 'feed'
  | 'reels'
  | 'messages'
  | 'search'
  | 'map'
  | 'audio_spaces'
  | 'courses' 
  | 'saved_courses' 
  | 'learnerships' 
  | 'services' 
  | 'mentors' 
  | 'resources'
  | 'ai_advisor' 
  | 'profile' 
  | 'bookmarks' 
  | 'notifications'
  | 'jobs_orders';

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorLocation: string;
  authorCountry?: string;
  authorRating?: number;
  authorVerified?: boolean;
  authorPrimarySkill?: string;
  createdAt: string;
  content: string;
  hashtags?: string[];
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  category?: string;
  postType?: 'showcase' | 'service_request';
  serviceRequest?: {
    budget?: string;
    deadline?: string;
    preferredRegion?: string;
  };
}

export interface StorySlideReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export type StoryReaction = StorySlideReaction;

export interface StorySlide {
  id: string;
  mediaUrl: string;
  createdAt: string;
  caption?: string;
  reactions?: StorySlideReaction[];
}

export interface Story {
  id: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  createdAt: string;
  hasUnseen: boolean;
  slides?: StorySlide[];
}

export interface Reel {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorLocation?: string;
  authorCountry?: string;
  authorRating?: number;
  authorVerified?: boolean;
  authorHourlyRate?: string;
  caption: string;
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  audioTrack: string;
  tags: string[];
  skills?: string[];
  category?: 'web_dev' | 'design' | 'trades' | 'tutoring' | 'trending' | string;
  isPortfolioPiece?: boolean;
  viewsCount?: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  dateBadge: string; // e.g. "Aug 20"
  fullDate: string;
  location: string;
  hostName: string;
  hostAvatar: string;
  attendeesCount: number;
  isAttending?: boolean;
  category: string;
  openingTime?: string;
  closingTime?: string;
  rules?: string[];
  sponsors?: string[];
  safetyGuidelines?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  concludedDateISO?: string;
  isConcluded?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  mediaUrl?: string;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantHandle: string;
  participantAvatar: string;
  online: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export type SessionTab = 'live' | 'upcoming' | 'replays' | 'my_spaces';

export type SessionCategory = 
  | 'All' 
  | 'Tech' 
  | 'Design' 
  | 'Trades' 
  | 'Business' 
  | 'Career' 
  | 'Free' 
  | 'Paid';

export interface SessionSpeaker {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isSpeaking?: boolean;
}

export interface LiveSession {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: 'Tech' | 'Design' | 'Trades' | 'Business' | 'Career';
  agenda: string[];
  hostId: string;
  hostName: string;
  hostUsername: string;
  hostAvatar: string;
  hostRole: string;
  hostRating?: number;
  hostVerified?: boolean;
  isTopRated?: boolean;
  status: 'live' | 'upcoming' | 'replay';
  speakersCount: number;
  listenersCount: number;
  duration: string; // e.g. "45 mins", "60 mins"
  scheduledFor?: string; // e.g. "2026-10-12T14:00:00Z"
  scheduledDateFormatted?: string; // e.g. "Monday, Oct 12 • 14:00 SAST"
  startsInText?: string; // e.g. "Starts in 2 days"
  isPaid: boolean;
  priceAmount?: number; // e.g. 25
  priceCurrency?: string; // e.g. "$" or "R"
  speakers: SessionSpeaker[];
  listeners: { id: string; name: string; avatar: string }[];
  isFollowed?: boolean;
  isNotified?: boolean;
  replayDuration?: string;
  recordingUrl?: string;
  recordingAudioPreview?: string;
  replayViewsCount?: number;
  linkedServiceId?: string;
  linkedServiceTitle?: string;
}
