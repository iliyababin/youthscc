'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useUserRole } from '@/hooks';
import { getAllUsersWithRoles, deleteUserAccount } from '@/lib/firebase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { DataTable } from '@/components/ui/data-table';
import { createColumns } from '@/components/admin/users-table-columns';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { UserProfile } from '@/types/roles';

export default function AdminPage() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ uid: string; displayName: string } | null>(null);

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

  const handleDeleteUser = (uid: string, displayName: string) => {
    setUserToDelete({ uid, displayName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(userToDelete.uid);
    setError(null);

    try {
      await deleteUserAccount(userToDelete.uid);

      // Remove from local state
      setUsers(users.filter(u => u.uid !== userToDelete.uid));

      // Close dialog after successful deletion
      setDeleteDialogOpen(false);
    } catch (err: any) {
      if (err.code === 'functions/failed-precondition') {
        setError('You cannot delete your own account');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
      console.error(err);
      // Close dialog even on error
      setDeleteDialogOpen(false);
    } finally {
      setDeletingUser(null);
      setUserToDelete(null);
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">User Management</h2>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{userToDelete?.displayName}</strong>?
              This action cannot be undone and will delete both their authentication and profile data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingUser !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deletingUser !== null}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingUser !== null ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
