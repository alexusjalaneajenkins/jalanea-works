'use client'

/**
 * 404 Not Found Page
 *
 * Displayed when a route doesn't exist.
 */

import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200 select-none">
            404
          </div>
          <div className="relative -mt-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
          It might have been moved or doesn&apos;t exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search Jobs
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Maybe you were looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/applications"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Applications
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/dashboard/resume"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Resume Builder
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/dashboard/settings"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Go Back */}
        <div className="mt-8">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}
