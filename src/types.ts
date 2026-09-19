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
  avatar: string;
  bio?: string;
  location: string;
  province: SouthAfricanProvince;
  verified?: boolean;
  setaVerified?: boolean;
  role: 'youth' | 'mentor' | 'employer' | 'trainer';
  skills: string[];
  educationLevel: string;
  matricYear?: number;
  badge?: string;
  enrolledCourseIds: string[];
  savedLearnershipIds: string[];
  savedServiceIds: string[];
  savedResourceIds: string[];
  certificatesCount: number;
  phone?: string;
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
  | 'learnerships' 
  | 'services' 
  | 'mentors' 
  | 'resources'
  | 'ai_advisor' 
  | 'profile' 
  | 'bookmarks' 
  | 'notifications';

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorLocation: string;
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
}

export interface Story {
  id: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  createdAt: string;
  hasUnseen: boolean;
}

export interface Reel {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  caption: string;
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  audioTrack: string;
  tags: string[];
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
