'use client';

import Link from "next/link";
import { useAuth } from "@/contexts";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 md:p-12">
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Welcome to Youth SCC
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Your church cell group management system built with Next.js, Firebase, and TanStack Query
            </p>

            {!loading && (
              <div className="pt-6 sm:pt-8 flex justify-center px-4">
                {user ? (
                  <Link
                    href="/biblestudygroups"
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    View Bible Study Groups
                  </Link>
                ) : (
                  <Link
                    href="/auth"
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            )}

            <div className="pt-8 sm:pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                  Firebase Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Real-time data sync with Firestore, Authentication, and Storage
                </p>
              </div>
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                  TanStack Query
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Powerful data fetching with caching and automatic updates
                </p>
              </div>
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                  Type-Safe
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Full TypeScript support with proper type definitions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
