'use client';

import { BibleStudyGroupList } from '@/components/biblestudygroups/BibleStudyGroupList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useUserRole } from '@/hooks';

export default function BibleStudyGroupsPage() {
  const { permissions, loading } = useUserRole();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="container mx-auto py-12 sm:py-16 px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Bible Verse */}
            <div className="relative">
              <div className="absolute -left-2 sm:-left-4 top-0 text-4xl sm:text-5xl text-white/20 font-serif">"</div>
              <blockquote className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-white/95 italic px-6 sm:px-12">
                For where two or three are gathered together in my name, there am I in the midst of them
              </blockquote>
              <div className="absolute -right-2 sm:-right-4 bottom-0 text-4xl sm:text-5xl text-white/20 font-serif">"</div>
            </div>

            <p className="mt-4 text-sm sm:text-base text-white/70 font-medium tracking-wide">
              — Matthew 18:20
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Bible Study Groups</h4>
          {!loading && permissions.canCreateBibleStudyGroups && (
            <Button variant="outline" asChild>
              <Link href="/biblestudygroups/new">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>
          )}
        </div>
        <BibleStudyGroupList />
      </div>
    </div>
  );
}
