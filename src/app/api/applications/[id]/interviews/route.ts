/**
 * Application Interviews API
 *
 * GET /api/applications/[id]/interviews - Get all interviews for an application
 * POST /api/applications/[id]/interviews - Create a new interview
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership of application
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Fetch interviews
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', applicationId)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Error fetching interviews:', error)
      throw error
    }

    return NextResponse.json({
      interviews: (interviews || []).map(transformInterview)
    })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership of application
    const { data: application } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.scheduledAt || !body.type) {
      return NextResponse.json(
        { error: 'Scheduled time and interview type are required' },
        { status: 400 }
      )
    }

    // Validate interview type
    const validTypes = ['phone', 'video', 'onsite', 'panel', 'technical', 'behavioral', 'case', 'other']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid interview type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current interview count for round number
    const { data: existingInterviews } = await supabase
      .from('interviews')
      .select('round')
      .eq('application_id', applicationId)
      .is('deleted_at', null)
      .order('round', { ascending: false })
      .limit(1)

    const nextRound = (existingInterviews?.[0]?.round || 0) + 1

    // Prepare interview data
    const interviewData = {
      application_id: applicationId,
      user_id: user.id,
      round: body.round || nextRound,
      interview_type: body.type,
      scheduled_at: body.scheduledAt,
      duration_minutes: body.duration || 60,
      location_address: body.location,
      location_lat: body.locationLat,
      location_lng: body.locationLng,
      transit_time_minutes: body.transitTimeMinutes,
      transit_route: body.transitRoute,
      interviewers: body.interviewers || [],
      prep_notes: body.prepNotes,
      notes: body.notes
    }

    // Insert interview
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single()

    if (error) {
      console.error('Error creating interview:', error)
      throw error
    }

    // Update application status to interviewing if it's not already
    if (application.status === 'applied' || application.status === 'pocketed') {
      await supabase
        .from('applications')
        .update({
          status: 'interviewing',
          first_interview_at: new Date().toISOString()
        })
        .eq('id', applicationId)
    }

    return NextResponse.json({
      interview: transformInterview(interview)
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    )
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
    locationLat: interview.location_lat,
    locationLng: interview.location_lng,
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
