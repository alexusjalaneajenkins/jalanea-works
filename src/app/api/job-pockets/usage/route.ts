/**
 * Job Pockets Usage API
 *
 * GET /api/job-pockets/usage
 *   Get current month's pocket usage stats for the authenticated user
 *
 * Response includes:
 *   - currentTier: User's subscription tier
 *   - periodStart: Start of current billing period
 *   - periodEnd: End of current billing period
 *   - usage: Usage counts per tier
 *   - totalPocketsGenerated: Total pockets ever generated
 *   - totalTokensUsed: Total tokens consumed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Regular pocket limits per tier (Advanced/Professional tracked separately)
const TIER_LIMITS: Record<string, number> = {
  free: 5,             // 5 regular pockets
  essential: 30,       // 30 regular pockets
  starter: 100,        // 100 regular pockets
  premium: -1,         // Unlimited (legacy)
  professional: -1,    // Unlimited regular pockets
  unlimited: -1,       // Unlimited (legacy)
  max: -1              // Unlimited regular pockets
}

// Tier names for display (Updated January 2026)
const TIER_NAMES: Record<string, string> = {
  free: 'Free Trial',
  essential: 'Essential',
  starter: 'Starter',
  premium: 'Professional (legacy)',
  professional: 'Professional',
  unlimited: 'Max (legacy)',
  max: 'Max'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's current tier
    let userTier = 'essential'

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier) {
      userTier = profile.subscription_tier
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()
      if (userData?.tier) {
        userTier = userData.tier
      }
    }

    // Calculate billing period (first to last of month)
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const periodEnd = new Date(periodStart)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    periodEnd.setDate(0) // Last day of current month
    periodEnd.setHours(23, 59, 59, 999)

    // Get current period usage
    const { data: usageData } = await supabase
      .from('pocket_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString().split('T')[0])

    // Get lifetime stats
    const { data: pocketStats } = await supabase
      .from('job_pockets')
      .select('tier, tokens_used')
      .eq('user_id', user.id)

    // Calculate totals
    let totalPocketsGenerated = 0
    let totalTokensUsed = 0
    const pocketsByTier: Record<string, number> = {
      free: 0,
      essential: 0,
      starter: 0,
      premium: 0,         // legacy
      professional: 0,
      unlimited: 0,       // legacy
      max: 0
    }

    if (pocketStats) {
      for (const pocket of pocketStats) {
        totalPocketsGenerated++
        totalTokensUsed += pocket.tokens_used || 0
        if (pocket.tier && pocketsByTier[pocket.tier] !== undefined) {
          pocketsByTier[pocket.tier]++
        }
      }
    }

    // Build current period usage by tier
    const currentUsage: Record<string, {
      used: number
      limit: number
      remaining: number
      isUnlimited: boolean
    }> = {}

    for (const tier of Object.keys(TIER_LIMITS)) {
      const tierUsage = usageData?.find(u => u.tier === tier)
      const limit = TIER_LIMITS[tier]
      const used = tierUsage?.pockets_generated || 0

      currentUsage[tier] = {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isUnlimited: limit === 999999
      }
    }

    // Calculate days remaining in period
    const now = new Date()
    const daysRemaining = Math.ceil(
      (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get user's available tier limits
    const userTierLevel = getTierLevel(userTier)
    const availableTiers = Object.keys(TIER_LIMITS).filter(
      tier => getTierLevel(tier) <= userTierLevel
    )

    return NextResponse.json({
      currentTier: userTier,
      tierName: TIER_NAMES[userTier] || userTier,

      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
        daysRemaining
      },

      usage: currentUsage,

      availableTiers: availableTiers.map(tier => ({
        tier,
        name: TIER_NAMES[tier],
        current: currentUsage[tier]
      })),

      lifetime: {
        totalPocketsGenerated,
        totalTokensUsed,
        byTier: pocketsByTier
      },

      limits: {
        description: getLimitDescription(userTier),
        upgradeMessage: getUpgradeMessage(userTier)
      }
    })
  } catch (error) {
    console.error('Error fetching pocket usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get tier level for comparison (Updated January 2026)
 */
function getTierLevel(tier: string): number {
  const levels: Record<string, number> = {
    free: 0,
    essential: 1,
    starter: 2,
    premium: 3,        // legacy - maps to professional
    professional: 3,
    unlimited: 4,      // legacy - maps to max
    max: 4
  }
  return levels[tier] || 0
}

/**
 * Get limit description for tier (Updated January 2026)
 */
function getLimitDescription(tier: string): string {
  switch (tier) {
    case 'max':
    case 'unlimited':
      return '10 Advanced or Professional pockets per month (shared pool), plus unlimited regular pockets'
    case 'professional':
    case 'premium':
      return '5 Advanced or Professional pockets per month (shared pool), plus unlimited regular pockets'
    case 'starter':
      return '100 regular pockets + 1 Advanced pocket per month'
    case 'essential':
      return '30 regular (20-second quick brief) pockets per month'
    case 'free':
    default:
      return '5 regular (20-second quick brief) pockets'
  }
}

/**
 * Get upgrade message for tier (Updated January 2026)
 */
function getUpgradeMessage(tier: string): string | null {
  switch (tier) {
    case 'free':
      return 'Upgrade to Essential ($15/mo) for 30 regular pockets'
    case 'essential':
      return 'Upgrade to Starter ($25/mo) for 100 regular pockets + 1 Advanced pocket'
    case 'starter':
      return 'Upgrade to Professional ($50/mo) for unlimited regular + 5 Advanced/Professional pockets'
    case 'professional':
    case 'premium':
      return 'Upgrade to Max ($100/mo) for 10 Advanced/Professional pockets + Success Coach'
    case 'max':
    case 'unlimited':
    default:
      return null
  }
}
