/**
 * Job Pockets List API
 *
 * GET /api/job-pockets
 *   List all pockets for the authenticated user
 *   Query params:
 *     - limit: number (default: 20)
 *     - offset: number (default: 0)
 *     - tier: 'essential' | 'starter' | 'premium' | 'unlimited' (optional)
 *     - favorites_only: boolean (default: false)
 *
 * Response includes:
 *   - pockets: Array of pocket summaries with job info
 *   - total: Total count of pockets
 *   - usage: Monthly usage stats (for Premium/Unlimited tiers)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Monthly limits per tier
const TIER_LIMITS: Record<string, number> = {
  essential: 999999,
  starter: 999999,
  premium: 5,
  unlimited: 10
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

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const tierFilter = searchParams.get('tier')
    const favoritesOnly = searchParams.get('favorites_only') === 'true'

    // Build query
    let query = supabase
      .from('job_pockets')
      .select(`
        id,
        job_id,
        tier,
        pocket_data,
        model_used,
        generation_time_ms,
        tokens_used,
        is_favorite,
        viewed_at,
        applied_after_viewing,
        created_at,
        expires_at,
        jobs (
          id,
          title,
          company,
          location_city,
          location_state,
          salary_min,
          salary_max,
          salary_period,
          valencia_friendly,
          valencia_match_score
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (tierFilter) {
      query = query.eq('tier', tierFilter)
    }

    if (favoritesOnly) {
      query = query.eq('is_favorite', true)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: pockets, count, error } = await query

    if (error) {
      console.error('Error fetching pockets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pockets' },
        { status: 500 }
      )
    }

    // Get usage stats for the user
    const usage = await getUsageStats(supabase, user.id)

    // Get user tier
    const { data: userData } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()

    const userTier = userData?.tier || 'essential'

    // Transform pockets for response
    const transformedPockets = (pockets || []).map(pocket => ({
      id: pocket.id,
      jobId: pocket.job_id,
      tier: pocket.tier,
      job: pocket.jobs ? {
        id: (pocket.jobs as any).id,
        title: (pocket.jobs as any).title,
        company: (pocket.jobs as any).company,
        location: `${(pocket.jobs as any).location_city || ''}, ${(pocket.jobs as any).location_state || 'FL'}`.trim(),
        salary: formatSalary(
          (pocket.jobs as any).salary_min,
          (pocket.jobs as any).salary_max,
          (pocket.jobs as any).salary_period
        ),
        valenciaMatch: (pocket.jobs as any).valencia_friendly,
        valenciaMatchScore: (pocket.jobs as any).valencia_match_score
      } : null,
      summary: extractPocketSummary(pocket.pocket_data, pocket.tier),
      modelUsed: pocket.model_used,
      isFavorite: pocket.is_favorite,
      viewedAt: pocket.viewed_at,
      appliedAfterViewing: pocket.applied_after_viewing,
      createdAt: pocket.created_at,
      expiresAt: pocket.expires_at,
      isExpired: pocket.expires_at ? new Date(pocket.expires_at) < new Date() : false
    }))

    return NextResponse.json({
      pockets: transformedPockets,
      total: count || 0,
      limit,
      offset,
      userTier,
      usage
    })
  } catch (error) {
    console.error('Error in job-pockets API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get usage statistics for the user
 */
async function getUsageStats(supabase: any, userId: string) {
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0)

  // Get usage for each tier
  const { data: usageData } = await supabase
    .from('pocket_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', periodStart.toISOString().split('T')[0])

  const usage: Record<string, { used: number; limit: number; remaining: number }> = {}

  // Initialize all tiers
  for (const tier of Object.keys(TIER_LIMITS)) {
    usage[tier] = {
      used: 0,
      limit: TIER_LIMITS[tier],
      remaining: TIER_LIMITS[tier]
    }
  }

  // Update with actual usage
  if (usageData) {
    for (const record of usageData) {
      if (usage[record.tier]) {
        usage[record.tier].used = record.pockets_generated
        usage[record.tier].remaining = Math.max(0, usage[record.tier].limit - record.pockets_generated)
      }
    }
  }

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    byTier: usage
  }
}

/**
 * Format salary for display
 */
function formatSalary(min?: number, max?: number, period?: string): string | null {
  if (!min && !max) return null

  const format = (amount: number) => {
    if (period === 'hourly') {
      return `$${amount}/hr`
    }
    return `$${Math.round(amount / 1000)}k`
  }

  if (min && max) {
    return `${format(min)} - ${format(max)}`
  }

  return min ? `${format(min)}+` : null
}

/**
 * Extract summary from pocket data for list display
 */
function extractPocketSummary(pocketData: any, tier: string): {
  recommendation: string
  matchStatus: string
  quickBrief: string
} {
  if (!pocketData) {
    return {
      recommendation: 'CONSIDER',
      matchStatus: 'unknown',
      quickBrief: 'Pocket data unavailable'
    }
  }

  return {
    recommendation: pocketData.recommendation || 'CONSIDER',
    matchStatus: pocketData.qualificationCheck?.status || 'unknown',
    quickBrief: pocketData.quickBrief || 'No summary available'
  }
}
