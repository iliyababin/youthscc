import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  Timestamp,
} from 'firebase/firestore';
import { db } from './index';
import type { BibleStudyGroup } from '@/types';

/**
 * Firestore data converter for BibleStudyGroup documents
 * Handles conversion between Firestore data and TypeScript types
 */
const bibleStudyGroupConverter: FirestoreDataConverter<BibleStudyGroup> = {
  toFirestore: (bibleStudyGroup) => {
    const { id, ...data } = bibleStudyGroup;
    return {
      ...data,
      meetingTimes: data.meetingTimes || [],
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description || '',
      location: data.location || '',
      leaders: data.leaders || [],
      meetingTimes: data.meetingTimes || [],
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as BibleStudyGroup;
  },
};

/**
 * Get a typed reference to the biblestudygroups collection
 */
export const getBibleStudyGroupsCollection = (): CollectionReference<BibleStudyGroup> => {
  return collection(db, 'biblestudygroups').withConverter(bibleStudyGroupConverter);
};

/**
 * Get a typed reference to a specific biblestudygroup document
 */
export const getBibleStudyGroupDoc = (id: string): DocumentReference<BibleStudyGroup> => {
  return doc(db, 'biblestudygroups', id).withConverter(bibleStudyGroupConverter);
};
