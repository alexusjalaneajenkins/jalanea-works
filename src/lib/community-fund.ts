/**
 * Community Fund Library
 *
 * Manages the Valencia College Community Fund transparency data.
 * 10% of all subscriptions support student emergency assistance,
 * textbooks, and career resources.
 */

// Types
export interface FundContribution {
  id: string
  userId: string
  amount: number
  source: 'subscription' | 'subscription_renewal' | 'donation' | 'one_time'
  subscriptionTier?: string
  stripePaymentId?: string
  createdAt: Date
}

export interface FundAllocation {
  id: string
  category: 'emergency' | 'textbooks' | 'career' | 'technology' | 'transportation' | 'other'
  amount: number
  description: string
  recipientCount: number
  allocatedAt: Date
  semester: string
  approvedBy?: string
}

export interface FundStats {
  totalRaised: number
  totalAllocated: number
  currentBalance: number
  contributorsCount: number
  studentsHelped: number
  averageGrant: number
}

export interface FundCategory {
  id: string
  name: string
  icon: string
  description: string
  color: string
  percentage: number
}

// Fund allocation categories
export const FUND_CATEGORIES: FundCategory[] = [
  {
    id: 'emergency',
    name: 'Emergency Assistance',
    icon: '🆘',
    description: 'Helping students facing unexpected financial hardships like medical bills, car repairs, or housing emergencies',
    color: 'red',
    percentage: 40
  },
  {
    id: 'textbooks',
    name: 'Textbooks & Materials',
    icon: '📚',
    description: 'Covering the cost of required textbooks, software, and course materials',
    color: 'blue',
    percentage: 25
  },
  {
    id: 'career',
    name: 'Career Resources',
    icon: '💼',
    description: 'Professional attire, certification exam fees, and career development workshops',
    color: 'purple',
    percentage: 15
  },
  {
    id: 'technology',
    name: 'Technology Access',
    icon: '💻',
    description: 'Laptops, software licenses, and internet access for students in need',
    color: 'green',
    percentage: 10
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚌',
    description: 'LYNX bus passes and gas cards to help students get to class and work',
    color: 'amber',
    percentage: 10
  }
]

// Impact stories (anonymized)
export interface ImpactStory {
  id: string
  category: string
  quote: string
  program: string
  semester: string
  amount: number
}

export const IMPACT_STORIES: ImpactStory[] = [
  {
    id: '1',
    category: 'emergency',
    quote: 'When my car broke down, I thought I\'d have to drop out. The emergency fund helped me get it fixed so I could keep going to class and my internship.',
    program: 'Business Administration',
    semester: 'Fall 2024',
    amount: 450
  },
  {
    id: '2',
    category: 'textbooks',
    quote: 'I couldn\'t afford my nursing textbooks, which cost over $500. This fund made it possible for me to have the materials I needed to succeed.',
    program: 'Nursing',
    semester: 'Fall 2024',
    amount: 525
  },
  {
    id: '3',
    category: 'career',
    quote: 'Thanks to the career fund, I was able to buy professional clothes for my first real interview. I got the job!',
    program: 'Hospitality Management',
    semester: 'Spring 2024',
    amount: 200
  },
  {
    id: '4',
    category: 'technology',
    quote: 'My laptop died right before finals. The technology fund helped me get a refurbished one so I could finish my projects.',
    program: 'Computer Science',
    semester: 'Fall 2024',
    amount: 350
  },
  {
    id: '5',
    category: 'transportation',
    quote: 'A semester bus pass changed everything. I no longer have to choose between gas money and groceries.',
    program: 'Early Childhood Education',
    semester: 'Fall 2024',
    amount: 150
  },
  {
    id: '6',
    category: 'emergency',
    quote: 'When I lost my housing, this fund helped me with a deposit for a new place. I\'m so grateful I didn\'t have to drop out.',
    program: 'Social Work',
    semester: 'Spring 2024',
    amount: 600
  }
]

// Milestones
export interface FundMilestone {
  amount: number
  title: string
  description: string
  achieved: boolean
  achievedAt?: Date
}

