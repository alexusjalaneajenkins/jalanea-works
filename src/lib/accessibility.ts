/**
 * Accessibility Utilities
 *
 * WCAG 2.1 AA compliant accessibility helpers for Jalanea Works.
 * Implements focus management, screen reader announcements, and keyboard navigation.
 */

/**
 * Announce a message to screen readers
 * Uses ARIA live regions for dynamic content updates
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return

  // Find or create the live region
  let liveRegion = document.getElementById('sr-announcer')

  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = 'sr-announcer'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', 'status')
    liveRegion.className = 'sr-only'
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    document.body.appendChild(liveRegion)
  }

  // Update priority if needed
  liveRegion.setAttribute('aria-live', priority)

  // Clear and set message (needed to trigger re-announcement)
  liveRegion.textContent = ''
  requestAnimationFrame(() => {
    liveRegion!.textContent = message
  })
}

/**
 * Focus management utility
 * Manages focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement
  private firstFocusable: HTMLElement | null = null
  private lastFocusable: HTMLElement | null = null
  private previouslyFocused: HTMLElement | null = null

  constructor(element: HTMLElement) {
    this.element = element
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  activate(): void {
    // Store previously focused element
    this.previouslyFocused = document.activeElement as HTMLElement

    // Find all focusable elements
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    const focusables = this.element.querySelectorAll<HTMLElement>(focusableSelectors)

    if (focusables.length > 0) {
      this.firstFocusable = focusables[0]
      this.lastFocusable = focusables[focusables.length - 1]

      // Focus first element
      this.firstFocusable.focus()
    }

    // Add keyboard listener
    this.element.addEventListener('keydown', this.handleKeyDown)
  }

  deactivate(): void {
    // Remove keyboard listener
    this.element.removeEventListener('keydown', this.handleKeyDown)

    // Restore previous focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus()
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return

    // Shift + Tab
    if (event.shiftKey) {
      if (document.activeElement === this.firstFocusable) {
        event.preventDefault()
        this.lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        event.preventDefault()
        this.firstFocusable?.focus()
      }
    }
  }
}

/**
 * Skip link target ID generator
 * Creates consistent IDs for skip link navigation
 */
export const skipLinkTargets = {
  mainContent: 'main-content',
  navigation: 'main-navigation',
  search: 'job-search',
  footer: 'main-footer'
} as const

/**
 * Generate ARIA label for job cards
 */
export function generateJobCardLabel(job: {
  title: string
  company: string
  location: string
  salary?: string
  matchScore?: number
}): string {
  const parts = [
    job.title,
    `at ${job.company}`,
    `in ${job.location}`
  ]

  if (job.salary) {
    parts.push(`salary ${job.salary}`)
  }

  if (job.matchScore !== undefined) {
    parts.push(`${job.matchScore}% match`)
  }

  return parts.join(', ')
}

/**
 * Generate ARIA label for scam risk levels
 */
export function generateScamRiskLabel(
  level: 'low' | 'medium' | 'high' | 'critical',
  reasons?: string[]
): string {
  const riskDescriptions = {
    low: 'Low risk - This job appears legitimate',
    medium: 'Medium risk - Some caution advised',
    high: 'High risk - Multiple warning signs detected',
    critical: 'Critical risk - This job has been flagged as potentially fraudulent'
  }

  let label = riskDescriptions[level]

  if (reasons && reasons.length > 0) {
    label += `. Warning signs: ${reasons.join(', ')}`
  }

  return label
}

/**
 * Keyboard shortcut manager
 */
interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = []
  private enabled = true

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut)
  }

  unregister(key: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key)
  }

  enable(): void {
    this.enabled = true
    document.addEventListener('keydown', this.handleKeyDown)
  }

  disable(): void {
    this.enabled = false
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  getShortcuts(): { key: string; description: string }[] {
    return this.shortcuts.map(s => ({
      key: this.formatShortcutKey(s),
      description: s.description
    }))
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      return
    }

    for (const shortcut of this.shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }

  private formatShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }
}

/**
 * Color contrast checker
 * Ensures WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace('#', '').match(/.{2}/g)
    if (!rgb) return 0

    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c, 16) / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  }
}

/**
 * Reduced motion detection
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}

export default {
  announceToScreenReader,
  FocusTrap,
  skipLinkTargets,
  generateJobCardLabel,
  generateScamRiskLabel,
  KeyboardShortcutManager,
  checkColorContrast,
  prefersReducedMotion,
  prefersHighContrast
}
