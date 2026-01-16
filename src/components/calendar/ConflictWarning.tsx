'use client'

/**
 * Conflict Warning Component
 *
 * Displays schedule conflict warnings when a job application
 * would create scheduling conflicts.
 */

import { AlertTriangle, Clock, Calendar, X, Bus } from 'lucide-react'
import { type ConflictDetail } from '@/lib/shadow-calendar'

interface ConflictWarningProps {
  conflicts: Array<{
    eventId?: string
    eventTitle: string
    eventType: string
    overlapMinutes: number
    conflictType: 'full' | 'partial'
    overlapStart: string
    overlapEnd: string
  }>
  transitInfo?: {
    durationMinutes: number
    route: string
    transfers: number
    walkingMinutes: number
  } | null
  maxCommuteMinutes?: number
  commuteExceedsMax?: boolean
  onDismiss?: () => void
  onProceedAnyway?: () => void
  onViewCalendar?: () => void
}

export default function ConflictWarning({
  conflicts,
  transitInfo,
  maxCommuteMinutes = 30,
  commuteExceedsMax = false,
  onDismiss,
  onProceedAnyway,
  onViewCalendar
}: ConflictWarningProps) {
  const hasScheduleConflict = conflicts.length > 0

  // Format time from ISO string
  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Format date from ISO string
  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get event type icon and color
  const getEventTypeStyle = (type: string) => {
    const styles: Record<string, { color: string; label: string }> = {
      shift: { color: 'text-blue-600', label: 'Work shift' },
      commute: { color: 'text-gray-600', label: 'Commute' },
      interview: { color: 'text-purple-600', label: 'Interview' },
      block: { color: 'text-red-600', label: 'Blocked time' }
    }
    return styles[type] || { color: 'text-gray-600', label: 'Event' }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-yellow-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">
            {hasScheduleConflict ? 'Schedule Conflict Detected' : 'Commute Warning'}
          </h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-yellow-200 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-yellow-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Schedule Conflicts */}
        {hasScheduleConflict && (
          <div className="space-y-3">
            <p className="text-sm text-yellow-700">
              This job&apos;s typical schedule conflicts with your existing commitments:
            </p>

            <div className="space-y-2">
              {conflicts.map((conflict, index) => {
                const style = getEventTypeStyle(conflict.eventType)

                return (
                  <div
                    key={index}
                    className="bg-white border border-yellow-200 rounded-md p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${style.color}`} />
                        <span className="font-medium text-gray-900">
                          {conflict.eventTitle}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        conflict.conflictType === 'full'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {conflict.conflictType === 'full' ? 'Full overlap' : 'Partial overlap'}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(conflict.overlapStart)}, {formatTime(conflict.overlapStart)} - {formatTime(conflict.overlapEnd)}
                        </span>
                      </div>
                      <p className="mt-1 text-yellow-600">
                        {conflict.overlapMinutes} minutes of overlap
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Commute Warning */}
        {commuteExceedsMax && transitInfo && (
          <div className="space-y-2">
            {!hasScheduleConflict && (
              <p className="text-sm text-yellow-700">
                This job&apos;s commute exceeds your preferred maximum:
              </p>
            )}

            <div className="bg-white border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">
                  Commute: {transitInfo.durationMinutes} minutes
                </span>
                <span className="text-sm text-gray-500">
                  (max: {maxCommuteMinutes} min)
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>{transitInfo.route}</p>
                {transitInfo.transfers > 0 && (
                  <p className="text-yellow-600">
                    {transitInfo.transfers} transfer{transitInfo.transfers > 1 ? 's' : ''} required
                  </p>
                )}
                {transitInfo.walkingMinutes > 5 && (
                  <p>{transitInfo.walkingMinutes} min walking</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transit Info (when no conflict) */}
        {!commuteExceedsMax && transitInfo && !hasScheduleConflict && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                {transitInfo.durationMinutes} min commute via LYNX
              </span>
            </div>
            <p className="mt-1 text-sm text-green-700">{transitInfo.route}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onViewCalendar && (
            <button
              onClick={onViewCalendar}
              className="flex-1 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
            >
              View Calendar
            </button>
          )}
          {onProceedAnyway && (
            <button
              onClick={onProceedAnyway}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md transition-colors"
            >
              Apply Anyway
            </button>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-yellow-600">
          Note: Schedule conflicts don&apos;t prevent you from applying, but you may need to
          adjust your availability or negotiate shift times with the employer.
        </p>
      </div>
    </div>
  )
}
