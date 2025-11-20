'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  loginWithEmailPassword,
  signupWithEmailPassword,
  logout as authLogout,
  sendVerificationEmail,
  getAuthErrorMessage,
} from '@/lib/auth/authService';
import { createUserProfile } from '@/lib/firebase/userService';
import type { EmailPasswordCredentials, SignupData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: EmailPasswordCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: EmailPasswordCredentials) => {
    try {
      setError(null);
      setLoading(true);
      await loginWithEmailPassword(credentials);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setError(null);
      setLoading(true);
      const user = await signupWithEmailPassword(data);

      // Create user profile in Firestore with default 'user' role
      try {
        await createUserProfile(
          user.uid,
          data.email,
          data.displayName,
          'user' // Default role for new users
        );
      } catch (firestoreError: any) {
        console.error('Error creating user profile:', firestoreError);
        // Continue even if profile creation fails - user can still login
        // Admin will need to manually create the profile or update rules
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = getAuthErrorMessage(err.code) || err.message || 'Failed to create account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authLogout();
    } catch (err: any) {
      const errorMessage = 'Failed to log out';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendEmailVerificationHandler = async () => {
    try {
      setError(null);
      await sendVerificationEmail();
    } catch (err: any) {
      const errorMessage = 'Failed to send verification email';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    sendEmailVerification: sendEmailVerificationHandler,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
