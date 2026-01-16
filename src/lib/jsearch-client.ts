/**
 * JSearch API Client
 *
 * Integrates with JSearch (via RapidAPI) to fetch real job listings.
 * JSearch aggregates jobs from LinkedIn, Indeed, Glassdoor, ZipRecruiter, and other sources.
 *
 * Setup:
 * 1. Get a RapidAPI key at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * 2. Add RAPIDAPI_KEY to .env.local
 *
 * Rate Limits:
 * - Free: 500 requests/month
 * - Basic ($50/mo): 10,000 requests/month
 * - Pro ($150/mo): 100,000 requests/month
 */

// Types
export interface JSearchParams {
  query: string                // Search query (e.g., "customer service in Orlando, FL")
  page?: number                // Page number (default 1)
  num_pages?: number           // Number of pages to return (default 1)
  date_posted?: 'all' | 'today' | '3days' | 'week' | 'month'
  remote_jobs_only?: boolean   // Filter for remote jobs
  employment_types?: string    // Comma-separated: "FULLTIME,PARTTIME,CONTRACTOR,INTERN"
  job_requirements?: string    // "under_3_years_experience", "more_than_3_years_experience", "no_experience", "no_degree"
  radius?: number              // Search radius in miles (default 50)
  country?: string             // Country code (default: 'us')
}

export interface JSearchJob {
  job_id: string
  employer_name: string
  employer_logo: string | null
  employer_website: string | null
  employer_company_type: string | null
  job_publisher: string
  job_employment_type: string
  job_title: string
  job_apply_link: string
  job_apply_is_direct: boolean
  job_apply_quality_score: number
  job_description: string
  job_is_remote: boolean
  job_posted_at_timestamp: number
  job_posted_at_datetime_utc: string
  job_city: string
  job_state: string
  job_country: string
  job_latitude: number | null
  job_longitude: number | null
  job_benefits: string[] | null
  job_google_link: string
  job_offer_expiration_datetime_utc: string | null
  job_required_experience: {
    no_experience_required: boolean
    required_experience_in_months: number | null
    experience_mentioned: boolean
    experience_preferred: boolean
  }
  job_required_skills: string[] | null
  job_required_education: {
    postgraduate_degree: boolean
    professional_certification: boolean
    high_school: boolean
    associates_degree: boolean
    bachelors_degree: boolean
    degree_mentioned: boolean
    degree_preferred: boolean
    professional_certification_mentioned: boolean
  }
  job_experience_in_place_of_education: boolean
  job_min_salary: number | null
  job_max_salary: number | null
  job_salary_currency: string | null
  job_salary_period: string | null  // "YEAR", "MONTH", "HOUR"
  job_highlights: {
    Qualifications?: string[]
    Responsibilities?: string[]
    Benefits?: string[]
  }
  job_job_title: string | null
  job_posting_language: string
  job_onet_soc: string
  job_onet_job_zone: string
  job_naics_code: string | null
  job_naics_name: string | null
}

export interface JSearchResponse {
  status: string
  request_id: string
  parameters: Record<string, string>
  data: JSearchJob[]
}

export interface JSearchDetailResponse {
  status: string
  request_id: string
  data: JSearchJob[]
}

export interface SalaryEstimate {
  location: string
  job_title: string
  publisher_name: string
  publisher_link: string
  min_salary: number
  max_salary: number
  median_salary: number
  salary_period: string
  salary_currency: string
}

export interface SalaryEstimateResponse {
  status: string
  request_id: string
  data: SalaryEstimate[]
}

// JSearch API configuration
const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com'
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'

// Track API usage
let monthlyApiCalls = 0
let lastMonthReset = new Date().toISOString().slice(0, 7) // YYYY-MM format

function resetMonthlyCountIfNeeded() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  if (currentMonth !== lastMonthReset) {
    monthlyApiCalls = 0
    lastMonthReset = currentMonth
  }
}

/**
 * Check if JSearch API is available
 */
