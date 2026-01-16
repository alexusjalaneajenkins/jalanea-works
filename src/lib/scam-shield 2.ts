/**
 * Scam Shield - Deterministic job scam detection system
 *
 * Protects users from job scams using pattern matching and heuristics.
 * Deterministic (not AI) for consistency and speed (<10ms per job).
 *
 * Severity Levels:
 * - CRITICAL: Auto-block, don't show job
 * - HIGH: Show warning, require confirmation to view
 * - MEDIUM: Show warning badge
 * - LOW: Safe, show green badge
 */

// Types
export type ScamSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface ScamFlag {
  id: string
  rule: string
  severity: ScamSeverity
  matched: string | boolean
  description: string
}

export interface ScamCheckResult {
  severity: ScamSeverity
  flags: ScamFlag[]
  safe: boolean
  message: string
  score: number // 0-100, higher = more suspicious
}

export interface JobForScamCheck {
  title?: string
  company?: string
  company_website?: string
  description?: string
  requirements?: string
  salary_min?: number
  salary_max?: number
  contact_email?: string
  location_address?: string
  employment_type?: string
  apply_url?: string
}

// Median salaries by job category (annual, USD)
// Used to detect unrealistic salary claims
const MEDIAN_SALARIES: Record<string, number> = {
  'customer service': 35000,
  'retail': 30000,
  'warehouse': 38000,
  'administrative': 42000,
  'receptionist': 35000,
  'data entry': 38000,
  'sales': 50000,
  'marketing': 55000,
  'accounting': 60000,
  'software': 95000,
  'developer': 90000,
  'engineer': 85000,
  'manager': 70000,
  'director': 100000,
  'executive': 150000,
  'nurse': 75000,
  'medical': 65000,
  'teacher': 50000,
  'default': 45000
}

/**
 * Get median salary for a job title
 */
function getMedianSalary(title: string): number {
  const lowerTitle = (title || '').toLowerCase()

  for (const [keyword, salary] of Object.entries(MEDIAN_SALARIES)) {
    if (keyword !== 'default' && lowerTitle.includes(keyword)) {
      return salary
    }
  }

  return MEDIAN_SALARIES.default
}

// =============================================================================
// DETECTION RULES
// =============================================================================

interface PatternRule {
  id: string
  pattern: RegExp
  description: string
}

interface CheckRule {
  id: string
  check: (job: JobForScamCheck) => boolean | string
  description: string
}

type Rule = PatternRule | CheckRule

function isPatternRule(rule: Rule): rule is PatternRule {
  return 'pattern' in rule
}

// CRITICAL Rules - Auto-block these jobs
const CRITICAL_RULES: Rule[] = [
  {
    id: 'upfront_payment',
    pattern: /(pay|send|wire|transfer|deposit).{0,30}(fee|money|upfront|advance)/i,
    description: 'Requests upfront payment or fees'
  },
  {
    id: 'check_cashing',
    pattern: /(cash|deposit).{0,20}(check|cheque|money order)/i,
    description: 'Involves check cashing scheme'
  },
  {
    id: 'cryptocurrency_payment',
    pattern: /(pay|paid|payment|salary).{0,30}(bitcoin|crypto|btc|ethereum|usdt)/i,
    description: 'Payment in cryptocurrency'
  },
  {
    id: 'money_transfer_service',
    pattern: /(western union|moneygram|wire transfer|money transfer)/i,
    description: 'Uses money transfer services'
  },
  {
    id: 'bank_account_request',
    pattern: /(your bank account|bank details|routing number|account number).{0,30}(send|provide|share)/i,
    description: 'Requests bank account details upfront'
  },
  {
    id: 'reshipping_scam',
    pattern: /(reship|re-ship|forward packages|receive packages).{0,30}(home|address)/i,
    description: 'Reshipping/package forwarding scam'
  },
  {
    id: 'mlm_pyramid',
    pattern: /(multi.?level|mlm|network marketing|pyramid|downline|upline)/i,
    description: 'Multi-level marketing or pyramid scheme'
  },
  {
    id: 'personal_info_upfront',
    pattern: /(ssn|social security|passport|driver.?s? license).{0,30}(before|upfront|to apply)/i,
    description: 'Requests sensitive personal info before interview'
  }
]

