/**
 * Shadow Calendar Preflight Check API
 *
 * POST /api/shadow-calendar/preflight - Check if a job would conflict with schedule
 *
 * Used before applying to jobs to detect scheduling conflicts with existing
 * calendar events and commute requirements.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  preflightCheck,
  getTypicalShifts,
  type CalendarEvent,
  type TypicalShift
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
 * POST - Check for scheduling conflicts before applying to a job
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
      jobId,
      employmentType = 'full-time',
      shifts,
      jobLocation
    } = body

    // Get user's current calendar events (next 2 weeks)
    const now = new Date()
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

    const { data: existingEvents, error: eventsError } = await supabase
      .from('shadow_calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', now.toISOString())
      .lte('end_time', twoWeeksLater.toISOString())

    if (eventsError) {
      console.error('Failed to fetch events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      )
    }

    const userEvents = (existingEvents as CalendarEventDB[] || []).map(dbToEvent)

    // Get user location
    const { data: userProfile } = await supabase
      .from('users')
      .select('location_lat, location_lng, max_commute_minutes, transportation')
      .eq('id', user.id)
      .single()

    let userLocation: Coordinates | undefined
    if (userProfile?.location_lat && userProfile?.location_lng) {
      userLocation = {
        lat: Number(userProfile.location_lat),
        lng: Number(userProfile.location_lng)
      }
    }

    // Get job location if job ID provided
    let jobCoordinates: Coordinates | undefined
    if (jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('location_lat, location_lng, employment_type')
        .eq('id', jobId)
        .single()

      if (job?.location_lat && job?.location_lng) {
        jobCoordinates = {
          lat: Number(job.location_lat),
          lng: Number(job.location_lng)
        }
      }
    } else if (jobLocation?.lat && jobLocation?.lng) {
      jobCoordinates = jobLocation
    }

    // Parse shifts if provided
    let parsedShifts: TypicalShift[] | undefined
    if (shifts && Array.isArray(shifts)) {
      parsedShifts = shifts
    }

    // Run preflight check
    const result = await preflightCheck(
      parsedShifts,
      employmentType,
      userEvents,
      userLocation,
      jobCoordinates
    )

    // Calculate typical shifts for reference
    const typicalShifts = getTypicalShifts(employmentType)

    return NextResponse.json({
      canApply: !result.hasScheduleConflict,
      hasScheduleConflict: result.hasScheduleConflict,
      hasCommuteConflict: result.hasCommuteConflict,
      conflicts: result.conflicts.map(c => ({
        eventId: c.existingEvent.id,
        eventTitle: c.existingEvent.title || 'Scheduled event',
        eventType: c.existingEvent.type,
        overlapMinutes: c.overlapMinutes,
        conflictType: c.type,
        overlapStart: c.overlapStart.toISOString(),
        overlapEnd: c.overlapEnd.toISOString()
      })),
      transitInfo: result.transitInfo ? {
        durationMinutes: result.transitInfo.durationMinutes,
        route: result.transitInfo.summary,
        transfers: result.transitInfo.transfers,
        walkingMinutes: result.transitInfo.walkingMinutes
      } : null,
      typicalShifts,
      maxCommuteMinutes: userProfile?.max_commute_minutes || 30,
      commuteExceedsMax: result.transitInfo
        ? result.transitInfo.durationMinutes > (userProfile?.max_commute_minutes || 30)
        : false
    })

  } catch (error) {
    console.error('Preflight check error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
