'use client'

/**
 * Shadow Calendar Component
 *
 * Week view calendar showing shifts, commutes, interviews, and blocked time.
 * Includes conflict detection and commute time visualization.
 */

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import CalendarEvent from './CalendarEvent'
import { type CalendarEvent as CalendarEventType, groupEventsByDate, calculateWeeklyHours } from '@/lib/shadow-calendar'

interface ShadowCalendarProps {
  events?: CalendarEventType[]
  onEventClick?: (event: CalendarEventType) => void
  onAddEvent?: (date: Date) => void
  onDeleteEvent?: (eventId: string) => void
  showWeeklyHours?: boolean
  viewMode?: 'week' | 'day'
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6 AM to 11 PM

export default function ShadowCalendar({
  events = [],
  onEventClick,
  onAddEvent,
  onDeleteEvent,
  showWeeklyHours = true,
  viewMode = 'week'
}: ShadowCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Update week start when current date changes
  useEffect(() => {
    setWeekStart(getWeekStart(currentDate))
  }, [currentDate])

  // Get week start (Sunday)
  function getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }

  // Navigate to previous week
  const goToPreviousWeek = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }, [currentDate])

  // Navigate to next week
  const goToNextWeek = useCallback(() => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }, [currentDate])

  // Go to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Get dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  // Group events by date
  const eventsByDate = groupEventsByDate(events)

  // Calculate weekly hours
  const weeklyHours = showWeeklyHours ? calculateWeeklyHours(events, weekStart) : 0

  // Get events for a specific day and hour
  const getEventsForSlot = (date: Date, hour: number): CalendarEventType[] => {
    const dateKey = date.toISOString().split('T')[0]
    const dayEvents = eventsByDate.get(dateKey) || []

    return dayEvents.filter(event => {
      const eventHour = event.startTime.getHours()
      return eventHour === hour
    })
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Format month/year for header
  const headerText = weekStart.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">{headerText}</h2>
          </div>

          {showWeeklyHours && (
            <span className="text-sm text-gray-500">
              {weeklyHours} hours scheduled
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Today
          </button>

          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={goToPreviousWeek}
              className="p-1.5 hover:bg-gray-100 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-1.5 hover:bg-gray-100 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {onAddEvent && (
            <button
              onClick={() => onAddEvent(new Date())}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Week View */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200">
              {/* Time column header */}
            </div>
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`p-2 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday(date) ? 'bg-primary-50' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-500">{DAYS[i]}</div>
                <div
                  className={`text-lg font-semibold ${
                    isToday(date) ? 'text-primary-600' : 'text-gray-900'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
                {/* Time label */}
                <div className="p-1 text-right text-xs text-gray-400 border-r border-gray-200 pr-2">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>

                {/* Day columns */}
                {weekDates.map((date, dayIndex) => {
                  const slotEvents = getEventsForSlot(date, hour)

                  return (
                    <div
                      key={dayIndex}
                      className={`relative border-r border-gray-100 last:border-r-0 ${
                        isToday(date) ? 'bg-primary-50/30' : ''
                      }`}
                      onClick={() => {
                        if (onAddEvent) {
                          const clickDate = new Date(date)
                          clickDate.setHours(hour, 0, 0, 0)
                          onAddEvent(clickDate)
                        }
                      }}
                    >
                      {slotEvents.map(event => (
                        <CalendarEvent
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick?.(event)}
                          onDelete={onDeleteEvent ? () => onDeleteEvent(event.id!) : undefined}
                          compact
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-500">Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-gray-600">Shift</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-500" />
          <span className="text-xs text-gray-600">Commute</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-xs text-gray-600">Interview</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-gray-600">Blocked</span>
        </div>
      </div>
    </div>
  )
}
