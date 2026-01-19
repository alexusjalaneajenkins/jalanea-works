/**
 * useHiringIntel.ts
 *
 * Hook to get hiring intel cards based on current date.
 * Handles the seasonal logic and returns relevant cards.
 */

import { useMemo } from 'react'
import { getTopCards, type HiringIntelCard } from './hiringIntelData'

interface UseHiringIntelOptions {
  /** Maximum number of cards to return */
  maxCards?: number
  /** Override date for testing different months */
  testDate?: Date
}

interface UseHiringIntelResult {
  /** Cards relevant to the current date */
  cards: HiringIntelCard[]
  /** Current month name */
  currentMonth: string
  /** Whether we're in a "hot" hiring period */
  isHotPeriod: boolean
  /** Last updated timestamp */
  lastUpdated: Date
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function useHiringIntel(options: UseHiringIntelOptions = {}): UseHiringIntelResult {
  const { maxCards = 4, testDate } = options

  return useMemo(() => {
    const date = testDate || new Date()
    const cards = getTopCards(maxCards, date)
    const monthIndex = date.getMonth()

    // Determine if we're in a "hot" hiring period
    // Hot periods: Jan-Apr (tax), Feb-May (home improvement), Jul-Aug (BTS), Sep-Nov (holiday)
    const hotMonths = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]
    const isHotPeriod = hotMonths.includes(monthIndex + 1)

    return {
      cards,
      currentMonth: monthNames[monthIndex],
      isHotPeriod,
      lastUpdated: date
    }
  }, [maxCards, testDate])
}

export default useHiringIntel
