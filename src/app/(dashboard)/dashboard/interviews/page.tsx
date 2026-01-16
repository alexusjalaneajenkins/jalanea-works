'use client'

/**
 * Interview Prep Dashboard
 *
 * Central hub for interview preparation, practice, and scheduling.
 */

import { useState, useEffect } from 'react'
import {
  Calendar,
  MessageSquare,
  CheckSquare,
  Clock,
  MapPin,
  ChevronRight,
  Play,
  Trophy,
  Target,
  Sparkles,
  Building2,
  Video,
  Phone,
  Users
} from 'lucide-react'
import { PracticeSession, PrepChecklist } from '@/components/interview'
import { INTERVIEW_TYPES, QUESTION_CATEGORIES, INTERVIEW_QUESTIONS } from '@/data/interview-questions'
import { getInterviewPrepChecklist, getQuestionsToAsk } from '@/lib/interview-prep'

interface Interview {
  id: string
  applicationId?: string
  round: number
  interviewType: string
  scheduledAt: string
  durationMinutes: number
  location?: string
  job?: {
    title: string
    company: string
  }
  prepCompleted: boolean
}

interface PracticeStats {
  totalSessions: number
  averageScore: number
  questionsAnswered: number
}

type TabType = 'upcoming' | 'practice' | 'tips'

