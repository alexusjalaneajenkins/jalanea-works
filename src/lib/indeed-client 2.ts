/**
 * Indeed API Client
 *
 * Integrates with Indeed's Job Search API to fetch real job listings.
 *
 * Setup:
 * 1. Get a Publisher ID at https://www.indeed.com/publisher
 * 2. Add INDEED_PUBLISHER_ID to .env.local
 *
 * Rate Limits:
 * - Free tier: 1000 calls/day
 * - Track usage to avoid hitting limits
 *
 * Note: Indeed API is deprecated for new users. If unavailable,
 * consider alternatives like:
 * - RapidAPI's JSearch API
 * - SerpAPI Jobs API
 * - Adzuna API
 * - CareerJet API
 */

// Types
export interface IndeedSearchParams {
  q?: string              // Search query (job title, keywords)
  l?: string              // Location (city, state, or zip)
  radius?: number         // Search radius in miles (default: 25)
  jt?: IndeedJobType      // Job type
  salary?: string         // Salary filter (e.g., "$50000")
  fromage?: number        // Days since posted (1, 3, 7, 14, 30)
  start?: number          // Result offset for pagination
  limit?: number          // Results per page (max: 25)
  sort?: 'relevance' | 'date'  // Sort order
  highlight?: boolean     // Highlight search terms in results
  latlong?: boolean       // Return lat/lng coordinates
  co?: string             // Country code (default: 'us')
}

export type IndeedJobType = 'fulltime' | 'parttime' | 'contract' | 'internship' | 'temporary'

export interface IndeedJob {
  jobkey: string          // Unique job ID
  jobtitle: string        // Job title
  company: string         // Company name
  city: string            // City
  state: string           // State
  country: string         // Country
  formattedLocation: string  // Formatted location string
  source: string          // Job source
  date: string            // Posted date
  snippet: string         // Job description snippet
  url: string             // Indeed job URL
  latitude?: number       // Job location latitude
  longitude?: number      // Job location longitude
  formattedRelativeTime: string  // "2 days ago"
  noUniqueUrl?: boolean   // Whether URL is unique
  indeedApply?: boolean   // Supports Indeed Apply
  expired?: boolean       // Job expired
  salary?: string         // Salary info if available
}

export interface IndeedSearchResponse {
  version: number
  query: string
  location: string
  dupefilter: boolean
  highlight: boolean
  totalResults: number
  start: number
  end: number
  pageNumber: number
  results: IndeedJob[]
}

export interface IndeedApiError {
  error: string
  message: string
}

// Indeed API base URL
const INDEED_API_BASE = 'https://api.indeed.com/ads/apisearch'

// Cache for tracking API calls
let apiCallCount = 0
let lastResetDate = new Date().toDateString()

/**
 * Search jobs on Indeed
 */
export async function searchIndeedJobs(params: IndeedSearchParams): Promise<IndeedSearchResponse> {
  const publisherId = process.env.INDEED_PUBLISHER_ID

  if (!publisherId) {
    console.warn('INDEED_PUBLISHER_ID not set - using mock data')
    return getMockIndeedResponse(params)
  }

  // Track API calls
  const today = new Date().toDateString()
  if (today !== lastResetDate) {
    apiCallCount = 0
    lastResetDate = today
  }

  if (apiCallCount >= 950) {
    console.warn('Approaching Indeed API daily limit - using cached/mock data')
    return getMockIndeedResponse(params)
  }

  // Build query parameters
  const searchParams = new URLSearchParams({
    publisher: publisherId,
    format: 'json',
    v: '2', // API version
    q: params.q || '',
    l: params.l || 'Orlando, FL',
    radius: String(params.radius || 25),
    sort: params.sort || 'relevance',
    start: String(params.start || 0),
    limit: String(Math.min(params.limit || 10, 25)),
    latlong: String(params.latlong ?? true),
    co: params.co || 'us',
    userip: '1.2.3.4', // Required by API
    useragent: 'JalaneaWorks/1.0'
  })

  if (params.jt) {
    searchParams.set('jt', params.jt)
  }

  if (params.fromage) {
    searchParams.set('fromage', String(params.fromage))
  }

  if (params.salary) {
    searchParams.set('salary', params.salary)
  }

  if (params.highlight !== undefined) {
    searchParams.set('highlight', params.highlight ? '1' : '0')
  }

  try {
    const response = await fetch(`${INDEED_API_BASE}?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Indeed API error: ${response.status}`)
    }

    apiCallCount++
    const data = await response.json()

    return data as IndeedSearchResponse
  } catch (error) {
    console.error('Indeed API error:', error)
    // Fall back to mock data on error
    return getMockIndeedResponse(params)
  }
}

