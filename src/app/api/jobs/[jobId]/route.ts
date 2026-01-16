/**
 * GET /api/jobs/[jobId]
 *
 * Fetch a single job by ID (UUID or external_id)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkJobForScams } from '@/lib/scam-shield'
import { getJobDetails, transformJSearchJob, isJSearchAvailable } from '@/lib/jsearch-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  try {
    const supabase = createAdminClient()

    // Try to find job by UUID first, then by external_id
    let job = null

    // Check if jobId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUUID = uuidRegex.test(jobId)

    if (isUUID) {
      // Search by UUID
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .is('deleted_at', null)
        .single()

      if (!error && data) {
        job = data
      }
    }

    // If not found by UUID, try external_id (includes indeed_ prefix)
    if (!job) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('external_id', jobId)
        .is('deleted_at', null)
        .single()

      if (!error && data) {
        job = data
      }
    }

    // Also try without indeed_ prefix
    if (!job && !jobId.startsWith('indeed_')) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('external_id', `indeed_${jobId}`)
        .is('deleted_at', null)
        .single()

      if (!error && data) {
        job = data
      }
    }

    // Try jsearch_ prefix
    if (!job && !jobId.startsWith('jsearch_')) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('external_id', `jsearch_${jobId}`)
        .is('deleted_at', null)
        .single()

      if (!error && data) {
        job = data
      }
    }

    // If still not found and JSearch is available, try fetching directly from JSearch API
    if (!job && isJSearchAvailable()) {
      // Extract the actual job ID (remove prefixes if present)
      let jsearchJobId = jobId
      if (jobId.startsWith('jsearch_')) {
        jsearchJobId = jobId.replace('jsearch_', '')
      }

      try {
        const jsearchJob = await getJobDetails(jsearchJobId)
        if (jsearchJob) {
          const transformed = transformJSearchJob(jsearchJob)

          // Return the transformed JSearch job directly (not saved to DB yet)
          const scamCheck = checkJobForScams({
            title: transformed.title,
            company: transformed.company,
            company_website: transformed.company_website || undefined,
            description: transformed.description,
            requirements: transformed.requirements,
            salary_min: transformed.salary_min || undefined,
            salary_max: transformed.salary_max || undefined,
            contact_email: undefined,
            location_address: transformed.location_address,
            apply_url: transformed.apply_url
          })

          return NextResponse.json({
            job: {
              id: transformed.id,
              externalId: transformed.external_id,
              source: 'jsearch',
              title: transformed.title,
              company: transformed.company,
              companyWebsite: transformed.company_website,
              location: transformed.location_address,
              locationCity: transformed.location_city,
              locationState: transformed.location_state,
              locationLat: transformed.location_lat,
              locationLng: transformed.location_lng,
              remote: transformed.is_remote,
              salaryMin: transformed.salary_min,
              salaryMax: transformed.salary_max,
              salaryType: transformed.salary_period === 'hourly' ? 'hourly' : 'yearly',
              description: transformed.description,
              fullDescription: transformed.description,
              requirements: transformed.requirements ? transformed.requirements.split('\n').filter(Boolean) : [],
              benefits: transformed.benefits ? transformed.benefits.split('\n').filter(Boolean) : [],
              jobType: transformed.employment_type,
              applicationUrl: transformed.apply_url,
              applicationMethod: 'external',
              postedAt: transformed.posted_at,
              expiresAt: null,
              scamRiskLevel: scamCheck.severity,
              scamReasons: scamCheck.flags.map(f => f.description),
              scamScore: scamCheck.score,
              valenciaMatch: false,
              valenciaMatchPercentage: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            isSaved: false
          })
        }
      } catch (jsearchError) {
        console.error('JSearch fetch error:', jsearchError)
        // Fall through to 404
      }
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Apply scam check
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

    // Check if job is saved by current user
    let isSaved = false
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()

    if (user) {
      // Check applications table for saved/pocketed jobs
      const { data: application } = await supabase
        .from('applications')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single()

      if (application) {
        isSaved = ['discovered', 'pocketed'].includes(application.status)
      }
    }

    // Format response with full job details
    return NextResponse.json({
      job: {
        id: job.id,
        externalId: job.external_id,
        source: job.source,
        title: job.title,
        company: job.company,
        companyWebsite: job.company_website,
        location: job.location_address,
        locationCity: job.location_city,
        locationState: job.location_state,
        locationLat: job.location_lat,
        locationLng: job.location_lng,
        remote: job.remote,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryType: job.salary_period === 'hourly' ? 'hourly' : 'yearly',
        description: job.description,
        fullDescription: job.description, // Could be expanded later
        requirements: job.requirements ?
          (typeof job.requirements === 'string' ? job.requirements.split('\n').filter(Boolean) : job.requirements)
          : [],
        benefits: job.benefits ?
          (typeof job.benefits === 'string' ? job.benefits.split('\n').filter(Boolean) : job.benefits)
          : [],
        jobType: job.employment_type,
        applicationUrl: job.apply_url,
        applicationMethod: job.application_method,
        postedAt: job.posted_at,
        expiresAt: job.expires_at,
        // Scam Shield data
        scamRiskLevel: scamCheck.severity,
        scamReasons: scamCheck.flags.map(f => f.description),
        scamScore: scamCheck.score,
        // Valencia match
        valenciaMatch: job.valencia_friendly,
        valenciaMatchPercentage: job.valencia_match_score,
        // Timestamps
        createdAt: job.created_at,
        updatedAt: job.updated_at
      },
      isSaved
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs/[jobId]/track
 *
 * Track that user clicked "Apply" on a job
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const action = body.action || 'click'

    const adminSupabase = createAdminClient()

    // Get job UUID if we have external_id
    let jobUUID = jobId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(jobId)) {
      const { data: job } = await adminSupabase
        .from('jobs')
        .select('id')
        .eq('external_id', jobId)
        .single()

      if (job) {
        jobUUID = job.id
      }
    }

    // Check if application already exists
    const { data: existingApp } = await adminSupabase
      .from('applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('job_id', jobUUID)
      .single()

    if (existingApp) {
      // Update existing application
      if (action === 'apply' && existingApp.status !== 'applied') {
        await adminSupabase
          .from('applications')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString()
          })
          .eq('id', existingApp.id)
      }

      return NextResponse.json({
        success: true,
        applicationId: existingApp.id,
        status: action === 'apply' ? 'applied' : existingApp.status
      })
    }

    // Create new application
    const { data: newApp, error } = await adminSupabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: jobUUID,
        status: action === 'apply' ? 'applied' : 'discovered',
        discovered_at: new Date().toISOString(),
        applied_at: action === 'apply' ? new Date().toISOString() : null
      })
      .select('id, status')
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json(
        { error: 'Failed to track application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      applicationId: newApp.id,
      status: newApp.status
    })
  } catch (error) {
    console.error('Error tracking job:', error)
    return NextResponse.json(
      { error: 'Failed to track job' },
      { status: 500 }
    )
  }
}