export default function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showPractice, setShowPractice] = useState(false)
  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    totalSessions: 0,
    averageScore: 0,
    questionsAnswered: 0
  })

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interviews')
        if (response.ok) {
          const data = await response.json()
          setInterviews(data.interviews || [])
        }
      } catch (error) {
        console.error('Failed to fetch interviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  // Get interview type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'panel': return <Users className="w-4 h-4" />
      default: return <Building2 className="w-4 h-4" />
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === now.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  // Format time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate days until interview
  const daysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Questions to ask the interviewer
  const questionsToAsk = getQuestionsToAsk()

  // Tabs
  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', icon: Calendar },
    { id: 'practice' as const, label: 'Practice', icon: MessageSquare },
    { id: 'tips' as const, label: 'Tips', icon: Target }
  ]

  // If showing practice session
  if (showPractice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setShowPractice(false)}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          ← Back to Interview Prep
        </button>
        <PracticeSession
          questions={INTERVIEW_QUESTIONS.slice(0, 5)}
          jobTitle={selectedInterview?.job?.title}
          companyName={selectedInterview?.job?.company}
          onComplete={(results) => {
            const avgScore = results.length > 0
              ? results.reduce((sum, r) => sum + r.score, 0) / results.length
              : 0
            setPracticeStats(prev => ({
              totalSessions: prev.totalSessions + 1,
              averageScore: (prev.averageScore * prev.totalSessions + avgScore) / (prev.totalSessions + 1),
              questionsAnswered: prev.questionsAnswered + results.length
            }))
            setShowPractice(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
        <p className="text-gray-600 mt-1">
          Prepare for your interviews with AI-powered practice and personalized feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
            <p className="text-sm text-gray-500">Upcoming Interviews</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{practiceStats.totalSessions}</p>
            <p className="text-sm text-gray-500">Practice Sessions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {practiceStats.averageScore > 0 ? practiceStats.averageScore.toFixed(1) : '-'}
            </p>
            <p className="text-sm text-gray-500">Avg. Practice Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ready to practice?</h2>
            <p className="text-purple-100 mt-1">
              Get AI feedback on your answers to common interview questions
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedInterview(null)
              setShowPractice(true)
            }}
            className="bg-white text-purple-600 px-6 py-2.5 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Practice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
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
      <div className="space-y-6">
        {/* Upcoming Interviews Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-500 mt-4">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No upcoming interviews</h3>
                <p className="text-gray-500">
                  When you schedule interviews for your job applications, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              interviews.map(interview => {
                const days = daysUntil(interview.scheduledAt)
                const typeInfo = INTERVIEW_TYPES.find(t => t.id === interview.interviewType)
                const checklist = getInterviewPrepChecklist(interview.interviewType, days)

                return (
                  <div key={interview.id} className="bg-white rounded-xl border overflow-hidden">
                    {/* Interview Header */}
                    <div className="p-4 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            days <= 1 ? 'bg-red-100' :
                            days <= 3 ? 'bg-amber-100' :
                            'bg-green-100'
                          }`}>
                            {getTypeIcon(interview.interviewType)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {interview.job?.title || 'Interview'}
                            </h3>
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
                              {interview.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {interview.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          days <= 1 ? 'bg-red-100 text-red-700' :
                          days <= 3 ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {days === 0 ? 'Today!' :
                           days === 1 ? 'Tomorrow' :
                           `${days} days`}
                        </div>
                      </div>
                    </div>

                    {/* Prep Section */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Interview Prep</h4>
                        <button
                          onClick={() => {
                            setSelectedInterview(interview)
                            setShowPractice(true)
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          Practice for this interview
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mini Checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PrepChecklist
                          items={checklist.slice(0, 6)}
                          interviewDate={new Date(interview.scheduledAt)}
                        />

                        {/* Type Tips */}
                        {typeInfo && (
                          <div className="bg-white rounded-lg border p-4">
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              {typeInfo.name} Tips
                            </h5>
                            <ul className="space-y-2">
                              {typeInfo.tips.slice(0, 4).map((tip, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-500">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* Question Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Practice by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUESTION_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setShowPractice(true)}
                    className="bg-white rounded-xl border p-4 text-left hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="font-medium text-gray-900 mt-2 group-hover:text-purple-600">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Types */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Practice by Interview Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INTERVIEW_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setShowPractice(true)}
                    className="bg-white rounded-xl border p-4 text-left hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-xs text-gray-500">{type.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Practice */}
            {practiceStats.totalSessions > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{practiceStats.totalSessions}</p>
                    <p className="text-sm text-gray-500">Sessions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{practiceStats.questionsAnswered}</p>
                    <p className="text-sm text-gray-500">Questions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{practiceStats.averageScore.toFixed(1)}/10</p>
                    <p className="text-sm text-gray-500">Avg. Score</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* Questions to Ask */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Questions to Ask Your Interviewer
              </h3>
              <p className="text-gray-600 mb-4">
                Always have questions prepared! Here are some great options:
              </p>
              <ul className="space-y-3">
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

            {/* General Tips */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Interview Success Tips
              </h3>
              <div className="grid gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-900 mb-2">Use the STAR Method</h4>
                  <p className="text-sm text-purple-700">
                    For behavioral questions, structure your answers using Situation, Task, Action, and Result.
                    This keeps your answers focused and impactful.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-900 mb-2">Research the Company</h4>
                  <p className="text-sm text-green-700">
                    Know the company&apos;s mission, recent news, and culture. Reference specific things
                    you admire about the organization.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h4 className="font-medium text-amber-900 mb-2">Practice Out Loud</h4>
                  <p className="text-sm text-amber-700">
                    Speaking your answers helps you sound more natural. Use our practice feature
                    to get AI feedback on your responses.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-900 mb-2">Arrive Prepared</h4>
                  <p className="text-sm text-blue-700">
                    Bring copies of your resume, a notepad, and your questions list.
                    For virtual interviews, test your tech ahead of time.
                  </p>
                </div>
              </div>
            </div>

            {/* Valencia-Specific Tips */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Tips for Valencia Graduates
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-100">
                    <strong className="text-white">Highlight your transferable skills</strong> from work experience,
                    even if it seems unrelated to the role.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-100">
                    <strong className="text-white">Mention specific projects or coursework</strong> from Valencia
                    that relate to the position.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-100">
                    <strong className="text-white">Show enthusiasm for Orlando</strong> - employers value
                    candidates who are invested in the local community.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <span className="text-purple-100">
                    <strong className="text-white">Be ready to discuss growth</strong> - entry-level candidates
                    should show eagerness to learn and develop.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
