import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">This page is a placeholder</h1>
        <Link
          href="/biblestudygroups"
          className="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Go to Bible Study Groups
        </Link>
      </div>
    </div>
  );
}
