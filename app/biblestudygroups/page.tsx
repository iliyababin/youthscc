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

export default function BibleStudyGroupsPage() {
  const { permissions, loading } = useUserRole();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto py-12 px-4 relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">Bible Study Groups</h1>

            {/* Bible Verse */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-4 top-0 text-3xl sm:text-4xl text-white/20 font-serif">"</div>
              <blockquote className="text-sm sm:text-base font-light leading-relaxed text-white/90 italic px-6 sm:px-12">
                For where two or three are gathered together in my name, there am I in the midst of them
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