/**
 * Transform Indeed job to our internal Job format
 */
export function transformIndeedJob(indeedJob: IndeedJob): {
  id: string
  externalId: string
  source: 'indeed'
  title: string
  company: string
  location: string
  locationCity: string
  locationState: string
  latitude?: number
  longitude?: number
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  description: string
  applicationUrl: string
  postedAt: string
  indeedApply: boolean
} {
  // Parse salary if available
  const { min, max, type } = parseSalary(indeedJob.salary)

  // Parse relative time to actual date
  const postedAt = parseRelativeTime(indeedJob.formattedRelativeTime)

  return {
    id: generateJobId(indeedJob.jobkey),
    externalId: indeedJob.jobkey,
    source: 'indeed',
    title: indeedJob.jobtitle,
    company: indeedJob.company,
    location: indeedJob.formattedLocation,
    locationCity: indeedJob.city,
    locationState: indeedJob.state,
    latitude: indeedJob.latitude,
    longitude: indeedJob.longitude,
    salaryMin: min,
    salaryMax: max,
    salaryType: type,
    description: indeedJob.snippet,
    applicationUrl: indeedJob.url,
    postedAt,
    indeedApply: indeedJob.indeedApply || false
  }
}

/**
 * Parse Indeed salary string
 */
function parseSalary(salaryStr?: string): {
  min?: number
  max?: number
  type?: 'hourly' | 'yearly'
} {
  if (!salaryStr) return {}

  const hourlyMatch = salaryStr.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:an?\s*hour|\/\s*hr|hourly)/i)
  if (hourlyMatch) {
    return {
      min: parseFloat(hourlyMatch[1].replace(/,/g, '')),
      max: parseFloat(hourlyMatch[2].replace(/,/g, '')),
      type: 'hourly'
    }
  }

  const singleHourly = salaryStr.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:an?\s*hour|\/\s*hr|hourly)/i)
  if (singleHourly) {
    const rate = parseFloat(singleHourly[1].replace(/,/g, ''))
    return { min: rate, max: rate, type: 'hourly' }
  }

  const yearlyMatch = salaryStr.match(/\$(\d+(?:,\d{3})*)\s*(?:-|to)\s*\$(\d+(?:,\d{3})*)\s*(?:a?\s*year|annually|\/\s*yr)/i)
  if (yearlyMatch) {
    return {
      min: parseFloat(yearlyMatch[1].replace(/,/g, '')),
      max: parseFloat(yearlyMatch[2].replace(/,/g, '')),
      type: 'yearly'
    }
  }

  const singleYearly = salaryStr.match(/\$(\d+(?:,\d{3})*)\s*(?:a?\s*year|annually|\/\s*yr)/i)
  if (singleYearly) {
    const salary = parseFloat(singleYearly[1].replace(/,/g, ''))
    return { min: salary, max: salary, type: 'yearly' }
  }

  // Just a number - assume yearly if > $100, hourly if less
  const plainNumber = salaryStr.match(/\$(\d+(?:,\d{3})*)/)
  if (plainNumber) {
    const value = parseFloat(plainNumber[1].replace(/,/g, ''))
    if (value > 100) {
      return { min: value, max: value, type: 'yearly' }
    }
    return { min: value, max: value, type: 'hourly' }
  }

  return {}
}

/**
 * Parse relative time string to ISO date
 */
