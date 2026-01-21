/**
 * ATS Bypass Strategy Generator
 *
 * Generates actionable strategies to help job seekers get past
 * automated screening systems and increase interview chances.
 *
 * Based on job hunting statistics:
 * - ATS submission: ~2% response rate
 * - Direct company application: ~4% response rate (2x)
 * - LinkedIn outreach: ~15% response rate (7.5x)
 * - Employee referral: ~50% interview rate (25x)
 */

export interface ATSBypassStrategy {
  strategy: string
  action: string
  impact: string
  timeEstimate: string
  priority: number // 1 = highest priority
}

interface JobInfo {
  company: string
  title: string
  applyUrl?: string
  companyWebsite?: string
  hasLinkedInPresence?: boolean
}

/**
 * Generate ATS bypass strategies based on job information
 */
export function generateATSBypassStrategies(job: JobInfo): ATSBypassStrategy[] {
  const strategies: ATSBypassStrategy[] = []

  // Strategy 1: Direct Apply on Company Website
  const isJobBoardUrl = job.applyUrl && (
    job.applyUrl.includes('indeed.com') ||
    job.applyUrl.includes('linkedin.com/jobs') ||
    job.applyUrl.includes('glassdoor.com') ||
    job.applyUrl.includes('ziprecruiter.com') ||
    job.applyUrl.includes('monster.com') ||
    job.applyUrl.includes('careerbuilder.com')
  )

  if (isJobBoardUrl || !job.applyUrl) {
    strategies.push({
      strategy: 'Apply Direct',
      action: `Find and apply on ${job.company}'s careers page instead of through the job board`,
      impact: '2x more likely to be seen by a human',
      timeEstimate: '5-10 min',
      priority: 1
    })
  }

  // Strategy 2: LinkedIn Outreach
  strategies.push({
    strategy: 'LinkedIn Outreach',
    action: `Find the hiring manager or HR recruiter for ${job.company} on LinkedIn and send a personalized connection request`,
    impact: '15% response rate vs 2% through ATS alone',
    timeEstimate: '10-15 min',
    priority: 2
  })

  // Strategy 3: Employee Referral
  strategies.push({
    strategy: 'Find a Referral',
    action: `Search LinkedIn for 1st or 2nd degree connections at ${job.company} who could refer you`,
    impact: 'Referrals get ~50% interview rate',
    timeEstimate: '15-20 min',
    priority: 3
  })

  // Strategy 4: Follow-up Email
  strategies.push({
    strategy: 'Follow-up Email',
    action: `Send a brief follow-up email 5-7 days after applying, reiterating interest in the ${job.title} role`,
    impact: '30% more likely to get a response',
    timeEstimate: '5 min',
    priority: 4
  })

  // Strategy 5: Company-specific (if well-known company)
  const knownCompanies = getKnownCompanyStrategy(job.company)
  if (knownCompanies) {
    strategies.push({
      ...knownCompanies,
      priority: strategies.length + 1
    })
  }

  // Sort by priority
  return strategies.sort((a, b) => a.priority - b.priority)
}

/**
 * Get company-specific strategies for well-known employers
 */
