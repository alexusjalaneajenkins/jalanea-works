/**
 * Single Application API
 *
 * GET /api/applications/[id] - Get a single application with all details
 * PUT /api/applications/[id] - Update an application
 * PATCH /api/applications/[id] - Partially update an application (status, etc.)
 * DELETE /api/applications/[id] - Soft delete an application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Valid status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  discovered: ['pocketed', 'applied', 'withdrawn', 'archived'],
  pocketed: ['applied', 'withdrawn', 'archived'],
  applied: ['interviewing', 'rejected', 'withdrawn', 'archived'],
  interviewing: ['offer_received', 'rejected', 'withdrawn', 'archived'],
  offer_received: ['offer_accepted', 'rejected', 'withdrawn', 'archived'],
  offer_accepted: ['archived'],
  rejected: ['archived'],
  withdrawn: ['archived'],
  archived: [] // Terminal state
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch application with job details
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          company_website,
          location_city,
          location_state,
          location_address,
          salary_min,
          salary_max,
          salary_period,
          description,
          requirements,
          benefits,
          apply_url,
          posted_at,
          valencia_friendly,
          valencia_match_score,
          scam_severity,
          scam_flags
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Fetch interviews
    const { data: interviews } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', id)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })

    // Fetch notes
    const { data: notes } = await supabase
      .from('application_notes')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false })

    // Fetch reminders
    const { data: reminders } = await supabase
      .from('application_reminders')
      .select('*')
      .eq('application_id', id)
      .order('due_at', { ascending: true })

    // Fetch pocket if exists
    let pocket = null
    if (application.pocket_id) {
      const { data: pocketData } = await supabase
        .from('job_pockets')
        .select('id, tier, created_at, expires_at')
        .eq('id', application.pocket_id)
        .single()
      pocket = pocketData
    } else if (application.job_id) {
      // Check if there's a pocket for this job
      const { data: pocketData } = await supabase
        .from('job_pockets')
        .select('id, tier, created_at, expires_at')
        .eq('job_id', application.job_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      pocket = pocketData
    }

    const job = application.jobs

    return NextResponse.json({
      application: {
        id: application.id,
        userId: application.user_id,
        jobId: application.job_id,
        status: application.status,
        // Job info (application fields with job fallback)
        jobTitle: application.job_title || job?.title || 'Unknown Position',
        company: application.company || job?.company || 'Unknown Company',
        companyWebsite: job?.company_website,
        location: application.location || (job ? `${job.location_city}, ${job.location_state}` : null),
        locationAddress: job?.location_address,
        salaryMin: application.salary_min || job?.salary_min,
        salaryMax: application.salary_max || job?.salary_max,
        salaryType: application.salary_type || job?.salary_period,
        description: job?.description,
        requirements: job?.requirements,
        benefits: job?.benefits,
        jobUrl: application.job_url || job?.apply_url,
        postedAt: job?.posted_at,
        // Valencia info
        valenciaMatch: job?.valencia_friendly || false,
        valenciaMatchScore: job?.valencia_match_score,
        scamSeverity: job?.scam_severity,
        scamFlags: job?.scam_flags,
        // Timestamps
        discoveredAt: application.discovered_at,
        pocketedAt: application.pocketed_at,
        appliedAt: application.applied_at,
        firstInterviewAt: application.first_interview_at,
        offerReceivedAt: application.offer_received_at,
        offerAcceptedAt: application.offer_accepted_at,
        rejectedAt: application.rejected_at,
        // Application method
        applicationMethod: application.application_method,
        appliedViaPocket: application.applied_via_pocket,
        // Pocket info
        pocket: pocket ? {
          id: pocket.id,
          tier: pocket.tier,
          createdAt: pocket.created_at,
          expiresAt: pocket.expires_at
        } : null,
        hasPocket: !!pocket,
        pocketTier: application.pocket_tier || pocket?.tier,
        // Offer info
        offerSalary: application.offer_salary,
        offerAmount: application.offer_amount,
        offerEquity: application.offer_equity,
        offerBenefits: application.offer_benefits,
        offerDeadline: application.offer_deadline,
        offerNotes: application.offer_notes,
        // Rejection info
        rejectionReason: application.rejection_reason,
        rejectionFeedback: application.rejection_feedback,
        // User notes
        userNotes: application.user_notes,
        // Related data
        interviews: (interviews || []).map(transformInterview),
        notes: (notes || []).map(transformNote),
        reminders: (reminders || []).map(transformReminder),
        // Timestamps
        createdAt: application.created_at,
        updatedAt: application.updated_at
      }
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Verify ownership
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Validate status transition if status is being changed
    if (body.status && body.status !== existing.status) {
      const validTransitions = VALID_STATUS_TRANSITIONS[existing.status] || []
      if (!validTransitions.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${existing.status} to ${body.status}` },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      updated_at: now
    }

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      status: 'status',
      jobTitle: 'job_title',
      company: 'company',
      location: 'location',
      salaryMin: 'salary_min',
      salaryMax: 'salary_max',
      salaryType: 'salary_type',
      jobUrl: 'job_url',
      applicationMethod: 'application_method',
      userNotes: 'user_notes',
      offerAmount: 'offer_amount',
      offerDeadline: 'offer_deadline',
      offerNotes: 'offer_notes',
      offerSalary: 'offer_salary',
      offerEquity: 'offer_equity',
      offerBenefits: 'offer_benefits',
      rejectionReason: 'rejection_reason',
      rejectionFeedback: 'rejection_feedback'
    }

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) {
        updateData[dbKey] = body[jsKey]
      }
    }

    // Set status timestamps
    if (body.status) {
      const statusTimestamps: Record<string, string> = {
        applied: 'applied_at',
        interviewing: 'first_interview_at',
        offer_received: 'offer_received_at',
        offer_accepted: 'offer_accepted_at',
        rejected: 'rejected_at'
      }
      const timestampField = statusTimestamps[body.status]
      if (timestampField && !(existing as Record<string, unknown>)[timestampField]) {
        updateData[timestampField] = now
      }
    }

    // Update application
    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating application:', error)
      throw error
    }

    return NextResponse.json({
      application: transformApplication(application)
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH delegates to PUT for partial updates
  return PUT(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete the application
    const { error } = await supabase
      .from('applications')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting application:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted'
    })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}

// Transform functions
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
    applicationMethod: app.application_method,
    appliedViaPocket: app.applied_via_pocket,
    pocketTier: app.pocket_tier,
    pocketId: app.pocket_id,
    userNotes: app.user_notes,
    offerAmount: app.offer_amount,
    offerDeadline: app.offer_deadline,
    offerNotes: app.offer_notes,
    discoveredAt: app.discovered_at,
    pocketedAt: app.pocketed_at,
    appliedAt: app.applied_at,
    firstInterviewAt: app.first_interview_at,
    offerReceivedAt: app.offer_received_at,
    offerAcceptedAt: app.offer_accepted_at,
    rejectedAt: app.rejected_at,
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
