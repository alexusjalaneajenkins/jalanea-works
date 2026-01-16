'use client'

/**
 * Shadow Calendar Page
 *
 * Full calendar view for managing work schedules, interviews,
 * and blocked time with automatic commute blocking.
 */

import { useState } from 'react'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { ShadowCalendar, AddEventModal, CalendarEvent as CalendarEventCard } from '@/components/calendar'
import { useShadowCalendar } from '@/hooks/useShadowCalendar'
import { type CalendarEvent } from '@/lib/shadow-calendar'

export default function CalendarPage() {
  const {
    events,
    loading,
    error,
    createEvent,
    deleteEvent
  } = useShadowCalendar()

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Handle adding event
  const handleAddEvent = (date: Date) => {
    setSelectedDate(date)
    setShowAddModal(true)
  }

  // Handle saving new event
  const handleSaveEvent = async (eventData: {
    type: 'shift' | 'interview' | 'block'
    startTime: string
    endTime: string
    title: string
    description?: string
    location?: { address?: string; lat?: number; lng?: number }
    autoGenerateCommute?: boolean
  }) => {
    const result = await createEvent({
      ...eventData,
      checkConflicts: true
    })

    if (!result.success && result.conflicts) {
      // Show conflict warning
      throw new Error(`Schedule conflict with ${result.conflicts.length} event(s)`)
    }

    setShowAddModal(false)
    setSelectedDate(null)
  }

  // Handle deleting event
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId)
      setSelectedEvent(null)
    }
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  // Calculate stats
  const upcomingInterviews = events.filter(
    e => e.type === 'interview' && e.startTime > new Date()
  ).length

  const shiftsThisWeek = events.filter(e => e.type === 'shift').length

  const totalCommuteMinutes = events
    .filter(e => e.type === 'commute')
    .reduce((sum, e) => sum + (e.transitTimeMinutes || 0), 0)

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Shadow Calendar</h1>
            <p className="text-muted-foreground mt-1">
              Manage your schedule and avoid over-committing
            </p>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Interviews</p>
              <p className="text-xl font-semibold text-gray-900">{upcomingInterviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Shifts This Week</p>
              <p className="text-xl font-semibold text-gray-900">{shiftsThisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Weekly Commute</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round(totalCommuteMinutes / 60 * 10) / 10} hrs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading calendar...</p>
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <ShadowCalendar
          events={events}
          onAddEvent={handleAddEvent}
          onEventClick={handleEventClick}
          onDeleteEvent={handleDeleteEvent}
          showWeeklyHours
        />
      )}

      {/* Selected Event Detail */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4">
              <CalendarEventCard
                event={selectedEvent}
                onDelete={() => handleDeleteEvent(selectedEvent.id!)}
                showDetails
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedDate(null)
        }}
        onSave={handleSaveEvent}
        initialDate={selectedDate || undefined}
      />

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">How Shadow Calendar Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>&bull; Add work shifts, interviews, and blocked time</li>
          <li>&bull; Commute time is automatically calculated using LYNX</li>
          <li>&bull; Conflicts are detected before you apply to new jobs</li>
          <li>&bull; Keep your schedule updated to avoid over-committing</li>
        </ul>
      </div>
    </div>
    </main>
  )
}
