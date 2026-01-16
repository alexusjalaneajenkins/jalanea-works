/**
 * POST /api/jobs/transit
 *
 * Calculate transit times for a batch of jobs from user's location
 * Used to enrich job listings with LYNX commute information
 *
 * Request body:
 *   - userLocation: { lat: number, lng: number } | { address: string }
 *   - jobs: Array<{ id: string, location_lat?: number, location_lng?: number, location_address?: string }>
 *   - maxCommute?: number (optional filter - only return jobs within this many minutes)
 *
 * Response:
 *   - jobs: Array<{ id: string, transitMinutes: number, lynxRoutes: string[], summary: string }>
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateTransitTime,
  geocodeAddress,
  formatTransitDisplay,
  type Coordinates,
  type TransitResult
} from '@/lib/transit-client'

interface JobLocationInput {
  id: string
  location_lat?: number
  location_lng?: number
  location_address?: string
}

interface TransitJobResult {
  id: string
  transitMinutes: number | null
  lynxRoutes: string[]
  summary: string
  walkingMinutes: number
  transfers: number
  distanceMiles: number
  accessible: boolean // Can reach by LYNX
}

// Cache for user location geocoding
const userLocationCache = new Map<string, { coords: Coordinates; timestamp: number }>()
const USER_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userLocation, jobs, maxCommute } = body

    if (!userLocation) {
      return NextResponse.json(
        { error: 'userLocation is required' },
        { status: 400 }
      )
    }

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: 'jobs array is required' },
        { status: 400 }
      )
    }

    // Limit batch size to prevent abuse
    if (jobs.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 jobs per request' },
        { status: 400 }
      )
    }

    // Resolve user location
    let userCoords: Coordinates | null = null

    if ('lat' in userLocation && 'lng' in userLocation) {
      userCoords = userLocation
    } else if ('address' in userLocation) {
      // Check cache
      const cacheKey = userLocation.address.toLowerCase().trim()
      const cached = userLocationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
        userCoords = cached.coords
      } else {
        userCoords = await geocodeAddress(userLocation.address)
        if (userCoords) {
          userLocationCache.set(cacheKey, { coords: userCoords, timestamp: Date.now() })
        }
      }
    }

    if (!userCoords) {
      return NextResponse.json(
        { error: 'Could not resolve user location' },
        { status: 400 }
      )
    }

    // Calculate transit for each job in parallel (with concurrency limit)
    const CONCURRENCY = 5 // Process 5 at a time to avoid rate limits
    const results: TransitJobResult[] = []

    for (let i = 0; i < jobs.length; i += CONCURRENCY) {
      const batch = jobs.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.all(
        batch.map(async (job: JobLocationInput): Promise<TransitJobResult> => {
          try {
            // Get job coordinates
            let jobCoords: Coordinates | null = null

            if (job.location_lat && job.location_lng) {
              jobCoords = { lat: job.location_lat, lng: job.location_lng }
            } else if (job.location_address) {
              jobCoords = await geocodeAddress(job.location_address)
            }

            if (!jobCoords) {
              return {
                id: job.id,
                transitMinutes: null,
                lynxRoutes: [],
                summary: 'Location unknown',
                walkingMinutes: 0,
                transfers: 0,
                distanceMiles: 0,
                accessible: false
              }
            }

            // Calculate transit time
            const transit = await calculateTransitTime(userCoords!, jobCoords)

            if (!transit) {
              return {
                id: job.id,
                transitMinutes: null,
                lynxRoutes: [],
                summary: 'No transit available',
                walkingMinutes: 0,
                transfers: 0,
                distanceMiles: 0,
                accessible: false
              }
            }

            // Extract LYNX route numbers
            const lynxRoutes = transit.routes.map(r => r.routeNumber)

            return {
              id: job.id,
              transitMinutes: transit.durationMinutes,
              lynxRoutes,
              summary: transit.summary,
              walkingMinutes: transit.walkingMinutes,
              transfers: transit.transfers,
              distanceMiles: transit.distanceMiles,
              accessible: true
            }
          } catch (error) {
            console.error(`Error calculating transit for job ${job.id}:`, error)
            return {
              id: job.id,
              transitMinutes: null,
              lynxRoutes: [],
              summary: 'Error calculating',
              walkingMinutes: 0,
              transfers: 0,
              distanceMiles: 0,
              accessible: false
            }
          }
        })
      )

      results.push(...batchResults)
    }

    // Apply max commute filter if specified
    let filteredResults = results
    if (maxCommute !== undefined && maxCommute > 0) {
      filteredResults = results.filter(
        job => job.transitMinutes !== null && job.transitMinutes <= maxCommute
      )
    }

    // Sort by transit time (shortest first), nulls at end
    filteredResults.sort((a, b) => {
      if (a.transitMinutes === null && b.transitMinutes === null) return 0
      if (a.transitMinutes === null) return 1
      if (b.transitMinutes === null) return -1
      return a.transitMinutes - b.transitMinutes
    })

    return NextResponse.json({
      jobs: filteredResults,
      userLocation: userCoords,
      totalJobs: jobs.length,
      accessibleJobs: filteredResults.filter(j => j.accessible).length,
      filteredByCommute: maxCommute !== undefined
    })
  } catch (error) {
    console.error('Transit batch calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate transit times' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/transit?job_id=xxx&user_lat=xxx&user_lng=xxx
 *
 * Calculate transit time for a single job
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const jobId = searchParams.get('job_id')
  const userLat = searchParams.get('user_lat')
  const userLng = searchParams.get('user_lng')
  const userAddress = searchParams.get('user_address')
  const jobLat = searchParams.get('job_lat')
  const jobLng = searchParams.get('job_lng')
  const jobAddress = searchParams.get('job_address')

  try {
    // Resolve user location
    let userCoords: Coordinates | null = null
    if (userLat && userLng) {
      userCoords = { lat: parseFloat(userLat), lng: parseFloat(userLng) }
    } else if (userAddress) {
      userCoords = await geocodeAddress(userAddress)
    }

    if (!userCoords) {
      return NextResponse.json(
        { error: 'User location required (user_lat/user_lng or user_address)' },
        { status: 400 }
      )
    }

    // Resolve job location
    let jobCoords: Coordinates | null = null
    if (jobLat && jobLng) {
      jobCoords = { lat: parseFloat(jobLat), lng: parseFloat(jobLng) }
    } else if (jobAddress) {
      jobCoords = await geocodeAddress(jobAddress)
    }

    if (!jobCoords) {
      return NextResponse.json(
        { error: 'Job location required (job_lat/job_lng or job_address)' },
        { status: 400 }
      )
    }

    // Calculate transit
    const transit = await calculateTransitTime(userCoords, jobCoords)

    if (!transit) {
      return NextResponse.json({
        jobId,
        transitMinutes: null,
        lynxRoutes: [],
        summary: 'No transit available',
        accessible: false
      })
    }

    const display = formatTransitDisplay(transit)

    return NextResponse.json({
      jobId,
      transitMinutes: transit.durationMinutes,
      lynxRoutes: transit.routes.map(r => r.routeNumber),
      summary: transit.summary,
      walkingMinutes: transit.walkingMinutes,
      transfers: transit.transfers,
      distanceMiles: transit.distanceMiles,
      accessible: true,
      display
    })
  } catch (error) {
    console.error('Transit calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate transit time' },
      { status: 500 }
    )
  }
}
