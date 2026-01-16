/**
 * Daily Plan Generator
 *
 * AI-powered daily job application planning for Valencia College graduates.
 * Selects the 8 best jobs to apply to each day based on:
 * - Match score (skills, education, experience)
 * - Commute time via LYNX
 * - Salary fit
 * - Application urgency (posting age)
 * - Valencia College program alignment
 *
 * Plans are regenerated daily at 6 AM or on-demand.
 */

import { generateJSON, isGeminiAvailable } from './gemini-client'

// Types
export interface DailyJob {
  jobId: string
  title: string
  company: string
  location: string
  matchScore: number // 0-100
  matchReasons: string[]
  salaryRange?: string
  transitMinutes?: number
  lynxRoutes?: string[]
  applicationUrl: string
  postedDaysAgo: number
  priority: 'high' | 'medium' | 'low'
  estimatedApplicationTime: number // minutes
  tipsForApplying?: string[]
}

export interface DailyPlan {
  date: string // ISO date
  userId: string
  jobs: DailyJob[]
  totalEstimatedTime: number // minutes
  motivationalMessage: string
  focusArea: string // e.g., "Customer Service roles near Downtown Orlando"
  stats: {
    avgMatchScore: number
    avgSalary: number
    avgCommute: number
    valenciaMatchCount: number
  }
}

export interface UserProfile {
  id: string
  name: string
  location: { lat: number; lng: number }
  maxCommute: number // minutes
  preferredJobTypes: string[]
  skills: string[]
  education: string
  experience: string
  salaryMin?: number
  salaryMax?: number
  valenciaProgram?: string
}

export interface JobForRanking {
  id: string
  title: string
  company: string
  location: string
  locationCoords?: { lat: number; lng: number }
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  jobType?: string
  description?: string
  requirements?: string[]
  postedAt: string
  applicationUrl: string
  transitMinutes?: number
  lynxRoutes?: string[]
  valenciaMatch?: boolean
  valenciaMatchPercentage?: number
}

// Weights for job ranking algorithm
const RANKING_WEIGHTS = {
  skillMatch: 0.25,
  valenciaMatch: 0.20,
  salaryFit: 0.15,
  commuteFit: 0.15,
  urgency: 0.10,
  companyQuality: 0.10,
  jobTypeFit: 0.05
}

// Known quality employers in Orlando area
const QUALITY_EMPLOYERS = [
  'orlando health', 'adventhealth', 'valencia college', 'ucf',
  'lockheed martin', 'disney', 'universal', 'publix',
  'amazon', 'target', 'costco', 'chewy', 'electronic arts',
  'siemens', 'deloitte', 'jpmorgan', 'bank of america'
]

/**
 * Generate a daily application plan for a user
 */
