'use client'

/**
 * Global Error Page - Catches errors in root layout
 *
 * This is a fallback for errors that occur outside route boundaries.
 * It must define its own <html> and <body> tags.
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error
    console.error('Global error:', error)

    // In production, send to error tracking
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div
          className="min-h-screen flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-red-100">
                We&apos;re experiencing technical difficulties
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-600 text-center mb-6">
                The application encountered a critical error. Your data is safe,
                but you&apos;ll need to reload the page to continue.
              </p>

              {/* Error digest */}
              {error.digest && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6 text-center">
                  <p className="text-xs text-gray-400 font-mono">
                    Reference: {error.digest}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => reset()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Return to Home
                </button>
              </div>

              {/* Support */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  If this problem persists, please contact support
                </p>
                <a
                  href="mailto:support@jalanea.works?subject=Critical Error Report"
                  className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <Mail className="w-4 h-4" />
                  support@jalanea.works
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
