import { createContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { apiFetch } from '../api';

const SESSION_KEY = 'wt_session';

interface Session {
  token: string;
  user: User;
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as Session).user;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<'ok' | 'invalid'>;
  signup: (username: string, password: string) => Promise<'ok' | 'taken'>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(loadSession);

  const login = useCallback(async (username: string, password: string): Promise<'ok' | 'invalid'> => {
    try {
      const data = await apiFetch<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setCurrentUser(data.user);
      return 'ok';
    } catch {
      return 'invalid';
    }
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<'ok' | 'taken'> => {
    try {
      const data = await apiFetch<Session>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setCurrentUser(data.user);
      return 'ok';
    } catch (err) {
      const e = err as { status?: number };
      if (e.status === 409) return 'taken';
      return 'taken';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
