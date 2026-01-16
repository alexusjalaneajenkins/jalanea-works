'use client'

/**
 * Interview Detail Page
 *
 * Full interview details with prep content, practice, and scheduling info.
 */

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Building2,
  ChevronLeft,
  Play,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
  MessageSquare,
  Target,
  FileText,
  User
} from 'lucide-react'
import { PracticeSession, PrepChecklist } from '@/components/interview'
import { INTERVIEW_TYPES, INTERVIEW_QUESTIONS } from '@/data/interview-questions'
import { getInterviewPrepChecklist, getQuestionsToAsk } from '@/lib/interview-prep'

interface Interview {
  id: string
  applicationId: string
  round: number
  interviewType: string
  scheduledAt: string
  durationMinutes: number
  location?: string
  coordinates?: { lat: number; lng: number }
  transitTimeMinutes?: number
  transitRoute?: string
  interviewers?: Array<{ name: string; title?: string; linkedin?: string }>
  prepCompleted: boolean
  prepNotes?: string
  completedAt?: string
  outcome?: string
  outcomeNotes?: string
  job?: {
    id: string
    title: string
    company: string
    location_address?: string
    description?: string
  }
  createdAt: string
}

type TabType = 'overview' | 'prep' | 'practice'

export default function InterviewDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showPractice, setShowPractice] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch interview details
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${id}`)
        if (!response.ok) {
          throw new Error('Interview not found')
        }
        const data = await response.json()
        setInterview(data.interview)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interview')
      } finally {
        setLoading(false)
      }
    }

    fetchInterview()
  }, [id])

  // Get interview type info
  const typeInfo = interview ? INTERVIEW_TYPES.find(t => t.id === interview.interviewType) : null

  // Calculate days until interview
  const daysUntil = interview
    ? Math.ceil((new Date(interview.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  // Get prep checklist
  const checklist = interview
    ? getInterviewPrepChecklist(interview.interviewType || 'video', daysUntil)
    : []

  // Questions to ask
  const questionsToAsk = getQuestionsToAsk(interview?.job?.title, interview?.job?.company)

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get type icon
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'phone': return <Phone className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'panel': return <Users className="w-5 h-5" />
      default: return <Building2 className="w-5 h-5" />
    }
  }

  // Mark prep as completed
  const handleMarkPrepComplete = async () => {
    if (!interview || markingComplete) return
    setMarkingComplete(true)

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prepCompleted: !interview.prepCompleted })
      })

      if (response.ok) {
        setInterview(prev => prev ? { ...prev, prepCompleted: !prev.prepCompleted } : null)
      }
    } catch (error) {
      console.error('Failed to update prep status:', error)
    } finally {
      setMarkingComplete(false)
    }
  }

  // Delete interview
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this interview?')) return
    setDeleting(true)

    try {
      const response = await fetch(`/api/interviews/${id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/dashboard/interviews')
      }
    } catch (error) {
      console.error('Failed to delete interview:', error)
    } finally {
      setDeleting(false)
    }
  }

  // Record outcome
  const handleRecordOutcome = async (outcome: 'passed' | 'pending' | 'rejected') => {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome })
      })

      if (response.ok) {
        setInterview(prev => prev ? { ...prev, outcome, completedAt: new Date().toISOString() } : null)
      }
    } catch (error) {
      console.error('Failed to record outcome:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
        <p className="mt-4 text-gray-500">Loading interview details...</p>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Interview Not Found</h1>
        <p className="text-gray-500 mb-4">{error || 'This interview does not exist.'}</p>
        <button
          onClick={() => router.push('/dashboard/interviews')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Interviews
        </button>
      </div>
    )
  }

  // Practice mode
  if (showPractice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowPractice(false)}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Interview Details
        </button>
        <PracticeSession
          questions={INTERVIEW_QUESTIONS.slice(0, 5)}
          jobTitle={interview.job?.title}
          companyName={interview.job?.company}
          onComplete={() => setShowPractice(false)}
        />
      </div>
    )
  }

  const isPast = new Date(interview.scheduledAt) < new Date()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/interviews')}
        className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Interviews
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isPast ? 'bg-gray-100' :
              daysUntil <= 1 ? 'bg-red-100' :
              daysUntil <= 3 ? 'bg-amber-100' :
              'bg-green-100'
            }`}>
              {getTypeIcon(interview.interviewType)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {interview.job?.title || 'Interview'}
              </h1>
              <p className="text-gray-600">{interview.job?.company}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(interview.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(interview.scheduledAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPast && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                daysUntil <= 1 ? 'bg-red-100 text-red-700' :
                daysUntil <= 3 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {daysUntil === 0 ? 'Today!' :
                 daysUntil === 1 ? 'Tomorrow' :
                 `${daysUntil} days`}
              </div>
            )}
            {interview.outcome && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                interview.outcome === 'passed' ? 'bg-green-100 text-green-700' :
                interview.outcome === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {interview.outcome === 'passed' ? 'Passed' :
                 interview.outcome === 'rejected' ? 'Not Selected' :
                 'Awaiting Result'}
              </div>
            )}
          </div>
        </div>

        {/* Interview Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase">Type</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              {typeInfo?.icon} {typeInfo?.name || interview.interviewType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Duration</p>
            <p className="font-medium text-gray-900">{interview.durationMinutes} min</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Round</p>
            <p className="font-medium text-gray-900">Round {interview.round}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Prep Status</p>
            <p className={`font-medium flex items-center gap-1 ${
              interview.prepCompleted ? 'text-green-600' : 'text-amber-600'
            }`}>
              {interview.prepCompleted ? (
                <><CheckCircle className="w-4 h-4" /> Complete</>
              ) : (
                <><AlertCircle className="w-4 h-4" /> In Progress</>
              )}
            </p>
          </div>
        </div>

        {/* Location/Link */}
        {interview.location && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">{interview.location}</p>
                {interview.transitTimeMinutes && (
                  <p className="text-xs text-gray-500 mt-1">
                    Transit: ~{interview.transitTimeMinutes} min {interview.transitRoute && `via ${interview.transitRoute}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview' as const, label: 'Overview', icon: Target },
          { id: 'prep' as const, label: 'Prep Checklist', icon: FileText },
          { id: 'practice' as const, label: 'Practice', icon: MessageSquare }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">Prepare for Success</h3>
            <p className="text-purple-100 mb-4">
              Practice answering common interview questions with AI feedback
            </p>
            <button
              onClick={() => setShowPractice(true)}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Practice
            </button>
          </div>

          {/* Interview Tips */}
          {typeInfo && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                {typeInfo.name} Tips
              </h3>
              <ul className="space-y-2">
                {typeInfo.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-purple-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interviewers */}
          {interview.interviewers && interview.interviewers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Interviewers
              </h3>
              <div className="space-y-3">
                {interview.interviewers.map((interviewer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{interviewer.name}</p>
                      {interviewer.title && (
                        <p className="text-sm text-gray-500">{interviewer.title}</p>
                      )}
                    </div>
                    {interviewer.linkedin && (
                      <a
                        href={interviewer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Ask */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Questions to Ask
            </h3>
            <ul className="space-y-2">
              {questionsToAsk.map((question, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <button
              onClick={handleMarkPrepComplete}
              disabled={markingComplete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                interview.prepCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {markingComplete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {interview.prepCompleted ? 'Prep Completed' : 'Mark as Prepped'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/interviews/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Cancel
              </button>
            </div>
          </div>

          {/* Record Outcome (if past) */}
          {isPast && !interview.outcome && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Record Interview Outcome</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRecordOutcome('passed')}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                >
                  Passed / Moving Forward
                </button>
                <button
                  onClick={() => handleRecordOutcome('pending')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Awaiting Result
                </button>
                <button
                  onClick={() => handleRecordOutcome('rejected')}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                >
                  Not Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'prep' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <PrepChecklist
            items={checklist}
            interviewDate={new Date(interview.scheduledAt)}
          />
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Practice for this Interview</h3>
            <p className="text-gray-600 mb-4">
              Get personalized practice questions based on the role at {interview.job?.company}.
            </p>
            <button
              onClick={() => setShowPractice(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Start Practice Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
