'use client'

/**
 * SegmentedControl.tsx
 *
 * A modern segmented control with sliding pill indicator.
 * Inspired by iOS/macOS design patterns.
 *
 * Features:
 * - Smooth animated sliding indicator
 * - Touch-friendly 44px minimum targets
 * - Full keyboard accessibility
 * - Theme-aware colors
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  /** Optional color class for the active indicator (e.g., 'bg-rose-500') */
  activeColor?: string
  /** Optional text color class when active (e.g., 'text-rose-600') */
  activeTextColor?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  /** Size variant */
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    if (!containerRef.current) return

    const activeIndex = options.findIndex((opt) => opt.value === value)
    if (activeIndex === -1) return

    const buttons = containerRef.current.querySelectorAll('button')
    const activeButton = buttons[activeIndex]

    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      })
    }
  }, [options, value])

  // Update indicator position on mount and value change
  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  // Update on resize
  useEffect(() => {
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateIndicator])

  const sizeClasses = {
    sm: 'h-9 text-xs',
    md: 'h-11 text-sm',
  }

  const paddingClasses = {
    sm: 'px-3',
    md: 'px-4',
  }

  // Get the active option for its color settings
  const activeOption = options.find((opt) => opt.value === value)
  const indicatorColorClass = activeOption?.activeColor || 'bg-card'
  const hasCustomColor = !!activeOption?.activeColor

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center rounded-full border border-border/50 bg-muted/30 p-1',
        sizeClasses[size],
        className
      )}
      role="tablist"
    >
      {/* Sliding indicator - stronger shadow for better contrast */}
      <motion.div
        className={cn(
          'absolute top-1 bottom-1 rounded-full shadow-md',
          hasCustomColor ? indicatorColorClass : 'bg-background border border-border/50'
        )}
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
      />

      {/* Options */}
      {options.map((option) => {
        const isActive = option.value === value
        const activeTextClass = option.activeTextColor || 'text-foreground'
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 rounded-full transition-colors duration-200 min-w-[44px]',
              paddingClasses[size],
              isActive
                ? option.activeColor
                  ? 'text-white font-semibold'
                  : cn(activeTextClass, 'font-semibold')
                : 'font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
