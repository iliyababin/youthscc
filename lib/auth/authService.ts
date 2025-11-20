/**
 * Authentication Service Layer
 * Handles all Firebase auth operations
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type {
  EmailPasswordCredentials,
  SignupData,
  MagicLinkCredentials,
} from '@/types/auth';

// ==========================================
// EMAIL/PASSWORD AUTHENTICATION
// ==========================================

/**
 * Sign in with email and password
 */
export async function loginWithEmailPassword({
  email,
  password,
}: EmailPasswordCredentials): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Create new account with email and password
 */
export async function signupWithEmailPassword({
  email,
  password,
  displayName,
}: SignupData): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update profile with display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  return userCredential.user;
}

/**
 * Send email verification to current user
 */
export async function sendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  await sendEmailVerification(user);
}

// ==========================================
// MAGIC LINK AUTHENTICATION (Future)
// ==========================================

/**
 * Send magic link to email
 * Ready for future implementation
 */
export async function sendMagicLink({
  email,
  redirectUrl,
}: MagicLinkCredentials): Promise<void> {
  const actionCodeSettings = {
    url: redirectUrl || window.location.origin + '/auth/verify',
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

/**
 * Complete magic link sign-in
 * Ready for future implementation
 */
export async function completeMagicLinkSignIn(emailLink?: string): Promise<User> {
  const link = emailLink || window.location.href;

  if (!isSignInWithEmailLink(auth, link)) {
    throw new Error('Invalid sign-in link');
  }

  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Please provide your email for confirmation');
  }

  if (!email) throw new Error('Email is required');

  const userCredential = await signInWithEmailLink(auth, email, link);
  window.localStorage.removeItem('emailForSignIn');

  return userCredential.user;
}

/**
 * Check if current URL is a sign-in link
 */
export function isSignInLink(url?: string): boolean {
  return isSignInWithEmailLink(auth, url || window.location.href);
}

// ==========================================
// PHONE AUTHENTICATION (Future)
// ==========================================
// Placeholder for phone auth - implement when needed

// ==========================================
// SIGN OUT
// ==========================================

/**
 * Sign out current user
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-action-code':
      return 'This link is invalid or has expired';
    case 'auth/expired-action-code':
      return 'This link has expired. Please request a new one';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}
