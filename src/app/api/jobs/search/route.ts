/**
 * GET /api/jobs/search
 *
 * Search jobs with filters including LYNX transit times
 * Query params:
 *   - q: search query
 *   - location: location string (job location)
 *   - salary_min: minimum salary
 *   - salary_max: maximum salary
 *   - job_type: comma-separated job types
 *   - posted_within: 24h, 3d, 7d, 30d
 *   - lynx_accessible: true/false
 *   - valencia_friendly: true/false
 *   - max_commute: max commute minutes
 *   - user_lat: user latitude (for transit calculation)
 *   - user_lng: user longitude (for transit calculation)
 *   - user_address: user address (alternative to lat/lng)
 *   - sort_by: 'date', 'commute', 'salary' (default: 'date')
 *   - page: page number (1-indexed)
 *   - limit: results per page
 *   - refresh: force refresh from Indeed API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkJobForScams, type ScamCheckResult } from '@/lib/scam-shield'
import { searchIndeedJobs, transformIndeedJob, type IndeedSearchParams, type IndeedJobType } from '@/lib/indeed-client'
import { searchJobs as searchJSearchJobs, transformJSearchJob, isJSearchAvailable, type JSearchParams } from '@/lib/jsearch-client'
import { calculateTransitTime, geocodeAddress, type Coordinates, type TransitResult } from '@/lib/transit-client'
import { getUserValenciaProgram, calculateValenciaMatch, type ValenciaProgram } from '@/lib/valencia-match'

// Type for jobs with scam check and transit
interface JobWithExtras {
  id: string
  external_id: string
  source: string
  title: string
  company: string
  company_website?: string
  location_address?: string
  location_city?: string
  location_state?: string
  location_lat?: number
  location_lng?: number
  salary_min?: number
  salary_max?: number
  salary_period?: string
  employment_type?: string
  description?: string
  requirements?: string
  benefits?: string
  apply_url?: string
  posted_at?: string
  scam_severity?: string
  scam_flags?: any[]
  valencia_friendly?: boolean
  valencia_match_score?: number
  created_at?: string
  // Transit fields
  transitMinutes?: number | null
  lynxRoutes?: string[]
  transitSummary?: string
  // Scam fields
  scamRiskLevel?: string
  scamReasons?: string[]
  scamScore?: number
}

// Helper to map job type filters to Indeed job types
function mapJobType(jobType: string): IndeedJobType | undefined {
  const mapping: Record<string, IndeedJobType> = {
    'full-time': 'fulltime',
    'fulltime': 'fulltime',
    'part-time': 'parttime',
    'parttime': 'parttime',
    'contract': 'contract',
    'internship': 'internship',
    'temporary': 'temporary'
  }
  return mapping[jobType.toLowerCase()]
}

// Helper to map posted_within to Indeed fromage (days)
function mapPostedWithin(postedWithin: string): number | undefined {
  const mapping: Record<string, number> = {
    '24h': 1,
    '3d': 3,
    '7d': 7,
    '30d': 30
  }
  return mapping[postedWithin]
}

// Apply scam check to a job
function applyScamCheck(job: JobWithExtras): JobWithExtras {
  const scamCheck = checkJobForScams({
    title: job.title,
    company: job.company,
    company_website: job.company_website,
    description: job.description,
    requirements: job.requirements,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    contact_email: undefined,
    location_address: job.location_address,
    apply_url: job.apply_url
  })

  return {
    ...job,
    scam_severity: scamCheck.severity,
    scam_flags: scamCheck.flags,
    scamRiskLevel: scamCheck.severity,
    scamReasons: scamCheck.flags.map(f => f.description),
    scamScore: scamCheck.score
  }
}

// Apply Valencia match to a job
function applyValenciaMatch(
  job: JobWithExtras,
  valenciaProgram: ValenciaProgram | null
): JobWithExtras {
  if (!valenciaProgram) {
    return {
      ...job,
      valencia_friendly: false,
      valencia_match_score: undefined
    }
  }

  const matchResult = calculateValenciaMatch(
    {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_period: job.salary_period as 'hourly' | 'annual' | undefined
    },
    valenciaProgram
  )

  return {
    ...job,
    valencia_friendly: matchResult.isMatch,
    valencia_match_score: matchResult.isMatch ? matchResult.matchPercentage : undefined
  }
}

// Apply Valencia match to batch of jobs
function applyBatchValenciaMatch(
  jobs: JobWithExtras[],
  valenciaProgram: ValenciaProgram | null
): JobWithExtras[] {
  return jobs.map(job => applyValenciaMatch(job, valenciaProgram))
}

// Calculate transit for a single job
async function calculateJobTransit(
  userCoords: Coordinates,
  job: JobWithExtras
): Promise<JobWithExtras> {
  try {
    let jobCoords: Coordinates | null = null

    if (job.location_lat && job.location_lng) {
      jobCoords = { lat: job.location_lat, lng: job.location_lng }
    } else if (job.location_address) {
      jobCoords = await geocodeAddress(job.location_address)
    }

    if (!jobCoords) {
      return {
        ...job,
        transitMinutes: null,
        lynxRoutes: [],
        transitSummary: 'Location unknown'
      }
    }

    const transit = await calculateTransitTime(userCoords, jobCoords)

    if (!transit) {
      return {
        ...job,
        transitMinutes: null,
        lynxRoutes: [],
        transitSummary: 'No transit available'
      }
    }

    return {
      ...job,
      transitMinutes: transit.durationMinutes,
      lynxRoutes: transit.routes.map(r => r.routeNumber),
      transitSummary: transit.summary
    }
  } catch (error) {
    console.error(`Error calculating transit for job ${job.id}:`, error)
    return {
      ...job,
      transitMinutes: null,
      lynxRoutes: [],
      transitSummary: 'Error calculating'
    }
  }
}

// Calculate transit for batch of jobs (with concurrency limit)
async function calculateBatchTransit(
  userCoords: Coordinates,
  jobs: JobWithExtras[]
): Promise<JobWithExtras[]> {
  const CONCURRENCY = 5 // Process 5 at a time to avoid rate limits
  const results: JobWithExtras[] = []

  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(job => calculateJobTransit(userCoords, job))
    )
    results.push(...batchResults)
  }

  return results
}

// Save jobs to database (upsert based on external_id) and return with DB IDs
async function saveJobsToDatabase(jobs: any[]): Promise<{ map: Map<string, string>, error?: string }> {
  const externalIdToDbId = new Map<string, string>()
  if (jobs.length === 0) return { map: externalIdToDbId }

  try {
    const supabase = createAdminClient()

    // Transform jobs to database format
    const dbJobs = jobs.map(job => ({
      external_id: job.externalId || job.external_id,
      source: job.source || 'indeed',
      title: job.title,
      company: job.company,
      location_address: job.location || job.location_address,
      location_city: job.locationCity || job.location_city,
      location_state: job.locationState || job.location_state,
      location_lat: job.latitude || job.location_lat,
      location_lng: job.longitude || job.location_lng,
      salary_min: job.salaryMin || job.salary_min,
      salary_max: job.salaryMax || job.salary_max,
      salary_period: job.salaryType === 'hourly' ? 'hourly' : job.salaryType === 'yearly' ? 'annual' : job.salary_period,
      description: job.description,
      apply_url: job.applicationUrl || job.apply_url,
      posted_at: job.postedAt || job.posted_at,
      employment_type: job.jobType || job.employment_type,
      // Scam shield data (DB expects uppercase: CRITICAL, HIGH, MEDIUM, LOW)
      scam_severity: (job.scamRiskLevel || job.scam_severity)?.toUpperCase(),
      scam_flags: job.scamReasons ? job.scamReasons.map((r: string) => ({ description: r })) : job.scam_flags,
      // Valencia match data
      valencia_friendly: job.valencia_friendly || false,
      valencia_match_score: job.valencia_match_score || null
    }))

    // Upsert jobs (update if external_id exists, insert if not)
    const { data, error } = await supabase
      .from('jobs')
      .upsert(dbJobs, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      })
      .select('id, external_id')

    if (error) {
      console.error('Error saving jobs to database:', error)
      return { map: externalIdToDbId, error: error.message }
    }

    if (data) {
      // Build mapping from external_id to database id
      for (const job of data) {
        externalIdToDbId.set(job.external_id, job.id)
      }
    }
  } catch (error: any) {
    console.error('Failed to save jobs:', error)
    return { map: externalIdToDbId, error: error?.message }
  }

  return { map: externalIdToDbId }
}

// Fetch jobs from database
async function fetchJobsFromDatabase(params: {
  query?: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  jobTypes?: string[]
  postedWithin?: string
  page: number
  limit: number
}): Promise<{ jobs: JobWithExtras[]; total: number }> {
  const supabase = createAdminClient()

  let queryBuilder = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)

  // Text search
  if (params.query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${params.query}%,company.ilike.%${params.query}%,description.ilike.%${params.query}%`)
  }

  // Location filter
  if (params.location) {
    queryBuilder = queryBuilder.or(`location_address.ilike.%${params.location}%,location_city.ilike.%${params.location}%`)
  }

  // Salary filter
  if (params.salaryMin) {
    queryBuilder = queryBuilder.gte('salary_min', params.salaryMin)
  }

  // Posted within filter
  if (params.postedWithin) {
    const daysMap: Record<string, number> = { '24h': 1, '3d': 3, '7d': 7, '30d': 30 }
    const days = daysMap[params.postedWithin]
    if (days) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      queryBuilder = queryBuilder.gte('posted_at', cutoffDate.toISOString())
    }
  }

  // Pagination
  const offset = (params.page - 1) * params.limit
  queryBuilder = queryBuilder
    .order('posted_at', { ascending: false })
    .range(offset, offset + params.limit - 1)

  const { data, count, error } = await queryBuilder

  if (error) {
    console.error('Database query error:', error)
    return { jobs: [], total: 0 }
  }

  return {
    jobs: (data || []) as JobWithExtras[],
    total: count || 0
  }
}

// Format job for API response
function formatJobResponse(job: JobWithExtras) {
  return {
    id: job.id,
    externalId: job.external_id,
    source: job.source,
    title: job.title,
    company: job.company,
    location: job.location_address,
    locationCity: job.location_city,
    locationState: job.location_state,
    locationLat: job.location_lat,
    locationLng: job.location_lng,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryType: job.salary_period === 'hourly' ? 'hourly' : 'yearly',
    jobType: job.employment_type,
    description: job.description,
    applicationUrl: job.apply_url,
    postedAt: job.posted_at,
    // Scam Shield
    scamRiskLevel: job.scamRiskLevel,
    scamReasons: job.scamReasons,
    scamScore: job.scamScore,
    // Valencia Match
    valenciaMatch: job.valencia_friendly,
    valenciaMatchPercentage: job.valencia_match_score,
    // Transit
    transitMinutes: job.transitMinutes,
    lynxRoutes: job.lynxRoutes,
    transitSummary: job.transitSummary
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || 'Orlando, FL'
  const salaryMin = searchParams.get('salary_min') ? Number(searchParams.get('salary_min')) : undefined
  const salaryMax = searchParams.get('salary_max') ? Number(searchParams.get('salary_max')) : undefined
  const jobTypes = searchParams.get('job_type')?.split(',').filter(Boolean) || []
  const postedWithin = searchParams.get('posted_within') || undefined
  const lynxAccessible = searchParams.get('lynx_accessible') === 'true'
  const valenciaFriendly = searchParams.get('valencia_friendly') === 'true'
  const maxCommute = searchParams.get('max_commute') ? Number(searchParams.get('max_commute')) : undefined
  const sortBy = searchParams.get('sort_by') || 'date' // 'date', 'commute', 'salary'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10))
  const forceRefresh = searchParams.get('refresh') === 'true'

  // User location for transit calculation
  const userLat = searchParams.get('user_lat') ? Number(searchParams.get('user_lat')) : undefined
  const userLng = searchParams.get('user_lng') ? Number(searchParams.get('user_lng')) : undefined
  const userAddress = searchParams.get('user_address')

  try {
    // Resolve user location if provided
    let userCoords: Coordinates | null = null
    if (userLat && userLng) {
      userCoords = { lat: userLat, lng: userLng }
    } else if (userAddress) {
      userCoords = await geocodeAddress(userAddress)
    }

    // Get current user for Valencia match calculation
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user's Valencia program for matching
    let valenciaProgram: ValenciaProgram | null = null
    if (user) {
      valenciaProgram = await getUserValenciaProgram(user.id)
    }

    // Option 1: Check if we should fetch fresh data from external API
    let shouldFetchFromAPI = forceRefresh

    // For now, always try to fetch from API if we have a search query
    if (query || forceRefresh) {
      shouldFetchFromAPI = true
    }

    // Fetch from external API if needed (JSearch first, then Indeed fallback)
    if (shouldFetchFromAPI) {
      // Try JSearch API first (via RapidAPI)
      if (isJSearchAvailable()) {
        try {
          // Build JSearch params
          const jsearchParams: JSearchParams = {
            query: query ? `${query} in ${location}` : `jobs in ${location}`,
            page: page,
            num_pages: 1
          }

          // Add job type filter
          if (jobTypes.length > 0) {
            const typeMap: Record<string, string> = {
              'full-time': 'FULLTIME',
              'fulltime': 'FULLTIME',
              'part-time': 'PARTTIME',
              'parttime': 'PARTTIME',
              'contract': 'CONTRACTOR',
              'internship': 'INTERN'
            }
            const mappedTypes = jobTypes
              .map(t => typeMap[t.toLowerCase()])
              .filter(Boolean)
            if (mappedTypes.length > 0) {
              jsearchParams.employment_types = mappedTypes.join(',')
            }
          }

          // Add posted within filter
          if (postedWithin) {
            const dateMap: Record<string, 'today' | '3days' | 'week' | 'month'> = {
              '24h': 'today',
              '3d': '3days',
              '7d': 'week',
              '30d': 'month'
            }
            if (dateMap[postedWithin]) {
              jsearchParams.date_posted = dateMap[postedWithin]
            }
          }

          // Search JSearch
          const jsearchResponse = await searchJSearchJobs(jsearchParams)

          if (jsearchResponse.data && jsearchResponse.data.length > 0) {
            // Transform and apply scam check to JSearch jobs
            let transformedJobs: JobWithExtras[] = jsearchResponse.data.map(job => {
              const transformed = transformJSearchJob(job)
              return applyScamCheck({
                id: transformed.id,
                external_id: transformed.external_id,
                source: 'jsearch',
                title: transformed.title,
                company: transformed.company,
                company_website: transformed.company_website || undefined,
                location_address: transformed.location_address,
                location_city: transformed.location_city,
                location_state: transformed.location_state,
                location_lat: transformed.location_lat || undefined,
                location_lng: transformed.location_lng || undefined,
                salary_min: transformed.salary_min || undefined,
                salary_max: transformed.salary_max || undefined,
                salary_period: transformed.salary_period || undefined,
                employment_type: transformed.employment_type,
                description: transformed.description,
                requirements: transformed.requirements,
                benefits: transformed.benefits,
                apply_url: transformed.apply_url,
                posted_at: transformed.posted_at
              })
            })

            // Apply Valencia match scoring
            let jobsWithValencia = applyBatchValenciaMatch(transformedJobs, valenciaProgram)

            // Save jobs to database and get back the database IDs
            const saveResult = await saveJobsToDatabase(jobsWithValencia)
            const idMap = saveResult.map

            // Update job IDs with actual database IDs
            jobsWithValencia = jobsWithValencia.map(job => {
              const dbId = idMap.get(job.external_id)
              if (dbId) {
                return { ...job, id: dbId }
              }
              return job
            })

            // Filter out critical scam jobs
            let filteredJobs = jobsWithValencia.filter(job => job.scamRiskLevel !== 'critical')

            // Calculate transit times if user location provided
            if (userCoords) {
              filteredJobs = await calculateBatchTransit(userCoords, filteredJobs)

              // Filter by max commute if specified
              if (maxCommute !== undefined) {
                filteredJobs = filteredJobs.filter(
                  job => job.transitMinutes != null && job.transitMinutes <= maxCommute
                )
              }

              // Filter for LYNX accessible only
              if (lynxAccessible) {
                filteredJobs = filteredJobs.filter(
                  job => job.transitMinutes != null && job.lynxRoutes && job.lynxRoutes.length > 0
                )
              }
            }

            // Filter by Valencia friendly
            if (valenciaFriendly) {
              filteredJobs = filteredJobs.filter(job => job.valencia_friendly)
            }

            // Sort jobs
            if (sortBy === 'commute' && userCoords) {
              filteredJobs.sort((a, b) => {
                if (a.transitMinutes == null && b.transitMinutes == null) return 0
                if (a.transitMinutes == null) return 1
                if (b.transitMinutes == null) return -1
                return a.transitMinutes - b.transitMinutes
              })
            } else if (sortBy === 'salary') {
              filteredJobs.sort((a, b) => {
                const salaryA = a.salary_max || a.salary_min || 0
                const salaryB = b.salary_max || b.salary_min || 0
                return salaryB - salaryA // Highest first
              })
            }

            // Paginate (JSearch already returns paginated results, but we re-paginate after filtering)
            const total = filteredJobs.length
            const startIndex = 0 // Already paginated from API
            const paginatedJobs = filteredJobs.slice(0, limit)

            return NextResponse.json({
              jobs: paginatedJobs.map(formatJobResponse),
              total,
              page,
              limit,
              hasMore: jsearchResponse.data.length >= 10, // JSearch returns up to 10 per page
              source: 'jsearch',
              hasTransitData: !!userCoords,
              hasValenciaData: !!valenciaProgram,
              sortedBy: sortBy
            })
          }
        } catch (jsearchError) {
          console.error('JSearch API error, trying Indeed fallback:', jsearchError)
          // Fall through to Indeed
        }
      }

      // Fallback to Indeed API
      try {
        // Build Indeed search params
        const indeedParams: IndeedSearchParams = {
          q: query || undefined,
          l: location,
          limit: Math.min(25, limit * 2), // Fetch more to have buffer
          latlong: true,
          sort: 'date'
        }

        // Add job type filter
        if (jobTypes.length > 0) {
          const mappedType = mapJobType(jobTypes[0])
          if (mappedType) {
            indeedParams.jt = mappedType
          }
        }

        // Add posted within filter
        if (postedWithin) {
          const fromage = mapPostedWithin(postedWithin)
          if (fromage) {
            indeedParams.fromage = fromage
          }
        }

        // Add salary filter
        if (salaryMin) {
          indeedParams.salary = `$${salaryMin}`
        }

        // Search Indeed
        const indeedResponse = await searchIndeedJobs(indeedParams)

        // Transform and apply scam check to Indeed jobs
        let transformedJobs: JobWithExtras[] = indeedResponse.results.map(job => {
          const transformed = transformIndeedJob(job)
          return applyScamCheck({
            id: transformed.id,
            external_id: transformed.externalId,
            source: 'indeed',
            title: transformed.title,
            company: transformed.company,
            location_address: transformed.location,
            location_city: transformed.locationCity,
            location_state: transformed.locationState,
            location_lat: transformed.latitude,
            location_lng: transformed.longitude,
            salary_min: transformed.salaryMin,
            salary_max: transformed.salaryMax,
            salary_period: transformed.salaryType === 'hourly' ? 'hourly' : 'annual',
            description: transformed.description,
            apply_url: transformed.applicationUrl,
            posted_at: transformed.postedAt
          })
        })

        // Apply Valencia match scoring
        let jobsWithValencia = applyBatchValenciaMatch(transformedJobs, valenciaProgram)

        // Save jobs to database and get back the database IDs
        const saveResult = await saveJobsToDatabase(jobsWithValencia)
        const idMap = saveResult.map

        // Update job IDs with actual database IDs
        jobsWithValencia = jobsWithValencia.map(job => {
          const dbId = idMap.get(job.external_id)
          return dbId ? { ...job, id: dbId } : job
        })

        // Filter out critical scam jobs
        let filteredJobs = jobsWithValencia.filter(job => job.scamRiskLevel !== 'critical')

        // Calculate transit times if user location provided
        if (userCoords) {
          filteredJobs = await calculateBatchTransit(userCoords, filteredJobs)

          // Filter by max commute if specified
          if (maxCommute !== undefined) {
            filteredJobs = filteredJobs.filter(
              job => job.transitMinutes != null && job.transitMinutes <= maxCommute
            )
          }

          // Filter for LYNX accessible only
          if (lynxAccessible) {
            filteredJobs = filteredJobs.filter(
              job => job.transitMinutes != null && job.lynxRoutes && job.lynxRoutes.length > 0
            )
          }
        }

        // Filter by Valencia friendly
        if (valenciaFriendly) {
          filteredJobs = filteredJobs.filter(job => job.valencia_friendly)
        }

        // Sort jobs
        if (sortBy === 'commute' && userCoords) {
          filteredJobs.sort((a, b) => {
            if (a.transitMinutes == null && b.transitMinutes == null) return 0
            if (a.transitMinutes == null) return 1
            if (b.transitMinutes == null) return -1
            return a.transitMinutes - b.transitMinutes
          })
        } else if (sortBy === 'salary') {
          filteredJobs.sort((a, b) => {
            const salaryA = a.salary_max || a.salary_min || 0
            const salaryB = b.salary_max || b.salary_min || 0
            return salaryB - salaryA // Highest first
          })
        }
        // Default is already sorted by date from Indeed

        // Paginate
        const total = filteredJobs.length
        const startIndex = (page - 1) * limit
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit)

        return NextResponse.json({
          jobs: paginatedJobs.map(formatJobResponse),
          total,
          page,
          limit,
          hasMore: startIndex + limit < total,
          source: 'indeed',
          hasTransitData: !!userCoords,
          hasValenciaData: !!valenciaProgram,
          sortedBy: sortBy
        })
      } catch (indeedError) {
        console.error('Indeed API error, falling back to database:', indeedError)
        // Fall through to database query
      }
    }

    // Option 2: Fetch from database (cached jobs)
    const { jobs: dbJobs, total } = await fetchJobsFromDatabase({
      query: query || undefined,
      location: location || undefined,
      salaryMin,
      salaryMax,
      jobTypes,
      postedWithin,
      page,
      limit
    })

    // Apply scam check to database jobs
    let processedJobs = dbJobs.map(job => applyScamCheck(job))

    // Apply Valencia match scoring
    processedJobs = applyBatchValenciaMatch(processedJobs, valenciaProgram)

    // Filter out critical scam jobs
    processedJobs = processedJobs.filter(job => job.scamRiskLevel !== 'critical')

    // Calculate transit times if user location provided
    if (userCoords) {
      processedJobs = await calculateBatchTransit(userCoords, processedJobs)

      // Filter by max commute if specified
      if (maxCommute !== undefined) {
        processedJobs = processedJobs.filter(
          job => job.transitMinutes != null && job.transitMinutes <= maxCommute
        )
      }

      // Filter for LYNX accessible only
      if (lynxAccessible) {
        processedJobs = processedJobs.filter(
          job => job.transitMinutes != null && job.lynxRoutes && job.lynxRoutes.length > 0
        )
      }
    }

    // Filter by Valencia friendly
    if (valenciaFriendly) {
      processedJobs = processedJobs.filter(job => job.valencia_friendly)
    }

    // Sort jobs
    if (sortBy === 'commute' && userCoords) {
      processedJobs.sort((a, b) => {
        if (a.transitMinutes == null && b.transitMinutes == null) return 0
        if (a.transitMinutes == null) return 1
        if (b.transitMinutes == null) return -1
        return a.transitMinutes - b.transitMinutes
      })
    } else if (sortBy === 'salary') {
      processedJobs.sort((a, b) => {
        const salaryA = a.salary_max || a.salary_min || 0
        const salaryB = b.salary_max || b.salary_min || 0
        return salaryB - salaryA // Highest first
      })
    }

    return NextResponse.json({
      jobs: processedJobs.map(formatJobResponse),
      total: processedJobs.length,
      page,
      limit,
      hasMore: (page * limit) < total,
      source: 'database',
      hasTransitData: !!userCoords,
      hasValenciaData: !!valenciaProgram,
      sortedBy: sortBy
    })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    )
  }
}
