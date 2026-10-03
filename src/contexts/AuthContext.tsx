import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSummary, RegisterPayload } from '../api/types';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  getCurrentUser,
} from '../api/auth';
import { getAccessToken, isUserLoggedIn } from '../api/client';
import { useIdleTimer } from '../hooks/useIdleTimer';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<UserSummary | undefined>;
  register: (payload: RegisterPayload, rememberMe?: boolean) => Promise<UserSummary>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  idleTimeoutOccurred: boolean;
  clearIdleWarning: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('skillhub_user') || sessionStorage.getItem('skillhub_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [idleTimeoutOccurred, setIdleTimeoutOccurred] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
        } catch (err) {
          // Token may be expired: attempt silent refresh
          const newToken = await apiRefreshToken();
          if (newToken) {
            try {
              const refreshedProfile = await getCurrentUser();
              setUser(refreshedProfile);
            } catch {
              // Ignore
            }
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for custom logout events (e.g. from Axios 401 interceptor)
    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  // Automatic token refresh timer: 15-minute token refreshed at 13 minutes (780 seconds)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      await apiRefreshToken();
    }, 13 * 60 * 1000); // 13 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Handle Inactivity Auto-Logout (30 minutes)
  const handleIdle = useCallback(async () => {
    if (user) {
      setIdleTimeoutOccurred(true);
      await apiLogout();
      setUser(null);
    }
  }, [user]);

  useIdleTimer({
    timeoutMs: 30 * 60 * 1000, // 30 minutes
    onIdle: handleIdle,
    enabled: !!user,
  });

  const login = async (username: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(username, password, rememberMe);
      if (data.user) {
        setUser(data.user);
      }
      setIdleTimeoutOccurred(false);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload, rememberMe = true) => {
    setIsLoading(true);
    try {
      const data = await apiRegister(payload, rememberMe);
      const userObj: UserSummary = data.user || {
        id: `usr_${payload.username.toLowerCase().replace(/\s+/g, '_')}`,
        username: payload.username.trim(),
        email: payload.email.trim(),
        full_name: payload.full_name?.trim() || payload.username.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        location: 'Johannesburg, South Africa',
        province: 'Gauteng',
        skills: payload.role === 'mentor' ? ['Youth Mentorship', 'Career Strategy'] : ['Trades & Technology', 'Digital Skills'],
        is_creator: true,
        role: payload.role || 'youth',
        verified: true,
        seta_verified: true,
        badge: payload.role === 'mentor' ? 'Verified Mentor' : 'Verified Youth Member',
      };
      setUser(userObj);
      setIdleTimeoutOccurred(false);
      return userObj;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    return await apiRefreshToken();
  };

  const clearIdleWarning = () => {
    setIdleTimeoutOccurred(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && isUserLoggedIn(),
        isLoading,
        login,
        register,
        logout,
        refreshToken,
        idleTimeoutOccurred,
        clearIdleWarning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
