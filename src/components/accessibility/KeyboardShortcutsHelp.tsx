'use client'

/**
 * Keyboard Shortcuts Help Modal
 *
 * Displays available keyboard shortcuts to users.
 * Triggered by pressing '?' key.
 */

import { useEffect, useState } from 'react'
import { X, Keyboard } from 'lucide-react'
import { FocusTrap, announceToScreenReader } from '@/lib/accessibility'

interface Shortcut {
  key: string
  description: string
}

const defaultShortcuts: Shortcut[] = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: '/', description: 'Focus search input' },
  { key: 'Escape', description: 'Close modal or dialog' },
  { key: 'J', description: 'Next job in list' },
  { key: 'K', description: 'Previous job in list' },
  { key: 'Enter', description: 'Open selected job' },
  { key: 'S', description: 'Save/unsave job' },
  { key: 'A', description: 'Apply to job' },
  { key: 'G then H', description: 'Go to Home' },
  { key: 'G then D', description: 'Go to Dashboard' },
  { key: 'G then P', description: 'Go to Profile' }
]

interface KeyboardShortcutsHelpProps {
  shortcuts?: Shortcut[]
  triggerKey?: string
}

export function KeyboardShortcutsHelp({
  shortcuts = defaultShortcuts,
  triggerKey = '?'
}: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusTrap, setFocusTrap] = useState<FocusTrap | null>(null)

  // Listen for trigger key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return
      }

      if (e.key === triggerKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [triggerKey, isOpen])

  // Manage focus trap
  useEffect(() => {
    if (isOpen) {
      const modal = document.getElementById('keyboard-shortcuts-modal')
      if (modal) {
        const trap = new FocusTrap(modal)
        trap.activate()
        setFocusTrap(trap)
        announceToScreenReader('Keyboard shortcuts dialog opened')
      }
    } else if (focusTrap) {
      focusTrap.deactivate()
      setFocusTrap(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={() => setIsOpen(false)}
    >
      <div
        id="keyboard-shortcuts-modal"
        role="dialog"
        aria-labelledby="keyboard-shortcuts-title"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-gray-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close keyboard shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <dl className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <dt className="text-sm text-gray-600">{shortcut.description}</dt>
                <dd>
                  <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded">
                    {shortcut.key}
                  </kbd>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
