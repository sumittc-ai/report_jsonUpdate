import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string, remember?: boolean) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'jsonupdate_auth_session';

const VALID_USER = {
  username: 'skumar',
  password: 'user123',
  profile: {
    username: 'skumar',
    name: 'Sumit Kumar',
    email: 'skumar@company.internal',
    role: 'Senior DevOps Engineer',
    avatar: 'SK',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const login = (usernameInput: string, passwordInput: string, remember: boolean = true) => {
    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Username and password are required' };
    }

    if (trimmedUser === VALID_USER.username && trimmedPass === VALID_USER.password) {
      const loggedUser = VALID_USER.profile;
      setUser(loggedUser);
      try {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
        if (!remember) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        // ignore storage errors
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please use skumar / user123',
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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
