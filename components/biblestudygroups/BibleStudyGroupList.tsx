'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBibleStudyGroups, useDeleteBibleStudyGroup } from '@/lib/firebase/hooks';
import { useUserRole } from '@/hooks';
import { useAuth } from '@/contexts';
import { MoreVertical, Users, ChevronDown, ChevronUp, Trash2, Edit, Share2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import type { BibleStudyGroup, MeetingTime } from '@/types';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function BibleStudyGroupList() {
  const router = useRouter();
  const { user } = useAuth();
  const bibleStudyGroupsQuery = useBibleStudyGroups();
  const deleteBibleStudyGroup = useDeleteBibleStudyGroup();
  const { permissions } = useUserRole();
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Helper function to format meeting time for display
  const formatMeetingTime = (meetingTime: MeetingTime) => {
    const hour12 = meetingTime.hour === 0 ? 12 : meetingTime.hour > 12 ? meetingTime.hour - 12 : meetingTime.hour;
    const period = meetingTime.hour >= 12 ? 'PM' : 'AM';
    const minute = meetingTime.minute.toString().padStart(2, '0');
    return `${meetingTime.dayOfWeek} at ${hour12}:${minute} ${period}`;
  };

  const toggleCard = (id: string) => {
    setOpenCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (bibleStudyGroupsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Loading bible study groups...</p>
      </div>
    );
  }

  if (bibleStudyGroupsQuery.isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle className="text-lg font-semibold">Error Loading Bible Study Groups</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">{bibleStudyGroupsQuery.error?.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const snapshot = bibleStudyGroupsQuery.data;
  const bibleStudyGroups = (snapshot?.docs.map((doc) => doc.data()) || []) as BibleStudyGroup[];

  if (bibleStudyGroups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border bg-white shadow-sm p-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No Bible Study Groups Yet</EmptyTitle>
              <EmptyDescription>
                {permissions.canCreateCellGroups
                  ? "Get started by creating your first bible study group above!"
                  : "Bible study groups will appear here once they're created."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!selectedGroup) return;
    try {
      await deleteBibleStudyGroup.mutateAsync({ id: selectedGroup.id, name: selectedGroup.name });
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error deleting bible study group:', error);
    }
  };

  const handleJoin = (groupId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    // TODO: Implement join logic
    console.log('Joining group:', groupId);
  };

  return (
    <>
      <div className="space-y-4">
        {bibleStudyGroups.map((bibleStudyGroup) => (
          <div key={bibleStudyGroup.id} className="rounded-lg border bg-white shadow-sm">
            {/* Header */}
            <div className="p-4 pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{bibleStudyGroup.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{bibleStudyGroup.description}</p>
                </div>
                {permissions.canDeleteCellGroups && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteBibleStudyGroup.isPending}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/biblestudygroups/${bibleStudyGroup.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Share', bibleStudyGroup.id)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGroup({ id: bibleStudyGroup.id, name: bibleStudyGroup.name });
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Collapsible Content */}
            <div className="px-4 pb-4">
              <Collapsible open={openCards[bibleStudyGroup.id]} onOpenChange={() => toggleCard(bibleStudyGroup.id)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full h-8 -mx-2">
                    {openCards[bibleStudyGroup.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show More
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-3 space-y-3">
                {/* Leaders */}
                <p className="text-sm">
                  <span className="font-medium">Leaders:</span> {bibleStudyGroup.leaders.length > 0 ? bibleStudyGroup.leaders.map(l => l.name).join(', ') : 'None'}
                </p>

                {/* Location */}
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {bibleStudyGroup.location}
                </p>

                {/* Meeting Times */}
                {bibleStudyGroup.meetingTimes && bibleStudyGroup.meetingTimes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Meeting Times:</p>
                    <ul className="ml-5 list-disc space-y-0.5">
                      {bibleStudyGroup.meetingTimes.map((meetingTime, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {formatMeetingTime(meetingTime)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Join Button */}
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => handleJoin(bibleStudyGroup.id)}
                >
                  Join
                </Button>
              </CollapsibleContent>
            </Collapsible>
            </div>
          </div>
        ))}
    </div>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bible Study Group?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
