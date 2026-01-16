/**
 * Shadow Calendar Event API - Individual Event Operations
 *
 * GET    /api/shadow-calendar/[id] - Get single event
 * PATCH  /api/shadow-calendar/[id] - Update event
 * DELETE /api/shadow-calendar/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type CalendarEvent } from '@/lib/shadow-calendar'

interface CalendarEventDB {
  id: string
  user_id: string
  type: 'shift' | 'commute' | 'interview' | 'block'
  start_time: string
  end_time: string
  job_id: string | null
  application_id: string | null
  interview_id: string | null
  transit_mode: string | null
  lynx_route: string | null
  transit_time_minutes: number | null
  title: string | null
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * Transform DB record to CalendarEvent
 */
function dbToEvent(record: CalendarEventDB): CalendarEvent {
  return {
    id: record.id,
    userId: record.user_id,
    type: record.type,
    startTime: new Date(record.start_time),
    endTime: new Date(record.end_time),
    jobId: record.job_id || undefined,
    applicationId: record.application_id || undefined,
    interviewId: record.interview_id || undefined,
    transitMode: record.transit_mode || undefined,
    lynxRoute: record.lynx_route || undefined,
    transitTimeMinutes: record.transit_time_minutes || undefined,
    title: record.title || undefined,
    description: record.description || undefined
  }
}

/**
 * GET - Retrieve a single calendar event
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

  // Fetch event
  const { data: event, error } = await supabase
    .from('shadow_calendar_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({ event: dbToEvent(event as CalendarEventDB) })
}

/**
 * PATCH - Update a calendar event
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
    if (body.startTime) updates.start_time = new Date(body.startTime).toISOString()
    if (body.endTime) updates.end_time = new Date(body.endTime).toISOString()
    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.type) updates.type = body.type

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    // Update event
    const { data: updatedEvent, error } = await supabase
      .from('shadow_calendar_events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update event:', error)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      event: dbToEvent(updatedEvent as CalendarEventDB),
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE - Remove a calendar event
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

  // Delete the event
  const { error } = await supabase
    .from('shadow_calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Event deleted successfully' })
}
