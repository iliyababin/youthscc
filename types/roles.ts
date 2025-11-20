/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'user';

/**
 * User document in Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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
