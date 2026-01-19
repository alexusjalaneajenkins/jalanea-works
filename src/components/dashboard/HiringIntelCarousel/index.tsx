'use client'

/**
 * HiringIntelCarousel
 *
 * Dashboard widget showing seasonal hiring intelligence.
 * Displays cards based on current date with navigation controls.
 *
 * Responsive:
 * - Mobile: 1 card visible, swipe/arrows to navigate
 * - Tablet: 2 cards visible
 * - Desktop: 3 cards visible
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useHiringIntel } from './useHiringIntel'
import { HiringIntelCard } from './HiringIntelCard'

interface HiringIntelCarouselProps {
  /** Override date for testing different months */
  testDate?: Date
  /** Callback when coach should open with a prompt */
  onCoachOpen?: (prompt: string) => void
  /** Auto-rotate interval in ms (0 to disable) */
  autoRotateInterval?: number
}

export function HiringIntelCarousel({
  testDate,
  onCoachOpen,
  autoRotateInterval = 0 // Disabled by default
}: HiringIntelCarouselProps) {
  const { cards, currentMonth, isHotPeriod } = useHiringIntel({
    maxCards: 5,
    testDate
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  // Show toast and auto-dismiss
  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Determine visible count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3) // Desktop: 3 cards
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2) // Tablet: 2 cards
      } else {
        setVisibleCount(1) // Mobile: 1 card
      }
    }

    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  // Calculate max index based on visible count
  const maxIndex = Math.max(0, cards.length - visibleCount)

  // Navigation handlers
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }, [maxIndex])

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(Math.min(index, maxIndex))
  }, [maxIndex])

  // Auto-rotate
  useEffect(() => {
    if (autoRotateInterval <= 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= maxIndex) return 0
        return prev + 1
      })
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [autoRotateInterval, maxIndex])

  // Don't render if no cards
  if (cards.length === 0) return null

  // Calculate which cards are visible
  const visibleCards = cards.slice(currentIndex, currentIndex + visibleCount)

  // Dot indicators
  const dotCount = Math.ceil(cards.length / visibleCount)
  const activeDot = Math.floor(currentIndex / visibleCount)

  return (
    <div className="w-full relative">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg">
              <Bell className="w-4 h-4" />
              <span>{toast}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-1 p-0.5 hover:bg-white/20 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container */}
      <div className="rounded-2xl md:rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Hiring Intel
            </span>
            <span className="text-xs text-muted-foreground">
              {currentMonth}
            </span>
            {isHotPeriod && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                Hot Period
              </span>
            )}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                currentIndex === 0
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              aria-label="Previous cards"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                currentIndex >= maxIndex
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              aria-label="Next cards"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards container */}
        <div className="p-4 sm:p-5 md:p-6">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'grid gap-4',
                  visibleCount === 1 && 'grid-cols-1',
                  visibleCount === 2 && 'grid-cols-2',
                  visibleCount === 3 && 'grid-cols-3'
                )}
              >
                {visibleCards.map((card) => (
                  <HiringIntelCard
                    key={card.id}
                    card={card}
                    onCoachOpen={onCoachOpen}
                    onReminderSet={() => showToast('Reminder set! We\'ll nudge you when it\'s time.')}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators - only show if more than one "page" */}
          {dotCount > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: dotCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index * visibleCount)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    index === activeDot
                      ? 'bg-primary w-4'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HiringIntelCarousel
