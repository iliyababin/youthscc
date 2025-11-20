'use client';

import { useDocumentQuery, useCollectionQuery } from '@tanstack-query-firebase/react/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  getDocsFromServer,
  Timestamp,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { getBibleStudyGroupsCollection, getBibleStudyGroupDoc } from '../collections';
import type { BibleStudyGroup, CreateBibleStudyGroupData, UpdateBibleStudyGroupData } from '@/types';

/**
 * Hook to fetch all bible study groups
 * @returns TanStack Query result with array of bible study groups
 */
export function useBibleStudyGroups() {
  const collectionRef = getBibleStudyGroupsCollection();
  const q = query(collectionRef, orderBy('name', 'asc'));

  return useCollectionQuery(q, {
    queryKey: ['biblestudygroups'],
    firestore: {
      source: 'server', // Force fetch from server, bypass cache
    },
  });
}

/**
 * Hook to fetch a single bible study group by ID
 * @param id - Bible study group document ID
 * @returns TanStack Query result with bible study group data
 */
export function useBibleStudyGroup(id: string) {
  const docRef = getBibleStudyGroupDoc(id);

  return useDocumentQuery(docRef, {
    queryKey: ['biblestudygroups', id],
    subscribed: true, // Real-time updates
  });
}

/**
 * Hook to create a new bible study group
 * @returns Mutation function to create a bible study group
 */
export function useCreateBibleStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBibleStudyGroupData) => {
      const collectionRef = getBibleStudyGroupsCollection();
      const docRef = await addDoc(collectionRef, {
        ...data,
        members: [], // Always initialize with empty members array
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      } as any);
      return { id: docRef.id, name: data.name };
    },
    onSuccess: async (data) => {
      // Force refetch all active queries
      await queryClient.refetchQueries();
      // Show success toast
      toast.success('Bible study group created');
    },
  });
}

/**
 * Hook to update an existing bible study group
 * @returns Mutation function to update a bible study group
 */
export function useUpdateBibleStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBibleStudyGroupData }) => {
      const docRef = getBibleStudyGroupDoc(id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return data.name;
    },
    onSuccess: async (name) => {
      // Force refetch all active queries
      await queryClient.refetchQueries();
      // Show success toast
      toast.success('Bible study group updated');
    },
  });
}

/**
 * Hook to delete a bible study group
 * @returns Mutation function to delete a bible study group
 */
export function useDeleteBibleStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const docRef = getBibleStudyGroupDoc(id);
      await deleteDoc(docRef);
      return name;
    },
    onSuccess: async (name) => {
      // Force refetch all active queries
      await queryClient.refetchQueries();
      // Show success toast
      toast.success('Bible study group deleted');
    },
  });
}

/**
 * Hook to join a bible study group
 * @returns Mutation function to join a bible study group
 */
export function useJoinBibleStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      console.log('JOIN MUTATION: Starting join for groupId:', groupId, 'userId:', userId);
      const docRef = getBibleStudyGroupDoc(groupId);
      await updateDoc(docRef, {
        members: arrayUnion({ userId, joinedAt: Timestamp.now() }),
        updatedAt: Timestamp.now(),
      });
      console.log('JOIN MUTATION: Successfully updated Firestore');
      return { groupId, userId };
    },
    onMutate: async ({ groupId, userId }) => {
      console.log('JOIN MUTATION: onMutate - Optimistic update starting');
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['biblestudygroups'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['biblestudygroups']);

      // Optimistically update the cache
      queryClient.setQueryData(['biblestudygroups'], (old: any) => {
        if (!old?.docs) return old;

        return {
          ...old,
          docs: old.docs.map((doc: any) => {
            if (doc.id === groupId) {
              const currentData = doc.data();
              const currentMembers = currentData.members || [];
              return {
                ...doc,
                data: () => ({
                  ...currentData,
                  members: [...currentMembers, { userId, joinedAt: new Date() }],
                  updatedAt: new Date(),
                }),
              };
            }
            return doc;
          }),
        };
      });

      // Force re-render by invalidating without refetch
      queryClient.invalidateQueries({ queryKey: ['biblestudygroups'], refetchType: 'none' });

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      console.error('JOIN MUTATION: Error occurred:', err);
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['biblestudygroups'], context.previousData);
      }
      toast.error('Failed to join group');
    },
    onSuccess: async () => {
      console.log('JOIN MUTATION: onSuccess - Mutation completed successfully');
      // Invalidate and refetch to ensure cache is in sync with server
      await queryClient.invalidateQueries({ queryKey: ['biblestudygroups'] });
      // Success feedback is handled by the component dialog
    },
  });
}

/**
 * Hook to leave a bible study group
 * @returns Mutation function to leave a bible study group
 */
export function useLeaveBibleStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const docRef = getBibleStudyGroupDoc(groupId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error('Group not found');

      const currentMembers = docSnap.data().members || [];
      const updatedMembers = currentMembers.filter((member: any) => member.userId !== userId);

      await updateDoc(docRef, {
        members: updatedMembers,
        updatedAt: Timestamp.now(),
      });
      return { groupId, userId };
    },
    onMutate: async ({ groupId, userId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['biblestudygroups'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['biblestudygroups']);

      // Optimistically update the cache
      queryClient.setQueryData(['biblestudygroups'], (old: any) => {
        if (!old?.docs) return old;

        return {
          ...old,
          docs: old.docs.map((doc: any) => {
            if (doc.id === groupId) {
              const currentData = doc.data();
              const currentMembers = currentData.members || [];
              return {
                ...doc,
                data: () => ({
                  ...currentData,
                  members: currentMembers.filter((member: any) => member.userId !== userId),
                  updatedAt: new Date(),
                }),
              };
            }
            return doc;
          }),
        };
      });

      // Force re-render by invalidating without refetch
      queryClient.invalidateQueries({ queryKey: ['biblestudygroups'], refetchType: 'none' });

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['biblestudygroups'], context.previousData);
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch to ensure cache is in sync with server
      await queryClient.invalidateQueries({ queryKey: ['biblestudygroups'] });
      // Show success toast
      toast.success('You have left the group');
    },
  });
}
