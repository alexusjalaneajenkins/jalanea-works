'use client'

/**
 * InterviewScheduler - Schedule interview form with transit integration
 */

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Building2,
  Plus,
  X,
  Loader2,
  Bus,
  User
} from 'lucide-react'
import { INTERVIEW_TYPES } from '@/data/interview-questions'

interface Interviewer {
  name: string
  title?: string
  linkedin?: string
}

interface InterviewSchedulerProps {
  applicationId: string
  jobTitle?: string
  company?: string
  onSchedule: (interview: ScheduledInterview) => void
  onCancel: () => void
}

export interface ScheduledInterview {
  applicationId: string
  round: number
  interviewType: string
  scheduledAt: string
  durationMinutes: number
  location?: {
    address: string
    lat?: number
    lng?: number
  }
  videoLink?: string
  interviewers: Interviewer[]
  notes?: string
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
]

export default function InterviewScheduler({
  applicationId,
  jobTitle,
  company,
  onSchedule,
  onCancel
}: InterviewSchedulerProps) {
  const [round, setRound] = useState(1)
  const [interviewType, setInterviewType] = useState('video')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [location, setLocation] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [newInterviewerName, setNewInterviewerName] = useState('')
  const [newInterviewerTitle, setNewInterviewerTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transitInfo, setTransitInfo] = useState<{ time: number; route: string } | null>(null)
  const [loadingTransit, setLoadingTransit] = useState(false)

  // Get transit time estimate
  const fetchTransitInfo = async (address: string) => {
    if (!address || interviewType !== 'in-person') return
    setLoadingTransit(true)

    try {
      const response = await fetch('/api/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: address })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.transitTime) {
          setTransitInfo({
            time: data.transitTime,
            route: data.route || 'LYNX Bus'
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch transit info:', error)
    } finally {
      setLoadingTransit(false)
    }
  }

  // Add interviewer
  const handleAddInterviewer = () => {
    if (!newInterviewerName.trim()) return

    setInterviewers(prev => [
      ...prev,
      { name: newInterviewerName.trim(), title: newInterviewerTitle.trim() || undefined }
    ])
    setNewInterviewerName('')
    setNewInterviewerTitle('')
  }

  // Remove interviewer
  const handleRemoveInterviewer = (index: number) => {
    setInterviewers(prev => prev.filter((_, i) => i !== index))
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !time) return

    setIsSubmitting(true)

    const scheduledAt = new Date(`${date}T${time}`).toISOString()

    const interview: ScheduledInterview = {
      applicationId,
      round,
      interviewType,
      scheduledAt,
      durationMinutes: duration,
      interviewers,
      notes: notes || undefined
    }

    if (interviewType === 'in-person' && location) {
      interview.location = { address: location }
    }

    if ((interviewType === 'video' || interviewType === 'phone') && videoLink) {
      interview.videoLink = videoLink
    }

    try {
      onSchedule(interview)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Type buttons
  const typeButtons = [
    { id: 'phone', icon: Phone, label: 'Phone' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'in-person', icon: Building2, label: 'In-Person' },
    { id: 'panel', icon: Users, label: 'Panel' }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Schedule Interview</h3>
        {jobTitle && company && (
          <p className="text-sm text-gray-500 mt-1">
            {jobTitle} at {company}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Round */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Round
          </label>
          <select
            value={round}
            onChange={(e) => setRound(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {typeButtons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setInterviewType(id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                  interviewType === id
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDuration(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  duration === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Location (for in-person) */}
        {interviewType === 'in-person' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={() => fetchTransitInfo(location)}
              placeholder="Enter address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {loadingTransit && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Calculating transit time...
              </p>
            )}
            {transitInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Bus className="w-4 h-4" />
                  <span>
                    ~{transitInfo.time} min via {transitInfo.route}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Link (for video/phone) */}
        {(interviewType === 'video' || interviewType === 'phone') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="w-4 h-4 inline mr-1" />
              Meeting Link (optional)
            </label>
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Interviewers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Interviewers (optional)
          </label>

          {/* Existing interviewers */}
          {interviewers.length > 0 && (
            <div className="space-y-2 mb-3">
              {interviewers.map((interviewer, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{interviewer.name}</span>
                    {interviewer.title && (
                      <span className="text-gray-500 ml-2">- {interviewer.title}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterviewer(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add interviewer form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterviewerName}
              onChange={(e) => setNewInterviewerName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={newInterviewerTitle}
              onChange={(e) => setNewInterviewerTitle(e.target.value)}
              placeholder="Title (optional)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleAddInterviewer}
              disabled={!newInterviewerName.trim()}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!date || !time || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Schedule Interview
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
