import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient, { getCsrfToken } from '../api/axiosClient.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  is2FARequired: boolean;
  tempToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  verify2FACode: (code: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, company?: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fitbrilliance_jwt_token'));
  const [is2FARequired, setIs2FARequired] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCsrfToken(); // pre-fetch CSRF token

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('fitbrilliance_jwt_token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Silent Heartbeat request every 5 minutes to validate token freshness & proactive revocation
  useEffect(() => {
    if (!token) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await axiosClient.get('/api/auth/heartbeat');
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(heartbeatInterval);
  }, [token]);

  const refreshUser = async () => {
    try {
      const res = await axiosClient.get('/api/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (e: any) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('fitbrilliance_jwt_token');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await axiosClient.post('/api/auth/login', { email, password });
      
      if (res.data.status === 'requires_2fa') {
        setIs2FARequired(true);
        setTempToken(res.data.tempToken);
        return false;
      }

      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('fitbrilliance_jwt_token', res.data.token);
        setIs2FARequired(false);
        setTempToken(null);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.';
      setError(msg);
      return false;
    }
  };

  const verify2FACode = async (code: string): Promise<boolean> => {
    setError(null);
    if (!tempToken) return false;

    try {
      const res = await axiosClient.post('/api/auth/verify-2fa', { tempToken, code });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('fitbrilliance_jwt_token', res.data.token);
        setIs2FARequired(false);
        setTempToken(null);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'رمز التحقق الثنائي خاطئ.';
      setError(msg);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, company?: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await axiosClient.post('/api/auth/register', { name, email, password, company });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('fitbrilliance_jwt_token', res.data.token);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'فشل إنشاء الحساب.';
      setError(msg);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIs2FARequired(false);
    setTempToken(null);
    localStorage.removeItem('fitbrilliance_jwt_token');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        is2FARequired,
        tempToken,
        loading,
        error,
        login,
        verify2FACode,
        register,
        logout,
        refreshUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
