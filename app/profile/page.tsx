'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useUserRole } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const [customClaims, setCustomClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const idTokenResult = await user.getIdTokenResult();
        setCustomClaims(idTokenResult.claims);
      } catch (error) {
        console.error('Error loading custom claims:', error);
      } finally {
        setLoading(false);
      }
    }

    loadClaims();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'leader':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Display Name</label>
              <p className="text-lg">{user.displayName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="text-lg">{user.phoneNumber || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{user.email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{user.uid}</p>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Permissions</CardTitle>
            <CardDescription>Your current role and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Current Role</label>
              <div className="mt-2">
                <Badge variant={getRoleBadgeVariant(role)} className="text-sm">
                  {role.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Claims (Debug Info) */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Claims (Debug)</CardTitle>
            <CardDescription>Raw custom claims from Firebase Auth token</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(customClaims, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
