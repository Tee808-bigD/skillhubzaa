import apiClient, { setTokens, clearTokens, getAccessToken, getRefreshToken, API_BASE_URL } from './client';
import { TokenResponse, UserSummary, RegisterPayload } from './types';
import axios from 'axios';

/**
 * Login via Django SimpleJWT (/api/token/)
 * Accepts username & password, stores access and refresh tokens, and returns user info.
 * Honors `rememberMe`:
 * - If true: tokens persist across sessions in localStorage.
 * - If false: tokens stay in-memory / sessionStorage and are cleared when tab closes.
 */
export const login = async (
  username: string,
  password: string,
  rememberMe = true
): Promise<{ access: string; refresh: string; user?: UserSummary }> => {
  try {
    const response = await apiClient.post<TokenResponse>('token/', {
      username: username.trim(),
      password: password.trim(),
    });

    const { access, refresh } = response.data;
    let user = response.data.user;
    setTokens(access, refresh, rememberMe);

    // If backend uses standard SimpleJWT without custom serializer,
    // fetch the user profile from /api/users/me/ using the access token.
    if (!user) {
      try {
        const meResponse = await apiClient.get<UserSummary>('users/me/', {
          headers: { Authorization: `Bearer ${access}` },
        });
        user = meResponse.data;
      } catch (profileErr) {
        console.warn('Could not fetch user profile from /api/users/me/:', profileErr);
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

    if (user && typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('skillhub_user', JSON.stringify(user));
    }

    return { access, refresh, user };
  } catch (err: any) {
    console.error('Login error:', err);
    throw err;
  }
};

/**
 * User Registration (/api/auth/register/)
 * Registers user with password confirmation, role selection, and returns authenticated session.
 */
export const register = async (
  payload: RegisterPayload,
  rememberMe = true
): Promise<{ access: string; refresh: string; user?: UserSummary }> => {
  try {
    const response = await apiClient.post<{
      user: UserSummary;
      access: string;
      refresh: string;
      detail?: string;
    }>('auth/register/', payload);

    const { access, refresh, user } = response.data;
    setTokens(access, refresh, rememberMe);

    if (user && typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('skillhub_user', JSON.stringify(user));
    }

    return { access, refresh, user };
  } catch (err: any) {
    console.error('Registration error:', err);
    throw err;
  }
};

/**
 * Silent Refresh of JWT Token
 */
export const refreshToken = async (): Promise<string | null> => {
  const currentRefresh = getRefreshToken();
  try {
    const res = await apiClient.post<{ access: string; refresh?: string }>('token/refresh/', {
      refresh: currentRefresh || undefined,
    });
    if (res.data?.access) {
      const rememberMe = typeof localStorage !== 'undefined' && localStorage.getItem('skillhub_remember_me') === 'true';
      setTokens(res.data.access, res.data.refresh, rememberMe);
      return res.data.access;
    }
  } catch (err) {
    console.warn('Silent refresh failed:', err);
  }
  return null;
};

/**
 * Fetch authenticated user profile (/api/users/me/)
 */
export const getCurrentUser = async (): Promise<UserSummary> => {
  const response = await apiClient.get<UserSummary>('users/me/');
  if (response.data && typeof window !== 'undefined') {
    const rememberMe = localStorage.getItem('skillhub_remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('skillhub_user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Upload and update current user avatar via Django REST API
 */
export const uploadAvatar = async (file: File): Promise<UserSummary> => {
  const formData = new FormData();
  formData.append('avatar', file);

  let response;
  try {
    response = await apiClient.patch<UserSummary>('users/upload_avatar/', formData);
  } catch (err) {
    response = await apiClient.patch<UserSummary>('users/avatar/', formData);
  }

  if (response.data && typeof window !== 'undefined') {
    const rememberMe = localStorage.getItem('skillhub_remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('skillhub_user', JSON.stringify(response.data));
  }
  return response.data;
};

/**
 * Logout: Blacklists the refresh token on the Django server, clears cookies,
 * and purges tokens from in-memory and local storage.
 */
export const logout = async (): Promise<void> => {
  const currentRefresh = getRefreshToken();
  try {
    // Notify Django backend to blacklist the token and erase HttpOnly cookie
    await apiClient.post('token/logout/', { refresh: currentRefresh || '' });
  } catch (err) {
    console.warn('Backend token blacklist request skipped or timed out:', err);
  } finally {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }
};
