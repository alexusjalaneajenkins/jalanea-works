/**
 * Tier Limits Utility
 *
 * Fetches subscription tier limits from database with in-memory caching.
 * Limits are cached for 5 minutes to reduce database calls.
 */

import { createClient } from '@/lib/supabase/server'

export interface TierLimits {
  id: string
  name: string
  pockets: number | null
  resumes: number | null
  aiMessages: number | null
  aiSuggestions: number | null
}

// Default limits (fallback if database fetch fails)
const DEFAULT_LIMITS: Record<string, TierLimits> = {
  free: { id: 'free', name: 'Free Trial', pockets: 5, resumes: 1, aiMessages: 10, aiSuggestions: 5 },
  essential: { id: 'essential', name: 'Essential', pockets: 30, resumes: 1, aiMessages: 50, aiSuggestions: 10 },
  starter: { id: 'starter', name: 'Starter', pockets: 100, resumes: 3, aiMessages: 1000, aiSuggestions: 50 },
  professional: { id: 'professional', name: 'Professional', pockets: null, resumes: null, aiMessages: null, aiSuggestions: 200 },
  max: { id: 'max', name: 'Max', pockets: null, resumes: null, aiMessages: null, aiSuggestions: null },
  owner: { id: 'owner', name: 'Owner', pockets: null, resumes: null, aiMessages: null, aiSuggestions: null }
}

// In-memory cache
let cachedLimits: Record<string, TierLimits> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get all tier limits (cached)
 */
export async function getAllTierLimits(): Promise<Record<string, TierLimits>> {
  // Return cached if still valid
  if (cachedLimits && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedLimits
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tier_limits')
      .select('*')

    if (error || !data || data.length === 0) {
      console.warn('Failed to fetch tier limits, using defaults:', error)
      return DEFAULT_LIMITS
    }

    // Transform to lookup object
    const limits: Record<string, TierLimits> = {}
    for (const row of data) {
      limits[row.id] = {
        id: row.id,
        name: row.name,
        pockets: row.pockets,
        resumes: row.resumes,
        aiMessages: row.ai_messages,
        aiSuggestions: row.ai_suggestions
      }
    }

    // Update cache
    cachedLimits = limits
    cacheTimestamp = Date.now()

    return limits
  } catch (error) {
    console.error('Error fetching tier limits:', error)
    return DEFAULT_LIMITS
  }
}

/**
 * Get limits for a specific tier
 */
export async function getTierLimits(tierId: string): Promise<TierLimits> {
  const allLimits = await getAllTierLimits()
  return allLimits[tierId] || allLimits['starter'] || DEFAULT_LIMITS['starter']
}

/**
 * Invalidate the cache (call when limits are updated)
 */
export function invalidateTierLimitsCache(): void {
  cachedLimits = null
  cacheTimestamp = 0
}
