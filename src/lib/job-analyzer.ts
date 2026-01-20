/**
 * Job Analyzer - Pre-pocket qualification matching
 *
 * Analyzes job fit BEFORE pocket generation to help users decide
 * if a job is worth their time. Integrates with Scam Shield for safety.
 *
 * Features:
 * - Safety check (via Scam Shield)
 * - Qualification matching (skills comparison)
 * - Quick win suggestions (actionable improvements)
 * - Verdict calculation (APPLY_NOW / CONSIDER / SKIP)
 */

import { checkJobForScams, type ScamCheckResult, type JobForScamCheck } from './scam-shield'

// =============================================================================
// TYPES
// =============================================================================

export interface SafetyResult {
  status: 'safe' | 'caution' | 'warning' | 'danger'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  flags: string[]
  message: string
}

export interface QualificationResult {
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  experienceGap: number | null
  totalRequired: number
  totalMatched: number
}

export interface QuickWinResult {
  action: string
  impact: string
  timeEstimate: string
  type: 'add_skill' | 'reframe' | 'learn'
}

export interface VerdictResult {
  recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
  reason: string
  confidence: number
}

export interface AnalysisResult {
  safety: SafetyResult
  qualification: QualificationResult
  quickWin: QuickWinResult | null
  verdict: VerdictResult
  analyzedAt: string
}

export interface JobForAnalysis {
  id?: string
  title: string
  company?: string
  company_website?: string
  description?: string
  requirements?: string | string[]
  salary_min?: number
  salary_max?: number
  contact_email?: string
  location_address?: string
  employment_type?: string
  apply_url?: string
}

export interface UserProfile {
  skills: string[]
  experienceYears?: number
  education?: string
  location?: string
}

// =============================================================================
// SKILL EXTRACTION
// =============================================================================

/**
 * Common skill keywords organized by category
 */
const SKILL_KEYWORDS = {
  technical: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'rails',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
    'rest', 'graphql', 'api', 'microservices',
    'agile', 'scrum', 'jira', 'confluence'
  ],
  office: [
    'excel', 'word', 'powerpoint', 'outlook', 'microsoft office', 'ms office',
    'google sheets', 'google docs', 'google slides', 'g suite', 'google workspace',
    'quickbooks', 'salesforce', 'hubspot', 'zendesk', 'slack', 'zoom', 'teams'
  ],
  soft: [
    'communication', 'teamwork', 'leadership', 'problem solving', 'problem-solving',
    'time management', 'organization', 'organizational', 'attention to detail',
    'customer service', 'interpersonal', 'adaptability', 'flexibility',
    'critical thinking', 'decision making', 'conflict resolution',
    'presentation', 'public speaking', 'writing', 'verbal'
  ],
  certifications: [
    'pmp', 'cpa', 'cfa', 'series 7', 'series 63', 'aws certified', 'azure certified',
    'google certified', 'cisco', 'ccna', 'comptia', 'a+', 'security+', 'network+',
    'six sigma', 'lean', 'itil', 'scrum master', 'csm', 'safe'
  ],
  retail_service: [
    'cash handling', 'register', 'pos', 'point of sale', 'inventory',
    'merchandising', 'stocking', 'customer service', 'sales',
    'food handling', 'food safety', 'servsafe', 'food service',
    'phone', 'email', 'chat support', 'data entry', 'typing'
  ]
}

/**
 * Extract skill requirements from job description and requirements
 */
export function extractRequirements(job: JobForAnalysis): string[] {
  const text = `${job.title || ''} ${job.description || ''} ${
    Array.isArray(job.requirements) ? job.requirements.join(' ') : job.requirements || ''
  }`.toLowerCase()

  const foundSkills = new Set<string>()

  // Check all skill categories
  for (const category of Object.values(SKILL_KEYWORDS)) {
    for (const skill of category) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.add(skill)
      }
    }
  }

  // Also extract common requirement patterns
  const patterns = [
    /(?:required|must have|experience with|proficient in|knowledge of)\s*:?\s*([^.;,\n]+)/gi,
    /\b(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        // Extract individual skills from the match
        const skills = match[1].split(/[,/&]/).map(s => s.trim().toLowerCase())
        for (const skill of skills) {
          if (skill.length > 2 && skill.length < 30) {
            foundSkills.add(skill)
          }
        }
      }
    }
  }

  return Array.from(foundSkills)
}

