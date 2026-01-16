'use client'

/**
 * VisuallyHidden - Screen reader only content
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Use for accessible labels, descriptions, and announcements.
 *
 * WCAG 2.1 AA compliant implementation.
 */

import React, { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react'

interface VisuallyHiddenProps<T extends ElementType = 'span'> {
  /** Content to be hidden visually but read by screen readers */
  children: ReactNode
  /** HTML element to render as (default: span) */
  as?: T
  /** When true, content becomes visible on focus (useful for skip links) */
  focusable?: boolean
}

type Props<T extends ElementType> = VisuallyHiddenProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof VisuallyHiddenProps<T>>

/**
 * Visually hidden styles that keep content accessible to screen readers
 * Based on the HTML5 Boilerplate .sr-only class
 */
const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0
}

/**
 * Styles for focusable elements that become visible on focus
 */
const focusableStyles = `
  .visually-hidden-focusable:focus,
  .visually-hidden-focusable:active {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`

export default function VisuallyHidden<T extends ElementType = 'span'>({
  children,
  as,
  focusable = false,
  ...props
}: Props<T>) {
  const Component = as || 'span'

  if (focusable) {
    return (
      <>
        <style>{focusableStyles}</style>
        <Component
          className="visually-hidden-focusable"
          style={visuallyHiddenStyles}
          {...props}
        >
          {children}
        </Component>
      </>
    )
  }

  return (
    <Component style={visuallyHiddenStyles} {...props}>
      {children}
    </Component>
  )
}

/**
 * Utility component for live region announcements
 * Content will be announced by screen readers when it changes
 */
interface LiveRegionProps {
  children: ReactNode
  /** Politeness level: 'polite' waits for idle, 'assertive' interrupts */
  politeness?: 'polite' | 'assertive'
  /** Whether changes should be announced atomically */
  atomic?: boolean
  /** ID for the live region */
  id?: string
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  id
}: LiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      style={visuallyHiddenStyles}
    >
      {children}
    </div>
  )
}

/**
 * Hook-friendly utility for adding screen reader text inline
 */
export function srOnly(text: string): React.ReactElement {
  return <VisuallyHidden>{text}</VisuallyHidden>
}
