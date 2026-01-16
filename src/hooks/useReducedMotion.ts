'use client'

/**
 * useReducedMotion Hook
 *
 * Detects user's reduced motion preference and provides utilities
 * for adapting animations accordingly.
 *
 * WCAG 2.1 AA compliant - respects prefers-reduced-motion media query.
 */

import { useState, useEffect, useMemo } from 'react'

/**
 * Hook to detect if user prefers reduced motion
 *
 * @returns boolean - true if user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = useReducedMotion()
 *
 * const animationProps = prefersReducedMotion
 *   ? {}
 *   : { initial: { opacity: 0 }, animate: { opacity: 1 } }
 */
export function useReducedMotion(): boolean {
  // Initialize with a function to avoid SSR issues
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Animation variants for Framer Motion that respect reduced motion
 */
export interface MotionConfig {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit?: Record<string, unknown>
  transition?: Record<string, unknown>
}

/**
 * Hook that returns animation config based on motion preference
 *
 * @param fullMotion - Animation config for users who accept motion
 * @param reducedMotion - Optional simplified config for reduced motion (defaults to empty)
 * @returns Animation config appropriate for user's preference
 *
 * @example
 * const fadeIn = useMotionConfig(
 *   { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
 *   { initial: { opacity: 0 }, animate: { opacity: 1 } }
 * )
 */
export function useMotionConfig(
  fullMotion: MotionConfig,
  reducedMotion: MotionConfig = { initial: {}, animate: {} }
): MotionConfig {
  const prefersReducedMotion = useReducedMotion()

  return useMemo(() => {
    return prefersReducedMotion ? reducedMotion : fullMotion
  }, [prefersReducedMotion, fullMotion, reducedMotion])
}

/**
 * Common animation presets that respect reduced motion
 */
export const motionPresets = {
  /**
   * Fade in animation
   */
  fadeIn: (prefersReducedMotion: boolean): MotionConfig => ({
    initial: prefersReducedMotion ? {} : { opacity: 0 },
    animate: { opacity: 1 },
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }
  }),

  /**
   * Slide up and fade in
   */
  slideUp: (prefersReducedMotion: boolean): MotionConfig => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }
  }),

  /**
   * Scale up and fade in
   */
  scaleIn: (prefersReducedMotion: boolean): MotionConfig => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }
  }),

  /**
   * Slide from right
   */
  slideFromRight: (prefersReducedMotion: boolean): MotionConfig => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: prefersReducedMotion ? {} : { opacity: 0, x: -20 },
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }
  }),

  /**
   * Stagger children animation
   */
  staggerContainer: (prefersReducedMotion: boolean) => ({
    animate: {
      transition: prefersReducedMotion
        ? {}
        : { staggerChildren: 0.1 }
    }
  }),

  /**
   * Item for staggered list
   */
  staggerItem: (prefersReducedMotion: boolean): MotionConfig => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }
  })
}

/**
 * Hook that provides all motion presets with reduced motion applied
 */
export function useMotionPresets() {
  const prefersReducedMotion = useReducedMotion()

  return useMemo(() => ({
    fadeIn: motionPresets.fadeIn(prefersReducedMotion),
    slideUp: motionPresets.slideUp(prefersReducedMotion),
    scaleIn: motionPresets.scaleIn(prefersReducedMotion),
    slideFromRight: motionPresets.slideFromRight(prefersReducedMotion),
    staggerContainer: motionPresets.staggerContainer(prefersReducedMotion),
    staggerItem: motionPresets.staggerItem(prefersReducedMotion),
    prefersReducedMotion
  }), [prefersReducedMotion])
}

export default useReducedMotion
