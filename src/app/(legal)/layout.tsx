/**
 * Legal Pages Layout
 * Clean, readable layout for privacy policy, terms of service, etc.
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jalanea Works</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10">
          {children}
        </article>

        {/* Legal Navigation */}
        <nav className="mt-8 pt-6 border-t border-gray-200" aria-label="Legal documents">
          <p className="text-sm text-gray-500 mb-3">Legal Documents</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Cookie Policy
            </Link>
            <Link
              href="/accessibility"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Accessibility
            </Link>
          </div>
        </nav>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Jalanea Works. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
