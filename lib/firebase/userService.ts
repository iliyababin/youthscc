/**
 * User management service
 * Handles user profiles and roles in Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, UserRole, PublicUserProfile } from '@/types/roles';

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    uid: userDoc.id,
    phoneNumber: data.phoneNumber,
    email: data.email,
    displayName: data.displayName,
    role: data.role || 'user',
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as UserProfile;
}

/**
 * Create or update public user profile
 * This is separate from the private user profile and contains only displayName
 */
async function syncPublicProfile(uid: string, displayName: string): Promise<void> {
  const publicProfileRef = doc(db, 'publicProfiles', uid);
  await setDoc(publicProfileRef, {
    uid,
    displayName,
  });
}

/**
 * Create user profile in Firestore
 * Called when a new user signs up
 * Note: Roles are managed via custom claims only (not stored in Firestore)
 */
export async function createUserProfile(
  uid: string,
  phoneNumber: string,
  displayName?: string,
  email?: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    phoneNumber,
    email: email || null,
    displayName: displayName || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Also create public profile if displayName is provided
  if (displayName) {
    await syncPublicProfile(uid, displayName);
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return profile?.role === 'admin';
}

/**
 * Get all users from Firestore
 * Returns all users for display and filtering
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('email', 'asc'));
  const snapshot = await getDocs(q);

  const users: UserProfile[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const user: UserProfile = {
      uid: doc.id,
      phoneNumber: data.phoneNumber,
      email: data.email,
      displayName: data.displayName,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
    users.push(user);
  });

  return users;
}

/**
 * Search users by email or display name
 * Returns up to 10 matching users
 * @deprecated Use getAllUsers() and filter client-side for better UX
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const usersRef = collection(db, 'users');

  // Get all users (we'll filter client-side for better search experience)
  // In production, you might want to use a search service like Algolia
  const q = query(usersRef, limit(50));
  const snapshot = await getDocs(q);

  const users: UserProfile[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const user: UserProfile = {
      uid: doc.id,
      phoneNumber: data.phoneNumber,
      email: data.email,
      displayName: data.displayName,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };

    // Filter by phone, email, or display name
    const matchesPhone = user.phoneNumber?.toLowerCase().includes(normalizedSearch);
    const matchesEmail = user.email?.toLowerCase().includes(normalizedSearch);
    const matchesName = user.displayName?.toLowerCase().includes(normalizedSearch);

    if (matchesPhone || matchesEmail || matchesName) {
      users.push(user);
    }
  });

  return users.slice(0, 10); // Limit to 10 results
}

/**
 * Get multiple user profiles by UIDs
 * Efficiently fetches user profiles for an array of UIDs
 */
export async function getUsersByIds(uids: string[]): Promise<Map<string, UserProfile>> {
  const userMap = new Map<string, UserProfile>();

  if (uids.length === 0) {
    return userMap;
  }

  // Fetch all user profiles in parallel
  const userPromises = uids.map(uid => getUserProfile(uid));
  const users = await Promise.all(userPromises);

  // Build map of uid -> UserProfile
  users.forEach((user, index) => {
    if (user) {
      userMap.set(uids[index], user);
    }
  });

  return userMap;
}

/**
 * Get public profile by UID
 * This is safe to call from anywhere as it only contains displayName
 */
export async function getPublicProfile(uid: string): Promise<PublicUserProfile | null> {
  const profileDoc = await getDoc(doc(db, 'publicProfiles', uid));

  if (!profileDoc.exists()) {
    return null;
  }

  const data = profileDoc.data();
  return {
    uid: profileDoc.id,
    displayName: data.displayName || 'Unknown User',
  };
}

/**
 * Get multiple public profiles by UIDs
 * This is safe to call from anywhere (even unauthenticated) for displaying leader names
 */
export async function getPublicProfilesByIds(uids: string[]): Promise<Map<string, PublicUserProfile>> {
  const profileMap = new Map<string, PublicUserProfile>();

  if (uids.length === 0) {
    return profileMap;
  }

  // Fetch all public profiles in parallel
  const profilePromises = uids.map(uid => getPublicProfile(uid));
  const profiles = await Promise.all(profilePromises);

  // Build map of uid -> PublicUserProfile
  profiles.forEach((profile, index) => {
    if (profile) {
      profileMap.set(uids[index], profile);
    }
  });

  return profileMap;
}
