'use client';

import { use } from 'react';
import { useBibleStudyGroup } from '@/lib/firebase/hooks';
import { BibleStudyGroupForm } from '@/components/biblestudygroups/BibleStudyGroupForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EditBibleStudyGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bibleStudyGroupQuery = useBibleStudyGroup(id);

  if (bibleStudyGroupQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="container mx-auto py-8 sm:py-10 px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
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
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Spinner className="size-8" />
            <p className="text-sm text-muted-foreground">Loading bible study group...</p>
          </div>
        </div>
      </div>
    );
  }

  if (bibleStudyGroupQuery.isError) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="container mx-auto py-8 sm:py-10 px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
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
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/biblestudygroups">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bible Study Groups
              </Link>
            </Button>
          </div>
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertTitle className="text-lg font-semibold">Error Loading Bible Study Group</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                {bibleStudyGroupQuery.error?.message || 'Failed to load bible study group'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  const bibleStudyGroup = bibleStudyGroupQuery.data?.data();

  if (!bibleStudyGroup) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="container mx-auto py-8 sm:py-10 px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
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
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/biblestudygroups">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bible Study Groups
              </Link>
            </Button>
          </div>
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertTitle className="text-lg font-semibold">Bible Study Group Not Found</AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground">
                The bible study group you're looking for doesn't exist.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="container mx-auto py-8 sm:py-10 px-4 relative">
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
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/biblestudygroups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bible Study Groups
            </Link>
          </Button>
        </div>
        <BibleStudyGroupForm initialData={bibleStudyGroup} />
      </div>
    </div>
  );
}
