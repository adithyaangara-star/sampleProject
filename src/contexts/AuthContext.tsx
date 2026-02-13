import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { clearAuth, hasValidStoredAuth } from '../storage/authStorage';
import { setAuthForceLogoutCallback } from '../api/authClient';
import { login as apiLogin, type LoginCredentials } from '../api/auth';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  authState: AuthState;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkStoredAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  const logout = useCallback(async () => {
    await clearAuth();
    setAuthState('unauthenticated');
  }, []);

  useEffect(() => {
    setAuthForceLogoutCallback(() => {
      setAuthState('unauthenticated');
    });
  }, []);

  const checkStoredAuth = useCallback(async (): Promise<boolean> => {
    const valid = await hasValidStoredAuth();
    setAuthState(valid ? 'authenticated' : 'unauthenticated');
    return valid;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    await apiLogin(credentials);
    setAuthState('authenticated');
  }, []);

  const value: AuthContextValue = {
    authState,
    isAuthenticated: authState === 'authenticated',
    login,
    logout,
    checkStoredAuth,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
