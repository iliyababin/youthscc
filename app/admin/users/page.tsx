'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useUserRole } from '@/hooks';
import { getAllUsersWithRoles, deleteUserAccount } from '@/lib/firebase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from '@/components/admin/users-table-columns';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import type { UserProfile } from '@/types/roles';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsersWithRoles();
      setUsers(allUsers);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role === 'admin') {
      loadUsers();
    } else if (!roleLoading) {
      setLoading(false);
    }
  }, [user, role, roleLoading]);

  const handleDeleteUser = async (uid: string, displayName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${displayName}? This action cannot be undone and will delete both their authentication and profile data.`)) {
      return;
    }

    setDeletingUser(uid);
    setError(null);

    try {
      await deleteUserAccount(uid);

      // Remove from local state
      setUsers(users.filter(u => u.uid !== uid));

      alert(`Successfully deleted user "${displayName}"`);
    } catch (err: any) {
      if (err.code === 'functions/failed-precondition') {
        setError('You cannot delete your own account');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
      console.error(err);
    } finally {
      setDeletingUser(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>Please sign in to view this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Management</h1>
          <CreateUserDialog onUserCreated={loadUsers} />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={createColumns({
                currentUserId: user?.uid || '',
                onDeleteUser: handleDeleteUser,
                deletingUser,
              })}
              data={users}
              searchKey="displayName"
              searchPlaceholder="Search by name..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Users must sign out and sign back in after role changes for the changes to take effect</p>
            <p>• Admin role grants full access to all system features</p>
            <p>• Leader role grants access to manage bible study groups</p>
            <p>• User role grants basic access to view and join groups</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
