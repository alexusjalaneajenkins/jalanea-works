/**
 * Shadow Calendar
 *
 * Manages user schedules with automatic commute time blocking
 * and conflict detection to prevent over-committing.
 */

import { calculateTransitTime, type Coordinates, type TransitResult } from './transit-client'

// Types
export interface CalendarEvent {
  id?: string
  userId: string
  type: 'shift' | 'commute' | 'interview' | 'block'
  startTime: Date
  endTime: Date
  jobId?: string
  applicationId?: string
  interviewId?: string
  transitMode?: string
  lynxRoute?: string
  transitTimeMinutes?: number
  title?: string
  description?: string
  location?: {
    address?: string
    lat?: number
    lng?: number
  }
}

export interface ConflictCheck {
  hasConflict: boolean
  conflicts: ConflictDetail[]
}

export interface ConflictDetail {
  existingEvent: CalendarEvent
  overlapMinutes: number
  type: 'full' | 'partial'
  overlapStart: Date
  overlapEnd: Date
}

export interface PreflightResult {
  hasScheduleConflict: boolean
  hasCommuteConflict: boolean
  conflicts: ConflictDetail[]
  suggestedAlternatives?: Date[]
  transitInfo?: TransitResult | null
}

export interface TypicalShift {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
}

/**
 * Check if two events overlap
 */
export function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  return event1.startTime < event2.endTime && event1.endTime > event2.startTime
}

/**
 * Calculate overlap in minutes between two events
 */
export function calculateOverlap(event1: CalendarEvent, event2: CalendarEvent): number {
  if (!eventsOverlap(event1, event2)) {
    return 0
  }

  const overlapStart = new Date(Math.max(event1.startTime.getTime(), event2.startTime.getTime()))
  const overlapEnd = new Date(Math.min(event1.endTime.getTime(), event2.endTime.getTime()))

  return Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60))
}

/**
 * Check if one event fully overlaps another
 */
export function isFullOverlap(newEvent: CalendarEvent, existingEvent: CalendarEvent): boolean {
  return (
    existingEvent.startTime <= newEvent.startTime &&
    existingEvent.endTime >= newEvent.endTime
  )
}

/**
 * Check for scheduling conflicts
 */
