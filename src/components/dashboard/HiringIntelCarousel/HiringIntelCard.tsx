'use client'

/**
 * HiringIntelCard.tsx
 *
 * Individual card component for the Hiring Intel carousel.
 * Displays seasonal hiring information with actionable CTAs.
 */

import { useRouter } from 'next/navigation'
import {
  Flame,
  Calendar,
  AlertTriangle,
  Phone,
  Rocket,
  Clock,
  TrendingDown,
  Zap,
  Snowflake,
  Dumbbell,
  Ghost,
  Lightbulb,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  type HiringIntelCard as CardData,
  cardTypeColors,
  cardTypeLabels
} from './hiringIntelData'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Flame,
  Calendar,
  AlertTriangle,
  Phone,
  Rocket,
  Clock,
  TrendingDown,
  Zap,
  Snowflake,
  Dumbbell,
  Ghost,
  Lightbulb
}

interface HiringIntelCardProps {
  card: CardData
  onCoachOpen?: (prompt: string) => void
  onReminderSet?: () => void
}

export function HiringIntelCard({ card, onCoachOpen, onReminderSet }: HiringIntelCardProps) {
  const router = useRouter()
  const colors = cardTypeColors[card.type]
  const typeLabel = cardTypeLabels[card.type]
  const Icon = iconMap[card.icon] || Lightbulb

  const handleCTAClick = () => {
    switch (card.cta.action) {
      case 'search':
        // Navigate to job search with query
        if (card.cta.payload) {
          router.push(`/dashboard/jobs?q=${encodeURIComponent(card.cta.payload)}`)
        }
        break
      case 'link':
        // Navigate to internal link
        if (card.cta.payload) {
          router.push(card.cta.payload)
        }
        break
      case 'coach':
        // Open coach with context
        if (onCoachOpen && card.cta.payload) {
          onCoachOpen(card.cta.payload)
        } else {
          // Fallback: navigate to coach page
          router.push('/dashboard/coach')
        }
        break
      case 'reminder':
        if (onReminderSet) {
          onReminderSet()
        } else {
          // Fallback: navigate to calendar
          router.push('/dashboard/calendar')
        }
        break
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-2xl border bg-card/80 backdrop-blur-sm p-4 sm:p-5 transition-all duration-200',
        'hover:shadow-lg hover:border-primary/30',
        colors.border
      )}
    >
      {/* Header with icon and type badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl',
          colors.bg
        )}>
          <Icon className={cn('w-5 h-5', colors.text)} />
        </div>
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full',
          colors.bg,
          colors.text
        )}>
          {typeLabel}
        </span>
      </div>

      {/* Title and subtitle */}
      <h3 className="text-base font-bold text-foreground mb-1 line-clamp-2">
        {card.title}
      </h3>
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {card.subtitle}
      </p>

      {/* Description */}
      <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">
        {card.description}
      </p>

      {/* CTA Button */}
      <button
        onClick={handleCTAClick}
        className={cn(
          'w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
          'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/50'
        )}
      >
        {card.cta.label}
      </button>
    </div>
  )
}

export default HiringIntelCard
