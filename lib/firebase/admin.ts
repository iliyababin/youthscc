/**
 * Admin functions for managing user roles
 * These functions interact with Firebase Cloud Functions to set custom claims
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { UserProfile } from '@/types/roles';

export interface SetUserRoleData {
  uid: string;
  role: 'admin' | 'leader' | 'user';
}

export interface SetUserRoleResult {
  success: boolean;
  message: string;
}

export interface GetAllUsersResult {
  users: UserProfile[];
}

export interface CreateUserData {
  phoneNumber: string;
  displayName: string;
}

export interface CreateUserResult {
  success: boolean;
  message: string;
  uid: string;
}

export interface DeleteUserData {
  uid: string;
}

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

/**
 * Set a user's role using custom claims
 * This function can only be called by admins
 */
export async function setUserRole(uid: string, role: 'admin' | 'leader' | 'user'): Promise<SetUserRoleResult> {
  const setUserRoleFunction = httpsCallable<SetUserRoleData, SetUserRoleResult>(
    functions,
    'setUserRole'
  );

  try {
    const result = await setUserRoleFunction({ uid, role });
    return result.data;
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

/**
 * Get all users with their roles from custom claims
 * This function can only be called by admins
 * Roles are read directly from Firebase Auth custom claims (single source of truth)
 */
export async function getAllUsersWithRoles(): Promise<UserProfile[]> {
  const getAllUsersFunction = httpsCallable<void, GetAllUsersResult>(
    functions,
    'getAllUsersWithRoles'
  );

  try {
    const result = await getAllUsersFunction();
    return result.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Create a new user with phone number and display name
 * This function can only be called by admins
 * Created users are unverified and have default 'user' role
 */
export async function createUser(phoneNumber: string, displayName: string): Promise<CreateUserResult> {
  const createUserFunction = httpsCallable<CreateUserData, CreateUserResult>(
    functions,
    'createUser'
  );

  try {
    const result = await createUserFunction({ phoneNumber, displayName });
    return result.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 * This function can only be called by admins
 * Deletes user from both Firebase Auth and Firestore
 */
export async function deleteUserAccount(uid: string): Promise<DeleteUserResult> {
  const deleteUserFunction = httpsCallable<DeleteUserData, DeleteUserResult>(
    functions,
    'deleteUser'
  );

  try {
    const result = await deleteUserFunction({ uid });
    return result.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
