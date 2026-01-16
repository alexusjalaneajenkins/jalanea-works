/**
 * Valencia Match Score Calculator
 *
 * Calculates how well a job matches a user's Valencia College education/credentials.
 * Uses keyword matching, career pathway alignment, and salary fit.
 *
 * Score breakdown (0-100):
 * - Keyword Match: 40 points (job contains program keywords)
 * - Career Pathway: 30 points (job aligns with career pathway)
 * - Salary Fit: 20 points (job salary matches program typical range)
 * - Credential Level: 10 points (job matches credential level)
 */

import { createAdminClient } from '@/lib/supabase/admin'

// Types
export interface ValenciaProgram {
  program_id: string
  program_name: string
  program_type: 'certificate' | 'AS' | 'BAS'
  school: string
  career_pathway: string | null
  keywords: string[]
  typical_salary_min: number | null
  typical_salary_max: number | null
}

export interface UserCredential {
  institution: string
  credential_type: string
  program: string
  valencia_credential: boolean
}

export interface JobForMatching {
  id: string
  title: string
  company?: string
  description?: string
  requirements?: string
  salary_min?: number
  salary_max?: number
  salary_period?: 'hourly' | 'annual'
  employment_type?: string
}

export interface ValenciaMatchResult {
  isMatch: boolean
  score: number // 0-100
  matchPercentage: number // Same as score, for display
  breakdown: {
    keywordScore: number
    pathwayScore: number
    salaryScore: number
    credentialScore: number
  }
  matchedKeywords: string[]
  reasons: string[]
  programName?: string
}

// Career pathway keywords mapping
const CAREER_PATHWAY_KEYWORDS: Record<string, string[]> = {
  'Technology': [
    'software', 'developer', 'programmer', 'engineer', 'it', 'tech', 'computer',
    'web', 'data', 'network', 'support', 'helpdesk', 'help desk', 'analyst',
    'systems', 'database', 'security', 'cloud', 'devops', 'qa', 'testing',
    'frontend', 'backend', 'full stack', 'fullstack', 'mobile', 'application'
  ],
  'Business': [
    'business', 'manager', 'management', 'analyst', 'accounting', 'accountant',
    'bookkeeper', 'finance', 'financial', 'marketing', 'sales', 'administrative',
    'admin', 'office', 'coordinator', 'specialist', 'consultant', 'project',
    'operations', 'hr', 'human resources', 'payroll', 'executive', 'assistant'
  ],
  'Healthcare': [
    'health', 'healthcare', 'medical', 'nurse', 'nursing', 'patient', 'clinical',
    'care', 'hospital', 'doctor', 'physician', 'pharmacy', 'dental', 'therapist',
    'technician', 'emt', 'paramedic', 'lab', 'diagnostic', 'radiology'
  ],
  'Hospitality': [
    'hospitality', 'hotel', 'restaurant', 'food', 'service', 'guest', 'tourism',
    'travel', 'event', 'catering', 'culinary', 'chef', 'kitchen', 'front desk',
    'concierge', 'housekeeping', 'banquet', 'resort'
  ],
  'Creative': [
    'design', 'designer', 'graphic', 'creative', 'art', 'artist', 'visual',
    'media', 'video', 'photography', 'animation', 'ui', 'ux', 'user experience',
    'brand', 'content', 'writer', 'editor', 'production'
  ],
  'Education': [
    'education', 'teacher', 'teaching', 'instructor', 'tutor', 'professor',
    'academic', 'school', 'training', 'learning', 'curriculum', 'student'
  ],
  'Manufacturing': [
    'manufacturing', 'production', 'assembly', 'warehouse', 'logistics',
    'supply chain', 'inventory', 'quality', 'machine', 'operator', 'technician',
    'maintenance', 'cnc', 'welding', 'fabrication'
  ]
}

