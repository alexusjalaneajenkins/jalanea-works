'use client'

/**
 * Google Translate Widget Component
 *
 * Provides a floating translate button that appears when user selects Spanish
 * but for pages that don't have full i18n support yet.
 *
 * Usage: Add <GoogleTranslate /> to your layout or page
 */

import { useEffect, useState } from 'react'
import { Languages, X } from 'lucide-react'

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string
              includedLanguages?: string
              layout?: unknown
              autoDisplay?: boolean
            },
            elementId: string
          ): unknown
          InlineLayout: { SIMPLE: unknown }
        }
      }
    }
  }
}

interface GoogleTranslateProps {
  /** Show only when this condition is true */
  showWhen?: boolean
  /** Position of the floating button */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function GoogleTranslate({
  showWhen = true,
  position = 'bottom-right'
}: GoogleTranslateProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    if (!showWhen || isScriptLoaded) return

    // Define the callback function
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'es,en',
            autoDisplay: false,
          },
          'google_translate_element'
        )
        setIsLoaded(true)
      }
    }

    // Load the Google Translate script
    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)
    setIsScriptLoaded(true)

    return () => {
      // Cleanup
      delete window.googleTranslateElementInit
    }
  }, [showWhen, isScriptLoaded])

  if (!showWhen) return null

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <>
      {/* Hidden Google Translate element */}
      <div
        id="google_translate_element"
        className={`
          fixed z-50 bg-white rounded-lg shadow-xl p-2
          ${positionClasses[position]}
          ${isOpen ? 'block' : 'hidden'}
        `}
        style={{
          minWidth: '200px',
          // Offset to account for the floating button
          marginBottom: isOpen ? '60px' : '0'
        }}
      />

      {/* Floating translate button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed z-50 p-3 rounded-full shadow-lg
          transition-all duration-200 ease-out
          ${positionClasses[position]}
          ${isOpen
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-[#ffc425] hover:bg-[#e6b121] text-slate-900'
          }
        `}
        aria-label={isOpen ? 'Close translator' : 'Translate page'}
        title={isOpen ? 'Close translator' : 'Translate page to Spanish'}
      >
        {isOpen ? <X size={24} /> : <Languages size={24} />}
      </button>

      {/* Notification badge when translation is active */}
      {isLoaded && !isOpen && (
        <span
          className={`
            fixed z-50 w-3 h-3 bg-emerald-500 rounded-full
            ${position === 'bottom-right' ? 'bottom-4 right-4' : ''}
            ${position === 'bottom-left' ? 'bottom-4 left-4' : ''}
            ${position === 'top-right' ? 'top-4 right-4' : ''}
            ${position === 'top-left' ? 'top-4 left-4' : ''}
            transform translate-x-1/2 -translate-y-1/2
          `}
          style={{
            marginBottom: position.includes('bottom') ? '40px' : '0',
            marginTop: position.includes('top') ? '40px' : '0',
          }}
        />
      )}

      {/* Custom styles to hide Google Translate branding */}
      <style jsx global>{`
        /* Hide Google Translate top bar */
        .goog-te-banner-frame {
          display: none !important;
        }

        body {
          top: 0 !important;
        }

        /* Style the dropdown nicely */
        .goog-te-gadget {
          font-family: inherit !important;
        }

        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 8px !important;
          font-size: 14px !important;
        }

        .goog-te-gadget-simple > span {
          border: none !important;
        }

        .goog-te-menu-value {
          color: #1e293b !important;
        }

        .goog-te-menu-value span {
          color: #1e293b !important;
        }

        /* Hide "Powered by Google" text */
        .goog-te-gadget > span {
          display: none !important;
        }

        .goog-logo-link {
          display: none !important;
        }

        /* Make the select look nicer */
        .goog-te-combo {
          padding: 8px 12px !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          background: white !important;
          font-size: 14px !important;
          cursor: pointer !important;
        }
      `}</style>
    </>
  )
}

export default GoogleTranslate