// HIGH Rules - Show warning, require confirmation
const HIGH_RULES: Rule[] = [
  {
    id: 'vague_description',
    check: (job) => {
      const wordCount = (job.description || '').split(/\s+/).filter(w => w.length > 0).length
      return wordCount < 50
    },
    description: 'Very vague job description (less than 50 words)'
  },
  {
    id: 'no_company_info',
    check: (job) => !job.company || job.company.length < 2,
    description: 'No company name provided'
  },
  {
    id: 'unrealistic_salary',
    check: (job) => {
      if (!job.salary_max || !job.title) return false
      const median = getMedianSalary(job.title)
      return job.salary_max > median * 2.5
    },
    description: 'Salary significantly above market rate (2.5x+ median)'
  },
  {
    id: 'work_from_home_emphasis',
    pattern: /(work from home|earn from home|make money from home|home.?based opportunity)/i,
    description: 'Heavy emphasis on work-from-home opportunity'
  },
  {
    id: 'too_good_to_be_true',
    pattern: /(unlimited earning|unlimited income|no experience needed|no experience required|easy money|get rich|quick cash)/i,
    description: 'Claims that sound too good to be true'
  },
  {
    id: 'guaranteed_income',
    pattern: /(guaranteed.{0,20}(income|salary|pay)|make \$\d{3,}.{0,10}(day|week|hour))/i,
    description: 'Unrealistic income guarantees'
  },
  {
    id: 'suspicious_url',
    check: (job) => {
      const url = job.apply_url || ''
      // Check for suspicious URL patterns
      const suspicious = [
        /\.(xyz|top|work|click|link)$/i,  // Suspicious TLDs
        /bit\.ly|tinyurl|t\.co/i,          // URL shorteners
        /\d{5,}/,                           // Lots of numbers
      ]
      return suspicious.some(p => p.test(url))
    },
    description: 'Suspicious application URL'
  },
  {
    id: 'interview_fee',
    pattern: /(interview|training|orientation).{0,30}(fee|cost|pay|charge)/i,
    description: 'Mentions fees for interview or training'
  }
]

// MEDIUM Rules - Show warning badge only
const MEDIUM_RULES: Rule[] = [
  {
    id: 'personal_email',
    check: (job) => {
      const email = job.contact_email || ''
      return /@(gmail|yahoo|hotmail|outlook|aol|mail)\./i.test(email)
    },
    description: 'Uses personal email domain instead of company email'
  },
  {
    id: 'po_box_address',
    pattern: /p\.?o\.?\s*box/i,
    description: 'Uses P.O. Box instead of physical address'
  },
  {
    id: 'missing_requirements',
    check: (job) => {
      const reqLength = (job.requirements || '').length
      return reqLength < 20
    },
    description: 'Missing or very brief job requirements'
  },
  {
    id: 'urgency_language',
    pattern: /(urgent|immediately|right away|asap|start today|hiring now|immediate start)/i,
    description: 'Uses high-urgency language'
  },
  {
    id: 'vague_company_name',
    check: (job) => {
      const company = (job.company || '').toLowerCase()
      const vagueNames = ['company', 'corporation', 'inc', 'llc', 'business', 'enterprise', 'group']
      // Check if company name is just a generic term
      return vagueNames.some(v => company === v || company === `${v}.`)
    },
    description: 'Generic or vague company name'
  },
  {
    id: 'contact_before_apply',
    pattern: /(text|call|whatsapp|telegram).{0,30}(before applying|to apply|for more info)/i,
    description: 'Requests contact via messaging app before applying'
  },
  {
    id: 'commission_only',
    pattern: /commission.?only|100%.?commission|no base.?(salary|pay)/i,
    description: 'Commission-only compensation'
  },
  {
    id: 'personal_vehicle_required',
    pattern: /(must have|need|require).{0,20}(your own|personal|reliable).{0,10}(car|vehicle|transportation)/i,
    description: 'Requires personal vehicle (common in delivery scams)'
  }
]

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Check a job listing for potential scam indicators
 *
 * @param job - Job object to check
 * @returns ScamCheckResult with severity, flags, and recommendations
 */
