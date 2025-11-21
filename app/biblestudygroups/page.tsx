'use client';

import { BibleStudyGroupList } from '@/components/biblestudygroups/BibleStudyGroupList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useUserRole } from '@/hooks';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import TypingText from '@/components/ui/shadcn-io/typing-text';

export default function BibleStudyGroupsPage() {
  const { permissions, loading } = useUserRole();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto py-12 px-4 relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">Bible Study Groups</h1>

            {/* Bible Verse */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-4 top-0 text-3xl sm:text-4xl text-white/20 font-serif">"</div>
              <blockquote className="text-sm sm:text-base font-light leading-relaxed text-white/90 italic px-6 sm:px-12 min-h-[3rem]">
                <TypingText
                  text="For where two or three are gathered together in my name, there am I in the midst of them"
                  typingSpeed={25}
                  showCursor={true}
                  cursorCharacter="|"
                  loop={false}
                  startOnVisible={true}
                  variableSpeed={{ min: 20, max: 35 }}
                  className="text-sm sm:text-base font-light leading-relaxed text-white/90 italic"
                />
              </blockquote>
              <div className="absolute -right-2 sm:-right-4 bottom-0 text-3xl sm:text-4xl text-white/20 font-serif">"</div>
            </div>
            <p className="mt-2 text-xs text-white/70 font-medium text-right">
              — Matthew 18:20
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Groups List */}
          <div>
            <BibleStudyGroupList />
          </div>

          {/* FAQ Accordion */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
            <div className="rounded-lg border bg-white shadow-sm">
              <Accordion type="single" collapsible className="w-full px-6">
                <AccordionItem value="why-join">
                  <AccordionTrigger>Why Join a Bible Study Group?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Bible study groups are small gatherings where believers come together to study God's Word, share fellowship, and grow in faith. These groups provide a supportive community where you can ask questions, discuss scripture, and build meaningful relationships with others on the same spiritual journey.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="how-to-join">
                  <AccordionTrigger>How to Join</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Browse the groups below to find one that suits your needs and schedule. When you find a group that interests you, click the "Join" button. The group leaders will then reach out to you with more details about meeting times, location, and how to get started.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
