'use client'

/**
 * ErrorBoundary - Global error handling component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing.
 */

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback component */
  fallback?: ReactNode
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  /** Whether to show technical details (development only) */
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary class component
 * Must be a class component as hooks don't support componentDidCatch
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, showDetails } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
          showDetails={showDetails}
        />
      )
    }

    return children
  }
}

/**
 * Default error fallback UI
 */
interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  onReset?: () => void
  showDetails?: boolean
}

export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails = process.env.NODE_ENV === 'development'
}: ErrorFallbackProps) {
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-red-100 text-sm">
                We&apos;re sorry, an unexpected error occurred
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Don&apos;t worry, your data is safe. You can try refreshing the page
            or return to the home page.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => {
                if (onReset) onReset()
                window.location.reload()
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>

          {/* Technical Details (development only) */}
          {showDetails && error && (
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 p-4 bg-gray-900 rounded-lg overflow-x-auto">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {error.name}: {error.message}
                </p>
                {errorInfo?.componentStack && (
                  <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Support Link */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">
              If this keeps happening, please let us know
            </p>
            <a
              href="mailto:support@jalanea.works?subject=Bug Report"
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              <Mail className="w-4 h-4" />
              Report this issue
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Wrapper component for specific error boundaries
 */
interface SectionErrorBoundaryProps {
  children: ReactNode
  sectionName: string
}

export function SectionErrorBoundary({ children, sectionName }: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              Error loading {sectionName}
            </p>
          </div>
          <p className="text-sm text-red-600 mt-1">
            This section encountered an error. Please refresh the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
