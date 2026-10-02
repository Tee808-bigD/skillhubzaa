import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL: Points to Django backend (http://127.0.0.1:8000/api/) by default,
// or falls back to relative /api/ for Vite proxy and preview runtime.
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // If explicitly defined in environment
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    // If backend URL is stored in localStorage toggle
    const customUrl = localStorage.getItem('skillhub_custom_api_url');
    if (customUrl) return customUrl;
  }
  // Default to relative /api/ in browser preview so it works out-of-the-box,
  // or http://127.0.0.1:8000/api/ for direct Django development.
  return '/api/';
};

export const API_BASE_URL = getBaseUrl();
export const DJANGO_LOCAL_URL = 'http://127.0.0.1:8000/api/';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Token Storage Keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'skillhub_user';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (access: string, refresh?: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isUserLoggedIn = (): boolean => {
  return !!getAccessToken();
};

/**
 * Request Interceptor: Attach JWT Bearer Token to Authorization Header
 * For FormData payloads, remove default Content-Type so the browser automatically generates
 * 'multipart/form-data; boundary=----WebKitFormBoundary...' (prevents DRF 400 Bad Request).
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove manual Content-Type if payload is FormData so browser sets correct boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Automatically attempt Refresh Token on 401 Unauthorized
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const res = await axios.post<{ access: string }>(
            `${API_BASE_URL}token/refresh/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (res.data.access) {
            setTokens(res.data.access);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token expired or invalid: clear session
          clearTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
