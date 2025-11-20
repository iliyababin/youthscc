'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { getUserProfile } from '@/lib/firebase/userService';
import type { UserRole } from '@/types/roles';
import { ROLE_PERMISSIONS } from '@/types/roles';

/**
 * Hook to get current user's role and permissions
 */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setRole(profile?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const permissions = ROLE_PERMISSIONS[role];
  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    loading,
    permissions,
  };
}
