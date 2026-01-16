/**
 * Shadow Calendar API
 *
 * CRUD operations for calendar events with automatic commute blocking.
 *
 * GET    /api/shadow-calendar?start=DATE&end=DATE - Get events in range
 * POST   /api/shadow-calendar - Create event (with auto-commute)
 * DELETE /api/shadow-calendar?id=UUID - Delete event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateCommuteEvent,
  checkForConflicts,
  type CalendarEvent
} from '@/lib/shadow-calendar'
import { type Coordinates } from '@/lib/transit-client'

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
 * Transform CalendarEvent to DB insert format
 */
function eventToDb(event: CalendarEvent): Record<string, unknown> {
  return {
    user_id: event.userId,
    type: event.type,
    start_time: event.startTime.toISOString(),
    end_time: event.endTime.toISOString(),
    job_id: event.jobId || null,
    application_id: event.applicationId || null,
    interview_id: event.interviewId || null,
    transit_mode: event.transitMode || null,
    lynx_route: event.lynxRoute || null,
    transit_time_minutes: event.transitTimeMinutes || null,
    title: event.title || null,
    description: event.description || null
  }
}

/**
 * GET - Retrieve calendar events for a date range
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')

  // Default to current week if no dates provided
  const today = new Date()
  const defaultStart = new Date(today)
  defaultStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  defaultStart.setHours(0, 0, 0, 0)

  const defaultEnd = new Date(defaultStart)
  defaultEnd.setDate(defaultStart.getDate() + 7) // End of week

  const startDate = startParam ? new Date(startParam) : defaultStart
  const endDate = endParam ? new Date(endParam) : defaultEnd

  // Fetch events
  const { data: events, error } = await supabase
    .from('shadow_calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', startDate.toISOString())
    .lt('end_time', endDate.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Failed to fetch calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }

  const transformedEvents = (events as CalendarEventDB[]).map(dbToEvent)

  return NextResponse.json({
    events: transformedEvents,
    range: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  })
}

/**
 * POST - Create a new calendar event with optional auto-commute
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
      type,
      startTime,
      endTime,
      title,
      description,
      jobId,
      applicationId,
      interviewId,
      location,
      autoGenerateCommute = true,
      checkConflicts = true
    } = body

    // Validate required fields
    if (!type || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: type, startTime, endTime' },
        { status: 400 }
      )
    }

    // Create event object
    const newEvent: CalendarEvent = {
      userId: user.id,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      title,
      description,
      jobId,
      applicationId,
      interviewId,
      location
    }

    // Check for conflicts if requested
    if (checkConflicts) {
      const { data: existingEvents } = await supabase
        .from('shadow_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date(new Date(startTime).getTime() - 24 * 60 * 60 * 1000).toISOString())
        .lte('end_time', new Date(new Date(endTime).getTime() + 24 * 60 * 60 * 1000).toISOString())

      const transformedExisting = (existingEvents as CalendarEventDB[] || []).map(dbToEvent)
      const conflictResult = checkForConflicts(newEvent, transformedExisting)

      if (conflictResult.hasConflict) {
        return NextResponse.json({
          error: 'Schedule conflict detected',
          conflicts: conflictResult.conflicts.map(c => ({
            eventId: c.existingEvent.id,
            eventTitle: c.existingEvent.title,
            overlapMinutes: c.overlapMinutes,
            type: c.type
          }))
        }, { status: 409 })
      }
    }

    // Insert the main event
    const { data: createdEvent, error: insertError } = await supabase
      .from('shadow_calendar_events')
      .insert(eventToDb(newEvent))
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create event:', insertError)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    let commuteEvent = null

    // Auto-generate commute event for shifts and interviews
    if (autoGenerateCommute && (type === 'shift' || type === 'interview') && location?.lat && location?.lng) {
      // Get user location
      const { data: userProfile } = await supabase
        .from('users')
        .select('location_lat, location_lng, transportation')
        .eq('id', user.id)
        .single()

      if (userProfile?.location_lat && userProfile?.location_lng) {
        const userLocation: Coordinates = {
          lat: Number(userProfile.location_lat),
          lng: Number(userProfile.location_lng)
        }

        const transportMode = userProfile.transportation?.uses_lynx ? 'lynx'
          : userProfile.transportation?.has_car ? 'car'
            : userProfile.transportation?.uses_rideshare ? 'rideshare'
              : 'walk'

        const generatedCommute = await generateCommuteEvent(
          newEvent,
          userLocation,
          transportMode as 'lynx' | 'car' | 'rideshare' | 'walk'
        )

        if (generatedCommute) {
          const { data: insertedCommute, error: commuteError } = await supabase
            .from('shadow_calendar_events')
            .insert(eventToDb(generatedCommute))
            .select()
            .single()

          if (!commuteError && insertedCommute) {
            commuteEvent = dbToEvent(insertedCommute as CalendarEventDB)
          }
        }
      }
    }

    return NextResponse.json({
      event: dbToEvent(createdEvent as CalendarEventDB),
      commuteEvent,
      message: 'Event created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Calendar event creation error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE - Remove a calendar event
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('id')

  if (!eventId) {
    return NextResponse.json({ error: 'Missing event ID' }, { status: 400 })
  }

  // Delete the event (RLS ensures user can only delete their own)
  const { error } = await supabase
    .from('shadow_calendar_events')
    .delete()
    .eq('id', eventId)
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
