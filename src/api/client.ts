import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL: Points to Django backend or falls back to relative /api/
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    const customUrl = localStorage.getItem('skillhub_custom_api_url');
    if (customUrl) return customUrl;
  }
  return '/api/';
};

export const API_BASE_URL = getBaseUrl();
export const DJANGO_LOCAL_URL = 'http://127.0.0.1:8000/api/';

// Helper to read CSRF token cookie from browser
export const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Primary Axios Client with withCredentials enabled for HttpOnly cookies & CSRF
// Includes ngrok-skip-browser-warning header to bypass Ngrok free-tier warning page
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypasses Ngrok free-tier browser warning interstitial
  },
  timeout: 10000,
  withCredentials: true, // Enables sending and receiving HttpOnly cookies across origins
});

// In-Memory Token Storage (Shielded from XSS localStorage attacks)
let inMemoryAccessToken: string | null = null;

export const setInMemoryToken = (token: string | null): void => {
  inMemoryAccessToken = token;
};

export const getInMemoryToken = (): string | null => {
  return inMemoryAccessToken;
};

// Storage Keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'skillhub_user';
export const REMEMBER_ME_KEY = 'skillhub_remember_me';

/**
 * Retrieves the active access token, prioritizing in-memory storage,
 * followed by session-scoped sessionStorage, and persistent localStorage.
 */
export const getAccessToken = (): string | null => {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Sets access and refresh tokens according to "Remember Me" preference.
 * If rememberMe is false, tokens are stored in memory and sessionStorage only (destroyed on tab close).
 */
export const setTokens = (access: string, refresh?: string, rememberMe = true): void => {
  inMemoryAccessToken = access;
  if (typeof window === 'undefined') return;

  if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.removeItem(REMEMBER_ME_KEY);
    if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearTokens = (): void => {
  inMemoryAccessToken = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
};

export const isUserLoggedIn = (): boolean => {
  return !!getAccessToken();
};

/**
 * Request Interceptor:
 * 1. Attaches JWT Bearer Token.
 * 2. Attaches X-CSRFToken header for non-GET requests.
 * 3. Removes manual Content-Type for FormData (multipart boundary preservation).
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Always bypass Ngrok free tier browser warning interstitial
    if (config.headers) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    // Attach CSRF token header if present in cookies for non-safe HTTP methods
    const method = config.method?.toLowerCase() || 'get';
    if (!['get', 'head', 'options'].includes(method)) {
      const csrf = getCsrfToken();
      if (csrf && config.headers) {
        config.headers['X-CSRFToken'] = csrf;
      }
    }

    // Remove manual Content-Type if payload is FormData
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
 * Response Interceptor:
 * Silently refreshes expired access token via HttpOnly cookie or stored refresh token on 401.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints themselves
    if (
      originalRequest?.url?.includes('token/') || 
      originalRequest?.url?.includes('auth/register/') || 
      originalRequest?.url?.includes('auth/logout/')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      try {
        // Post to token refresh endpoint with credentials (supporting both HttpOnly cookie and body)
        const payload = refreshToken ? { refresh: refreshToken } : {};
        const res = await axios.post<{ access: string; refresh?: string }>(
          `${API_BASE_URL}token/refresh/`,
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        if (res.data?.access) {
          const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
          setTokens(res.data.access, res.data.refresh, isRemembered);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh token expired or blacklisted: clear session
        clearTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    }

    // Comprehensive logging for debugging Django REST Framework & Ngrok interactions
    if (error.response) {
      console.error(
        `[DRF API Error] Status: ${error.response.status} (${error.response.statusText}) | Endpoint: ${error.config?.baseURL || ''}${error.config?.url}`,
        '\nPayload sent:', error.config?.data,
        '\nResponse received from Django:', error.response.data,
        '\nError Details (error.toJSON):', error.toJSON ? error.toJSON() : 'N/A'
      );
    } else if (error.request) {
      console.error(
        `[DRF Network Error] No response received from server at: ${error.config?.baseURL || ''}${error.config?.url}`,
        '\nError Message:', error.message,
        '\nError Code:', error.code,
        '\nError toJSON:', error.toJSON ? error.toJSON() : error,
        '\nCheck if Ngrok tunnel is running: ngrok http 8000 --url https://engrainedly-subinvolute-silvana.ngrok-free.dev',
        '\nCheck if Django CORS settings allow origin and ngrok-skip-browser-warning header.'
      );
    } else {
      console.error('[DRF Request Setup Error]:', error.message, error.toJSON ? error.toJSON() : error);
    }

    return Promise.reject(error);
  }
);

/**
 * Extracts and formats human-readable error messages from Django REST Framework responses.
 * Converts {"username": ["..."], "date_of_birth": ["..."]} into formatted strings.
 */
export const extractDjangoErrorMessage = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  const data = err.response?.data;

  // Log raw data so developer can inspect it in DevTools Console
  if (data) {
    console.warn('[Django Error Data]:', data);
  }

  if (!data) {
    if (err.message && err.message.includes('Network Error')) {
      return 'Network Error: Cannot connect to the backend server. Please verify your Ngrok tunnel is running on port 8000.';
    }
    return err.message || 'Server is unreachable. Please check your internet connection.';
  }

  // If DRF returned a plain text string or HTML error page
  if (typeof data === 'string') {
    if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
      return `Server Error (${err.response?.status || 500}). Django returned an HTML error. Check Django console logs.`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.join(' ');
  }

  if (typeof data === 'object') {
    // If standard detail message is present
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    const messages: string[] = [];

    // Check non_field_errors first
    if (data.non_field_errors) {
      const nfe = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : String(data.non_field_errors);
      messages.push(nfe);
    }

    for (const [key, value] of Object.entries(data)) {
      if (key === 'non_field_errors' || key === 'detail') continue;

      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      let text = '';
      if (Array.isArray(value)) {
        text = value.join(' ');
      } else if (typeof value === 'object' && value !== null) {
        text = JSON.stringify(value);
      } else {
        text = String(value);
      }

      messages.push(`${formattedKey}: ${text}`);
    }

    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }

  return 'Registration failed. Please review your details and try again.';
};

export default apiClient;
