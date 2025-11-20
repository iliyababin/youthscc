/**
 * Represents a leader in a bible study group
 */
export interface Leader {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Represents a member in a bible study group
 */
export interface Member {
  userId: string;
  joinedAt?: Date;
}

/**
 * Day of the week
 */
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/**
 * Meeting time with day of week and time
 */
export interface MeetingTime {
  dayOfWeek: DayOfWeek;
  hour: number; // 0-23 (24-hour format)
  minute: number; // 0, 15, 30, 45
}

/**
 * Represents a bible study group document in Firestore
 */
export interface BibleStudyGroup {
  id: string;
  name: string;
  description: string;
  location: string;
  leaders: Leader[];
  meetingTimes: MeetingTime[]; // Array of recurring meeting times (required)
  members: Member[]; // Array of members (required, can be empty)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Data required to create a new bible study group
 * Members array is optional as new groups start empty
 */
export type CreateBibleStudyGroupData = Omit<BibleStudyGroup, 'id' | 'createdAt' | 'updatedAt' | 'members'> & {
  members?: Member[];
};

/**
 * Data required to update a bible study group
 */
export type UpdateBibleStudyGroupData = Partial<CreateBibleStudyGroupData>;
