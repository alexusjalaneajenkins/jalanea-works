/**
 * O*NET Web Services API Client
 *
 * Integrates with O*NET (Occupational Information Network) to fetch
 * detailed career data including job descriptions, skills, education
 * requirements, salary information, and job outlook.
 *
 * API Documentation: https://services.onetcenter.org/reference/
 *
 * Setup:
 * 1. Register at https://services.onetcenter.org/developer/
 * 2. Add ONET_API_KEY to .env.local
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ONetOccupation {
  code: string           // O*NET-SOC code (e.g., "15-1254.00")
  title: string          // Occupation title
  description?: string   // Job description
  tags?: {
    bright_outlook?: boolean
    green?: boolean
    apprenticeship?: boolean
  }
}

export interface ONetOccupationDetail extends ONetOccupation {
  also_called?: string[]        // Alternative job titles
  what_they_do?: string         // Brief description
  on_the_job?: string[]         // Typical tasks
  skills?: ONetSkill[]
  knowledge?: ONetKnowledge[]
  abilities?: ONetAbility[]
  technology?: ONetTechnology[]
  education?: ONetEducation
  job_outlook?: ONetJobOutlook
  wages?: ONetWages
  related_occupations?: ONetRelatedOccupation[]
}

export interface ONetSkill {
  id: string
  name: string
  description?: string
  category?: string
  level?: {
    value: number
    scale_name: string
  }
}

export interface ONetKnowledge {
  id: string
  name: string
  description?: string
  level?: {
    value: number
    scale_name: string
  }
}

export interface ONetAbility {
  id: string
  name: string
  description?: string
  level?: {
    value: number
    scale_name: string
  }
}

export interface ONetTechnology {
  name: string
  hot_technology?: boolean
  category?: string
}

export interface ONetEducation {
  level_required?: string
  education_usually_needed?: string
  experience_in_related_occupation?: string
  on_the_job_training?: string
}

export interface ONetJobOutlook {
  outlook?: 'bright' | 'average' | 'below_average'
  outlook_description?: string
  salary_median?: number
  salary_range?: {
    low: number
    median: number
    high: number
  }
  projected_growth?: string
  projected_openings?: number
  category?: string
}

export interface ONetWages {
  national_median?: number
  national_annual?: {
    pct10: number
    pct25: number
    median: number
    pct75: number
    pct90: number
  }
  national_hourly?: {
    pct10: number
    pct25: number
    median: number
    pct75: number
    pct90: number
  }
}

export interface ONetRelatedOccupation {
  code: string
  title: string
  href?: string
}

export interface ONetSearchParams {
  keyword?: string           // Search keyword
  start?: number             // Pagination start (1-based)
  end?: number               // Pagination end
}

export interface ONetSearchResponse {
  keyword?: string
  total: number
  start: number
  end: number
  occupation: ONetOccupation[]
}

export interface ONetCareerSearchParams {
  keyword: string
  start?: number
  end?: number
}

export interface ONetCareerSearchResponse {
  keyword: string
  total: number
  start: number
  end: number
  career: ONetCareer[]
}

export interface ONetCareer {
  code: string
  title: string
  href: string
  tags?: {
    bright_outlook?: boolean
    green?: boolean
    apprenticeship?: boolean
  }
  fit?: string  // 'Best', 'Great', 'Good'
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const ONET_BASE_URL = 'https://api-v2.onetcenter.org'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// =============================================================================
// API HELPERS
// =============================================================================

/**
 * Check if O*NET API is available
 */
export function isONetAvailable(): boolean {
  return !!(process.env.ONET_API_KEY || process.env.ONET_USERNAME)
}

/**
 * Get API headers for O*NET requests
 * O*NET API v2 uses X-API-Key header authentication
 */
function getHeaders(): HeadersInit {
  const apiKey = process.env.ONET_API_KEY || process.env.ONET_USERNAME
  if (!apiKey) {
    throw new Error('ONET_API_KEY not configured')
  }

  return {
    'X-API-Key': apiKey,
    'Accept': 'application/json',
  }
}

/**
 * Make authenticated request to O*NET API
 */