// =============================================================================
// MATCHING LOGIC
// =============================================================================

/**
 * Match user skills against job requirements
 */
export function matchSkills(
  requirements: string[],
  userSkills: string[]
): QualificationResult {
  if (requirements.length === 0) {
    // No requirements extracted - assume good match
    return {
      matchPercentage: 85,
      matchedSkills: [],
      missingSkills: [],
      experienceGap: null,
      totalRequired: 0,
      totalMatched: 0
    }
  }

  const normalizedReqs = requirements.map(r => r.toLowerCase().trim())
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim())

  const matched: string[] = []
  const missing: string[] = []

  for (const req of normalizedReqs) {
    const isMatched = normalizedUser.some(skill => {
      // Exact match
      if (skill === req) return true
      // Partial match (skill contains requirement or vice versa)
      if (skill.includes(req) || req.includes(skill)) return true
      // Handle common variations
      const variations = getSkillVariations(req)
      return variations.some(v => skill.includes(v) || v.includes(skill))
    })

    if (isMatched) {
      matched.push(req)
    } else {
      missing.push(req)
    }
  }

  const matchPercentage = normalizedReqs.length > 0
    ? Math.round((matched.length / normalizedReqs.length) * 100)
    : 85 // Default if no requirements

  return {
    matchPercentage,
    matchedSkills: matched,
    missingSkills: missing.slice(0, 5), // Top 5 missing
    experienceGap: null, // TODO: Parse experience requirements
    totalRequired: normalizedReqs.length,
    totalMatched: matched.length
  }
}

/**
 * Get common variations of a skill name
 */
function getSkillVariations(skill: string): string[] {
  const variations = [skill]

  // Common variations
  const variationMap: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'customer service': ['customer support', 'client service', 'client support'],
    'microsoft office': ['ms office', 'office suite', 'word', 'excel', 'powerpoint'],
    'excel': ['spreadsheets', 'google sheets'],
    'communication': ['verbal', 'written', 'interpersonal'],
    'problem solving': ['problem-solving', 'analytical'],
    'time management': ['organizational', 'organization'],
  }

  if (variationMap[skill]) {
    variations.push(...variationMap[skill])
  }

  return variations
}

// =============================================================================
// QUICK WIN GENERATION
// =============================================================================

/**
 * Generate a quick win suggestion based on qualification gaps
 */
export function generateQuickWin(
  qualification: QualificationResult,
  userSkills: string[]
): QuickWinResult | null {
  if (qualification.missingSkills.length === 0) {
    return null
  }

  const topMissing = qualification.missingSkills[0]
  const potentialImpact = qualification.totalRequired > 0
    ? Math.round(100 / qualification.totalRequired)
    : 5

  // Check if user might have a related skill they could reframe
  const relatedSkill = findRelatedSkill(topMissing, userSkills)

  if (relatedSkill) {
    return {
      action: `Highlight your ${relatedSkill} experience as "${topMissing}"`,
      impact: `+${potentialImpact}% match`,
      timeEstimate: '3 min',
      type: 'reframe'
    }
  }

  // Check if it's a learnable skill (soft skill or basic tool)
  const isQuickLearnable = isQuicklyLearnable(topMissing)

  if (isQuickLearnable) {
    return {
      action: `Watch a quick tutorial on ${topMissing} basics`,
      impact: `+${potentialImpact}% match`,
      timeEstimate: '5 min',
      type: 'learn'
    }
  }

  // Default: suggest adding to resume
  return {
    action: `Add "${topMissing}" to your skills section if applicable`,
    impact: `+${potentialImpact}% match`,
    timeEstimate: '2 min',
    type: 'add_skill'
  }
}

/**
 * Find a related skill the user already has
 */
function findRelatedSkill(missing: string, userSkills: string[]): string | null {
  const relatedMap: Record<string, string[]> = {
    'customer service': ['retail', 'sales', 'hospitality', 'support'],
    'communication': ['presentation', 'writing', 'public speaking'],
    'excel': ['google sheets', 'spreadsheets', 'data analysis'],
    'leadership': ['management', 'team lead', 'supervisor'],
    'problem solving': ['analytical', 'troubleshooting', 'debugging'],
  }

  const relatedTerms = relatedMap[missing.toLowerCase()] || []

  for (const skill of userSkills) {
    const lowerSkill = skill.toLowerCase()
    for (const term of relatedTerms) {
      if (lowerSkill.includes(term)) {
        return skill
      }
    }
  }

  return null
}