export const FUND_MILESTONES: FundMilestone[] = [
  {
    amount: 1000,
    title: 'First Thousand',
    description: 'Raised our first $1,000 for Valencia students',
    achieved: true,
    achievedAt: new Date('2024-09-15')
  },
  {
    amount: 5000,
    title: 'Making an Impact',
    description: 'Helped 20+ students with essential resources',
    achieved: true,
    achievedAt: new Date('2024-11-01')
  },
  {
    amount: 10000,
    title: 'Ten Thousand Strong',
    description: 'A community of support reaching $10,000',
    achieved: false
  },
  {
    amount: 25000,
    title: 'Quarter Champion',
    description: 'Supporting a full semester of student needs',
    achieved: false
  },
  {
    amount: 50000,
    title: 'Halfway Hero',
    description: 'Creating lasting change in students\' lives',
    achieved: false
  },
  {
    amount: 100000,
    title: 'Century Club',
    description: '$100,000 invested in Valencia students\' futures',
    achieved: false
  }
]

/**
 * Calculate user's total contribution
 */
export function calculateUserContribution(
  subscriptionTier: string,
  monthsSubscribed: number
): number {
  const monthlyContributions: Record<string, number> = {
    essential: 1.50,
    starter: 2.50,
    premium: 7.50,
    unlimited: 15.00
  }

  return (monthlyContributions[subscriptionTier] || 0) * monthsSubscribed
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get progress to next milestone
 */
export function getNextMilestone(totalRaised: number): {
  current: FundMilestone | null
  next: FundMilestone | null
  progress: number
} {
  const achieved = FUND_MILESTONES.filter(m => totalRaised >= m.amount)
  const remaining = FUND_MILESTONES.filter(m => totalRaised < m.amount)

  const current = achieved[achieved.length - 1] || null
  const next = remaining[0] || null

  let progress = 100
  if (next) {
    const prevAmount = current?.amount || 0
    progress = ((totalRaised - prevAmount) / (next.amount - prevAmount)) * 100
  }

  return { current, next, progress }
}

/**
 * Get category stats from allocations
 */
export function getCategoryStats(
  allocations: FundAllocation[]
): Record<string, { total: number; count: number; students: number }> {
  const stats: Record<string, { total: number; count: number; students: number }> = {}

  FUND_CATEGORIES.forEach(cat => {
    stats[cat.id] = { total: 0, count: 0, students: 0 }
  })

  allocations.forEach(alloc => {
    if (stats[alloc.category]) {
      stats[alloc.category].total += alloc.amount
      stats[alloc.category].count += 1
      stats[alloc.category].students += alloc.recipientCount
    }
  })

  return stats
}

/**
 * Generate transparency report data
 */
export function generateTransparencyReport(
  contributions: FundContribution[],
  allocations: FundAllocation[]
): {
  period: string
  totalContributions: number
  totalAllocations: number
  categoryBreakdown: Array<{
    category: FundCategory
    allocated: number
    percentage: number
    studentsHelped: number
  }>
  topContributionSources: Array<{
    source: string
    amount: number
    percentage: number
  }>
} {
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalAllocations = allocations.reduce((sum, a) => sum + a.amount, 0)

  // Category breakdown
  const categoryStats = getCategoryStats(allocations)
  const categoryBreakdown = FUND_CATEGORIES.map(cat => ({
    category: cat,
    allocated: categoryStats[cat.id]?.total || 0,
    percentage: totalAllocations > 0
      ? (categoryStats[cat.id]?.total || 0) / totalAllocations * 100
      : 0,
    studentsHelped: categoryStats[cat.id]?.students || 0
  }))

  // Contribution sources
  const sourceAmounts: Record<string, number> = {}
  contributions.forEach(c => {
    const source = c.source === 'subscription_renewal' ? 'subscription' : c.source
    sourceAmounts[source] = (sourceAmounts[source] || 0) + c.amount
  })

  const topContributionSources = Object.entries(sourceAmounts)
    .map(([source, amount]) => ({
      source: source === 'subscription' ? 'Subscriptions' :
              source === 'donation' ? 'Direct Donations' :
              source === 'one_time' ? 'One-Time Gifts' : source,
      amount,
      percentage: totalContributions > 0 ? (amount / totalContributions) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)

  return {
    period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    totalContributions,
    totalAllocations,
    categoryBreakdown,
    topContributionSources
  }
}

export default {
  FUND_CATEGORIES,
  IMPACT_STORIES,
  FUND_MILESTONES,
  calculateUserContribution,
  formatCurrency,
  getNextMilestone,
  getCategoryStats,
  generateTransparencyReport
}
