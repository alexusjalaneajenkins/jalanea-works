/**
 * Interview Detail API
 *
 * GET /api/interviews/[id] - Get interview details
 * PATCH /api/interviews/[id] - Update interview
 * DELETE /api/interviews/[id] - Cancel interview
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET - Get interview details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch interview with related data
  const { data: interview, error } = await supabase
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
          location_address,
          description
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !interview) {
    return NextResponse.json(
      { error: 'Interview not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    interview: {
      id: interview.id,
      applicationId: interview.application_id,
      round: interview.round,
      interviewType: interview.interview_type,
      scheduledAt: interview.scheduled_at,
      durationMinutes: interview.duration_minutes,
      location: interview.location_address,
      coordinates: interview.location_lat && interview.location_lng
        ? { lat: interview.location_lat, lng: interview.location_lng }
        : null,
      transitTimeMinutes: interview.transit_time_minutes,
      transitRoute: interview.transit_route,
      interviewers: interview.interviewers,
      prepCompleted: interview.prep_completed,
      prepNotes: interview.prep_notes,
      completedAt: interview.completed_at,
      outcome: interview.outcome,
      outcomeNotes: interview.outcome_notes,
      job: interview.applications?.jobs,
      createdAt: interview.created_at
    }
  })
}

/**
 * PATCH - Update interview
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    // Map allowed update fields
    if (body.scheduledAt) updates.scheduled_at = body.scheduledAt
    if (body.durationMinutes) updates.duration_minutes = body.durationMinutes
    if (body.interviewType) updates.interview_type = body.interviewType
    if (body.location !== undefined) updates.location_address = body.location
    if (body.interviewers !== undefined) updates.interviewers = body.interviewers
    if (body.prepNotes !== undefined) updates.prep_notes = body.prepNotes
    if (body.prepCompleted !== undefined) updates.prep_completed = body.prepCompleted
    if (body.outcome) updates.outcome = body.outcome
    if (body.outcomeNotes !== undefined) updates.outcome_notes = body.outcomeNotes
    if (body.outcome) updates.completed_at = new Date().toISOString()

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    // Update interview
    const { data: interview, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update interview:', error)
      return NextResponse.json(
        { error: 'Failed to update interview' },
        { status: 500 }
      )
    }

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // If outcome is set, update application status
    if (body.outcome) {
      const { data: app } = await supabase
        .from('interviews')
        .select('application_id')
        .eq('id', id)
        .single()

      if (app) {
        let appStatus = 'interviewing'
        if (body.outcome === 'passed' || body.outcome === 'offer') {
          // Check if there are more rounds
          appStatus = 'interviewing'
        } else if (body.outcome === 'rejected') {
          appStatus = 'rejected'
        }

        await supabase
          .from('applications')
          .update({ status: appStatus, rejected_at: body.outcome === 'rejected' ? new Date().toISOString() : null })
          .eq('id', app.application_id)
      }
    }

    return NextResponse.json({
      interview: {
        id: interview.id,
        prepCompleted: interview.prep_completed,
        outcome: interview.outcome
      },
      message: 'Interview updated successfully'
    })

  } catch (error) {
    console.error('Interview update error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE - Cancel interview
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete interview
  const { error } = await supabase
    .from('interviews')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete interview:', error)
    return NextResponse.json(
      { error: 'Failed to cancel interview' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: 'Interview cancelled successfully'
  })
}
