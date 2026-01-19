'use client'

/**
 * StatCardCarousel.tsx
 *
 * A compact carousel that fits in the stat card grid.
 * Auto-rotates through items with the same visual style as StatCard.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface StatCarouselItem {
  id: string
  icon: React.ReactNode
  label: string
  value: string
  hint: string
  onClick?: () => void
}

interface StatCardCarouselProps {
  items: StatCarouselItem[]
  /** Auto-rotate interval in ms (0 to disable) */
  autoRotateInterval?: number
  /** Accent styling (gold highlight) */
  accent?: boolean
  /** Show navigation dots */
  showDots?: boolean
}

export function StatCardCarousel({
  items,
  autoRotateInterval = 4000,
  accent = false,
  showDots = true
}: StatCardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  // Auto-rotate
  useEffect(() => {
    if (autoRotateInterval <= 0 || isPaused || items.length <= 1) return

    const interval = setInterval(goToNext, autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotateInterval, isPaused, goToNext, items.length])

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div
      className={cn(
        'relative rounded-2xl md:rounded-3xl border p-3 md:p-4 transition-all duration-200 overflow-hidden group',
        accent
          ? 'border-primary/30 bg-primary/5 shadow-[0_4px_24px_hsl(var(--primary)/0.08)]'
          : 'border-border bg-card/60'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation arrows - visible on hover */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev() }}
            className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-background"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext() }}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-background"
            aria-label="Next"
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        </>
      )}

      {/* Card content */}
      <div
        className={cn('cursor-pointer', currentItem.onClick && 'hover:opacity-80')}
        onClick={currentItem.onClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-lg md:rounded-xl border',
                  accent
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground'
                )}
              >
                {currentItem.icon}
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">{currentItem.hint}</span>
            </div>
            <div
              className={cn(
                'mt-2 md:mt-3 text-xl md:text-2xl font-black tracking-tight',
                accent ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'
              )}
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              {currentItem.value}
            </div>
            <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-semibold text-muted-foreground">
              {currentItem.label}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators - visible on hover */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index) }}
              className={cn(
                'w-1 h-1 rounded-full transition-all duration-200',
                index === currentIndex
                  ? accent ? 'bg-amber-600 dark:bg-amber-400 w-2' : 'bg-foreground w-2'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default StatCardCarousel
