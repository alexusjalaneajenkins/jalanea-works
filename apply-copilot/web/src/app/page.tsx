import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Apply Co-Pilot
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Your human-in-the-loop job application assistant
          </p>
        </div>

        <nav className="space-y-4">
          <Link
            href="/vault"
            className="block w-full p-4 text-center bg-primary-500 text-white rounded-xl font-medium touch-target hover:bg-primary-600 transition-colors"
          >
            Setup Vault
          </Link>
          <Link
            href="/jobs"
            className="block w-full p-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium touch-target hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Job Queue
          </Link>
          <Link
            href="/apply"
            className="block w-full p-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium touch-target hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Apply Sprint
          </Link>
          <Link
            href="/tracker"
            className="block w-full p-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium touch-target hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Tracker
          </Link>
        </nav>
      </div>
    </main>
  );
}
