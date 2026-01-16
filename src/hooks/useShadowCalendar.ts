'use client'

/**
 * Shadow Calendar Hook
 *
 * React hook for calendar operations including fetching events,
 * creating events, and running preflight checks.
 */

import { useState, useCallback, useEffect } from 'react'
import { type CalendarEvent } from '@/lib/shadow-calendar'

interface PreflightResult {
  canApply: boolean
  hasScheduleConflict: boolean
  hasCommuteConflict: boolean
  conflicts: Array<{
    eventId?: string
    eventTitle: string
    eventType: string
    overlapMinutes: number
    conflictType: 'full' | 'partial'
    overlapStart: string
    overlapEnd: string
  }>
  transitInfo: {
    durationMinutes: number
    route: string
    transfers: number
    walkingMinutes: number
  } | null
  maxCommuteMinutes: number
  commuteExceedsMax: boolean
}

interface UseShadowCalendarOptions {
  autoFetch?: boolean
  weekStart?: Date
}

export function useShadowCalendar(options: UseShadowCalendarOptions = {}) {
  const { autoFetch = true, weekStart } = options

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch calendar events for a date range
   */
  const fetchEvents = useCallback(async (start?: Date, end?: Date) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (start) params.set('start', start.toISOString())
      if (end) params.set('end', end.toISOString())

      const response = await fetch(`/api/shadow-calendar?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()

      // Parse dates
      const parsedEvents: CalendarEvent[] = data.events.map((event: CalendarEvent) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      }))

      setEvents(parsedEvents)
      return parsedEvents
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new calendar event
   */
  const createEvent = useCallback(async (event: {
    type: 'shift' | 'interview' | 'block'
    startTime: string
    endTime: string
    title?: string
    description?: string
    location?: {
      address?: string
      lat?: number
      lng?: number
    }
    jobId?: string
    applicationId?: string
    interviewId?: string
    autoGenerateCommute?: boolean
    checkConflicts?: boolean
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/shadow-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle conflict error
        if (response.status === 409) {
          return {
            success: false,
            conflicts: data.conflicts,
            error: 'Schedule conflict detected'
          }
        }
        throw new Error(data.error || 'Failed to create event')
      }

      // Refresh events
      await fetchEvents()

      return {
        success: true,
        event: data.event,
        commuteEvent: data.commuteEvent
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  /**
   * Update an existing event
   */
  const updateEvent = useCallback(async (eventId: string, updates: {
    startTime?: string
    endTime?: string
    title?: string
    description?: string
    type?: 'shift' | 'interview' | 'block' | 'commute'
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/shadow-calendar/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update event')
      }

      // Refresh events
      await fetchEvents()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  /**
   * Delete an event
   */
  const deleteEvent = useCallback(async (eventId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/shadow-calendar/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      // Refresh events
      await fetchEvents()

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [fetchEvents])

  /**
   * Run preflight check before applying to a job
   */
  const runPreflightCheck = useCallback(async (params: {
    jobId?: string
    employmentType?: string
    shifts?: Array<{
      dayOfWeek: number
      startHour: number
      startMinute: number
      endHour: number
      endMinute: number
    }>
    jobLocation?: {
      lat: number
      lng: number
    }
  }): Promise<PreflightResult | null> => {
    try {
      const response = await fetch('/api/shadow-calendar/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('Preflight check failed')
      }

      return await response.json()
    } catch (err) {
      console.error('Preflight check error:', err)
      return null
    }
  }, [])

  // Auto-fetch events on mount
  useEffect(() => {
    if (autoFetch) {
      fetchEvents(weekStart)
    }
  }, [autoFetch, fetchEvents, weekStart])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    runPreflightCheck
  }
}

export default useShadowCalendar
