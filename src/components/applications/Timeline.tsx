'use client'

/**
 * Timeline - Activity timeline for application tracking
 * Shows status changes, interviews, notes, and key events
 */

import { motion } from 'framer-motion'
import {
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Gift,
  XCircle,
  LogOut,
  Send,
  Sparkles,
  CheckCircle,
  Archive,
  Search,
  Phone,
  Users,
  Video
} from 'lucide-react'
import type { Application, Interview } from './types'

export interface TimelineEvent {
  id: string
  date: Date
  type: 'status_change' | 'note' | 'interview' | 'offer' | 'created' | 'reminder'
  title: string
  description?: string
  icon?: React.ReactNode
  color?: string
}

interface TimelineProps {
  application: Application
  maxEvents?: number
  showAll?: boolean
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'discovered':
      return <Search size={16} />
    case 'pocketed':
      return <Sparkles size={16} />
    case 'saved':
      return <FileText size={16} />
    case 'applied':
      return <Send size={16} />
    case 'screening':
      return <Phone size={16} />
    case 'interviewing':
      return <Users size={16} />
    case 'offer':
    case 'offer_received':
      return <Gift size={16} />
    case 'accepted':
    case 'offer_accepted':
      return <CheckCircle size={16} />
    case 'rejected':
      return <XCircle size={16} />
    case 'withdrawn':
      return <LogOut size={16} />
    case 'archived':
      return <Archive size={16} />
    default:
      return <Calendar size={16} />
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'discovered':
      return 'bg-slate-500/20 text-slate-400'
    case 'pocketed':
      return 'bg-[#ffc425]/20 text-[#ffc425]'
    case 'saved':
      return 'bg-blue-500/20 text-blue-400'
    case 'applied':
      return 'bg-blue-500/20 text-blue-400'
    case 'screening':
      return 'bg-cyan-500/20 text-cyan-400'
    case 'interviewing':
      return 'bg-purple-500/20 text-purple-400'
    case 'offer':
    case 'offer_received':
      return 'bg-green-500/20 text-green-400'
    case 'accepted':
    case 'offer_accepted':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'rejected':
      return 'bg-red-500/20 text-red-400'
    case 'withdrawn':
      return 'bg-orange-500/20 text-orange-400'
    case 'archived':
      return 'bg-slate-600/20 text-slate-500'
    default:
      return 'bg-slate-500/20 text-slate-400'
  }
}

function getInterviewIcon(type: string) {
  switch (type) {
    case 'phone':
      return <Phone size={16} />
    case 'video':
      return <Video size={16} />
    default:
      return <Users size={16} />
  }
}

function buildTimelineEvents(application: Application): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Created event
  events.push({
    id: 'created',
    date: new Date(application.createdAt),
    type: 'created',
    title: 'Application tracked',
    description: `Started tracking ${application.jobTitle} at ${application.company}`,
    icon: <Calendar size={16} />,
    color: 'bg-slate-500/20 text-slate-400'
  })

  // Discovered
  if (application.discoveredAt) {
    events.push({
      id: 'discovered',
      date: new Date(application.discoveredAt),
      type: 'status_change',
      title: 'Job discovered',
      icon: getStatusIcon('discovered'),
      color: getStatusColor('discovered')
    })
  }

  // Pocketed
  if (application.pocketedAt) {
    events.push({
      id: 'pocketed',
      date: new Date(application.pocketedAt),
      type: 'status_change',
      title: 'Pocket generated',
      description: application.pocketTier ? `${application.pocketTier} tier pocket` : undefined,
      icon: getStatusIcon('pocketed'),
      color: getStatusColor('pocketed')
    })
  }

  // Applied
  if (application.appliedAt) {
    events.push({
      id: 'applied',
      date: new Date(application.appliedAt),
      type: 'status_change',
      title: 'Application submitted',
      description: application.applicationMethod ? `Via ${application.applicationMethod}` : undefined,
      icon: getStatusIcon('applied'),
      color: getStatusColor('applied')
    })
  }

  // Interviews
  application.interviews.forEach((interview: Interview, index: number) => {
    events.push({
      id: `interview-${interview.id}`,
      date: new Date(interview.scheduledAt),
      type: 'interview',
      title: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} interview${interview.round ? ` (Round ${interview.round})` : ''}`,
      description: interview.completed
        ? `Completed${interview.outcome ? ` - ${interview.outcome}` : ''}`
        : interview.location || undefined,
      icon: getInterviewIcon(interview.type),
      color: interview.completed
        ? 'bg-green-500/20 text-green-400'
        : 'bg-purple-500/20 text-purple-400'
    })
  })

  // First interview (status change)
  if (application.firstInterviewAt) {
    events.push({
      id: 'first-interview',
      date: new Date(application.firstInterviewAt),
      type: 'status_change',
      title: 'Interview process started',
      icon: getStatusIcon('interviewing'),
      color: getStatusColor('interviewing')
    })
  }

  // Offer received
  if (application.offerReceivedAt) {
    events.push({
      id: 'offer-received',
      date: new Date(application.offerReceivedAt),
      type: 'offer',
      title: 'Offer received',
      description: application.offerAmount
        ? `$${application.offerAmount.toLocaleString()}${application.salaryType === 'hourly' ? '/hr' : '/yr'}`
        : undefined,
      icon: getStatusIcon('offer_received'),
      color: getStatusColor('offer_received')
    })
  }

  // Offer accepted
  if (application.offerAcceptedAt) {
    events.push({
      id: 'offer-accepted',
      date: new Date(application.offerAcceptedAt),
      type: 'status_change',
      title: 'Offer accepted',
      icon: getStatusIcon('offer_accepted'),
      color: getStatusColor('offer_accepted')
    })
  }

  // Rejected
  if (application.rejectedAt) {
    events.push({
      id: 'rejected',
      date: new Date(application.rejectedAt),
      type: 'status_change',
      title: 'Application rejected',
      description: application.rejectionReason || undefined,
      icon: getStatusIcon('rejected'),
      color: getStatusColor('rejected')
    })
  }

  // Notes
  application.notes.forEach((note, index) => {
    events.push({
      id: `note-${note.id}`,
      date: new Date(note.createdAt),
      type: 'note',
      title: 'Note added',
      description: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
      icon: <MessageSquare size={16} />,
      color: 'bg-slate-500/20 text-slate-400'
    })
  })

  // Sort by date descending (most recent first)
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  return events
}

export function Timeline({ application, maxEvents = 10, showAll = false }: TimelineProps) {
  const allEvents = buildTimelineEvents(application)
  const events = showAll ? allEvents : allEvents.slice(0, maxEvents)

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p>No timeline events yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800" />

      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-10"
          >
            {/* Timeline dot */}
            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${event.color}`}>
              {event.icon}
            </div>

            {/* Event content */}
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">{event.title}</span>
                <span className="text-xs text-slate-500">
                  {formatDate(event.date)}
                  {event.type === 'interview' && ` at ${formatTime(event.date)}`}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-slate-400">{event.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show more indicator */}
      {!showAll && allEvents.length > maxEvents && (
        <div className="text-center pt-4">
          <span className="text-sm text-slate-500">
            +{allEvents.length - maxEvents} more events
          </span>
        </div>
      )}
    </div>
  )
}

export default Timeline
