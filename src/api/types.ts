/**
 * TypeScript interfaces matching Django REST Framework Serializers & JWT Authentication.
 */

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  bio?: string;
  avatar: string;
  location: string;
  province: string;
  skills: string[];
  is_creator: boolean;
  role: 'youth' | 'mentor' | 'employer' | 'trainer';
  seta_verified?: boolean;
  verified?: boolean;
  badge?: string;
  date_joined?: string;
}

export interface CommentData {
  id: string;
  post: string;
  author: UserSummary | { username: string; full_name?: string; avatar?: string };
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface PostData {
  id: string;
  author: UserSummary;
  content: string;
  media_type: 'text' | 'image' | 'video';
  media_file?: string | null;
  video_file?: string | null;
  media_url?: string | null;
  video_url?: string | null;
  category: string;
  hashtags: string[];
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments?: CommentData[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreatePostPayload {
  content: string;
  media_type?: 'text' | 'image' | 'video';
  media_file?: File | Blob | null;
  video_file?: File | Blob | null;
  media_url?: string;
  video_url?: string;
  category?: string;
  hashtags?: string[];
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user?: UserSummary;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface ChatMessage {
  id: string;
  room_id?: string;
  sender: UserSummary | {
    id: string;
    username: string;
    full_name?: string;
    avatar?: string;
  };
  content: string;
  text?: string;
  timestamp: string;
  is_read?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: UserSummary[];
  last_message?: {
    id: string;
    content: string;
    sender: string;
    sender_name?: string;
    timestamp: string;
  } | null;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WebSocketPayload {
  type: 'chat_message' | 'typing' | 'connection_established';
  id?: string;
  room_id?: string;
  message?: string;
  content?: string;
  sender?: {
    id: string;
    username: string;
    full_name?: string;
    avatar?: string;
  };
  username?: string;
  is_typing?: boolean;
  timestamp?: string;
}