export function isJSearchAvailable(): boolean {
  return !!process.env.RAPIDAPI_KEY
}

/**
 * Get API headers for JSearch requests
 */
function getHeaders(): HeadersInit {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY not configured')
  }
  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': RAPIDAPI_HOST
  }
}

/**
 * Search jobs using JSearch API
 */
export async function searchJobs(params: JSearchParams): Promise<JSearchResponse> {
  resetMonthlyCountIfNeeded()

  // Check rate limit
  if (monthlyApiCalls >= 450) { // Leave buffer before 500 limit
    console.warn('Approaching JSearch API monthly limit - using cached/fallback data')
    return getFallbackSearchResponse(params)
  }

  if (!isJSearchAvailable()) {
    console.warn('RAPIDAPI_KEY not set - using fallback data')
    return getFallbackSearchResponse(params)
  }

  try {
    const searchParams = new URLSearchParams({
      query: params.query,
      page: String(params.page || 1),
      num_pages: String(params.num_pages || 1),
      country: params.country || 'us'
    })

    if (params.date_posted && params.date_posted !== 'all') {
      searchParams.set('date_posted', params.date_posted)
    }

    if (params.remote_jobs_only) {
      searchParams.set('remote_jobs_only', 'true')
    }

    if (params.employment_types) {
      searchParams.set('employment_types', params.employment_types)
    }

    if (params.job_requirements) {
      searchParams.set('job_requirements', params.job_requirements)
    }

    if (params.radius) {
      searchParams.set('radius', String(params.radius))
    }

    const response = await fetch(
      `${JSEARCH_BASE_URL}/search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    monthlyApiCalls++

    if (!response.ok) {
      throw await handleJSearchError(response)
    }

    const data = await response.json()
    return data as JSearchResponse
  } catch (error) {
    console.error('JSearch API error:', error)
    return getFallbackSearchResponse(params)
  }
}

/**
 * Get job details by job ID
 */
export async function getJobDetails(jobId: string): Promise<JSearchJob | null> {
  resetMonthlyCountIfNeeded()

  if (monthlyApiCalls >= 450 || !isJSearchAvailable()) {
    return null
  }

  try {
    const searchParams = new URLSearchParams({
      job_id: jobId,
      extended_publisher_details: 'false'
    })

    const response = await fetch(
      `${JSEARCH_BASE_URL}/job-details?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    monthlyApiCalls++

    if (!response.ok) {
      throw await handleJSearchError(response)
    }

    const data: JSearchDetailResponse = await response.json()
    return data.data?.[0] || null
  } catch (error) {
    console.error('JSearch job details error:', error)
    return null
  }
}

/**
 * Get estimated salary for a job title and location
 */
export async function getEstimatedSalary(params: {
  job_title: string
  location: string
  radius?: number
}): Promise<SalaryEstimate[] | null> {
  resetMonthlyCountIfNeeded()

  if (monthlyApiCalls >= 450 || !isJSearchAvailable()) {
    return null
  }

  try {
    const searchParams = new URLSearchParams({
      job_title: params.job_title,
      location: params.location,
      radius: String(params.radius || 50)
    })

    const response = await fetch(
      `${JSEARCH_BASE_URL}/estimated-salary?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    )

    monthlyApiCalls++

    if (!response.ok) {
      throw await handleJSearchError(response)
    }

    const data: SalaryEstimateResponse = await response.json()
    return data.data || null
  } catch (error) {
    console.error('JSearch salary estimate error:', error)
    return null
  }
}

/**
 * Handle JSearch API errors
 */
async function handleJSearchError(response: Response): Promise<Error> {
  if (response.status === 429) {
    return new Error('JSearch rate limit exceeded - using cached data')
  }
  if (response.status === 403) {
    return new Error('Invalid RapidAPI key')
  }
  if (response.status === 404) {
    return new Error('Job not found')
  }

  let message = `JSearch API error: ${response.status}`
  try {
    const body = await response.json()
    if (body.message) {
      message = body.message
    }
  } catch {
    // Ignore JSON parse errors
  }

  return new Error(message)
}

/**
 * Transform JSearch job to our internal format
 */
export function transformJSearchJob(job: JSearchJob): {
  id: string
  external_id: string
  source: 'jsearch'
  title: string
  company: string
  company_logo: string | null
  company_website: string | null
  location_address: string
  location_city: string
  location_state: string
  location_lat: number | null
  location_lng: number | null
  salary_min: number | null
  salary_max: number | null
  salary_period: 'hourly' | 'annual' | null
  employment_type: string
  description: string
  requirements: string
  benefits: string
  apply_url: string
  posted_at: string
  is_remote: boolean
  experience_required: boolean
} {
  // Convert salary period to our format
  let salaryPeriod: 'hourly' | 'annual' | null = null
  if (job.job_salary_period) {
    const period = job.job_salary_period.toUpperCase()
    if (period === 'HOUR') salaryPeriod = 'hourly'
    else if (period === 'YEAR') salaryPeriod = 'annual'
    else if (period === 'MONTH') {
      // Convert monthly to annual for consistency
      salaryPeriod = 'annual'
    }
  }

  // Format requirements from highlights
  const requirements = job.job_highlights?.Qualifications?.join('\n') || ''

  // Format benefits from highlights or job_benefits
  const benefits = job.job_highlights?.Benefits?.join('\n') ||
                   job.job_benefits?.join('\n') || ''

  return {
    id: `jsearch_${job.job_id}`,
    external_id: job.job_id,
    source: 'jsearch',
    title: job.job_title,
    company: job.employer_name,
    company_logo: job.employer_logo,
    company_website: job.employer_website,
    location_address: `${job.job_city}, ${job.job_state}`,
    location_city: job.job_city,
    location_state: job.job_state,
    location_lat: job.job_latitude,
    location_lng: job.job_longitude,
    salary_min: job.job_min_salary,
    salary_max: job.job_max_salary,
    salary_period: salaryPeriod,
    employment_type: job.job_employment_type || 'FULLTIME',
    description: job.job_description,
    requirements,
    benefits,
    apply_url: job.job_apply_link,
    posted_at: job.job_posted_at_datetime_utc,
    is_remote: job.job_is_remote,
    experience_required: !job.job_required_experience?.no_experience_required
  }
}

/**
 * Get API usage statistics
 */
export function getApiUsage(): {
  count: number
  limit: number
  remaining: number
  month: string
} {
  resetMonthlyCountIfNeeded()
  return {
    count: monthlyApiCalls,
    limit: 500, // Free tier limit
    remaining: 500 - monthlyApiCalls,
    month: lastMonthReset
  }
}

// =============================================================================
// FALLBACK DATA FOR DEVELOPMENT / WHEN API IS UNAVAILABLE
// =============================================================================

function getFallbackSearchResponse(params: JSearchParams): JSearchResponse {
  const fallbackJobs: JSearchJob[] = [
    {
      job_id: 'fallback_001',
      employer_name: 'Orlando Health',
      employer_logo: null,
      employer_website: 'https://www.orlandohealth.com',
      employer_company_type: 'Healthcare',
      job_publisher: 'Orlando Health Careers',
      job_employment_type: 'FULLTIME',
      job_title: 'Customer Service Representative',
      job_apply_link: 'https://www.orlandohealth.com/careers',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.9,
      job_description: 'Join our team as a Customer Service Representative. Handle patient inquiries, schedule appointments, and provide excellent customer service in a fast-paced healthcare environment. We offer competitive benefits and opportunities for growth.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.5383,
      job_longitude: -81.3792,
      job_benefits: ['Health Insurance', 'Dental Insurance', '401(k)', 'Paid Time Off'],
      job_google_link: 'https://www.google.com/search?q=Orlando+Health+jobs',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: false,
        required_experience_in_months: 12,
        experience_mentioned: true,
        experience_preferred: false
      },
      job_required_skills: ['Customer Service', 'Communication', 'Microsoft Office'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: true,
        associates_degree: false,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: false,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 32000,
      job_max_salary: 40000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_highlights: {
        Qualifications: [
          'High school diploma or equivalent',
          '1+ years customer service experience',
          'Excellent communication skills',
          'Proficiency in Microsoft Office'
        ],
        Responsibilities: [
          'Handle patient inquiries via phone and in person',
          'Schedule appointments and manage calendars',
          'Process patient registration and verify insurance',
          'Provide exceptional customer service'
        ],
        Benefits: [
          'Comprehensive health insurance',
          '401(k) with employer match',
          'Paid time off and holidays',
          'Tuition reimbursement'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '43-4051.00',
      job_onet_job_zone: '2',
      job_naics_code: '622110',
      job_naics_name: 'General Medical and Surgical Hospitals'
    },
    {
      job_id: 'fallback_002',
      employer_name: 'Valencia College',
      employer_logo: null,
      employer_website: 'https://www.valenciacollege.edu',
      employer_company_type: 'Education',
      job_publisher: 'Valencia College Careers',
      job_employment_type: 'FULLTIME',
      job_title: 'Administrative Assistant',
      job_apply_link: 'https://www.valenciacollege.edu/careers',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.85,
      job_description: 'Support administrative operations at Valencia College. Manage calendars, coordinate meetings, and assist faculty and staff. Must have excellent organizational skills and proficiency in Microsoft Office.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.5088,
      job_longitude: -81.4035,
      job_benefits: ['State Benefits', 'Retirement Plan', 'Tuition Waiver'],
      job_google_link: 'https://www.google.com/search?q=Valencia+College+jobs',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: false,
        required_experience_in_months: 24,
        experience_mentioned: true,
        experience_preferred: true
      },
      job_required_skills: ['Administrative Support', 'Microsoft Office', 'Organization'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: true,
        associates_degree: true,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: true,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 35000,
      job_max_salary: 42000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_highlights: {
        Qualifications: [
          'Associate degree or equivalent experience',
          '2+ years administrative experience',
          'Proficiency in Microsoft Office Suite',
          'Excellent organizational skills'
        ],
        Responsibilities: [
          'Manage department calendars and scheduling',
          'Coordinate meetings and events',
          'Process correspondence and documentation',
          'Provide support to faculty and staff'
        ],
        Benefits: [
          'Florida Retirement System',
          'Health and life insurance',
          'Tuition waiver for employees',
          'Generous leave benefits'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '43-6014.00',
      job_onet_job_zone: '2',
      job_naics_code: '611210',
      job_naics_name: 'Junior Colleges'
    },
    {
      job_id: 'fallback_003',
      employer_name: 'Target',
      employer_logo: 'https://logo.clearbit.com/target.com',
      employer_website: 'https://www.target.com',
      employer_company_type: 'Retail',
      job_publisher: 'Target Careers',
      job_employment_type: 'PARTTIME',
      job_title: 'Guest Advocate (Cashier)',
      job_apply_link: 'https://jobs.target.com',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.8,
      job_description: 'Help guests find what they need and provide an exceptional shopping experience. Flexible scheduling, team discounts, and growth opportunities available.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.5494,
      job_longitude: -81.3498,
      job_benefits: ['Employee Discount', 'Flexible Scheduling'],
      job_google_link: 'https://www.google.com/search?q=Target+jobs+Orlando',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: true,
        required_experience_in_months: null,
        experience_mentioned: false,
        experience_preferred: false
      },
      job_required_skills: ['Customer Service', 'Cash Handling'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: false,
        associates_degree: false,
        bachelors_degree: false,
        degree_mentioned: false,
        degree_preferred: false,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: false,
      job_min_salary: 15,
      job_max_salary: 18,
      job_salary_currency: 'USD',
      job_salary_period: 'HOUR',
      job_highlights: {
        Qualifications: [
          'No experience required',
          'Ability to work flexible hours',
          'Strong communication skills'
        ],
        Responsibilities: [
          'Process guest transactions quickly and accurately',
          'Help guests find products throughout the store',
          'Maintain a clean and organized checkout area'
        ],
        Benefits: [
          '10% team member discount',
          'Flexible scheduling',
          'Health benefits for eligible team members'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '41-2011.00',
      job_onet_job_zone: '1',
      job_naics_code: '452210',
      job_naics_name: 'Department Stores'
    },
    {
      job_id: 'fallback_004',
      employer_name: 'Lockheed Martin',
      employer_logo: 'https://logo.clearbit.com/lockheedmartin.com',
      employer_website: 'https://www.lockheedmartin.com',
      employer_company_type: 'Aerospace & Defense',
      job_publisher: 'Lockheed Martin Careers',
      job_employment_type: 'FULLTIME',
      job_title: 'Help Desk Technician',
      job_apply_link: 'https://www.lockheedmartinjobs.com',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.95,
      job_description: 'Provide technical support to internal teams. Troubleshoot hardware and software issues, manage tickets, and maintain IT documentation. A+ certification preferred.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.4747,
      job_longitude: -81.3010,
      job_benefits: ['Health Insurance', '401(k)', 'Paid Time Off', 'Education Assistance'],
      job_google_link: 'https://www.google.com/search?q=Lockheed+Martin+jobs+Orlando',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: false,
        required_experience_in_months: 12,
        experience_mentioned: true,
        experience_preferred: true
      },
      job_required_skills: ['IT Support', 'Troubleshooting', 'Windows', 'Active Directory'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: true,
        high_school: true,
        associates_degree: true,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: true,
        professional_certification_mentioned: true
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 45000,
      job_max_salary: 55000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_highlights: {
        Qualifications: [
          'A+ certification preferred',
          '1+ years IT support experience',
          'Knowledge of Windows OS and Active Directory',
          'Strong troubleshooting skills'
        ],
        Responsibilities: [
          'Provide Tier 1-2 technical support',
          'Troubleshoot hardware and software issues',
          'Manage and resolve support tickets',
          'Document solutions and procedures'
        ],
        Benefits: [
          'Comprehensive health and dental insurance',
          '401(k) with company match',
          'Education assistance program',
          'Paid holidays and PTO'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '15-1232.00',
      job_onet_job_zone: '3',
      job_naics_code: '336411',
      job_naics_name: 'Aircraft Manufacturing'
    },
    {
      job_id: 'fallback_005',
      employer_name: 'AdventHealth',
      employer_logo: null,
      employer_website: 'https://www.adventhealth.com',
      employer_company_type: 'Healthcare',
      job_publisher: 'AdventHealth Careers',
      job_employment_type: 'FULLTIME',
      job_title: 'Medical Receptionist',
      job_apply_link: 'https://careers.adventhealth.com',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.88,
      job_description: 'Front desk receptionist for busy medical office. Check in patients, verify insurance, and handle phone inquiries. Medical office experience required.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Winter Park',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.5997,
      job_longitude: -81.3392,
      job_benefits: ['Health Insurance', 'Dental', 'Vision', '401(k)'],
      job_google_link: 'https://www.google.com/search?q=AdventHealth+jobs+Orlando',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: false,
        required_experience_in_months: 12,
        experience_mentioned: true,
        experience_preferred: true
      },
      job_required_skills: ['Medical Terminology', 'Insurance Verification', 'EHR Systems'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: true,
        associates_degree: false,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: false,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 30000,
      job_max_salary: 38000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_highlights: {
        Qualifications: [
          'High school diploma required',
          '1+ years medical office experience',
          'Knowledge of medical terminology',
          'Experience with EHR systems'
        ],
        Responsibilities: [
          'Greet and check in patients',
          'Verify insurance coverage',
          'Schedule appointments',
          'Handle phone inquiries'
        ],
        Benefits: [
          'Medical, dental, and vision insurance',
          '401(k) retirement plan',
          'Paid time off',
          'Employee wellness programs'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '43-6013.00',
      job_onet_job_zone: '2',
      job_naics_code: '621111',
      job_naics_name: 'Offices of Physicians'
    },
    {
      job_id: 'fallback_006',
      employer_name: 'Tech Orlando',
      employer_logo: null,
      employer_website: 'https://techorlando.example.com',
      employer_company_type: 'Technology',
      job_publisher: 'Tech Orlando',
      job_employment_type: 'FULLTIME',
      job_title: 'Junior Web Developer',
      job_apply_link: 'https://techorlando.example.com/careers',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.85,
      job_description: 'Join our growing team as a junior web developer. Work with React, Node.js, and modern web technologies. Great opportunity for Valencia College CS graduates.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.5383,
      job_longitude: -81.3792,
      job_benefits: ['Health Insurance', 'Remote Work Options', 'Professional Development'],
      job_google_link: 'https://www.google.com/search?q=Tech+Orlando+jobs',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: true,
        required_experience_in_months: null,
        experience_mentioned: false,
        experience_preferred: true
      },
      job_required_skills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: false,
        associates_degree: true,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: true,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 48000,
      job_max_salary: 62000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_highlights: {
        Qualifications: [
          'Associates degree in CS or related field',
          'Knowledge of JavaScript, React, Node.js',
          'Understanding of HTML/CSS',
          'Eager to learn and grow'
        ],
        Responsibilities: [
          'Develop and maintain web applications',
          'Collaborate with senior developers',
          'Write clean, maintainable code',
          'Participate in code reviews'
        ],
        Benefits: [
          'Competitive salary',
          'Health insurance',
          'Flexible work arrangements',
          'Continuous learning opportunities'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '15-1254.00',
      job_onet_job_zone: '4',
      job_naics_code: '541511',
      job_naics_name: 'Custom Computer Programming Services'
    },
    {
      job_id: 'fallback_007',
      employer_name: 'Amazon',
      employer_logo: 'https://logo.clearbit.com/amazon.com',
      employer_website: 'https://www.amazon.com',
      employer_company_type: 'E-Commerce',
      job_publisher: 'Amazon Jobs',
      job_employment_type: 'FULLTIME',
      job_title: 'Warehouse Associate',
      job_apply_link: 'https://www.amazon.jobs',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.9,
      job_description: 'Join our Orlando fulfillment center team. Pick, pack, and ship customer orders. Must be able to lift 50 lbs. Benefits include health insurance, 401k.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.4209,
      job_longitude: -81.4162,
      job_benefits: ['Health Insurance', '401(k)', 'Employee Discount'],
      job_google_link: 'https://www.google.com/search?q=Amazon+jobs+Orlando',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: true,
        required_experience_in_months: null,
        experience_mentioned: false,
        experience_preferred: false
      },
      job_required_skills: ['Physical Stamina', 'Attention to Detail'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: false,
        associates_degree: false,
        bachelors_degree: false,
        degree_mentioned: false,
        degree_preferred: false,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: false,
      job_min_salary: 17,
      job_max_salary: 21,
      job_salary_currency: 'USD',
      job_salary_period: 'HOUR',
      job_highlights: {
        Qualifications: [
          'Ability to lift up to 50 lbs',
          'Must be 18 years or older',
          'Ability to stand/walk for long periods'
        ],
        Responsibilities: [
          'Pick and pack customer orders',
          'Meet productivity targets',
          'Maintain quality standards',
          'Follow safety procedures'
        ],
        Benefits: [
          'Medical, dental, and vision insurance',
          '401(k) with company match',
          'Paid time off',
          'Employee discount'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '53-7065.00',
      job_onet_job_zone: '1',
      job_naics_code: '493110',
      job_naics_name: 'General Warehousing and Storage'
    },
    {
      job_id: 'fallback_008',
      employer_name: 'Universal Orlando Resort',
      employer_logo: 'https://logo.clearbit.com/universalorlando.com',
      employer_website: 'https://www.universalorlando.com',
      employer_company_type: 'Entertainment',
      job_publisher: 'Universal Careers',
      job_employment_type: 'FULLTIME',
      job_title: 'Security Officer',
      job_apply_link: 'https://jobs.universalorlando.com',
      job_apply_is_direct: true,
      job_apply_quality_score: 0.85,
      job_description: 'Ensure safety of guests and team members at Universal Orlando Resort. Patrol assigned areas, respond to incidents, and provide excellent guest service. Must pass background check.',
      job_is_remote: false,
      job_posted_at_timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      job_city: 'Orlando',
      job_state: 'FL',
      job_country: 'US',
      job_latitude: 28.4722,
      job_longitude: -81.4673,
      job_benefits: ['Free Park Access', 'Health Insurance', 'Discounts'],
      job_google_link: 'https://www.google.com/search?q=Universal+Orlando+jobs',
      job_offer_expiration_datetime_utc: null,
      job_required_experience: {
        no_experience_required: false,
        required_experience_in_months: 6,
        experience_mentioned: true,
        experience_preferred: true
      },
      job_required_skills: ['Security', 'Customer Service', 'Communication'],
      job_required_education: {
        postgraduate_degree: false,
        professional_certification: false,
        high_school: true,
        associates_degree: false,
        bachelors_degree: false,
        degree_mentioned: true,
        degree_preferred: false,
        professional_certification_mentioned: false
      },
      job_experience_in_place_of_education: true,
      job_min_salary: 16,
      job_max_salary: 19,
      job_salary_currency: 'USD',
      job_salary_period: 'HOUR',
      job_highlights: {
        Qualifications: [
          'High school diploma or GED',
          '6+ months security experience preferred',
          'Must pass background check',
          'Excellent communication skills'
        ],
        Responsibilities: [
          'Patrol assigned areas of the resort',
          'Respond to security incidents',
          'Provide exceptional guest service',
          'Write incident reports'
        ],
        Benefits: [
          'Free park admission',
          'Health and dental insurance',
          'Team member discounts',
          'Career advancement opportunities'
        ]
      },
      job_job_title: null,
      job_posting_language: 'en',
      job_onet_soc: '33-9032.00',
      job_onet_job_zone: '2',
      job_naics_code: '713110',
      job_naics_name: 'Amusement and Theme Parks'
    }
  ]

  // Filter by query if provided
  let filteredJobs = fallbackJobs
  const query = params.query.toLowerCase()

  if (query && !query.includes('orlando')) {
    filteredJobs = fallbackJobs.filter(job =>
      job.job_title.toLowerCase().includes(query) ||
      job.employer_name.toLowerCase().includes(query) ||
      job.job_description.toLowerCase().includes(query)
    )
  }

  // If query contains specific job terms, prioritize matching jobs
  if (query) {
    const queryTerms = query.split(/\s+/).filter(t => t.length > 2)
    filteredJobs = filteredJobs.sort((a, b) => {
      const aMatches = queryTerms.filter(t =>
        a.job_title.toLowerCase().includes(t) ||
        a.employer_name.toLowerCase().includes(t)
      ).length
      const bMatches = queryTerms.filter(t =>
        b.job_title.toLowerCase().includes(t) ||
        b.employer_name.toLowerCase().includes(t)
      ).length
      return bMatches - aMatches
    })
  }

  // Filter by employment type
  if (params.employment_types) {
    const types = params.employment_types.split(',').map(t => t.toUpperCase())
    filteredJobs = filteredJobs.filter(job => types.includes(job.job_employment_type))
  }

  // Pagination
  const page = params.page || 1
  const perPage = 10
  const startIndex = (page - 1) * perPage
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + perPage)

  return {
    status: 'OK',
    request_id: `fallback_${Date.now()}`,
    parameters: {
      query: params.query,
      page: String(params.page || 1),
      num_pages: String(params.num_pages || 1)
    },
    data: paginatedJobs
  }
}

export default searchJobs
