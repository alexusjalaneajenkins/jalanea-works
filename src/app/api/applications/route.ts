/**
 * Applications API
 *
 * GET /api/applications - Get all applications for the current user
 * POST /api/applications - Create a new application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Application status mapping for display
const STATUS_GROUPS = {
  saved: ['discovered', 'pocketed'],
  applied: ['applied'],
  interviewing: ['interviewing'],
  offer: ['offer_received'],
  rejected: ['rejected'],
  withdrawn: ['withdrawn'],
  archived: ['archived']
} as const

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

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('applications')
      .select(`
        id,
        user_id,
        job_id,
        status,
        job_title,
        company,
        location,
        salary_min,
        salary_max,
        salary_type,
        job_url,
        discovered_at,
        pocketed_at,
        applied_at,
        first_interview_at,
        offer_received_at,
        offer_accepted_at,
        rejected_at,
        application_method,
        applied_via_pocket,
        pocket_tier,
        pocket_id,
        offer_amount,
        offer_deadline,
        offer_notes,
        offer_salary,
        offer_equity,
        offer_benefits,
        rejection_reason,
        rejection_feedback,
        user_notes,
        created_at,
        updated_at,
        jobs (
          id,
          title,
          company,
          location_city,
          location_state,
          salary_min,
          salary_max,
          salary_period,
          apply_url,
          valencia_friendly,
          valencia_match_score,
          scam_severity
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'all') {
      const statusGroup = STATUS_GROUPS[status as keyof typeof STATUS_GROUPS]
      if (statusGroup) {
        query = query.in('status', statusGroup)
      } else {
        query = query.eq('status', status)
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Error fetching applications:', error)
      throw error
    }

    // Fetch related data for each application
    const applicationIds = applications?.map(a => a.id) || []

    // Get interviews for these applications
    const { data: interviews } = await supabase
      .from('interviews')
      .select('*')
      .in('application_id', applicationIds)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })

    // Get notes for these applications
    const { data: notes } = await supabase
      .from('application_notes')
      .select('*')
      .in('application_id', applicationIds)
      .order('created_at', { ascending: false })

    // Get reminders for these applications
    const { data: reminders } = await supabase
      .from('application_reminders')
      .select('*')
      .in('application_id', applicationIds)
      .order('due_at', { ascending: true })

    // Group related data by application
    const interviewsByApp = groupBy(interviews || [], 'application_id')
    const notesByApp = groupBy(notes || [], 'application_id')
    const remindersByApp = groupBy(reminders || [], 'application_id')

    // Transform applications with nested data
    const transformedApplications = applications?.map(app => {
      // Supabase returns joins as arrays, get first element
      const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs
      return {
        id: app.id,
        userId: app.user_id,
        jobId: app.job_id,
        status: app.status,
        // Use application fields with job fallback
        jobTitle: app.job_title || job?.title || 'Unknown Position',
        company: app.company || job?.company || 'Unknown Company',
        location: app.location || (job ? `${job.location_city}, ${job.location_state}` : null),
        salaryMin: app.salary_min || job?.salary_min,
        salaryMax: app.salary_max || job?.salary_max,
        salaryType: app.salary_type || job?.salary_period,
        jobUrl: app.job_url || job?.apply_url,
        // Timestamps
        discoveredAt: app.discovered_at,
        pocketedAt: app.pocketed_at,
        appliedAt: app.applied_at,
        firstInterviewAt: app.first_interview_at,
        offerReceivedAt: app.offer_received_at,
        offerAcceptedAt: app.offer_accepted_at,
        rejectedAt: app.rejected_at,
        // Pocket info
        appliedViaPocket: app.applied_via_pocket,
        pocketTier: app.pocket_tier,
        pocketId: app.pocket_id,
        hasPocket: !!app.pocket_id,
        // Valencia info
        valenciaMatch: job?.valencia_friendly || false,
        valenciaMatchScore: job?.valencia_match_score,
        scamSeverity: job?.scam_severity,
        // Offer info
        offerAmount: app.offer_amount || app.offer_salary,
        offerDeadline: app.offer_deadline,
        offerNotes: app.offer_notes,
        offerEquity: app.offer_equity,
        offerBenefits: app.offer_benefits,
        // Rejection info
        rejectionReason: app.rejection_reason,
        rejectionFeedback: app.rejection_feedback,
        // User notes
        userNotes: app.user_notes,
        // Nested data
        interviews: (interviewsByApp[app.id] || []).map(transformInterview),
        notes: (notesByApp[app.id] || []).map(transformNote),
        reminders: (remindersByApp[app.id] || []).map(transformReminder),
        // Timestamps
        createdAt: app.created_at,
        updatedAt: app.updated_at
      }
    }) || []

    // Get stats using RPC function
    const { data: stats } = await supabase.rpc('get_application_stats', {
      p_user_id: user.id
    })

    const statsResult = stats?.[0] || {
      total_count: 0,
      saved_count: 0,
      applied_count: 0,
      interviewing_count: 0,
      offer_count: 0,
      rejected_count: 0,
      withdrawn_count: 0,
      archived_count: 0
    }

    return NextResponse.json({
      applications: transformedApplications,
      total: count || 0,
      stats: {
        total: Number(statsResult.total_count),
        saved: Number(statsResult.saved_count),
        applied: Number(statsResult.applied_count),
        interviewing: Number(statsResult.interviewing_count),
        offers: Number(statsResult.offer_count),
        rejected: Number(statsResult.rejected_count),
        withdrawn: Number(statsResult.withdrawn_count),
        archived: Number(statsResult.archived_count)
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields for manual entry
    if (!body.jobId && (!body.jobTitle || !body.company)) {
      return NextResponse.json(
        { error: 'Job title and company are required for manual entries' },
        { status: 400 }
      )
    }

    // Prepare application data
    const now = new Date().toISOString()
    const applicationData: Record<string, unknown> = {
      user_id: user.id,
      status: body.status || 'applied',
      job_id: body.jobId || null,
      job_title: body.jobTitle,
      company: body.company,
      location: body.location,
      salary_min: body.salaryMin,
      salary_max: body.salaryMax,
      salary_type: body.salaryType,
      job_url: body.jobUrl,
      application_method: body.applicationMethod,
      applied_via_pocket: body.appliedViaPocket || false,
      pocket_tier: body.pocketTier,
      pocket_id: body.pocketId,
      user_notes: body.userNotes,
      discovered_at: body.status === 'discovered' ? now : null,
      pocketed_at: body.status === 'pocketed' ? now : null,
      applied_at: ['applied', 'interviewing', 'offer_received', 'offer_accepted'].includes(body.status) ? (body.appliedAt || now) : null
    }

    // Insert application
    const { data: application, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      throw error
    }

    // If pocket was used, mark it as applied
    if (body.pocketId) {
      await supabase
        .from('job_pockets')
        .update({
          applied_after_viewing: true
        })
        .eq('id', body.pocketId)
    }

    return NextResponse.json({
      application: transformApplication(application)
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

// Helper functions
function groupBy<T extends Record<string, unknown>>(array: T[], key: string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = item[key] as string
    if (!groups[value]) {
      groups[value] = []
    }
    groups[value].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

function transformApplication(app: Record<string, unknown>) {
  return {
    id: app.id,
    userId: app.user_id,
    jobId: app.job_id,
    status: app.status,
    jobTitle: app.job_title,
    company: app.company,
    location: app.location,
    salaryMin: app.salary_min,
    salaryMax: app.salary_max,
    salaryType: app.salary_type,
    jobUrl: app.job_url,
    appliedAt: app.applied_at,
    appliedViaPocket: app.applied_via_pocket,
    pocketTier: app.pocket_tier,
    pocketId: app.pocket_id,
    userNotes: app.user_notes,
    createdAt: app.created_at,
    updatedAt: app.updated_at
  }
}

function transformInterview(interview: Record<string, unknown>) {
  return {
    id: interview.id,
    applicationId: interview.application_id,
    round: interview.round,
    type: interview.interview_type,
    scheduledAt: interview.scheduled_at,
    duration: interview.duration_minutes,
    location: interview.location_address,
    transitTimeMinutes: interview.transit_time_minutes,
    transitRoute: interview.transit_route,
    interviewers: interview.interviewers,
    prepCompleted: interview.prep_completed,
    prepNotes: interview.prep_notes,
    notes: interview.notes,
    completedAt: interview.completed_at,
    outcome: interview.outcome,
    outcomeNotes: interview.outcome_notes,
    completed: !!interview.completed_at,
    createdAt: interview.created_at,
    updatedAt: interview.updated_at
  }
}

function transformNote(note: Record<string, unknown>) {
  return {
    id: note.id,
    applicationId: note.application_id,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }
}

function transformReminder(reminder: Record<string, unknown>) {
  return {
    id: reminder.id,
    applicationId: reminder.application_id,
    type: reminder.reminder_type,
    message: reminder.message,
    dueAt: reminder.due_at,
    completed: reminder.completed,
    completedAt: reminder.completed_at,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at
  }
}
