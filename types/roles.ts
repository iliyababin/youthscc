/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'leader' | 'user';

/**
 * User document in Firestore (PRIVATE - contains sensitive data)
 */
export interface UserProfile {
  uid: string;
  phoneNumber: string; // Required - primary identifier
  email?: string; // Optional
  displayName?: string;
  role: UserRole;
  createdAt: string | null; // ISO string from Firestore timestamp
  updatedAt: string | null; // ISO string from Firestore timestamp
}

/**
 * Public user profile (only contains non-sensitive data for display)
 */
export interface PublicUserProfile {
  uid: string;
  displayName: string;
}

/**
 * Permissions for each role
 */
export const ROLE_PERMISSIONS = {
  admin: {
    canCreateBibleStudyGroups: true,
    canUpdateBibleStudyGroups: true,
    canDeleteBibleStudyGroups: true,
    canManageUsers: true,
    // Legacy permissions for backwards compatibility
    canCreateCellGroups: true,
    canUpdateCellGroups: true,
    canDeleteCellGroups: true,
  },
  leader: {
    canCreateBibleStudyGroups: true,
    canUpdateBibleStudyGroups: true,
    canDeleteBibleStudyGroups: true,
    canManageUsers: false,
    // Legacy permissions for backwards compatibility
    canCreateCellGroups: true,
    canUpdateCellGroups: true,
    canDeleteCellGroups: true,
  },
  user: {
    canCreateBibleStudyGroups: false,
    canUpdateBibleStudyGroups: false,
    canDeleteBibleStudyGroups: false,
    canManageUsers: false,
    // Legacy permissions for backwards compatibility
    canCreateCellGroups: false,
    canUpdateCellGroups: false,
    canDeleteCellGroups: false,
  },
} as const;
