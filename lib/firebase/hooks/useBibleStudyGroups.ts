'use client';

import { useDocumentQuery } from '@tanstack-query-firebase/react/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { getBibleStudyGroupsCollection, getBibleStudyGroupDoc } from '../collections';
import type { BibleStudyGroup, CreateBibleStudyGroupData, UpdateBibleStudyGroupData } from '@/types';

/**
 * Hook to fetch all bible study groups
 * @returns TanStack Query result with array of bible study groups
 */
export function useBibleStudyGroups() {
  return useQuery({
    queryKey: ['biblestudygroups'],
    queryFn: async () => {
      const collectionRef = getBibleStudyGroupsCollection();
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot;
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
