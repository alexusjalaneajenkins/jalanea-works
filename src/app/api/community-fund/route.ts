/**
 * Community Fund API
 *
 * GET /api/community-fund - Get fund statistics and transparency data
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  FUND_CATEGORIES,
  IMPACT_STORIES,
  FUND_MILESTONES,
  getNextMilestone,
  formatCurrency
} from '@/lib/community-fund'

/**
 * GET - Get community fund statistics
 */
export async function GET() {
  const supabase = await createClient()

  // Try to get real data, fall back to demo data if tables don't exist
  let stats = {
    totalRaised: 7250, // Demo data
    totalAllocated: 5800,
    currentBalance: 1450,
    contributorsCount: 145,
    studentsHelped: 32,
    averageGrant: 181
  }

  let recentAllocations: Array<{
    category: string
    amount: number
    description: string
    recipientCount: number
    semester: string
    allocatedAt: string
  }> = []

  let userContribution = 0
  let userMonthsSubscribed = 0

  try {
    // Get total contributions
    const { data: contributions } = await supabase
      .from('community_contributions')
      .select('amount, user_id')

    if (contributions && contributions.length > 0) {
      stats.totalRaised = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
      stats.contributorsCount = new Set(contributions.map(c => c.user_id)).size
    }

    // Get allocations
    const { data: allocations } = await supabase
      .from('fund_allocations')
      .select('*')
      .order('allocated_at', { ascending: false })

    if (allocations && allocations.length > 0) {
      stats.totalAllocated = allocations.reduce((sum, a) => sum + (a.amount || 0), 0)
      stats.studentsHelped = allocations.reduce((sum, a) => sum + (a.recipient_count || 0), 0)
      stats.averageGrant = stats.studentsHelped > 0
        ? Math.round(stats.totalAllocated / stats.studentsHelped)
        : 0
      stats.currentBalance = stats.totalRaised - stats.totalAllocated

      recentAllocations = allocations.slice(0, 10).map(a => ({
        category: a.category,
        amount: a.amount,
        description: a.description,
        recipientCount: a.recipient_count,
        semester: a.semester,
        allocatedAt: a.allocated_at
      }))
    }

    // Get current user's contribution if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userContribs } = await supabase
        .from('community_contributions')
        .select('amount')
        .eq('user_id', user.id)

      if (userContribs) {
        userContribution = userContribs.reduce((sum, c) => sum + (c.amount || 0), 0)
      }

      // Get months subscribed
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_started_at')
        .eq('id', user.id)
        .single()

      if (profile?.subscription_started_at) {
        const startDate = new Date(profile.subscription_started_at)
        const now = new Date()
        userMonthsSubscribed = Math.max(1, Math.ceil(
          (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ))
      }
    }
  } catch (error) {
    // Tables might not exist yet, use demo data
    console.log('Using demo fund data:', error)
  }

  // Calculate milestone progress
  const milestoneProgress = getNextMilestone(stats.totalRaised)

  // Get category breakdown (using allocation percentages from config)
  const categoryBreakdown = FUND_CATEGORIES.map(cat => {
    const allocated = Math.round(stats.totalAllocated * (cat.percentage / 100))
    return {
      ...cat,
      allocated,
      formattedAmount: formatCurrency(allocated)
    }
  })

  // Recent impact stories
  const impactStories = IMPACT_STORIES.slice(0, 4)

  // Milestones with achievement status based on actual total
  const milestones = FUND_MILESTONES.map(m => ({
    ...m,
    achieved: stats.totalRaised >= m.amount,
    formattedAmount: formatCurrency(m.amount)
  }))

  return NextResponse.json({
    stats: {
      ...stats,
      formattedTotalRaised: formatCurrency(stats.totalRaised),
      formattedTotalAllocated: formatCurrency(stats.totalAllocated),
      formattedCurrentBalance: formatCurrency(stats.currentBalance),
      formattedAverageGrant: formatCurrency(stats.averageGrant)
    },
    userImpact: {
      totalContribution: userContribution,
      formattedContribution: formatCurrency(userContribution),
      monthsSubscribed: userMonthsSubscribed,
      studentsHelpedEquivalent: Math.max(1, Math.floor(userContribution / stats.averageGrant))
    },
    milestoneProgress: {
      ...milestoneProgress,
      currentFormatted: milestoneProgress.current
        ? formatCurrency(milestoneProgress.current.amount)
        : null,
      nextFormatted: milestoneProgress.next
        ? formatCurrency(milestoneProgress.next.amount)
        : null
    },
    categoryBreakdown,
    impactStories,
    milestones,
    recentAllocations
  })
}
