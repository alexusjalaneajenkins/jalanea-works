/**
 * Pocket Credits Remaining API
 *
 * GET /api/pocket-credits/remaining
 *   Get remaining pocket credits for the authenticated user
 *
 * Response includes:
 *   - subscription: User's current tier and status
 *   - credits: Available credits by pocket type
 *   - canPurchase: Whether user can buy à la carte pockets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTierConfig,
  getPocketCredits,
  canAccessPocketType,
  type SubscriptionTier,
  type PocketType,
  POCKET_PRICES
} from '@/lib/stripe'

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

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    const userTier = (profile?.subscription_tier || 'free') as SubscriptionTier
    const tierConfig = getTierConfig(userTier)
    const pocketCredits = getPocketCredits(userTier)

    // Calculate current month date range
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthKey = monthStart.toISOString().split('T')[0] // YYYY-MM-DD

    // Get or initialize pocket credits for current month
    let { data: credits } = await supabase
      .from('pocket_credits')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', monthKey)
      .single()

    // If no credits record exists for this month, it means user hasn't used any
    // The DB function will initialize when needed, but we return the allowance
    if (!credits) {
      credits = {
        tier: userTier,
        month: monthKey,
        advanced_allowance: pocketCredits.advancedPerMonth,
        professional_allowance: pocketCredits.professionalPerMonth,
        advanced_used: 0,
        professional_used: 0,
        advanced_purchased: 0,
        professional_purchased: 0
      }
    }

    // Calculate remaining credits
    // For Professional/Max tiers: Advanced and Professional share a pool
    const isSharedPool = ['professional', 'max'].includes(userTier)

    let advancedRemaining: number
    let professionalRemaining: number

    if (isSharedPool) {
      // Shared pool: total pool = advancedAllowance (same as professionalAllowance)
      const totalPool = credits.advanced_allowance
      const totalUsed = credits.advanced_used + credits.professional_used
      const totalPurchased = credits.advanced_purchased + credits.professional_purchased
      const poolRemaining = Math.max(0, totalPool - totalUsed) + totalPurchased

      // Both types share the same remaining count
      advancedRemaining = poolRemaining
      professionalRemaining = poolRemaining
    } else {
      // Separate pools
      advancedRemaining = Math.max(0, credits.advanced_allowance - credits.advanced_used)
        + credits.advanced_purchased
      professionalRemaining = Math.max(0, credits.professional_allowance - credits.professional_used)
        + credits.professional_purchased
    }

    // Regular pockets tracking
    const { count: regularUsedThisMonth } = await supabase
      .from('job_pockets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('pocket_type', 'regular')
      .gte('created_at', monthStart.toISOString())

    const regularLimit = pocketCredits.regularLimit
    const regularRemaining = regularLimit === -1
      ? -1 // unlimited
      : Math.max(0, regularLimit - (regularUsedThisMonth || 0))

    // Calculate days remaining in billing period
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const daysRemaining = Math.ceil(
      (nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Can user purchase à la carte?
    // Starter can buy advanced, Professional/Max can buy either
    const canPurchaseAdvanced = canAccessPocketType(userTier, 'advanced')
    const canPurchaseProfessional = canAccessPocketType(userTier, 'professional')

    return NextResponse.json({
      subscription: {
        tier: userTier,
        tierName: tierConfig?.name || userTier,
        status: profile?.subscription_status || 'none'
      },

      period: {
        month: monthKey,
        daysRemaining,
        resetsAt: nextMonth.toISOString()
      },

      credits: {
        regular: {
          used: regularUsedThisMonth || 0,
          limit: regularLimit,
          remaining: regularRemaining,
          isUnlimited: regularLimit === -1
        },
        advanced: {
          used: credits.advanced_used,
          allowance: credits.advanced_allowance,
          purchased: credits.advanced_purchased,
          remaining: advancedRemaining,
          canAccess: canAccessPocketType(userTier, 'advanced')
        },
        professional: {
          used: credits.professional_used,
          allowance: credits.professional_allowance,
          purchased: credits.professional_purchased,
          remaining: professionalRemaining,
          canAccess: canAccessPocketType(userTier, 'professional')
        },
        isSharedPool
      },

      purchase: {
        canPurchaseAdvanced,
        canPurchaseProfessional,
        prices: {
          advanced: POCKET_PRICES.advanced,
          professional: POCKET_PRICES.professional
        }
      }
    })
  } catch (error) {
    console.error('Error fetching pocket credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
