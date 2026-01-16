'use client'

/**
 * Calendar Event Component
 *
 * Displays a single calendar event with type-specific styling.
 */

import { X, Bus, Clock, Briefcase, Calendar, Ban } from 'lucide-react'
import { type CalendarEvent as CalendarEventType } from '@/lib/shadow-calendar'

interface CalendarEventProps {
  event: CalendarEventType
  onClick?: () => void
  onDelete?: () => void
  compact?: boolean
  showDetails?: boolean
}

const typeConfig = {
  shift: {
    icon: Briefcase,
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    label: 'Shift'
  },
  commute: {
    icon: Bus,
    bgColor: 'bg-gray-500',
    lightBg: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    label: 'Commute'
  },
  interview: {
    icon: Calendar,
    bgColor: 'bg-purple-500',
    lightBg: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    label: 'Interview'
  },
  block: {
    icon: Ban,
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    label: 'Blocked'
  }
}

export default function CalendarEvent({
  event,
  onClick,
  onDelete,
  compact = false,
  showDetails = false
}: CalendarEventProps) {
  const config = typeConfig[event.type]
  const Icon = config.icon

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate duration
  const durationMinutes = Math.round(
    (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
  )
  const durationHours = Math.floor(durationMinutes / 60)
  const durationMins = durationMinutes % 60
  const durationText = durationHours > 0
    ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
    : `${durationMins}m`

  // Calculate height for calendar display (pixels per minute)
  const heightPx = compact ? Math.max(24, Math.min(durationMinutes, 120)) : 'auto'

  if (compact) {
    return (
      <div
        className={`absolute inset-x-1 rounded-sm ${config.lightBg} border-l-2 ${config.borderColor} cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
        style={{ height: heightPx, minHeight: 24 }}
        onClick={onClick}
      >
        <div className="px-1 py-0.5 text-xs truncate">
          <span className={`font-medium ${config.textColor}`}>
            {event.title || config.label}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg ${config.lightBg} border ${config.borderColor} overflow-hidden ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className={`${config.bgColor} text-white px-3 py-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {event.title || config.label}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Delete event"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className={`w-4 h-4 ${config.textColor}`} />
          <span className="text-gray-700">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </span>
          <span className="text-gray-500">({durationText})</span>
        </div>

        {/* Transit Info (for commute events) */}
        {event.type === 'commute' && event.lynxRoute && (
          <div className="flex items-center gap-2 text-sm">
            <Bus className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{event.lynxRoute}</span>
            {event.transitTimeMinutes && (
              <span className="text-gray-500">({event.transitTimeMinutes} min)</span>
            )}
          </div>
        )}

        {/* Description */}
        {showDetails && event.description && (
          <p className="text-sm text-gray-600 mt-2">{event.description}</p>
        )}
      </div>
    </div>
  )
}
