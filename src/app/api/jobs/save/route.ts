/**
 * POST /api/jobs/save - Save/pocket a job
 * DELETE /api/jobs/save - Unsave a job
 *
 * Uses the applications table with status 'pocketed' for saved jobs
 *
 * Request body:
 *   - jobId: string - The job ID to save/unsave (UUID or external_id)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Helper to get job UUID from any job identifier
async function getJobUUID(jobId: string, supabase: ReturnType<typeof createAdminClient>): Promise<string | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (uuidRegex.test(jobId)) {
    // Verify job exists
    const { data } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single()
    return data?.id || null
  }

  // Try external_id
  const { data: job1 } = await supabase
    .from('jobs')
    .select('id')
    .eq('external_id', jobId)
    .single()

  if (job1) return job1.id

  // Try with indeed_ prefix
  if (!jobId.startsWith('indeed_')) {
    const { data: job2 } = await supabase
      .from('jobs')
      .select('id')
      .eq('external_id', `indeed_${jobId}`)
      .single()

    if (job2) return job2.id
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()

    // Get the job UUID
    const jobUUID = await getJobUUID(jobId, adminSupabase)

    if (!jobUUID) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if application already exists
    const { data: existing } = await adminSupabase
      .from('applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('job_id', jobUUID)
      .single()

    if (existing) {
      // If job exists but not pocketed, update to pocketed
      if (existing.status === 'discovered') {
        await adminSupabase
          .from('applications')
          .update({
            status: 'pocketed',
            pocketed_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        return NextResponse.json({
          success: true,
          message: 'Job saved',
          applicationId: existing.id
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Job already saved',
        applicationId: existing.id
      })
    }

    // Create new application with pocketed status
    const { data: newApp, error } = await adminSupabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: jobUUID,
        status: 'pocketed',
        discovered_at: new Date().toISOString(),
        pocketed_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving job:', error)
      return NextResponse.json(
        { error: 'Failed to save job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      applicationId: newApp.id
    })
  } catch (error) {
    console.error('Error saving job:', error)
    return NextResponse.json(
      { error: 'Failed to save job' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()

    // Get the job UUID
    const jobUUID = await getJobUUID(jobId, adminSupabase)

    if (!jobUUID) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if application exists and is just saved (not applied)
    const { data: existing } = await adminSupabase
      .from('applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('job_id', jobUUID)
      .single()

    if (!existing) {
      return NextResponse.json({
        success: true,
        message: 'Job was not saved'
      })
    }

    // Only remove if status is discovered or pocketed (not applied)
    if (['discovered', 'pocketed'].includes(existing.status)) {
      const { error } = await adminSupabase
        .from('applications')
        .delete()
        .eq('id', existing.id)

      if (error) {
        console.error('Error unsaving job:', error)
        return NextResponse.json(
          { error: 'Failed to unsave job' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    // If already applied, just return success (can't unsave applied jobs)
    return NextResponse.json({
      success: true,
      message: 'Cannot unsave - job has already been applied to'
    })
  } catch (error) {
    console.error('Error unsaving job:', error)
    return NextResponse.json(
      { error: 'Failed to unsave job' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/save - Get user's saved jobs
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()

    // Get saved jobs (pocketed status)
    const { data: applications, error } = await adminSupabase
      .from('applications')
      .select(`
        id,
        status,
        pocketed_at,
        job:jobs (
          id,
          external_id,
          title,
          company,
          location_address,
          salary_min,
          salary_max,
          salary_period,
          posted_at,
          apply_url
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['discovered', 'pocketed'])
      .order('pocketed_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch saved jobs' },
        { status: 500 }
      )
    }

    // Format response
    const savedJobs = applications
      .filter(app => app.job)
      .map(app => ({
        applicationId: app.id,
        status: app.status,
        savedAt: app.pocketed_at,
        job: {
          id: app.job.id,
          externalId: app.job.external_id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location_address,
          salaryMin: app.job.salary_min,
          salaryMax: app.job.salary_max,
          salaryType: app.job.salary_period === 'hourly' ? 'hourly' : 'yearly',
          postedAt: app.job.posted_at,
          applicationUrl: app.job.apply_url
        }
      }))

    return NextResponse.json({
      savedJobs,
      total: savedJobs.length
    })
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved jobs' },
      { status: 500 }
    )
  }
}
