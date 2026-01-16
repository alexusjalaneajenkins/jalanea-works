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

// Monthly limits per tier
const TIER_LIMITS: Record<string, number> = {
  essential: 999999,   // Unlimited
  starter: 999999,     // Unlimited
  premium: 5,          // 5 Tier 3 pockets per month
  unlimited: 10        // 10 Tier 3+ pockets per month
}

// Tier names for display
const TIER_NAMES: Record<string, string> = {
  essential: 'Essential (Tier 1)',
  starter: 'Starter (Tier 2)',
  premium: 'Premium (Tier 3)',
  unlimited: 'Unlimited (Tier 3+)'
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
      essential: 0,
      starter: 0,
      premium: 0,
      unlimited: 0
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
 * Get tier level for comparison
 */
function getTierLevel(tier: string): number {
  const levels: Record<string, number> = {
    essential: 1,
    starter: 2,
    premium: 3,
    unlimited: 4
  }
  return levels[tier] || 1
}

/**
 * Get limit description for tier
 */
function getLimitDescription(tier: string): string {
  switch (tier) {
    case 'unlimited':
      return '10 Deep Research (Tier 3+) pockets per month, plus unlimited Tier 1 & 2 pockets'
    case 'premium':
      return '5 comprehensive (Tier 3) pockets per month, plus unlimited Tier 1 & 2 pockets'
    case 'starter':
      return 'Unlimited Tier 2 (90-second breakdown) pockets, plus unlimited Tier 1 pockets'
    case 'essential':
    default:
      return 'Unlimited Tier 1 (20-second quick brief) pockets'
  }
}

/**
 * Get upgrade message for tier
 */
function getUpgradeMessage(tier: string): string | null {
  switch (tier) {
    case 'essential':
      return 'Upgrade to Starter ($25/mo) for detailed 90-second breakdowns'
    case 'starter':
      return 'Upgrade to Premium ($75/mo) for comprehensive 8-page reports'
    case 'premium':
      return 'Upgrade to Unlimited ($150/mo) for 12-page Deep Research reports'
    case 'unlimited':
    default:
      return null
  }
}