export async function generateDailyPlan(
  user: UserProfile,
  availableJobs: JobForRanking[],
  targetJobCount: number = 8
): Promise<DailyPlan> {
  // Score and rank all jobs
  const scoredJobs = availableJobs.map(job => ({
    job,
    score: calculateMatchScore(job, user)
  }))

  // Sort by score descending
  scoredJobs.sort((a, b) => b.score.total - a.score.total)

  // Take top jobs
  const topJobs = scoredJobs.slice(0, targetJobCount)

  // Convert to DailyJob format
  const dailyJobs: DailyJob[] = topJobs.map(({ job, score }, index) => {
    const postedDate = new Date(job.postedAt)
    const postedDaysAgo = Math.floor(
      (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine priority based on score and urgency
    let priority: 'high' | 'medium' | 'low' = 'medium'
    if (score.total >= 80 || (job.valenciaMatch && score.total >= 70)) {
      priority = 'high'
    } else if (score.total < 60) {
      priority = 'low'
    }

    // Estimate application time
    const estimatedApplicationTime = job.valenciaMatch ? 15 : 20 // Valencia jobs often have simpler applications

    return {
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      matchScore: score.total,
      matchReasons: score.reasons,
      salaryRange: formatSalaryRange(job),
      transitMinutes: job.transitMinutes,
      lynxRoutes: job.lynxRoutes,
      applicationUrl: job.applicationUrl,
      postedDaysAgo,
      priority,
      estimatedApplicationTime,
      tipsForApplying: generateApplyTips(job, user)
    }
  })

  // Calculate stats
  const stats = calculatePlanStats(dailyJobs, topJobs.map(t => t.job))

  // Generate motivational message
  const motivationalMessage = await generateMotivationalMessage(user, dailyJobs)

  // Determine focus area
  const focusArea = determineFocusArea(dailyJobs)

  return {
    date: new Date().toISOString().split('T')[0],
    userId: user.id,
    jobs: dailyJobs,
    totalEstimatedTime: dailyJobs.reduce((sum, j) => sum + j.estimatedApplicationTime, 0),
    motivationalMessage,
    focusArea,
    stats
  }
}

/**
 * Calculate match score for a job
 */
export function calculateMatchScore(
  job: JobForRanking,
  user: UserProfile
): { total: number; reasons: string[] } {
  const scores: Record<string, number> = {}
  const reasons: string[] = []

  // 1. Skill Match (0-100)
  if (job.description || job.requirements) {
    const jobText = `${job.description || ''} ${job.requirements?.join(' ') || ''}`.toLowerCase()
    const matchedSkills = user.skills.filter(skill =>
      jobText.includes(skill.toLowerCase())
    )
    scores.skillMatch = Math.min(100, (matchedSkills.length / Math.max(1, user.skills.length)) * 100)

    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} skills match: ${matchedSkills.slice(0, 3).join(', ')}`)
    }
  } else {
    scores.skillMatch = 50 // Neutral if no description
  }

  // 2. Valencia Match (0-100)
  if (job.valenciaMatch) {
    scores.valenciaMatch = job.valenciaMatchPercentage || 80
    reasons.push(`Valencia ${user.valenciaProgram || 'program'} match: ${job.valenciaMatchPercentage || 80}%`)
  } else {
    scores.valenciaMatch = 30 // Base score for non-Valencia jobs
  }

  // 3. Salary Fit (0-100)
  if (job.salaryMin && user.salaryMin) {
    const jobSalary = job.salaryType === 'hourly'
      ? job.salaryMin * 2080
      : job.salaryMin

    if (jobSalary >= user.salaryMin) {
      scores.salaryFit = 100
      reasons.push(`Meets salary requirements`)
    } else if (jobSalary >= user.salaryMin * 0.9) {
      scores.salaryFit = 80
      reasons.push(`Close to salary target`)
    } else {
      scores.salaryFit = 50
    }
  } else {
    scores.salaryFit = 60 // Neutral if salary not specified
  }

  // 4. Commute Fit (0-100)
  if (job.transitMinutes !== undefined) {
    if (job.transitMinutes <= user.maxCommute * 0.5) {
      scores.commuteFit = 100
      reasons.push(`Short commute: ${job.transitMinutes} min`)
    } else if (job.transitMinutes <= user.maxCommute) {
      scores.commuteFit = 80
      reasons.push(`Reasonable commute: ${job.transitMinutes} min`)
    } else if (job.transitMinutes <= user.maxCommute * 1.5) {
      scores.commuteFit = 50
    } else {
      scores.commuteFit = 20
    }
  } else {
    scores.commuteFit = 50 // Neutral if no transit info
  }

  // 5. Urgency Score (0-100) - newer postings get higher scores
  const postedDate = new Date(job.postedAt)
  const daysSincePosted = Math.floor(
    (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSincePosted <= 1) {
    scores.urgency = 100
    reasons.push(`Just posted!`)
  } else if (daysSincePosted <= 3) {
    scores.urgency = 90
    reasons.push(`Posted ${daysSincePosted} days ago`)
  } else if (daysSincePosted <= 7) {
    scores.urgency = 70
  } else if (daysSincePosted <= 14) {
    scores.urgency = 50
  } else {
    scores.urgency = 30
  }

  // 6. Company Quality (0-100)
  const isQualityEmployer = QUALITY_EMPLOYERS.some(emp =>
    job.company.toLowerCase().includes(emp)
  )
  scores.companyQuality = isQualityEmployer ? 90 : 60
  if (isQualityEmployer) {
    reasons.push(`Well-known employer`)
  }

  // 7. Job Type Fit (0-100)
  if (job.jobType && user.preferredJobTypes.length > 0) {
    const matches = user.preferredJobTypes.some(type =>
      job.jobType!.toLowerCase().includes(type.toLowerCase())
    )
    scores.jobTypeFit = matches ? 100 : 40
  } else {
    scores.jobTypeFit = 60
  }

  // Calculate weighted total
  let total = 0
  Object.entries(RANKING_WEIGHTS).forEach(([key, weight]) => {
    total += (scores[key] || 50) * weight
  })

  return {
    total: Math.round(total),
    reasons
  }
}

/**
 * Format salary range for display
 */
function formatSalaryRange(job: JobForRanking): string | undefined {
  if (!job.salaryMin && !job.salaryMax) return undefined

  const format = (amount: number, type: 'hourly' | 'yearly') => {
    if (type === 'hourly') {
      return `$${amount}/hr`
    }
    return `$${(amount / 1000).toFixed(0)}k`
  }

  if (job.salaryMin && job.salaryMax) {
    return `${format(job.salaryMin, job.salaryType || 'yearly')} - ${format(job.salaryMax, job.salaryType || 'yearly')}`
  }

  if (job.salaryMin) {
    return `${format(job.salaryMin, job.salaryType || 'yearly')}+`
  }

  return undefined
}

/**
 * Generate application tips for a specific job
 */
function generateApplyTips(job: JobForRanking, user: UserProfile): string[] {
  const tips: string[] = []

  // Valencia match tip
  if (job.valenciaMatch) {
    tips.push(`Mention your Valencia College ${user.valenciaProgram || 'degree'} prominently`)
  }

  // Skill highlighting tip
  if (job.requirements && job.requirements.length > 0) {
    const matchedReq = job.requirements.find(req =>
      user.skills.some(skill => req.toLowerCase().includes(skill.toLowerCase()))
    )
    if (matchedReq) {
      tips.push(`Highlight experience with: ${matchedReq}`)
    }
  }

  // Company-specific tips
  if (job.company.toLowerCase().includes('orlando health') ||
      job.company.toLowerCase().includes('adventhealth')) {
    tips.push('Emphasize patient care and healthcare experience')
  }

  if (job.company.toLowerCase().includes('disney') ||
      job.company.toLowerCase().includes('universal')) {
    tips.push('Highlight customer service and teamwork skills')
  }

  // Commute tip
  if (job.transitMinutes && job.transitMinutes <= 30) {
    tips.push('Mention you live nearby and can commute easily')
  }

  // Default tip if none generated
  if (tips.length === 0) {
    tips.push('Tailor your resume summary to match the job description')
  }

  return tips.slice(0, 3) // Max 3 tips
}

/**
 * Calculate plan statistics
 */
function calculatePlanStats(
  dailyJobs: DailyJob[],
  originalJobs: JobForRanking[]
): DailyPlan['stats'] {
  const avgMatchScore = dailyJobs.length > 0
    ? Math.round(dailyJobs.reduce((sum, j) => sum + j.matchScore, 0) / dailyJobs.length)
    : 0

  // Calculate average salary
  const salaries = originalJobs
    .filter(j => j.salaryMin)
    .map(j => j.salaryType === 'hourly' ? (j.salaryMin! * 2080) : j.salaryMin!)

  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length)
    : 0

  // Calculate average commute
  const commutes = dailyJobs.filter(j => j.transitMinutes).map(j => j.transitMinutes!)
  const avgCommute = commutes.length > 0
    ? Math.round(commutes.reduce((sum, c) => sum + c, 0) / commutes.length)
    : 0

  // Count Valencia matches
  const valenciaMatchCount = originalJobs.filter(j => j.valenciaMatch).length

  return {
    avgMatchScore,
    avgSalary,
    avgCommute,
    valenciaMatchCount
  }
}

/**
 * Generate motivational message (with AI or fallback)
 */
async function generateMotivationalMessage(
  user: UserProfile,
  jobs: DailyJob[]
): Promise<string> {
  // Try AI generation first
  if (isGeminiAvailable()) {
    try {
      const highPriorityCount = jobs.filter(j => j.priority === 'high').length
      const avgScore = jobs.length > 0
        ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length)
        : 0

      const result = await generateJSON<{ message: string }>(
        `Generate a short (1-2 sentence) motivational message for ${user.name}, a Valencia College graduate looking for work in Orlando.

Today's plan includes ${jobs.length} jobs with ${highPriorityCount} high-priority opportunities.
Average match score: ${avgScore}%.

Keep it encouraging, specific to job hunting, and mention Orlando or their career journey.
Respond with JSON: { "message": "your message here" }`,
        {
          model: 'gemini-3.0-flash',
          temperature: 0.8
        }
      )

      if (result.message) {
        return result.message
      }
    } catch (error) {
      console.error('Failed to generate AI motivational message:', error)
    }
  }

  // Fallback messages
  const messages = [
    `Great morning, ${user.name}! Today's ${jobs.length} opportunities are hand-picked for your skills. Let's make it count!`,
    `${user.name}, you've got this! ${jobs.filter(j => j.priority === 'high').length} high-priority matches are waiting for you today.`,
    `Rise and shine, ${user.name}! Orlando's job market has ${jobs.length} opportunities that match your Valencia College background.`,
    `Today is your day, ${user.name}! These ${jobs.length} jobs align with your skills and career goals.`,
    `Good luck today, ${user.name}! Remember: each application brings you closer to your dream job in Orlando.`
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Determine the focus area for the day's plan
 */
function determineFocusArea(jobs: DailyJob[]): string {
  if (jobs.length === 0) return 'General job search'

  // Count job types/industries
  const titleWords: Record<string, number> = {}

  jobs.forEach(job => {
    const words = job.title.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (word.length > 4) {
        titleWords[word] = (titleWords[word] || 0) + 1
      }
    })
  })

  // Find most common word
  const topWord = Object.entries(titleWords)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'various'

  // Count locations
  const locations: Record<string, number> = {}
  jobs.forEach(job => {
    const city = job.location.split(',')[0].trim()
    locations[city] = (locations[city] || 0) + 1
  })

  const topLocation = Object.entries(locations)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Orlando area'

  return `${capitalize(topWord)} roles in ${topLocation}`
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default generateDailyPlan
