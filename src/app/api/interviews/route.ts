/**
 * Interviews API
 *
 * CRUD operations for interview scheduling.
 *
 * GET /api/interviews - Get user's scheduled interviews
 * POST /api/interviews - Schedule a new interview
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface InterviewDB {
  id: string
  application_id: string
  user_id: string
  round: number
  interview_type: string | null
  scheduled_at: string
  duration_minutes: number | null
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  transit_time_minutes: number | null
  transit_route: string | null
  interviewers: unknown
  prep_completed: boolean
  prep_notes: string | null
  completed_at: string | null
  outcome: string | null
  outcome_notes: string | null
  created_at: string
  updated_at: string
}

/**
 * GET - Retrieve scheduled interviews
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const upcoming = searchParams.get('upcoming') === 'true'
  const applicationId = searchParams.get('applicationId')

  // Build query
  let query = supabase
    .from('interviews')
    .select(`
      *,
      applications (
        id,
        status,
        jobs (
          id,
          title,
          company,
          location_address
        )
      )
    `)
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true })

  // Filter for upcoming only
  if (upcoming) {
    query = query.gte('scheduled_at', new Date().toISOString())
  }

  // Filter by application
  if (applicationId) {
    query = query.eq('application_id', applicationId)
  }

  const { data: interviews, error } = await query

  if (error) {
    console.error('Failed to fetch interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }

  // Transform data
  const transformedInterviews = (interviews || []).map((interview: InterviewDB & { applications?: { jobs?: { title?: string; company?: string } } }) => ({
    id: interview.id,
    applicationId: interview.application_id,
    round: interview.round,
    interviewType: interview.interview_type,
    scheduledAt: interview.scheduled_at,
    durationMinutes: interview.duration_minutes,
    location: interview.location_address,
    transitTimeMinutes: interview.transit_time_minutes,
    transitRoute: interview.transit_route,
    interviewers: interview.interviewers,
    prepCompleted: interview.prep_completed,
    prepNotes: interview.prep_notes,
    completedAt: interview.completed_at,
    outcome: interview.outcome,
    outcomeNotes: interview.outcome_notes,
    jobTitle: interview.applications?.jobs?.title,
    companyName: interview.applications?.jobs?.company
  }))

  return NextResponse.json({
    interviews: transformedInterviews,
    count: transformedInterviews.length
  })
}

/**
 * POST - Schedule a new interview
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      applicationId,
      round = 1,
      interviewType,
      scheduledAt,
      durationMinutes = 60,
      location,
      interviewers,
      notes
    } = body

    // Validate required fields
    if (!applicationId || !scheduledAt) {
      return NextResponse.json(
        { error: 'applicationId and scheduledAt are required' },
        { status: 400 }
      )
    }

    // Verify application belongs to user
    const { data: application } = await supabase
      .from('applications')
      .select('id, job_id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Insert interview
    const { data: interview, error: insertError } = await supabase
      .from('interviews')
      .insert({
        application_id: applicationId,
        user_id: user.id,
        round,
        interview_type: interviewType,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        location_address: location?.address || null,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null,
        interviewers: interviewers || [],
        prep_notes: notes || null,
        prep_completed: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create interview:', insertError)
      return NextResponse.json(
        { error: 'Failed to schedule interview' },
        { status: 500 }
      )
    }

    // Update application status to 'interviewing'
    await supabase
      .from('applications')
      .update({
        status: 'interviewing',
        first_interview_at: scheduledAt
      })
      .eq('id', applicationId)

    return NextResponse.json({
      interview: {
        id: interview.id,
        applicationId: interview.application_id,
        scheduledAt: interview.scheduled_at,
        interviewType: interview.interview_type,
        durationMinutes: interview.duration_minutes
      },
      message: 'Interview scheduled successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Interview scheduling error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