function getKnownCompanyStrategy(company: string): Omit<ATSBypassStrategy, 'priority'> | null {
  const normalizedCompany = company.toLowerCase()

  const companyStrategies: Record<string, Omit<ATSBypassStrategy, 'priority'>> = {
    'orlando health': {
      strategy: 'Attend Career Fair',
      action: 'Orlando Health hosts regular career fairs - check their events page for upcoming dates',
      impact: 'Face-to-face interaction with recruiters',
      timeEstimate: '2-4 hours'
    },
    'advent health': {
      strategy: 'Attend Career Fair',
      action: 'AdventHealth hosts regular career fairs - check their events page for upcoming dates',
      impact: 'Face-to-face interaction with recruiters',
      timeEstimate: '2-4 hours'
    },
    'adventhealth': {
      strategy: 'Attend Career Fair',
      action: 'AdventHealth hosts regular career fairs - check their events page for upcoming dates',
      impact: 'Face-to-face interaction with recruiters',
      timeEstimate: '2-4 hours'
    },
    'valencia college': {
      strategy: 'Contact Career Services',
      action: 'If you\'re a Valencia student/alum, contact Career Services for internal job posting access',
      impact: 'Priority consideration for Valencia candidates',
      timeEstimate: '30 min'
    },
    'target': {
      strategy: 'Apply In-Store',
      action: 'Visit the Target store and ask to speak with the HR team lead about the position',
      impact: 'Shows initiative and gets your name in front of decision makers',
      timeEstimate: '30 min'
    },
    'walmart': {
      strategy: 'Apply In-Store',
      action: 'Visit the Walmart store and ask to speak with a manager about the position',
      impact: 'Shows initiative and gets your name in front of decision makers',
      timeEstimate: '30 min'
    },
    'publix': {
      strategy: 'Apply In-Store',
      action: 'Visit the Publix store and ask to speak with a manager - Publix values in-person interaction',
      impact: 'Publix is known for hiring through personal connections',
      timeEstimate: '30 min'
    },
    'lockheed martin': {
      strategy: 'Attend Hiring Events',
      action: 'Lockheed Martin hosts recruiting events - check their careers page for upcoming events',
      impact: 'Direct access to hiring managers',
      timeEstimate: '2-4 hours'
    },
    'disney': {
      strategy: 'Disney Casting',
      action: 'For Disney roles, attend open casting calls or use the Disney Careers mobile app',
      impact: 'Disney has specific hiring processes by role type',
      timeEstimate: '1-2 hours'
    },
    'walt disney': {
      strategy: 'Disney Casting',
      action: 'For Disney roles, attend open casting calls or use the Disney Careers mobile app',
      impact: 'Disney has specific hiring processes by role type',
      timeEstimate: '1-2 hours'
    },
    'ucf': {
      strategy: 'UCF Job Network',
      action: 'If you\'re a UCF alum, use Knight Connect for internal job postings and networking',
      impact: 'Alumni network provides insider access',
      timeEstimate: '30 min'
    },
    'university of central florida': {
      strategy: 'UCF Job Network',
      action: 'If you\'re a UCF alum, use Knight Connect for internal job postings and networking',
      impact: 'Alumni network provides insider access',
      timeEstimate: '30 min'
    }
  }

  for (const [key, strategy] of Object.entries(companyStrategies)) {
    if (normalizedCompany.includes(key)) {
      return strategy
    }
  }

  return null
}

/**
 * Get the single most impactful strategy
 */
export function getTopBypassStrategy(job: JobInfo): ATSBypassStrategy {
  const strategies = generateATSBypassStrategies(job)
  return strategies[0]
}

/**
 * Success rate education content
 */
export const JOB_HUNTING_STATS = {
  ats: {
    method: 'Applying through job boards (Indeed, LinkedIn)',
    responseRate: '2%',
    description: 'Your resume competes with 250+ others',
    tip: 'Optimize keywords but don\'t rely solely on this method'
  },
  directApply: {
    method: 'Applying on company careers page',
    responseRate: '4%',
    description: '2x better than job boards',
    tip: 'Always find the direct application link'
  },
  linkedIn: {
    method: 'LinkedIn outreach to hiring managers',
    responseRate: '15%',
    description: '7.5x better than job boards',
    tip: 'Send personalized messages, not generic templates'
  },
  referral: {
    method: 'Employee referral',
    responseRate: '50%',
    description: '25x better than job boards',
    tip: 'This is by far the most effective method'
  },
  networking: {
    method: 'Networking events and career fairs',
    responseRate: '30%',
    description: 'Face time with decision makers',
    tip: 'Prepare your 30-second pitch'
  }
}

/**
 * Generate a quick tip based on job context
 */
export function getQuickBypassTip(job: JobInfo): string {
  const normalizedCompany = job.company.toLowerCase()

  // Healthcare
  if (normalizedCompany.includes('health') ||
      normalizedCompany.includes('hospital') ||
      normalizedCompany.includes('medical')) {
    return `Healthcare hiring tip: Many hospitals have walk-in hiring events. Check ${job.company}'s careers page for upcoming dates.`
  }

  // Retail
  if (normalizedCompany.includes('target') ||
      normalizedCompany.includes('walmart') ||
      normalizedCompany.includes('publix') ||
      normalizedCompany.includes('store')) {
    return `Retail hiring tip: Visiting the location in person shows initiative and often leads to on-the-spot interviews.`
  }

  // Education
  if (normalizedCompany.includes('college') ||
      normalizedCompany.includes('university') ||
      normalizedCompany.includes('school')) {
    return `Education hiring tip: Current students and alumni often get priority. Contact the Career Services office.`
  }

  // Tech
  if (normalizedCompany.includes('tech') ||
      normalizedCompany.includes('software') ||
      normalizedCompany.includes('digital')) {
    return `Tech hiring tip: Join local tech meetups and slack communities where employees hang out.`
  }

  // Default
  return `Pro tip: 40% of hires come through referrals. Search LinkedIn for connections at ${job.company} before applying.`
}

export default generateATSBypassStrategies