async function onetFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  if (!isONetAvailable()) {
    throw new Error('O*NET API key not configured')
  }

  const url = new URL(`${ONET_BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const cacheKey = url.toString()
  const cached = getCached<T>(cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid O*NET API key')
    }
    if (response.status === 404) {
      throw new Error('O*NET resource not found')
    }
    if (response.status === 422) {
      const error = await response.json()
      throw new Error(`O*NET API error: ${error.error || 'Unknown error'}`)
    }
    throw new Error(`O*NET API error: ${response.status}`)
  }

  const data = await response.json() as T
  setCache(cacheKey, data)
  return data
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Search occupations by keyword
 * Uses O*NET OnLine browse endpoint
 */
export async function searchOccupations(
  keyword: string,
  options: { start?: number; end?: number } = {}
): Promise<ONetSearchResponse> {
  const { start = 1, end = 20 } = options

  return onetFetch<ONetSearchResponse>('/online/search', {
    keyword,
    start: String(start),
    end: String(end),
  })
}

/**
 * Search careers using My Next Move API
 * Better for career exploration with fit scores
 */
export async function searchCareers(
  keyword: string,
  options: { start?: number; end?: number } = {}
): Promise<ONetCareerSearchResponse> {
  const { start = 1, end = 20 } = options

  return onetFetch<ONetCareerSearchResponse>('/mnm/search', {
    keyword,
    start: String(start),
    end: String(end),
  })
}

/**
 * Get detailed information about an occupation
 * Uses O*NET API v2 My Next Move endpoints
 */
export async function getOccupationDetails(code: string): Promise<ONetOccupationDetail> {
  // V2 API types
  interface V2CareerSummary {
    code: string
    title: string
    tags?: { bright_outlook?: boolean; green?: boolean; apprenticeship?: boolean }
    also_called?: Array<{ title: string }>
    what_they_do?: string
    on_the_job?: string[]
  }
  interface V2Skill { id: string; name: string; description?: string; score?: { value: number } }
  interface V2Knowledge { id: string; name: string; description?: string; score?: { value: number } }
  interface V2Ability { id: string; name: string; description?: string; score?: { value: number } }
  interface V2Technology { category?: { title: string }; example?: Array<{ name: string; hot_technology?: boolean }> }
  interface V2Education { education_usually_needed?: { category: Array<{ name: string }> }; experience?: { category?: { name: string } } }
  interface V2JobOutlook { bright_outlook?: { description?: string }; salary?: { annual_median?: number }; outlook?: { description?: string; category?: string } }

  const [summary, skills, knowledge, abilities, technology, education, outlook] =
    await Promise.all([
      onetFetch<V2CareerSummary>(`/mnm/careers/${code}/`),
      onetFetch<{ element?: V2Skill[] }>(`/mnm/careers/${code}/skills`).catch(() => ({ element: [] })),
      onetFetch<{ element?: V2Knowledge[] }>(`/mnm/careers/${code}/knowledge`).catch(() => ({ element: [] })),
      onetFetch<{ element?: V2Ability[] }>(`/mnm/careers/${code}/abilities`).catch(() => ({ element: [] })),
      onetFetch<{ category?: V2Technology[] }>(`/mnm/careers/${code}/technology`).catch(() => ({ category: [] })),
      onetFetch<V2Education>(`/mnm/careers/${code}/education`).catch(() => ({})),
      onetFetch<V2JobOutlook>(`/mnm/careers/${code}/job_outlook`).catch(() => ({})),
    ])

  // Transform technology response
  const technologyList: ONetTechnology[] = []
  if (technology.category) {
    technology.category.forEach((cat) => {
      if (cat.example) {
        cat.example.forEach((tech) => {
          technologyList.push({
            name: tech.name,
            hot_technology: tech.hot_technology,
            category: cat.category?.title,
          })
        })
      }
    })
  }

  // Transform skills/knowledge/abilities
  const transformedSkills: ONetSkill[] = (skills.element || []).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    level: s.score ? { value: s.score.value, scale_name: 'Importance' } : undefined,
  }))

  const transformedKnowledge: ONetKnowledge[] = (knowledge.element || []).map(k => ({
    id: k.id,
    name: k.name,
    description: k.description,
    level: k.score ? { value: k.score.value, scale_name: 'Importance' } : undefined,
  }))

  const transformedAbilities: ONetAbility[] = (abilities.element || []).map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    level: a.score ? { value: a.score.value, scale_name: 'Importance' } : undefined,
  }))

  return {
    code: summary.code,
    title: summary.title,
    tags: summary.tags,
    description: summary.what_they_do,
    also_called: summary.also_called?.map(a => a.title),
    what_they_do: summary.what_they_do,
    on_the_job: summary.on_the_job,
    skills: transformedSkills,
    knowledge: transformedKnowledge,
    abilities: transformedAbilities,
    technology: technologyList,
    education: 'education_usually_needed' in education ? {
      education_usually_needed: education.education_usually_needed?.category?.[0]?.name,
      experience_in_related_occupation: 'experience' in education ? education.experience?.category?.name : undefined,
    } : undefined,
    job_outlook: 'salary' in outlook || 'outlook' in outlook || 'bright_outlook' in outlook ? {
      outlook: 'bright_outlook' in outlook && outlook.bright_outlook ? 'bright' : ('outlook' in outlook ? (outlook.outlook?.category as 'bright' | 'average' | 'below_average') : 'average'),
      outlook_description: 'outlook' in outlook ? outlook.outlook?.description : ('bright_outlook' in outlook ? outlook.bright_outlook?.description : undefined),
      salary_median: 'salary' in outlook ? outlook.salary?.annual_median : undefined,
    } : undefined,
  }
}

/**
 * Get related occupations for a given occupation code
 */
export async function getRelatedOccupations(code: string): Promise<ONetRelatedOccupation[]> {
  const response = await onetFetch<{ careers?: Array<{ code: string; title: string; href?: string }> }>(
    `/mnm/careers/${code}/explore_more`
  )
  return (response.careers || []).map(c => ({
    code: c.code,
    title: c.title,
    href: c.href,
  }))
}

/**
 * Get occupation by SOC code (the code returned by JSearch)
 */
export async function getOccupationBySOC(socCode: string): Promise<ONetOccupationDetail | null> {
  try {
    // O*NET codes are SOC codes with a suffix (e.g., "15-1254.00")
    // JSearch returns codes like "15-1254.00"
    return await getOccupationDetails(socCode)
  } catch (error) {
    console.error(`Failed to get O*NET data for SOC ${socCode}:`, error)
    return null
  }
}

/**
 * Get career paths for a program/degree
 * Searches O*NET and returns relevant careers based on keywords
 */
export async function getCareerPathsForProgram(
  programName: string,
  keywords: string[] = []
): Promise<ONetCareer[]> {
  const allCareers: ONetCareer[] = []
  const seenCodes = new Set<string>()

  // Search by program name
  const programResults = await searchCareers(programName, { start: 1, end: 10 })
  programResults.career.forEach(career => {
    if (!seenCodes.has(career.code)) {
      seenCodes.add(career.code)
      allCareers.push(career)
    }
  })

  // Search by each keyword
  for (const keyword of keywords.slice(0, 3)) { // Limit to 3 keywords
    try {
      const keywordResults = await searchCareers(keyword, { start: 1, end: 5 })
      keywordResults.career.forEach(career => {
        if (!seenCodes.has(career.code)) {
          seenCodes.add(career.code)
          allCareers.push(career)
        }
      })
    } catch {
      // Continue if keyword search fails
    }
  }

  return allCareers
}

/**
 * Get wages data for a location
 */
export async function getLocationWages(
  code: string,
  location: string
): Promise<ONetWages | null> {
  try {
    const response = await onetFetch<{ wage: ONetWages[] }>(
      `/online/occupations/${code}/details/wages`,
      { area: location }
    )
    return response.wage?.[0] || null
  } catch {
    return null
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Map O*NET job zone to education level
 */
export function jobZoneToEducation(jobZone: string): string {
  switch (jobZone) {
    case '1':
      return 'Little or no preparation needed'
    case '2':
      return 'Some preparation needed (high school diploma)'
    case '3':
      return 'Medium preparation needed (vocational training or associate degree)'
    case '4':
      return 'Considerable preparation needed (bachelor\'s degree)'
    case '5':
      return 'Extensive preparation needed (graduate degree)'
    default:
      return 'Varies'
  }
}

/**
 * Parse O*NET growth outlook to our internal format
 */
export function parseGrowthOutlook(outlook: string | undefined):
  'very high' | 'high' | 'moderate-high' | 'moderate' | 'low-moderate' | 'low' {
  if (!outlook) return 'moderate'

  const lower = outlook.toLowerCase()
  if (lower.includes('much faster') || lower.includes('very high')) return 'very high'
  if (lower.includes('faster') || lower.includes('high')) return 'high'
  if (lower.includes('average')) return 'moderate'
  if (lower.includes('slower') || lower.includes('little')) return 'low-moderate'
  if (lower.includes('decline')) return 'low'

  return 'moderate'
}

/**
 * Convert O*NET career to our CareerPath format
 */
export function onetCareerToCareerPath(career: ONetCareer, details?: ONetOccupationDetail) {
  return {
    id: career.code,
    onet_code: career.code,
    title: career.title,
    title_es: career.title, // TODO: Add translation
    salary_min: details?.job_outlook?.salary_median ? Math.floor(details.job_outlook.salary_median * 0.7) : null,
    salary_max: details?.job_outlook?.salary_median ? Math.floor(details.job_outlook.salary_median * 1.3) : null,
    growth_rate: parseGrowthOutlook(details?.job_outlook?.projected_growth),
    description: details?.description,
    bright_outlook: career.tags?.bright_outlook || false,
    green_job: career.tags?.green || false,
    apprenticeship: career.tags?.apprenticeship || false,
  }
}

export default {
  isONetAvailable,
  searchOccupations,
  searchCareers,
  getOccupationDetails,
  getRelatedOccupations,
  getOccupationBySOC,
  getCareerPathsForProgram,
  getLocationWages,
  jobZoneToEducation,
  parseGrowthOutlook,
  onetCareerToCareerPath,
}