export function checkJobForScams(job: JobForScamCheck): ScamCheckResult {
  const flags: ScamFlag[] = []

  // Combine all text fields for pattern matching
  const allText = [
    job.title || '',
    job.company || '',
    job.description || '',
    job.requirements || '',
    job.location_address || ''
  ].join(' ')

  // Check CRITICAL rules
  for (const rule of CRITICAL_RULES) {
    if (isPatternRule(rule)) {
      const match = allText.match(rule.pattern)
      if (match) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'critical',
          matched: match[0],
          description: rule.description
        })
      }
    } else {
      const result = rule.check(job)
      if (result) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'critical',
          matched: typeof result === 'string' ? result : true,
          description: rule.description
        })
      }
    }
  }

  // Check HIGH rules
  for (const rule of HIGH_RULES) {
    if (isPatternRule(rule)) {
      const match = allText.match(rule.pattern)
      if (match) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'high',
          matched: match[0],
          description: rule.description
        })
      }
    } else {
      const result = rule.check(job)
      if (result) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'high',
          matched: typeof result === 'string' ? result : true,
          description: rule.description
        })
      }
    }
  }

  // Check MEDIUM rules
  for (const rule of MEDIUM_RULES) {
    if (isPatternRule(rule)) {
      const match = allText.match(rule.pattern)
      if (match) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'medium',
          matched: match[0],
          description: rule.description
        })
      }
    } else {
      const result = rule.check(job)
      if (result) {
        flags.push({
          id: rule.id,
          rule: rule.description,
          severity: 'medium',
          matched: typeof result === 'string' ? result : true,
          description: rule.description
        })
      }
    }
  }

  // Calculate overall severity
  const severity = calculateSeverity(flags)

  // Calculate suspicion score (0-100)
  const score = calculateScore(flags)

  // Generate message
  const message = generateMessage(severity, flags)

  return {
    severity,
    flags,
    safe: severity === 'low',
    message,
    score
  }
}

/**
 * Calculate overall severity based on flags
 */
function calculateSeverity(flags: ScamFlag[]): ScamSeverity {
  if (flags.some(f => f.severity === 'critical')) {
    return 'critical'
  }

  // Multiple HIGH flags or HIGH + MEDIUM = HIGH
  const highCount = flags.filter(f => f.severity === 'high').length
  const mediumCount = flags.filter(f => f.severity === 'medium').length

  if (highCount >= 2 || (highCount >= 1 && mediumCount >= 2)) {
    return 'high'
  }

  if (highCount >= 1) {
    return 'high'
  }

  // Multiple MEDIUM flags = MEDIUM
  if (mediumCount >= 2) {
    return 'medium'
  }

  if (mediumCount >= 1) {
    return 'medium'
  }

  return 'low'
}

/**
 * Calculate suspicion score (0-100)
 */
function calculateScore(flags: ScamFlag[]): number {
  let score = 0

  for (const flag of flags) {
    switch (flag.severity) {
      case 'critical':
        score += 40
        break
      case 'high':
        score += 25
        break
      case 'medium':
        score += 10
        break
    }
  }

  return Math.min(100, score)
}

/**
 * Generate user-friendly message based on severity
 */
function generateMessage(severity: ScamSeverity, flags: ScamFlag[]): string {
  switch (severity) {
    case 'critical':
      return 'This job listing shows strong indicators of a scam and has been blocked for your protection.'
    case 'high':
      return `This job listing has ${flags.length} red flag${flags.length > 1 ? 's' : ''} that may indicate a scam. Please proceed with caution.`
    case 'medium':
      return `This job listing has some characteristics that warrant caution. Verify the company before applying.`
    case 'low':
      return 'This job listing appears safe based on our scam detection analysis.'
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Filter out CRITICAL jobs from a list
 */
export function filterCriticalJobs<T extends JobForScamCheck>(jobs: T[]): T[] {
  return jobs.filter(job => {
    const result = checkJobForScams(job)
    return result.severity !== 'critical'
  })
}

/**
 * Enrich jobs with scam check results
 */
export function enrichJobsWithScamCheck<T extends JobForScamCheck>(
  jobs: T[]
): (T & { scamCheck: ScamCheckResult })[] {
  return jobs.map(job => ({
    ...job,
    scamCheck: checkJobForScams(job)
  }))
}

/**
 * Get human-readable flag descriptions for display
 */
export function getReadableFlags(flags: ScamFlag[]): string[] {
  return flags.map(flag => flag.description)
}

/**
 * Check if a job should be shown to the user
 * (Filters out CRITICAL severity)
 */
export function shouldShowJob(job: JobForScamCheck): boolean {
  const result = checkJobForScams(job)
  return result.severity !== 'critical'
}

/**
 * Check if a job requires warning confirmation
 * (HIGH severity jobs need user confirmation)
 */
export function requiresWarningConfirmation(job: JobForScamCheck): boolean {
  const result = checkJobForScams(job)
  return result.severity === 'high'
}

export default checkJobForScams
