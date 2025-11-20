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
import type { UserProfile, UserRole } from '@/types/roles';

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
    email: data.email,
    displayName: data.displayName,
    role: data.role || 'user',
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as UserProfile;
}

/**
 * Create user profile in Firestore
 * Called when a new user signs up
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName?: string,
  role: UserRole = 'user'
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    email,
    displayName: displayName || null,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
      email: data.email,
      displayName: data.displayName,
      role: data.role || 'user',
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };

    // Filter by email or display name
    const matchesEmail = user.email?.toLowerCase().includes(normalizedSearch);
    const matchesName = user.displayName?.toLowerCase().includes(normalizedSearch);

    if (matchesEmail || matchesName) {
      users.push(user);
    }
  });

  return users.slice(0, 10); // Limit to 10 results
}