// Credential level requirements mapping
const CREDENTIAL_LEVEL_MAP: Record<string, string[]> = {
  'certificate': ['entry level', 'no degree', 'high school', 'certificate', 'certification'],
  'AS': ['associate', "associate's", 'aa', 'as', '2 year', 'two year', 'some college'],
  'BAS': ['bachelor', "bachelor's", 'ba', 'bs', '4 year', 'four year', 'degree required', 'college degree']
}

// Cache for Valencia programs
let programCache: Map<string, ValenciaProgram> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Get all Valencia programs (cached)
 */
export async function getValenciaPrograms(): Promise<Map<string, ValenciaProgram>> {
  // Return cached data if valid
  if (programCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return programCache
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('valencia_programs')
    .select('*')

  if (error) {
    console.error('Error fetching Valencia programs:', error)
    return new Map()
  }

  // Build cache
  programCache = new Map()
  for (const program of data || []) {
    programCache.set(program.program_id, program as ValenciaProgram)
  }
  cacheTimestamp = Date.now()

  return programCache
}

/**
 * Get a single Valencia program by ID
 */
export async function getValenciaProgram(programId: string): Promise<ValenciaProgram | null> {
  const programs = await getValenciaPrograms()
  return programs.get(programId) || null
}

/**
 * Calculate Valencia Match Score for a job
 */
export function calculateValenciaMatch(
  job: JobForMatching,
  program: ValenciaProgram
): ValenciaMatchResult {
  const scores = {
    keywordScore: 0,
    pathwayScore: 0,
    salaryScore: 0,
    credentialScore: 0
  }
  const matchedKeywords: string[] = []
  const reasons: string[] = []

  // Combine job text for matching
  const jobText = [
    job.title || '',
    job.description || '',
    job.requirements || '',
    job.company || ''
  ].join(' ').toLowerCase()

  // 1. Keyword Match (0-40 points)
  const programKeywords = program.keywords || []
  for (const keyword of programKeywords) {
    if (jobText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }

  if (programKeywords.length > 0) {
    const keywordRatio = matchedKeywords.length / programKeywords.length
    scores.keywordScore = Math.round(keywordRatio * 40)

    if (matchedKeywords.length > 0) {
      reasons.push(`Skills match: ${matchedKeywords.slice(0, 3).join(', ')}`)
    }
  }

  // 2. Career Pathway Match (0-30 points)
  if (program.career_pathway) {
    const pathwayKeywords = CAREER_PATHWAY_KEYWORDS[program.career_pathway] || []
    let pathwayMatches = 0

    for (const keyword of pathwayKeywords) {
      if (jobText.includes(keyword.toLowerCase())) {
        pathwayMatches++
      }
    }

    if (pathwayKeywords.length > 0) {
      // Score based on how many pathway keywords match (cap at 5+ for full score)
      const pathwayRatio = Math.min(1, pathwayMatches / 5)
      scores.pathwayScore = Math.round(pathwayRatio * 30)

      if (pathwayMatches >= 2) {
        reasons.push(`${program.career_pathway} career pathway match`)
      }
    }
  }

  // 3. Salary Fit (0-20 points)
  if (job.salary_min && program.typical_salary_min && program.typical_salary_max) {
    // Normalize job salary to annual
    let jobSalary = job.salary_min
    if (job.salary_period === 'hourly') {
      jobSalary = job.salary_min * 2080 // 40 hrs * 52 weeks
    }

    // Check if job salary is within program's typical range
    if (jobSalary >= program.typical_salary_min && jobSalary <= program.typical_salary_max * 1.5) {
      scores.salaryScore = 20
      reasons.push('Salary matches program expectations')
    } else if (jobSalary >= program.typical_salary_min * 0.8) {
      scores.salaryScore = 15
    } else if (jobSalary >= program.typical_salary_min * 0.6) {
      scores.salaryScore = 10
    }
  } else {
    // Give neutral score if salary info unavailable
    scores.salaryScore = 10
  }

  // 4. Credential Level Match (0-10 points)
  const credentialKeywords = CREDENTIAL_LEVEL_MAP[program.program_type] || []
  let credentialMatch = false

  for (const keyword of credentialKeywords) {
    if (jobText.includes(keyword.toLowerCase())) {
      credentialMatch = true
      break
    }
  }

  // Also match if job doesn't specify education requirements (entry-level friendly)
  const requiresDegree = jobText.includes('bachelor') || jobText.includes('degree required')
  const isCertProgram = program.program_type === 'certificate'

  if (credentialMatch) {
    scores.credentialScore = 10
    reasons.push(`${program.program_type.toUpperCase()} credential matches`)
  } else if (!requiresDegree && isCertProgram) {
    // Certificate programs can match jobs that don't require degrees
    scores.credentialScore = 8
  } else if (!requiresDegree) {
    scores.credentialScore = 5
  }

  // Calculate total score
  const totalScore = scores.keywordScore + scores.pathwayScore + scores.salaryScore + scores.credentialScore

  // Determine if it's a "match" (threshold: 40+)
  const isMatch = totalScore >= 40

  return {
    isMatch,
    score: totalScore,
    matchPercentage: totalScore,
    breakdown: scores,
    matchedKeywords,
    reasons,
    programName: program.program_name
  }
}

/**
 * Batch calculate Valencia matches for multiple jobs
 */
export async function calculateBatchValenciaMatch(
  jobs: JobForMatching[],
  programId: string
): Promise<Map<string, ValenciaMatchResult>> {
  const program = await getValenciaProgram(programId)
  const results = new Map<string, ValenciaMatchResult>()

  if (!program) {
    // Return empty results with isMatch=false for all jobs
    for (const job of jobs) {
      results.set(job.id, {
        isMatch: false,
        score: 0,
        matchPercentage: 0,
        breakdown: { keywordScore: 0, pathwayScore: 0, salaryScore: 0, credentialScore: 0 },
        matchedKeywords: [],
        reasons: []
      })
    }
    return results
  }

  for (const job of jobs) {
    results.set(job.id, calculateValenciaMatch(job, program))
  }

  return results
}

/**
 * Get user's Valencia program from their credentials
 */
export async function getUserValenciaProgram(userId: string): Promise<ValenciaProgram | null> {
  const supabase = createAdminClient()

  // Get user's Valencia credential
  const { data: credential } = await supabase
    .from('credentials')
    .select('program')
    .eq('user_id', userId)
    .eq('valencia_credential', true)
    .single()

  if (!credential?.program) {
    return null
  }

  // Try to match the credential program to a Valencia program
  const programs = await getValenciaPrograms()

  // First try exact match
  const exactMatch = programs.get(credential.program)
  if (exactMatch) {
    return exactMatch
  }

  // Try fuzzy match by program name
  const programName = credential.program.toLowerCase()
  for (const program of programs.values()) {
    if (program.program_name.toLowerCase().includes(programName) ||
        programName.includes(program.program_name.toLowerCase())) {
      return program
    }
  }

  return null
}

/**
 * Enrich jobs with Valencia match scores
 */
export async function enrichJobsWithValenciaMatch<T extends JobForMatching>(
  jobs: T[],
  userId: string
): Promise<(T & { valenciaMatch?: boolean; valenciaMatchPercentage?: number })[]> {
  // Get user's Valencia program
  const program = await getUserValenciaProgram(userId)

  if (!program) {
    // Return jobs without Valencia match data
    return jobs.map(job => ({
      ...job,
      valenciaMatch: false,
      valenciaMatchPercentage: undefined
    }))
  }

  // Calculate matches for all jobs
  return jobs.map(job => {
    const match = calculateValenciaMatch(job, program)
    return {
      ...job,
      valenciaMatch: match.isMatch,
      valenciaMatchPercentage: match.isMatch ? match.matchPercentage : undefined
    }
  })
}

/**
 * Clear the program cache (for testing or cache refresh)
 */
export function clearProgramCache(): void {
  programCache = null
  cacheTimestamp = 0
}

export default calculateValenciaMatch
