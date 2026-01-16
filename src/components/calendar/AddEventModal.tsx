'use client'

/**
 * Add Event Modal
 *
 * Modal for adding new calendar events with type selection
 * and auto-commute generation.
 */

import { useState } from 'react'
import { X, Calendar, Clock, Briefcase, Ban, Bus } from 'lucide-react'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: {
    type: 'shift' | 'interview' | 'block'
    startTime: string
    endTime: string
    title: string
    description?: string
    location?: {
      address?: string
      lat?: number
      lng?: number
    }
    autoGenerateCommute?: boolean
  }) => Promise<void>
  initialDate?: Date
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  initialDate
}: AddEventModalProps) {
  const [type, setType] = useState<'shift' | 'interview' | 'block'>('shift')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  )
  const [startTime, setStartTime] = useState(
    initialDate?.toTimeString().slice(0, 5) || '09:00'
  )
  const [endTime, setEndTime] = useState('17:00')
  const [address, setAddress] = useState('')
  const [autoCommute, setAutoCommute] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventTypes = [
    { value: 'shift' as const, label: 'Work Shift', icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
    { value: 'interview' as const, label: 'Interview', icon: Calendar, color: 'text-purple-600 bg-purple-100' },
    { value: 'block' as const, label: 'Blocked Time', icon: Ban, color: 'text-red-600 bg-red-100' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Combine date and time
      const startDateTime = new Date(`${date}T${startTime}:00`)
      const endDateTime = new Date(`${date}T${endTime}:00`)

      // Validate times
      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time')
      }

      await onSave({
        type,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        title: title || eventTypes.find(t => t.value === type)?.label || 'Event',
        description: description || undefined,
        location: address ? { address } : undefined,
        autoGenerateCommute: autoCommute && type !== 'block'
      })

      // Reset form and close
      setTitle('')
      setDescription('')
      setAddress('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Event</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Event Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {eventTypes.map(option => {
                const Icon = option.icon
                const isSelected = type === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-primary-500 ${option.color}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${
                      isSelected ? '' : 'text-gray-400'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isSelected ? '' : 'text-gray-600'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={eventTypes.find(t => t.value === type)?.label}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Location (for shift/interview) */}
          {type !== 'block' && (
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Location (optional)
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Main St, Orlando, FL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {/* Auto Commute Toggle */}
          {type !== 'block' && address && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Bus className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Auto-block commute time</p>
                <p className="text-xs text-gray-500">Calculate LYNX transit time and block it</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCommute}
                  onChange={e => setAutoCommute(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Add any notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {saving ? 'Saving...' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  )
}
