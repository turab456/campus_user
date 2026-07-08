import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { backendApi } from '../services/backendApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, college?: string, department?: string, semester?: number) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User> & { avatarFile?: File | null }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    backendApi.setOnUnauthorized(() => {
      setUser(null);
    });

    const initAuth = async () => {
      try {
        // We will try to fetch the profile.
        // If there's a refresh token cookie, backendApi fetchWithAuth will automatically
        // try to refresh it if the first call fails with 401.
        const profile = await backendApi.getUserProfile();
        setUser(profile);
      } catch (err) {
        // Normal if not logged in
        console.log('Not logged in on load');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await backendApi.login(email, password);
      const profile = await backendApi.getUserProfile();
      setUser(profile);
      sessionStorage.removeItem('setup_modal_dismissed');
      return true;
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password?: string, college?: string, department?: string, semester?: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      await backendApi.register(name, email, password, college, department, semester);
      return true;
    } catch (err) {
      console.error('Register failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        const endpoint = localStorage.getItem(`push_endpoint_${user.id}`);
        if (endpoint) {
          await backendApi.unsubscribePush(endpoint).catch(err => console.warn('Failed to remove Push subscription on logout', err));
          localStorage.removeItem(`push_endpoint_${user.id}`);
        }
      }
      await backendApi.logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      sessionStorage.removeItem('setup_modal_dismissed');
    }
  };

  const updateProfile = async (updates: Partial<User> & { avatarFile?: File | null }): Promise<boolean> => {
    if (!user) return false;
    try {
      const updated = await backendApi.updateProfile(user.id, updates);
      setUser(updated);
      return true;
    } catch (err: any) {
      console.error('Update profile failed', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
