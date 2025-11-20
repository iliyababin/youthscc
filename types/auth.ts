import type { User } from 'firebase/auth';

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Email/Password credentials
 */
export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

/**
 * Signup data with optional display name
 */
export interface SignupData extends EmailPasswordCredentials {
  displayName?: string;
}

/**
 * Magic link credentials (for future implementation)
 */
export interface MagicLinkCredentials {
  email: string;
  redirectUrl?: string;
}

/**
 * Phone authentication credentials (for future implementation)
 */
export interface PhoneCredentials {
  phoneNumber: string;
  verificationCode?: string;
}
