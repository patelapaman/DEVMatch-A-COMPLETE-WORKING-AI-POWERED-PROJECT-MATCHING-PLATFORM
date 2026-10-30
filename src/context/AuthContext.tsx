/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  switchDemoUser: (role: 'developer' | 'recruiter') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'devmatch_token';
const UID_KEY = 'devmatch_uid';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (authToken?: string) => {
    const curToken = authToken || token || localStorage.getItem(TOKEN_KEY);
    if (!curToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${curToken}`,
          'x-devmatch-uid': curToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(UID_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing) {
      fetchCurrentUser(existing);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(UID_KEY, data.user.uid);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(UID_KEY, data.user.uid);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(UID_KEY);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-devmatch-uid': token
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Profile update failed');
      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const switchDemoUser = async (role: 'developer' | 'recruiter') => {
    setLoading(true);
    const email = role === 'recruiter' ? 'sarah.recruiter@example.com' : 'alex.dev@example.com';
    const password = role === 'recruiter' ? 'lead123' : 'dev123';
    await login(email, password);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
