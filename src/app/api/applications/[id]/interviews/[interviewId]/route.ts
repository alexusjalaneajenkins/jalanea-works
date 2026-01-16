/**
 * Single Interview API
 *
 * GET /api/applications/[id]/interviews/[interviewId] - Get a single interview
 * PUT /api/applications/[id]/interviews/[interviewId] - Update an interview
 * DELETE /api/applications/[id]/interviews/[interviewId] - Delete an interview
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const { id: applicationId, interviewId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch interview and verify ownership
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      interview: transformInterview(interview)
    })
  } catch (error) {
    console.error('Error fetching interview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const { id: applicationId, interviewId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      type: 'interview_type',
      scheduledAt: 'scheduled_at',
      duration: 'duration_minutes',
      location: 'location_address',
      locationLat: 'location_lat',
      locationLng: 'location_lng',
      transitTimeMinutes: 'transit_time_minutes',
      transitRoute: 'transit_route',
      interviewers: 'interviewers',
      prepCompleted: 'prep_completed',
      prepNotes: 'prep_notes',
      notes: 'notes',
      outcome: 'outcome',
      outcomeNotes: 'outcome_notes'
    }

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) {
        updateData[dbKey] = body[jsKey]
      }
    }

    // Handle completion
    if (body.completed === true && !body.completedAt) {
      updateData.completed_at = new Date().toISOString()
    } else if (body.completed === false) {
      updateData.completed_at = null
    } else if (body.completedAt) {
      updateData.completed_at = body.completedAt
    }

    // Update interview
    const { data: interview, error } = await supabase
      .from('interviews')
      .update(updateData)
      .eq('id', interviewId)
      .select()
      .single()

    if (error) {
      console.error('Error updating interview:', error)
      throw error
    }

    return NextResponse.json({
      interview: transformInterview(interview)
    })
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; interviewId: string }> }
) {
  try {
    const { id: applicationId, interviewId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete
    const { error } = await supabase
      .from('interviews')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', interviewId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting interview:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Interview deleted'
    })
  } catch (error) {
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview' },
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
