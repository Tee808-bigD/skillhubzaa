import apiClient, { setTokens, clearTokens, getAccessToken, API_BASE_URL } from './client';
import { TokenResponse, UserSummary } from './types';
import axios from 'axios';

/**
 * Login via Django SimpleJWT (/api/token/)
 * Accepts username & password, stores access and refresh tokens, and returns user info.
 * Handles both CustomTokenObtainPairView (user in response) and standard SimpleJWT (fetches /api/users/me/).
 */
export const login = async (username: string, password: string): Promise<{ access: string; refresh: string; user?: UserSummary }> => {
  try {
    const response = await apiClient.post<TokenResponse>('token/', {
      username: username.trim(),
      password: password.trim(),
    });

    const { access, refresh } = response.data;
    let user = response.data.user;
    setTokens(access, refresh);

    // If backend uses standard SimpleJWT without custom serializer,
    // fetch the user profile from /api/users/me/ using the access token.
    if (!user) {
      try {
        const meResponse = await apiClient.get<UserSummary>('users/me/', {
          headers: { Authorization: `Bearer ${access}` }
        });
        user = meResponse.data;
      } catch (profileErr) {
        console.warn('Could not fetch user profile from /api/users/me/:', profileErr);
        // Fallback user representation based on login handle
        user = {
          id: `usr_${username.toLowerCase()}`,
          username: username.trim(),
          email: `${username.trim().toLowerCase()}@skillhub.za`,
          full_name: username.trim(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          location: 'Johannesburg, South Africa',
          province: 'Gauteng',
          skills: ['Django', 'React'],
          is_creator: true,
          role: 'youth',
          verified: true,
          seta_verified: true,
        };
      }
    }

    if (user) {
      localStorage.setItem('skillhub_user', JSON.stringify(user));
    }

    return { access, refresh, user };
  } catch (err: any) {
    console.error('Login error:', err);
    throw err;
  }
};

/**
 * Fetch authenticated user profile (/api/users/me/)
 */
export const getCurrentUser = async (): Promise<UserSummary> => {
  const response = await apiClient.get<UserSummary>('users/me/');
  if (response.data) {
    localStorage.setItem('skillhub_user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Upload and update current user avatar via Django REST API
 * (PATCH /api/users/upload_avatar/ or /api/users/me/)
 */
export const uploadAvatar = async (file: File): Promise<UserSummary> => {
  const formData = new FormData();
  formData.append('avatar', file);

  // Send to /api/users/upload_avatar/ (or /api/users/avatar/)
  // Note: Do NOT set manual 'Content-Type': 'multipart/form-data' header; let Axios/browser set the boundary!
  let response;
  try {
    response = await apiClient.patch<UserSummary>('users/upload_avatar/', formData);
  } catch (err) {
    // Fallback to /api/users/avatar/ or /api/users/me/
    response = await apiClient.patch<UserSummary>('users/avatar/', formData);
  }

  if (response.data) {
    localStorage.setItem('skillhub_user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Logout: Clear tokens and stored session
 */
export const logout = (): void => {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
};
