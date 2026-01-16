/**
 * GET /api/jobs/blocked
 *
 * Fetch jobs that were blocked by Scam Shield (CRITICAL severity)
 * Returns blocked jobs with their scam flags for transparency
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface BlockedJobResponse {
  id: string
  title: string
  company: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  postedAt?: string
  scamReasons: string[]
  scamScore: number
  blockedAt: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Fetch jobs with critical scam severity
    const { data: blockedJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('scam_severity', 'critical')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching blocked jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blocked jobs' },
        { status: 500 }
      )
    }

    // Transform to response format
    const jobs: BlockedJobResponse[] = (blockedJobs || []).map(job => {
      // Extract scam reasons from flags
      const scamReasons: string[] = []
      if (job.scam_flags && Array.isArray(job.scam_flags)) {
        for (const flag of job.scam_flags) {
          if (flag.description) {
            scamReasons.push(flag.description)
          }
        }
      }

      // Calculate scam score based on severity
      // CRITICAL = 80-100
      const scamScore = 80 + Math.min(20, scamReasons.length * 10)

      return {
        id: job.id,
        title: job.title,
        company: job.company || 'Unknown Company',
        location: job.location_address || job.location_city || 'Unknown Location',
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryType: job.salary_period === 'hourly' ? 'hourly' : 'yearly',
        postedAt: job.posted_at,
        scamReasons: scamReasons.length > 0
          ? scamReasons
          : ['Critical scam indicators detected'],
        scamScore,
        blockedAt: job.created_at
      }
    })

    return NextResponse.json({
      jobs,
      total: jobs.length
    })
  } catch (error) {
    console.error('Blocked jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked jobs' },
      { status: 500 }
    )
  }
}