function parseRelativeTime(relativeTime: string): string {
  const now = new Date()
  const lower = relativeTime.toLowerCase()

  if (lower.includes('just posted') || lower.includes('today')) {
    return now.toISOString()
  }

  const daysMatch = lower.match(/(\d+)\+?\s*days?\s*ago/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1])
    now.setDate(now.getDate() - days)
    return now.toISOString()
  }

  const weeksMatch = lower.match(/(\d+)\+?\s*weeks?\s*ago/)
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1])
    now.setDate(now.getDate() - weeks * 7)
    return now.toISOString()
  }

  const monthsMatch = lower.match(/(\d+)\+?\s*months?\s*ago/)
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1])
    now.setMonth(now.getMonth() - months)
    return now.toISOString()
  }

  return now.toISOString()
}

/**
 * Generate a unique job ID
 */
function generateJobId(externalId: string): string {
  // Create a deterministic ID from the external ID
  return `indeed_${externalId}`
}

/**
 * Get API call count for monitoring
 */
export function getApiUsage(): { count: number; limit: number; remaining: number } {
  return {
    count: apiCallCount,
    limit: 1000,
    remaining: 1000 - apiCallCount
  }
}

// =============================================================================
// MOCK DATA FOR DEVELOPMENT / FALLBACK
// =============================================================================

