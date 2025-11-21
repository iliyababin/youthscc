'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import type { UserRole } from '@/types/roles';
import { ROLE_PERMISSIONS } from '@/types/roles';

/**
 * Hook to get current user's role and permissions from custom claims
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
        // Get the ID token result which contains custom claims
        const idTokenResult = await user.getIdTokenResult();
        const customRole = idTokenResult.claims.role as UserRole | undefined;
        setRole(customRole || 'user');
      } catch (error) {
        console.error('Error fetching user role from custom claims:', error);
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
