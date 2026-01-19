/**
 * hiringIntelData.ts
 *
 * Seasonal hiring intelligence data based on retail labor market research.
 * Cards are shown based on the current month to help users focus their
 * job search on active hiring windows and avoid ghost jobs.
 */

export type CardType = 'hot' | 'upcoming' | 'warning' | 'tip' | 'spotlight'
export type CTAAction = 'link' | 'coach' | 'reminder' | 'search'

export interface HiringIntelCard {
  id: string
  type: CardType
  icon: string
  title: string
  subtitle: string
  description: string
  cta: {
    label: string
    action: CTAAction
    payload?: string
  }
  activeMonths: number[] // 1-12
  priority: number // Lower = higher priority
}

/**
 * All hiring intel cards with their active months.
 * Cards are filtered and sorted based on the current date.
 */
export const hiringIntelCards: HiringIntelCard[] = [
  // ============================================
  // TAX PREP SEASON (January - April)
  // ============================================
  {
    id: 'tax-prep-hot',
    type: 'hot',
    icon: 'Flame',
    title: 'Tax Prep is Hiring NOW',
    subtitle: 'H&R Block, Jackson Hewitt, Liberty Tax',
    description: 'Tax prep companies are hiring through April 15. No experience needed - they train you. This is one of the best entry points into professional work.',
    cta: {
      label: 'Find Tax Prep Jobs',
      action: 'search',
      payload: 'tax preparer'
    },
    activeMonths: [1, 2, 3, 4],
    priority: 1
  },
  {
    id: 'tax-prep-ending',
    type: 'warning',
    icon: 'Clock',
    title: 'Tax Season Ending Soon',
    subtitle: 'Last chance for tax prep roles',
    description: 'April 15 is the deadline. Most tax prep positions end after this date. If you want in, apply this week.',
    cta: {
      label: 'Apply Now',
      action: 'search',
      payload: 'tax preparer'
    },
    activeMonths: [4],
    priority: 2
  },

  // ============================================
  // HOME IMPROVEMENT SPRING SURGE (February - June)
  // ============================================
  {
    id: 'home-improvement-upcoming',
    type: 'upcoming',
    icon: 'Calendar',
    title: 'Spring Hiring Starts Soon',
    subtitle: 'Home Depot & Lowe\'s',
    description: 'Home improvement stores begin their 80,000+ seasonal hiring push in February. Get your application ready now to be in the first batch.',
    cta: {
      label: 'Prepare Your Resume',
      action: 'link',
      payload: '/dashboard/resume'
    },
    activeMonths: [1],
    priority: 3
  },
  {
    id: 'home-improvement-hot',
    type: 'hot',
    icon: 'Flame',
    title: 'Home Improvement is Hiring',
    subtitle: 'Home Depot, Lowe\'s, Ace Hardware',
    description: 'Spring is "Black Friday" for home improvement. Garden centers, lumber yards, and stores are actively interviewing. Physical roles pay well.',
    cta: {
      label: 'Find Garden/Warehouse Jobs',
      action: 'search',
      payload: 'home depot OR lowes OR garden center'
    },
    activeMonths: [2, 3, 4, 5],
    priority: 1
  },
  {
    id: 'home-improvement-winding',
    type: 'tip',
    icon: 'TrendingDown',
    title: 'Spring Season Winding Down',
    subtitle: 'Home improvement hiring slowing',
    description: 'Summer heat reduces outdoor project demand. If you\'re in a spring seasonal role, now is the time to ask about permanent positions.',
    cta: {
      label: 'Talk to Coach',
      action: 'coach',
      payload: 'How do I convert my seasonal job to permanent?'
    },
    activeMonths: [6],
    priority: 4
  },

  // ============================================
  // BACK-TO-SCHOOL (July - August)
  // ============================================
  {
    id: 'bts-upcoming',
    type: 'upcoming',
    icon: 'Calendar',
    title: 'Back-to-School Hiring Coming',
    subtitle: 'Apparel, Office Supplies, Electronics',
    description: 'The second-largest shopping event ($80B+) starts mid-July. Target, Old Navy, Staples, and Best Buy will be hiring aggressively.',
    cta: {
      label: 'Set Reminder',
      action: 'reminder',
      payload: 'back-to-school'
    },
    activeMonths: [6],
    priority: 2
  },
  {
    id: 'bts-hot',
    type: 'hot',
    icon: 'Flame',
    title: 'Back-to-School Rush is ON',
    subtitle: 'Clothing, Tech, Office Supplies',
    description: 'Parents are shopping against hard deadlines. Stores need floor staff NOW. Great opportunity for flexible schedules.',
    cta: {
      label: 'Find BTS Jobs',
      action: 'search',
      payload: 'retail sales associate'
    },
    activeMonths: [7, 8],
    priority: 1
  },

  // ============================================
  // HOLIDAY RETAIL (September - November)
  // ============================================
  {
    id: 'holiday-launch',
    type: 'hot',
    icon: 'Rocket',
    title: 'Holiday Hiring Has Launched',
    subtitle: 'Target, Walmart, Best Buy, Amazon',
    description: 'September is THE month to apply for holiday retail. Being in the "first batch" significantly increases your chances. Don\'t wait for November.',
    cta: {
      label: 'Apply to Holiday Jobs',
      action: 'search',
      payload: 'seasonal retail'
    },
    activeMonths: [9],
    priority: 1
  },
  {
    id: 'holiday-peak',
    type: 'hot',
    icon: 'Flame',
    title: 'Peak Holiday Hiring',
    subtitle: 'Interviews happening NOW',
    description: 'October is when interviews happen and offers are made. Managers want staff trained before November chaos. This is your best window.',
    cta: {
      label: 'Find Holiday Jobs',
      action: 'search',
      payload: 'holiday seasonal retail'
    },
    activeMonths: [10],
    priority: 1
  },
  {
    id: 'holiday-panic',
    type: 'tip',
    icon: 'Zap',
    title: 'Emergency Holiday Hiring',
    subtitle: 'Walk-in strategy works now',
    description: 'November is "panic hiring" - managers need bodies immediately. Walking in with open availability can get you hired on the spot.',
    cta: {
      label: 'Get Walk-In Tips',
      action: 'coach',
      payload: 'How do I walk in and get hired for holiday retail?'
    },
    activeMonths: [11],
    priority: 2
  },
  {
    id: 'holiday-freeze',
    type: 'warning',
    icon: 'Snowflake',
    title: 'Holiday Hiring Freeze',
    subtitle: 'Wait until January',
    description: 'December is survival mode for retailers. Budgets are exhausted, and no one is interviewing. Focus on January opportunities instead.',
    cta: {
      label: 'Plan for January',
      action: 'coach',
      payload: 'What jobs should I target in January?'
    },
    activeMonths: [12],
    priority: 2
  },

  // ============================================
  // GYMS & FITNESS (January - February)
  // ============================================
  {
    id: 'gym-hot',
    type: 'hot',
    icon: 'Dumbbell',
    title: 'Gyms Are Hiring',
    subtitle: 'New Year\'s Resolution Rush',
    description: 'January gym memberships spike 30-50%. Planet Fitness, LA Fitness, and local gyms need front desk and cleaning staff.',
    cta: {
      label: 'Find Gym Jobs',
      action: 'search',
      payload: 'gym fitness center'
    },
    activeMonths: [1, 2],
    priority: 2
  },

  // ============================================
  // WARNINGS & TIPS (Various months)
  // ============================================
  {
    id: 'summer-slump',
    type: 'warning',
    icon: 'AlertTriangle',
    title: 'Summer Hiring Slump',
    subtitle: 'Except Back-to-School sectors',
    description: 'June-August is the "dead zone" for general retail. Managers are on vacation, budgets are frozen. Focus on BTS sectors or use this time to build skills.',
    cta: {
      label: 'Build Your Resume',
      action: 'link',
      payload: '/dashboard/resume'
    },
    activeMonths: [6, 7, 8],
    priority: 5
  },
  {
    id: 'january-purge',
    type: 'warning',
    icon: 'AlertTriangle',
    title: 'January Retail Layoffs',
    subtitle: 'Seasonal contracts ending',
    description: 'Retailers cut seasonal staff in January. If you\'re job hunting, pivot to tax prep, gyms, or healthcare - they\'re counter-cyclical.',
    cta: {
      label: 'Find Counter-Cyclical Jobs',
      action: 'search',
      payload: 'healthcare OR tax preparer OR gym'
    },
    activeMonths: [1],
    priority: 4
  },

  // ============================================
  // GHOST JOB AWARENESS (Year-round, higher priority in slow months)
  // ============================================
  {
    id: 'ghost-jobs-warning',
    type: 'warning',
    icon: 'Ghost',
    title: '40% of Retail Jobs Are Fake',
    subtitle: 'Learn to spot ghost listings',
    description: 'Many retail listings are "evergreen" posts for future pipelining. If a job has been posted 45+ days, it\'s likely a ghost. Always call to verify.',
    cta: {
      label: 'Learn to Spot Them',
      action: 'coach',
      payload: 'How do I identify ghost job listings?'
    },
    activeMonths: [1, 6, 7, 8, 12], // Worse during slow months
    priority: 3
  },

  // ============================================
  // CALL STRATEGY (Year-round)
  // ============================================
  {
    id: 'call-strategy',
    type: 'tip',
    icon: 'Phone',
    title: 'The Best Time to Call',
    subtitle: 'Tuesday 10am - 11:30am',
    description: 'This is the golden window. Managers are past Monday chaos but not yet in weekend prep. A quick call can move you from "digital pile" to "real person."',
    cta: {
      label: 'Get Call Scripts',
      action: 'coach',
      payload: 'Give me a script for calling about a job application'
    },
    activeMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    priority: 6
  }
]

/**
 * Get cards relevant to the current date.
 * Returns cards filtered by active months and sorted by priority.
 */
export function getCardsForDate(date: Date = new Date()): HiringIntelCard[] {
  const month = date.getMonth() + 1 // JavaScript months are 0-indexed

  return hiringIntelCards
    .filter(card => card.activeMonths.includes(month))
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Get the top N cards for the current date.
 */
export function getTopCards(count: number = 4, date: Date = new Date()): HiringIntelCard[] {
  return getCardsForDate(date).slice(0, count)
}

/**
 * Icon color mapping by card type
 */
export const cardTypeColors: Record<CardType, { bg: string; text: string; border: string }> = {
  hot: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  upcoming: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800'
  },
  tip: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  spotlight: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  }
}

/**
 * Type labels for display
 */
export const cardTypeLabels: Record<CardType, string> = {
  hot: 'Hot Now',
  upcoming: 'Coming Up',
  warning: 'Heads Up',
  tip: 'Pro Tip',
  spotlight: 'Spotlight'
}