function getMockIndeedResponse(params: IndeedSearchParams): IndeedSearchResponse {
  const mockJobs: IndeedJob[] = [
    {
      jobkey: 'mock_001',
      jobtitle: 'Customer Service Representative',
      company: 'Orlando Health',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Orlando Health',
      date: new Date().toISOString(),
      snippet: 'Join our team as a Customer Service Representative. Handle patient inquiries, schedule appointments, and provide excellent customer service. Requirements: High school diploma, 1+ years customer service experience.',
      url: 'https://www.indeed.com/viewjob?jk=mock_001',
      formattedRelativeTime: '2 days ago',
      indeedApply: true,
      salary: '$32,000 - $40,000 a year'
    },
    {
      jobkey: 'mock_002',
      jobtitle: 'Administrative Assistant',
      company: 'Valencia College',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Valencia College',
      date: new Date().toISOString(),
      snippet: 'Support administrative operations at Valencia College. Manage calendars, coordinate meetings, and assist faculty and staff. Must have excellent organizational skills and proficiency in Microsoft Office.',
      url: 'https://www.indeed.com/viewjob?jk=mock_002',
      formattedRelativeTime: '1 day ago',
      indeedApply: true,
      salary: '$35,000 - $42,000 a year'
    },
    {
      jobkey: 'mock_003',
      jobtitle: 'Retail Sales Associate',
      company: 'Target',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL 32801',
      source: 'Target',
      date: new Date().toISOString(),
      snippet: 'Help guests find what they need and provide an exceptional shopping experience. Flexible scheduling, team discounts, and growth opportunities.',
      url: 'https://www.indeed.com/viewjob?jk=mock_003',
      formattedRelativeTime: '5 days ago',
      indeedApply: false,
      salary: '$15 - $18 an hour'
    },
    {
      jobkey: 'mock_004',
      jobtitle: 'Help Desk Technician',
      company: 'Lockheed Martin',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Lockheed Martin',
      date: new Date().toISOString(),
      snippet: 'Provide technical support to internal teams. Troubleshoot hardware and software issues, manage tickets, and maintain IT documentation. A+ certification preferred.',
      url: 'https://www.indeed.com/viewjob?jk=mock_004',
      formattedRelativeTime: 'Just posted',
      indeedApply: true,
      salary: '$45,000 - $55,000 a year',
      latitude: 28.4747,
      longitude: -81.3010
    },
    {
      jobkey: 'mock_005',
      jobtitle: 'Medical Receptionist',
      company: 'AdventHealth',
      city: 'Winter Park',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Winter Park, FL',
      source: 'AdventHealth',
      date: new Date().toISOString(),
      snippet: 'Front desk receptionist for busy medical office. Check in patients, verify insurance, and handle phone inquiries. Medical office experience required.',
      url: 'https://www.indeed.com/viewjob?jk=mock_005',
      formattedRelativeTime: '3 days ago',
      indeedApply: true,
      salary: '$30,000 - $38,000 a year'
    },
    {
      jobkey: 'mock_006',
      jobtitle: 'Junior Web Developer',
      company: 'Tech Orlando',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Tech Orlando',
      date: new Date().toISOString(),
      snippet: 'Join our growing team as a junior web developer. Work with React, Node.js, and modern web technologies. Great opportunity for Valencia College CS graduates.',
      url: 'https://www.indeed.com/viewjob?jk=mock_006',
      formattedRelativeTime: '4 days ago',
      indeedApply: true,
      salary: '$48,000 - $62,000 a year',
      latitude: 28.5383,
      longitude: -81.3792
    },
    {
      jobkey: 'mock_007',
      jobtitle: 'Restaurant Server',
      company: 'Olive Garden',
      city: 'Kissimmee',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Kissimmee, FL',
      source: 'Olive Garden',
      date: new Date().toISOString(),
      snippet: 'Serve guests with a smile at our Kissimmee location. Flexible hours, meal discounts, and growth opportunities. No experience necessary.',
      url: 'https://www.indeed.com/viewjob?jk=mock_007',
      formattedRelativeTime: '7 days ago',
      indeedApply: false,
      salary: '$12 - $15 an hour'
    },
    {
      jobkey: 'mock_008',
      jobtitle: 'Warehouse Associate',
      company: 'Amazon',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL 32824',
      source: 'Amazon',
      date: new Date().toISOString(),
      snippet: 'Join our Orlando fulfillment center team. Pick, pack, and ship customer orders. Must be able to lift 50 lbs. Benefits include health insurance, 401k.',
      url: 'https://www.indeed.com/viewjob?jk=mock_008',
      formattedRelativeTime: '3 days ago',
      indeedApply: true,
      salary: '$17 - $21 an hour',
      latitude: 28.4209,
      longitude: -81.4162
    },
    {
      jobkey: 'mock_009',
      jobtitle: 'Accounting Clerk',
      company: 'Darden Restaurants',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Darden Restaurants',
      date: new Date().toISOString(),
      snippet: 'Process invoices, reconcile accounts, and support the accounting team. Associates degree in Accounting required. QuickBooks experience preferred.',
      url: 'https://www.indeed.com/viewjob?jk=mock_009',
      formattedRelativeTime: '2 days ago',
      indeedApply: true,
      salary: '$38,000 - $45,000 a year'
    },
    {
      jobkey: 'mock_010',
      jobtitle: 'Security Officer',
      company: 'Universal Orlando Resort',
      city: 'Orlando',
      state: 'FL',
      country: 'US',
      formattedLocation: 'Orlando, FL',
      source: 'Universal Orlando Resort',
      date: new Date().toISOString(),
      snippet: 'Ensure safety of guests and team members. Patrol assigned areas, respond to incidents, and provide excellent guest service. Must pass background check.',
      url: 'https://www.indeed.com/viewjob?jk=mock_010',
      formattedRelativeTime: '1 day ago',
      indeedApply: true,
      salary: '$16 - $19 an hour'
    }
  ]

  // Filter by query if provided
  let filteredJobs = mockJobs
  if (params.q) {
    const query = params.q.toLowerCase()
    filteredJobs = mockJobs.filter(job =>
      job.jobtitle.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.snippet.toLowerCase().includes(query)
    )
  }

  // Filter by location if provided
  if (params.l && !params.l.toLowerCase().includes('orlando')) {
    filteredJobs = filteredJobs.filter(job =>
      job.formattedLocation.toLowerCase().includes(params.l!.toLowerCase())
    )
  }

  // Pagination
  const start = params.start || 0
  const limit = params.limit || 10
  const paginatedJobs = filteredJobs.slice(start, start + limit)

  return {
    version: 2,
    query: params.q || '',
    location: params.l || 'Orlando, FL',
    dupefilter: true,
    highlight: false,
    totalResults: filteredJobs.length,
    start,
    end: start + paginatedJobs.length,
    pageNumber: Math.floor(start / limit) + 1,
    results: paginatedJobs
  }
}

export default searchIndeedJobs
