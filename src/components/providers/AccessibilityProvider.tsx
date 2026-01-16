'use client'

/**
 * AccessibilityProvider - Client-side accessibility features wrapper
 *
 * Wraps accessibility components that need to be client-side
 * for use in the server component root layout.
 */

import { ReactNode } from 'react'
import { SkipLinks } from '@/components/accessibility'
import { KeyboardShortcutsHelp } from '@/components/accessibility'

interface AccessibilityProviderProps {
  children: ReactNode
}

export default function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  return (
    <>
      {/* Skip Links for Accessibility */}
      <SkipLinks />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp />

      {/* Main Content */}
      {children}
    </>
  )
}
