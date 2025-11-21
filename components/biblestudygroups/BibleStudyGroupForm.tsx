'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { Clock, Plus } from 'lucide-react';
import { useCreateBibleStudyGroup, useUpdateBibleStudyGroup } from '@/lib/firebase/hooks';
import { useUserRole } from '@/hooks';
import { getAllUsers, getUsersByIds } from '@/lib/firebase/userService';
import type { MeetingTime, DayOfWeek, BibleStudyGroup } from '@/types';
import type { UserProfile } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { formatPhoneNumberIntl } from 'react-phone-number-input';

interface BibleStudyGroupFormProps {
  initialData?: BibleStudyGroup;
  onSuccess?: () => void;
}

export function BibleStudyGroupForm({ initialData, onSuccess }: BibleStudyGroupFormProps) {
  const isEditMode = !!initialData;
  const [leaderIds, setLeaderIds] = useState<string[]>(initialData?.leaders || []);
  const [leaderProfiles, setLeaderProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [meetingTimes, setMeetingTimes] = useState<MeetingTime[]>(initialData?.meetingTimes || []);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>('Monday');
  const [selectedHour, setSelectedHour] = useState<string>('7');
  const [selectedMinute, setSelectedMinute] = useState<string>('00');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('PM');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const router = useRouter();
  const createBibleStudyGroup = useCreateBibleStudyGroup();
  const updateBibleStudyGroup = useUpdateBibleStudyGroup();
  const { permissions, loading: roleLoading } = useUserRole();

  // Setup form with TanStack Form
  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditMode && initialData) {
          await updateBibleStudyGroup.mutateAsync({
            id: initialData.id,
            data: {
              name: value.name.trim(),
              description: value.description.trim(),
              location: value.location.trim(),
              leaders: leaderIds,
              meetingTimes,
            },
          });
        } else {
          await createBibleStudyGroup.mutateAsync({
            name: value.name.trim(),
            description: value.description.trim(),
            location: value.location.trim(),
            leaders: leaderIds,
            meetingTimes,
          });
        }

        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: redirect to bible study groups list
          router.push('/biblestudygroups');
        }
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} bible study group:`, error);
      }
    },
  });

  // Load all users on mount
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserCreated = async () => {
    // Fetch just the new user list and update state without reloading
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  useEffect(() => {
    if (permissions.canCreateCellGroups) {
      loadUsers();
    }
  }, [permissions.canCreateCellGroups]);

  // Load leader profiles when leaderIds change
  useEffect(() => {
    async function loadLeaderProfiles() {
      if (leaderIds.length === 0) {
        setLeaderProfiles(new Map());
        setIsLoadingLeaders(false);
        return;
      }

      // Only fetch profiles we don't already have
      const missingIds = leaderIds.filter(id => !leaderProfiles.has(id));

      if (missingIds.length === 0) {
        setIsLoadingLeaders(false);
        return;
      }

      try {
        setIsLoadingLeaders(true);
        const newProfiles = await getUsersByIds(missingIds);
        setLeaderProfiles(prev => new Map([...prev, ...newProfiles]));
      } catch (error) {
        console.error('Error loading leader profiles:', error);
      } finally {
        setIsLoadingLeaders(false);
      }
    }

    if (permissions.canCreateCellGroups) {
      loadLeaderProfiles();
    }
  }, [leaderIds, permissions.canCreateCellGroups]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return allUsers.filter((user) => {
      if (leaderIds.includes(user.uid)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const matchesEmail = user.email?.toLowerCase().includes(normalizedSearch);
      const matchesName = user.displayName?.toLowerCase().includes(normalizedSearch);

      return matchesEmail || matchesName;
    });
  }, [searchTerm, allUsers, leaderIds]);

  if (roleLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!permissions.canCreateCellGroups) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm text-yellow-800">
          <strong>Admin Access Required:</strong> Only administrators can {isEditMode ? 'edit' : 'create'} bible study groups.
        </p>
      </div>
    );
  }

  const handleAddLeader = (user: UserProfile) => {
    setLeaderIds([...leaderIds, user.uid]);
    // Immediately add the user profile to cache to avoid loading state
    setLeaderProfiles(prev => new Map([...prev, [user.uid, user]]));
  };

  const handleRemoveLeader = (uid: string) => {
    setLeaderIds(leaderIds.filter((id) => id !== uid));
  };

  const handleAddMeetingTime = () => {
    // Convert 12-hour to 24-hour format
    let hour = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hour !== 12) {
      hour += 12;
    } else if (selectedPeriod === 'AM' && hour === 12) {
      hour = 0;
    }

    const newMeetingTime: MeetingTime = {
      dayOfWeek: selectedDayOfWeek,
      hour,
      minute: parseInt(selectedMinute),
    };

    setMeetingTimes([...meetingTimes, newMeetingTime]);
    setIsPopoverOpen(false);
  };

  const handleRemoveMeetingTime = (index: number) => {
    setMeetingTimes(meetingTimes.filter((_, i) => i !== index));
  };

  // Helper function to format meeting time for display
  const formatMeetingTime = (meetingTime: MeetingTime) => {
    const hour12 = meetingTime.hour === 0 ? 12 : meetingTime.hour > 12 ? meetingTime.hour - 12 : meetingTime.hour;
    const period = meetingTime.hour >= 12 ? 'PM' : 'AM';
    const minute = meetingTime.minute.toString().padStart(2, '0');
    return `${meetingTime.dayOfWeek} at ${hour12}:${minute} ${period}`;
  };

  // Days of week options
  const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  // Generate minute options (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45'];
  // AM/PM options
  const periods = ['AM', 'PM'];

  const mutation = isEditMode ? updateBibleStudyGroup : createBibleStudyGroup;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">
        {isEditMode ? 'Edit Bible Study Group' : 'Create Bible Study Group'}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Bible Study Group Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Cell group name is required' : value.length < 3 ? 'Name must be at least 3 characters' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Group Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="ex. Youth Bible Study"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Description Field */}
        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Description is required' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="ex. A weekly study for young adults focusing on..."
                rows={3}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Location Field */}
        <form.Field
          name="location"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Location is required' : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Location</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="ex. Church Main Hall"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        {/* Meeting Date/Times */}
        <div className="space-y-3">
          <Label>Meeting Time(s)</Label>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add Meeting Time</h4>
                    <p className="text-sm text-muted-foreground">
                      Select a day and time for this bible study group.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Day of Week Picker */}
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select value={selectedDayOfWeek} onValueChange={(value) => setSelectedDayOfWeek(value as DayOfWeek)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Time Picker */}
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="flex gap-2">
                        <Select value={selectedHour} onValueChange={setSelectedHour}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {hours.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {minutes.map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period} value={period}>
                                {period}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddMeetingTime}
                      variant="secondary"
                      className="w-full"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

          {/* Current Meeting Times */}
          {meetingTimes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meetingTimes.map((meetingTime, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatMeetingTime(meetingTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeetingTime(index)}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaders Section */}
        <div>
          <Label className="block mb-3">Leaders</Label>

          {/* Current Leaders */}
          {leaderIds.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {isLoadingLeaders ? (
                <div className="p-4 text-center text-gray-500">Loading leaders...</div>
              ) : (
                leaderIds.map((leaderId) => {
                  const leader = leaderProfiles.get(leaderId);
                  return (
                    <div
                      key={leaderId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      <span className="truncate max-w-[200px]">
                        {leader ? (leader.displayName || leader.phoneNumber) : 'Unknown User'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLeader(leaderId)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
              />
              <CreateUserDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>

            {/* Users List */}
            <ScrollArea className="h-48 rounded-md border bg-gray-50">
              {isLoadingUsers ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.uid}
                      type="button"
                      onClick={() => handleAddLeader(user)}
                      className="w-full text-left p-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 bg-white group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate text-gray-900">
                            {user.displayName || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatPhoneNumberIntl(user.phoneNumber)}
                          </div>
                        </div>
                        {user.role === 'admin' && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium flex-shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users available'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || mutation.isPending || meetingTimes.length === 0}
              className="w-full"
              size="lg"
            >
              {mutation.isPending || isSubmitting
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Bible Study Group' : 'Create Bible Study Group')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
