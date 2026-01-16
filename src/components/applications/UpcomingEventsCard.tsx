'use client'

/**
 * UpcomingEventsCard - Shows upcoming interviews and pending reminders
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  Bell,
  ChevronRight,
  Video,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { type UpcomingEvents, getInterviewTypeConfig } from './types'

interface UpcomingEventsCardProps {
  onEventClick?: (applicationId: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

function getInterviewIcon(type: string) {
  switch (type) {
    case 'phone':
      return Phone
    case 'video':
      return Video
    case 'onsite':
      return Building2
    default:
      return Calendar
  }
}

export function UpcomingEventsCard({ onEventClick }: UpcomingEventsCardProps) {
  const [events, setEvents] = useState<UpcomingEvents | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUpcoming() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/applications/upcoming?days=7')
        if (!response.ok) throw new Error('Failed to fetch upcoming events')
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcoming()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#ffc425]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">Failed to load upcoming events</span>
        </div>
      </div>
    )
  }

  if (!events || (events.interviews.length === 0 && events.reminders.length === 0)) {
    return null // Don't show card if nothing upcoming
  }

  const { interviews, reminders, summary } = events

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Calendar size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Upcoming This Week</h3>
            <p className="text-sm text-slate-400">
              {summary.totalInterviews} interview{summary.totalInterviews !== 1 ? 's' : ''}
              {summary.overdueReminders > 0 && (
                <span className="text-red-400 ml-2">
                  {summary.overdueReminders} overdue
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-800/50">
        {/* Today's interviews highlight */}
        {summary.todayInterviews > 0 && (
          <div className="p-4 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-300">
                {summary.todayInterviews} interview{summary.todayInterviews !== 1 ? 's' : ''} today
              </span>
            </div>
            {interviews
              .filter(i => formatDate(i.scheduledAt) === 'Today')
              .map((interview) => {
                const Icon = getInterviewIcon(interview.type)
                const typeConfig = getInterviewTypeConfig(interview.type)

                return (
                  <button
                    key={interview.id}
                    onClick={() => onEventClick?.(interview.applicationId)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors mb-2 last:mb-0"
                  >
                    <div className={`w-10 h-10 rounded-lg ${typeConfig.color.replace('text-', 'bg-').replace('400', '500/20')} flex items-center justify-center`}>
                      <Icon size={18} className={typeConfig.color} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white line-clamp-1">
                        {typeConfig.label} - {interview.company}
                      </p>
                      <p className="text-sm text-slate-400">
                        {interview.jobTitle} at {formatTime(interview.scheduledAt)}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                )
              })}
          </div>
        )}

        {/* Upcoming interviews */}
        {interviews.filter(i => formatDate(i.scheduledAt) !== 'Today').length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Coming Up
              </span>
            </div>
            <div className="space-y-2">
              {interviews
                .filter(i => formatDate(i.scheduledAt) !== 'Today')
                .slice(0, 3)
                .map((interview) => {
                  const Icon = getInterviewIcon(interview.type)
                  const typeConfig = getInterviewTypeConfig(interview.type)

                  return (
                    <button
                      key={interview.id}
                      onClick={() => onEventClick?.(interview.applicationId)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center`}>
                        <Icon size={16} className={typeConfig.color} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {interview.company}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(interview.scheduledAt)} at {formatTime(interview.scheduledAt)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${typeConfig.color.replace('text-', 'bg-').replace('400', '500/10')} ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {/* Pending reminders */}
        {reminders.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Reminders
              </span>
            </div>
            <div className="space-y-2">
              {reminders.slice(0, 3).map((reminder) => {
                const overdue = isOverdue(reminder.dueAt)

                return (
                  <button
                    key={reminder.id}
                    onClick={() => onEventClick?.(reminder.applicationId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      overdue
                        ? 'bg-red-500/10 hover:bg-red-500/20'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      overdue ? 'bg-red-500/20' : 'bg-yellow-500/10'
                    }`}>
                      {overdue ? (
                        <AlertCircle size={16} className="text-red-400" />
                      ) : (
                        <Bell size={16} className="text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-medium line-clamp-1 ${
                        overdue ? 'text-red-300' : 'text-white'
                      }`}>
                        {reminder.message}
                      </p>
                      <p className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
                        {reminder.company} - {overdue ? 'Overdue' : formatDate(reminder.dueAt)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default UpcomingEventsCard
