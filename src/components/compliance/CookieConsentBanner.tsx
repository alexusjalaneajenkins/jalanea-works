'use client'

/**
 * Cookie Consent Banner
 *
 * GDPR-compliant cookie consent banner with:
 * - Accept All / Essential Only / Customize options
 * - Persistent preference storage
 * - Granular category controls
 * - Re-accessible via footer link
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, ChevronDown, ChevronUp, Check } from 'lucide-react'

// Cookie consent categories
export interface CookiePreferences {
  essential: boolean    // Always true, cannot be disabled
  functional: boolean   // Preferences, personalization
  analytics: boolean    // Usage statistics
  timestamp: number     // When consent was given
  version: string       // Consent version for re-prompting
}

const CONSENT_VERSION = '1.0'
const STORAGE_KEY = 'jw_cookie_consent'

// Default preferences (essential only)
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  timestamp: 0,
  version: CONSENT_VERSION
}

interface CookieConsentBannerProps {
  onConsentChange?: (preferences: CookiePreferences) => void
}

export function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  // Check for existing consent on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences

        // Check if consent is still valid (same version)
        if (parsed.version === CONSENT_VERSION && parsed.timestamp > 0) {
          setPreferences(parsed)
          onConsentChange?.(parsed)
          return // Don't show banner
        }
      } catch {
        // Invalid stored data, show banner
      }
    }

    // Show banner after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [onConsentChange])

  // Save preferences and hide banner
  const savePreferences = (newPrefs: CookiePreferences) => {
    const toSave = {
      ...newPrefs,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    setPreferences(toSave)
    setIsVisible(false)
    onConsentChange?.(toSave)

    // Apply preferences
    applyPreferences(toSave)
  }

  // Accept all cookies
  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    })
  }

  // Essential only
  const handleEssentialOnly = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    })
  }

  // Save custom preferences
  const handleSaveCustom = () => {
    savePreferences(preferences)
  }

  // Toggle a category
  const toggleCategory = (category: 'functional' | 'analytics') => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-slide-up"
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main banner */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Icon and text */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Cookie className="w-5 h-5 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  We value your privacy
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  We use cookies to enhance your browsing experience, provide personalized content,
                  and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                  <Link href="/cookies" className="text-primary-600 hover:underline">
                    Learn more
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
            <button
              onClick={handleEssentialOnly}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Customize toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          aria-expanded={showDetails}
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide cookie settings
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Customize cookie settings
            </>
          )}
        </button>

        {/* Detailed settings */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Essential cookies */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Essential</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    Always on
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Required for the website to function. Cannot be disabled.
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>• Authentication</li>
                  <li>• Security</li>
                  <li>• Payment processing</li>
                </ul>
              </div>

              {/* Functional cookies */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Functional</h3>
                  <button
                    onClick={() => toggleCategory('functional')}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      preferences.functional ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={preferences.functional}
                    aria-label="Toggle functional cookies"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        preferences.functional ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      {preferences.functional && (
                        <Check className="w-3 h-3 text-primary-600 absolute top-1 left-1" />
                      )}
                    </span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Remember your preferences and personalize your experience.
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>• Theme preferences</li>
                  <li>• Search history</li>
                  <li>• Location settings</li>
                </ul>
              </div>

              {/* Analytics cookies */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <button
                    onClick={() => toggleCategory('analytics')}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      preferences.analytics ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Toggle analytics cookies"
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      {preferences.analytics && (
                        <Check className="w-3 h-3 text-primary-600 absolute top-1 left-1" />
                      )}
                    </span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Help us improve by collecting anonymous usage statistics.
                </p>
                <ul className="mt-2 text-xs text-gray-500 space-y-1">
                  <li>• Page views</li>
                  <li>• Feature usage</li>
                  <li>• Performance metrics</li>
                </ul>
              </div>
            </div>

            {/* Save custom preferences */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Apply cookie preferences (enable/disable tracking)
 */
function applyPreferences(prefs: CookiePreferences) {
  // Analytics: Google Analytics
  if (typeof window !== 'undefined') {
    // Disable GA if analytics not consented
    if (!prefs.analytics) {
      // Set GA opt-out
      (window as unknown as { 'ga-disable-GA_MEASUREMENT_ID'?: boolean })['ga-disable-GA_MEASUREMENT_ID'] = true

      // Remove existing GA cookies
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.startsWith('_ga')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        }
      })
    }

    // Functional: Clear functional cookies if not consented
    if (!prefs.functional) {
      const functionalKeys = ['jw_theme', 'jw_location', 'jw_recent_searches']
      functionalKeys.forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }
}

/**
 * Hook to get current cookie preferences
 */
export function useCookiePreferences(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch {
        setPreferences(null)
      }
    }
  }, [])

  return preferences
}

/**
 * Function to open cookie settings (for footer link)
 */
export function openCookieSettings() {
  // Remove stored consent to show banner again
  localStorage.removeItem(STORAGE_KEY)
  // Dispatch event to re-render banner
  window.dispatchEvent(new Event('storage'))
  // Reload to show banner
  window.location.reload()
}

export default CookieConsentBanner
