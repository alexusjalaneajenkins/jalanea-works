'use client'

/**
 * ValenciaBadge - Shows Valencia College degree match
 */

import { GraduationCap, Check } from 'lucide-react'

interface ValenciaBadgeProps {
  matchPercentage?: number
  programName?: string
  size?: 'sm' | 'md'
}

export function ValenciaBadge({
  matchPercentage,
  programName,
  size = 'sm'
}: ValenciaBadgeProps) {
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span
      className={`inline-flex items-center rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20 ${sizeClass}`}
      title={programName ? `Matches your ${programName} degree` : 'Matches your Valencia degree'}
    >
      <GraduationCap size={iconSize} />
      {matchPercentage !== undefined ? (
        <span className="font-medium">{matchPercentage}% match</span>
      ) : (
        <>
          <span className="font-medium">Valencia</span>
          <Check size={iconSize - 2} />
        </>
      )}
    </span>
  )
}

export default ValenciaBadge
