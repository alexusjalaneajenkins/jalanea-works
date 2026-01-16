'use client'

/**
 * LynxBadge - Shows LYNX transit accessibility info
 */

import { Bus } from 'lucide-react'

interface LynxBadgeProps {
  transitMinutes: number
  routeNumbers?: string[]
  size?: 'sm' | 'md'
}

export function LynxBadge({
  transitMinutes,
  routeNumbers,
  size = 'sm'
}: LynxBadgeProps) {
  const isGoodCommute = transitMinutes <= 30
  const isMediumCommute = transitMinutes > 30 && transitMinutes <= 45

  const colorClass = isGoodCommute
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : isMediumCommute
    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    : 'bg-orange-500/10 text-orange-400 border-orange-500/20'

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClass}`}>
      <Bus size={iconSize} />
      <span className="font-medium">{transitMinutes} min</span>
      {routeNumbers && routeNumbers.length > 0 && (
        <span className="opacity-70">
          • {routeNumbers.slice(0, 2).join(', ')}
        </span>
      )}
    </span>
  )
}

export default LynxBadge
