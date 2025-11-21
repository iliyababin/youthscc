'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, updateProfile, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  loginWithEmailPassword,
  signupWithEmailPassword,
  logout as authLogout,
  sendVerificationEmail,
  getAuthErrorMessage,
  setupRecaptcha,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  cleanupRecaptcha,
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
  sendPhoneCode: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  verifyPhoneAndSignIn: (confirmationResult: ConfirmationResult, code: string, displayName?: string) => Promise<void>;
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

      // Create user profile in Firestore
      // Role is automatically set to 'user' via Cloud Function
      try {
        await createUserProfile(
          user.uid,
          '', // Phone number not available for email signup
          data.displayName,
          data.email
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
    } catch (err) {
      const errorMessage = 'Failed to send verification email';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const sendPhoneCode = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
    try {
      setError(null);
      const recaptchaVerifier = setupRecaptcha(recaptchaContainerId);
      const confirmationResult = await sendPhoneVerificationCode(phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(errorMessage);
      cleanupRecaptcha();
      throw new Error(errorMessage);
    }
  };

  const verifyPhoneAndSignIn = async (confirmationResult: ConfirmationResult, code: string, displayName?: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      const userCredential = await verifyPhoneCode(confirmationResult, code);
      const user = userCredential;

      // Check if this is a new user (no existing display name)
      const isNewUser = !user.displayName;

      // Only update profile with display name if it's a new user and displayName is provided
      if (isNewUser && displayName && user) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore if it doesn't exist (only for new users)
      // Role is automatically set to 'user' via Cloud Function
      if (isNewUser) {
        try {
          await createUserProfile(
            user.uid,
            user.phoneNumber || '',
            displayName || user.displayName || undefined,
            undefined // email is optional
          );
        } catch (firestoreError) {
          console.error('Error creating user profile:', firestoreError);
        }
      }

      cleanupRecaptcha();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
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
    sendPhoneCode,
    verifyPhoneAndSignIn,
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
