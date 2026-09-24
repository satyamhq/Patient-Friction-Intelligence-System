import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { LoginResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  profile: any;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<LoginResponse>;
  loginWithGoogle: (credential: string, role?: string, profileData?: any) => Promise<LoginResponse>;
  register: (data: any) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setAuthSession: (token: string, user: User, profile?: any) => void;
}

const DEFAULT_USER: User = {
  id: 'pfis_open_access_user',
  name: 'Healthcare Practitioner',
  email: 'practitioner@pfis.org',
  role: 'admin',
  phone: '+91 98765 43210',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('pfis_auth_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [profile, setProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('pfis_auth_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pfis_auth_token') || 'pfis_open_access_token';
    } catch {
      return 'pfis_open_access_token';
    }
  });

  const [isLoading] = useState<boolean>(false);

  useEffect(() => {
    // Ensure default session in storage for all services
    localStorage.setItem('pfis_auth_token', token || 'pfis_open_access_token');
    localStorage.setItem('pfis_auth_user', JSON.stringify(user));
  }, [token, user]);

  const login = async (email: string, _pass: string): Promise<LoginResponse> => {
    const activeUser: User = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
    };
    setUser(activeUser);
    setToken('pfis_open_access_token');
    return {
      success: true,
      message: 'Authenticated',
      token: 'pfis_open_access_token',
      user: activeUser,
    };
  };

  const loginWithGoogle = async (_credential: string, role?: string): Promise<LoginResponse> => {
    const activeUser: User = {
      ...DEFAULT_USER,
      role: (role as any) || 'admin',
    };
    setUser(activeUser);
    setToken('pfis_open_access_token');
    return {
      success: true,
      message: 'Authenticated',
      token: 'pfis_open_access_token',
      user: activeUser,
    };
  };

  const register = async (data: any): Promise<LoginResponse> => {
    const activeUser: User = {
      ...DEFAULT_USER,
      name: data.name || DEFAULT_USER.name,
      email: data.email || DEFAULT_USER.email,
      role: data.role || 'patient',
    };
    setUser(activeUser);
    setToken('pfis_open_access_token');
    return {
      success: true,
      message: 'Registered',
      token: 'pfis_open_access_token',
      user: activeUser,
    };
  };

  const logout = async (): Promise<void> => {
    // Reset to default open-access user rather than breaking state
    setUser(DEFAULT_USER);
  };

  const refreshProfile = async (): Promise<void> => {
    // No-op for open access
  };

  const setAuthSession = (newToken: string, newUser: User, newProfile?: any) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
    localStorage.setItem('pfis_auth_token', newToken);
    localStorage.setItem('pfis_auth_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: true,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        setAuthSession,
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