/**
 * Check if a skill can be quickly learned
 */
function isQuicklyLearnable(skill: string): boolean {
  const quickLearnables = [
    'google sheets', 'google docs', 'google slides',
    'zoom', 'slack', 'teams', 'trello', 'asana',
    'basic excel', 'data entry', 'typing',
    'communication', 'customer service basics'
  ]

  return quickLearnables.some(s => skill.toLowerCase().includes(s))
}

// =============================================================================
// SAFETY CHECK
// =============================================================================

/**
 * Convert Scam Shield result to SafetyResult format
 */
export function checkSafety(job: JobForAnalysis): SafetyResult {
  // Convert job to format expected by scam shield
  const jobForScam: JobForScamCheck = {
    title: job.title,
    company: job.company,
    company_website: job.company_website,
    description: job.description,
    requirements: Array.isArray(job.requirements)
      ? job.requirements.join('\n')
      : job.requirements,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    contact_email: job.contact_email,
    location_address: job.location_address,
    employment_type: job.employment_type,
    apply_url: job.apply_url
  }

  const scamResult: ScamCheckResult = checkJobForScams(jobForScam)

  const statusMap: Record<string, 'safe' | 'caution' | 'warning' | 'danger'> = {
    'low': 'safe',
    'medium': 'caution',
    'high': 'warning',
    'critical': 'danger'
  }

  return {
    status: statusMap[scamResult.severity] || 'caution',
    severity: scamResult.severity.toUpperCase() as SafetyResult['severity'],
    flags: scamResult.flags.map(f => f.description),
    message: scamResult.message
  }
}

// =============================================================================
// VERDICT CALCULATION
// =============================================================================

/**
 * Calculate final verdict based on safety and qualification
 */
export function calculateVerdict(
  safety: SafetyResult,
  qualification: QualificationResult
): VerdictResult {
  // Safety first - high/critical severity means skip
  if (safety.severity === 'CRITICAL' || safety.severity === 'HIGH') {
    return {
      recommendation: 'SKIP',
      reason: 'This job has safety concerns. Proceed with caution or skip.',
      confidence: 95
    }
  }

  const match = qualification.matchPercentage

  // Strong match
  if (match >= 80) {
    return {
      recommendation: 'APPLY_NOW',
      reason: "You're a strong match for this role. Apply with confidence!",
      confidence: 90
    }
  }

  // Good match with room for improvement
  if (match >= 60) {
    return {
      recommendation: 'CONSIDER',
      reason: 'You meet most requirements. Use the quick win to boost your chances.',
      confidence: 75
    }
  }

  // Stretch opportunity
  if (match >= 40) {
    return {
      recommendation: 'CONSIDER',
      reason: "This is a stretch role. Emphasize transferable skills if you apply.",
      confidence: 60
    }
  }

  // Low match
  return {
    recommendation: 'SKIP',
    reason: "You may not meet enough requirements. Consider similar roles that better match your skills.",
    confidence: 70
  }
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Analyze a job for fit, safety, and actionable suggestions
 */
export async function analyzeJob(
  job: JobForAnalysis,
  userProfile: UserProfile
): Promise<AnalysisResult> {
  // 1. Safety check (via Scam Shield)
  const safety = checkSafety(job)

  // 2. Extract requirements and match skills
  const requirements = extractRequirements(job)
  const qualification = matchSkills(requirements, userProfile.skills || [])

  // 3. Generate quick win suggestion
  const quickWin = generateQuickWin(qualification, userProfile.skills || [])

  // 4. Calculate verdict
  const verdict = calculateVerdict(safety, qualification)

  return {
    safety,
    qualification,
    quickWin,
    verdict,
    analyzedAt: new Date().toISOString()
  }
}

/**
 * Quick analysis without full user profile (uses defaults)
 */
export async function quickAnalyze(job: JobForAnalysis): Promise<AnalysisResult> {
  return analyzeJob(job, { skills: [] })
}
