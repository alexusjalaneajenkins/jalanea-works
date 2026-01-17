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
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-card shadow-sm border border-border/30"
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
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 rounded-full font-semibold transition-colors duration-200 min-w-[44px]',
              paddingClasses[size],
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
