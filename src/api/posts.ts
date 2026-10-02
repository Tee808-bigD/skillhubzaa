import apiClient from './client';
import { PostData, CreatePostPayload, PaginatedResponse, CommentData } from './types';

/**
 * Fetch all posts from Django REST Framework (/api/posts/)
 * Handles both DRF paginated { results: [...] } and plain array formats.
 */
export const getPosts = async (params?: { category?: string; search?: string }): Promise<PostData[]> => {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') {
    queryParams.append('category', params.category);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const url = `posts/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<PaginatedResponse<PostData> | PostData[]>(url);

  // If response is DRF paginated structure
  if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  // If plain array
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Create a new Post via Django REST Framework (POST /api/posts/)
 * Accepts either a FormData instance (multipart/form-data) or a CreatePostPayload object.
 * When files are present, sends with Content-Type: multipart/form-data.
 */
export const createPost = async (data: FormData | CreatePostPayload): Promise<PostData> => {
  let body: FormData | CreatePostPayload;

  if (data instanceof FormData) {
    body = data;
  } else if (data.media_file || data.video_file) {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.category) formData.append('category', data.category);
    if (data.media_file) formData.append('media_file', data.media_file);
    if (data.video_file) formData.append('video_file', data.video_file);
    if (data.media_type) formData.append('media_type', data.media_type);
    if (data.hashtags && data.hashtags.length > 0) {
      formData.append('hashtags', JSON.stringify(data.hashtags));
    }
    body = formData;
  } else {
    body = data;
  }

  // Do not set manual Content-Type header on FormData; let Axios and browser supply the boundary
  const response = await apiClient.post<PostData>('posts/', body);
  return response.data;
};

/**
 * Toggle like on a Post (POST /api/posts/{id}/toggle_like/)
 */
export const toggleLikePost = async (postId: string): Promise<{ is_liked: boolean; likes_count: number }> => {
  // Change '/like/' to '/toggle_like/' to match Django custom action
  const response = await apiClient.post<{ is_liked: boolean; likes_count: number }>(`posts/${postId}/toggle_like/`);
  return response.data;
};

/**
 * Add a comment to a Post (POST /api/posts/{id}/comments/)
 */
export const addComment = async (postId: string, content: string): Promise<CommentData> => {
  const response = await apiClient.post<CommentData>(`posts/${postId}/comments/`, { content });
  return response.data;
};

/**
 * Fetch comments for a Post (GET /api/posts/{id}/comments/)
 */
export const getPostComments = async (postId: string): Promise<CommentData[]> => {
  const response = await apiClient.get<CommentData[]>(`posts/${postId}/comments/`);
  return Array.isArray(response.data) ? response.data : [];
};