export function checkForConflicts(
  newEvent: CalendarEvent,
  existingEvents: CalendarEvent[]
): ConflictCheck {
  const conflicts: ConflictDetail[] = []

  for (const existing of existingEvents) {
    // Skip checking against itself
    if (existing.id && existing.id === newEvent.id) {
      continue
    }

    if (eventsOverlap(newEvent, existing)) {
      const overlapMinutes = calculateOverlap(newEvent, existing)
      const overlapStart = new Date(Math.max(newEvent.startTime.getTime(), existing.startTime.getTime()))
      const overlapEnd = new Date(Math.min(newEvent.endTime.getTime(), existing.endTime.getTime()))

      conflicts.push({
        existingEvent: existing,
        overlapMinutes,
        type: isFullOverlap(newEvent, existing) ? 'full' : 'partial',
        overlapStart,
        overlapEnd
      })
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  }
}

/**
 * Generate commute event for an event
 */
export async function generateCommuteEvent(
  event: CalendarEvent,
  userLocation: Coordinates,
  transportMode: 'lynx' | 'car' | 'rideshare' | 'walk' = 'lynx'
): Promise<CalendarEvent | null> {
  if (!event.location?.lat || !event.location?.lng) {
    return null
  }

  const destination: Coordinates = {
    lat: event.location.lat,
    lng: event.location.lng
  }

  // Calculate transit time arriving before the event
  const transitResult = await calculateTransitTime(
    userLocation,
    destination,
    event.startTime
  )

  if (!transitResult) {
    // Fallback: estimate 30 minutes commute
    const commuteStart = new Date(event.startTime.getTime() - 30 * 60 * 1000)

    return {
      userId: event.userId,
      type: 'commute',
      startTime: commuteStart,
      endTime: event.startTime,
      transitMode: transportMode,
      transitTimeMinutes: 30,
      title: `Commute to ${event.title || 'appointment'}`,
      description: 'Estimated commute time'
    }
  }

  const commuteStart = new Date(event.startTime.getTime() - transitResult.durationMinutes * 60 * 1000)

  return {
    userId: event.userId,
    type: 'commute',
    startTime: commuteStart,
    endTime: event.startTime,
    transitMode: transportMode,
    lynxRoute: transitResult.summary,
    transitTimeMinutes: transitResult.durationMinutes,
    title: `Commute to ${event.title || 'appointment'}`,
    description: `${transitResult.summary} - ${transitResult.durationMinutes} min`
  }
}

/**
 * Get typical shift times based on employment type
 */
export function getTypicalShifts(employmentType?: string): TypicalShift[] {
  const shiftsMap: Record<string, TypicalShift[]> = {
    'full-time': [
      // Monday - Friday, 9-5
      { dayOfWeek: 1, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
      { dayOfWeek: 2, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
      { dayOfWeek: 3, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
      { dayOfWeek: 4, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
      { dayOfWeek: 5, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }
    ],
    'part-time': [
      // 3 days a week, 4-hour shifts
      { dayOfWeek: 1, startHour: 10, startMinute: 0, endHour: 14, endMinute: 0 },
      { dayOfWeek: 3, startHour: 10, startMinute: 0, endHour: 14, endMinute: 0 },
      { dayOfWeek: 5, startHour: 10, startMinute: 0, endHour: 14, endMinute: 0 }
    ],
    'retail': [
      // Variable retail hours
      { dayOfWeek: 0, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
      { dayOfWeek: 2, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
      { dayOfWeek: 4, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
      { dayOfWeek: 6, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 }
    ],
    'restaurant': [
      // Evening restaurant shifts
      { dayOfWeek: 2, startHour: 16, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 3, startHour: 16, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 4, startHour: 16, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 5, startHour: 16, startMinute: 0, endHour: 23, endMinute: 0 },
      { dayOfWeek: 6, startHour: 16, startMinute: 0, endHour: 23, endMinute: 0 }
    ]
  }

  return shiftsMap[employmentType?.toLowerCase() || 'full-time'] || shiftsMap['full-time']
}

/**
 * Convert typical shift to calendar events for a given week
 */
export function shiftToEvents(
  shift: TypicalShift,
  weekStart: Date,
  userId: string,
  jobId?: string,
  title?: string
): CalendarEvent {
  // Find the date for this day of week
  const shiftDate = new Date(weekStart)
  shiftDate.setDate(shiftDate.getDate() + shift.dayOfWeek)
  shiftDate.setHours(shift.startHour, shift.startMinute, 0, 0)

  const endDate = new Date(shiftDate)
  endDate.setHours(shift.endHour, shift.endMinute, 0, 0)

  return {
    userId,
    type: 'shift',
    startTime: shiftDate,
    endTime: endDate,
    jobId,
    title: title || 'Work Shift'
  }
}

/**
 * Pre-flight check before applying to a job
 * Checks if job shifts would conflict with existing schedule
 */
export async function preflightCheck(
  jobShifts: TypicalShift[] | undefined,
  employmentType: string,
  userEvents: CalendarEvent[],
  userLocation?: Coordinates,
  jobLocation?: Coordinates
): Promise<PreflightResult> {
  const shiftsToCheck = jobShifts || getTypicalShifts(employmentType)
  const weekStart = getWeekStart(new Date())
  const allConflicts: ConflictDetail[] = []

  // Convert shifts to events and check each
  for (const shift of shiftsToCheck) {
    const shiftEvent = shiftToEvents(shift, weekStart, 'temp-check')
    const { conflicts } = checkForConflicts(shiftEvent, userEvents)
    allConflicts.push(...conflicts)
  }

  // Calculate transit info if locations provided
  let transitInfo: TransitResult | null = null
  if (userLocation && jobLocation) {
    transitInfo = await calculateTransitTime(userLocation, jobLocation)
  }

  // Check commute conflicts
  let hasCommuteConflict = false
  if (transitInfo && transitInfo.durationMinutes > 0) {
    for (const shift of shiftsToCheck) {
      const shiftEvent = shiftToEvents(shift, weekStart, 'temp-check')
      const commuteStart = new Date(shiftEvent.startTime.getTime() - transitInfo.durationMinutes * 60 * 1000)

      const commuteEvent: CalendarEvent = {
        userId: 'temp-check',
        type: 'commute',
        startTime: commuteStart,
        endTime: shiftEvent.startTime,
        title: 'Commute'
      }

      const { hasConflict } = checkForConflicts(commuteEvent, userEvents)
      if (hasConflict) {
        hasCommuteConflict = true
        break
      }
    }
  }

  return {
    hasScheduleConflict: allConflicts.length > 0,
    hasCommuteConflict,
    conflicts: allConflicts,
    transitInfo
  }
}

/**
 * Get start of week (Sunday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Find available time slots in a given range
 */
export function findAvailableSlots(
  existingEvents: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  requiredDurationMinutes: number
): Date[] {
  const availableSlots: Date[] = []

  // Sort events by start time
  const sortedEvents = [...existingEvents].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  // Check slots between events
  let currentTime = new Date(rangeStart)

  for (const event of sortedEvents) {
    // Skip events outside our range
    if (event.endTime <= rangeStart || event.startTime >= rangeEnd) {
      continue
    }

    // Check if there's a gap before this event
    const gapMinutes = (event.startTime.getTime() - currentTime.getTime()) / (1000 * 60)

    if (gapMinutes >= requiredDurationMinutes) {
      // Found an available slot
      availableSlots.push(new Date(currentTime))
    }

    // Move current time to end of this event
    if (event.endTime > currentTime) {
      currentTime = new Date(event.endTime)
    }
  }

  // Check final gap after all events
  const finalGapMinutes = (rangeEnd.getTime() - currentTime.getTime()) / (1000 * 60)
  if (finalGapMinutes >= requiredDurationMinutes) {
    availableSlots.push(new Date(currentTime))
  }

  return availableSlots
}

/**
 * Format event for display
 */
export function formatEventDisplay(event: CalendarEvent): {
  timeRange: string
  title: string
  subtitle: string
  typeLabel: string
  typeColor: string
} {
  const startTime = event.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const endTime = event.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const typeConfig = {
    shift: { label: 'Shift', color: 'bg-blue-500' },
    commute: { label: 'Commute', color: 'bg-gray-500' },
    interview: { label: 'Interview', color: 'bg-purple-500' },
    block: { label: 'Blocked', color: 'bg-red-500' }
  }

  const config = typeConfig[event.type]

  return {
    timeRange: `${startTime} - ${endTime}`,
    title: event.title || config.label,
    subtitle: event.description || '',
    typeLabel: config.label,
    typeColor: config.color
  }
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>()

  for (const event of events) {
    const dateKey = event.startTime.toISOString().split('T')[0]
    const existing = grouped.get(dateKey) || []
    existing.push(event)
    grouped.set(dateKey, existing)
  }

  // Sort events within each day
  grouped.forEach((dayEvents, key) => {
    grouped.set(
      key,
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    )
  })

  return grouped
}

/**
 * Get events for a week
 */
export function getWeekEvents(events: CalendarEvent[], weekStart: Date): CalendarEvent[] {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return events.filter(
    event =>
      event.startTime >= weekStart &&
      event.startTime < weekEnd
  )
}

/**
 * Calculate total hours scheduled in a week
 */
export function calculateWeeklyHours(events: CalendarEvent[], weekStart: Date): number {
  const weekEvents = getWeekEvents(events, weekStart)
    .filter(e => e.type === 'shift')

  const totalMinutes = weekEvents.reduce((sum, event) => {
    const durationMs = event.endTime.getTime() - event.startTime.getTime()
    return sum + durationMs / (1000 * 60)
  }, 0)

  return Math.round(totalMinutes / 60 * 10) / 10 // Round to 1 decimal
}

export default {
  checkForConflicts,
  eventsOverlap,
  calculateOverlap,
  generateCommuteEvent,
  preflightCheck,
  findAvailableSlots,
  formatEventDisplay,
  groupEventsByDate,
  getWeekEvents,
  calculateWeeklyHours,
  getTypicalShifts,
  shiftToEvents
}
