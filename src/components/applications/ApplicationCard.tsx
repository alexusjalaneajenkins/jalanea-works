'use client'

/**
 * ApplicationCard - Individual application tracking card
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Bell,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  FileText
} from 'lucide-react'
import { type Application } from './types'
import { StatusBadge } from './StatusBadge'

interface ApplicationCardProps {
  application: Application
  onClick?: (application: Application) => void
  onEdit?: (application: Application) => void
  onDelete?: (applicationId: string) => void
  onViewPocket?: (application: Application) => void
  index?: number
}

function formatSalary(min?: number, max?: number, type?: 'hourly' | 'yearly'): string {
  if (!min && !max) return ''

  const suffix = type === 'hourly' ? '/hr' : '/yr'
  const format = (n: number) => {
    if (type === 'hourly') return `$${n}`
    return `$${Math.round(n / 1000)}K`
  }

  if (min && max) return `${format(min)} - ${format(max)}${suffix}`
  if (min) return `From ${format(min)}${suffix}`
  if (max) return `Up to ${format(max)}${suffix}`
  return ''
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  })
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateStr)
}

function getUpcomingInterview(application: Application) {
  const now = new Date()
  return application.interviews
    .filter(i => !i.completed && new Date(i.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
}

function getActiveReminders(application: Application) {
  const now = new Date()
  return application.reminders
    .filter(r => !r.completed && new Date(r.dueAt) > now)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
}

export function ApplicationCard({
  application,
  onClick,
  onEdit,
  onDelete,
  onViewPocket,
  index = 0
}: ApplicationCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const upcomingInterview = getUpcomingInterview(application)
  const activeReminders = getActiveReminders(application)
  const salary = formatSalary(application.salaryMin, application.salaryMax, application.salaryType)

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    action()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick?.(application)}
      className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all cursor-pointer relative"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {application.companyLogo ? (
            <img
              src={application.companyLogo}
              alt={application.company}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 size={24} className="text-slate-500" />
          )}
        </div>

        {/* Title & Company */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-1">
            {application.jobTitle}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-1">{application.company}</p>
        </div>

        {/* Status badge & menu */}
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} size="sm" />

          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false) }}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={handleAction(() => onEdit?.(application))}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Application
                  </button>
                  {application.hasPocket && (
                    <button
                      onClick={handleAction(() => onViewPocket?.(application))}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      View Job Pocket
                    </button>
                  )}
                  {application.jobUrl && (
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      View Job Posting
                    </a>
                  )}
                  <button
                    onClick={handleAction(() => onDelete?.(application.id))}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {application.location}
        </span>
        {salary && (
          <span className="flex items-center gap-1">
            <DollarSign size={14} />
            {salary}
          </span>
        )}
        {application.appliedAt && (
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            Applied {formatRelativeDate(application.appliedAt)}
          </span>
        )}
      </div>

      {/* Upcoming interview alert */}
      {upcomingInterview && (
        <div className="mb-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-300">
            <Clock size={16} />
            <span className="text-sm font-medium">
              {upcomingInterview.type.charAt(0).toUpperCase() + upcomingInterview.type.slice(1)} interview
            </span>
            <span className="text-purple-400 text-sm">
              {formatDate(upcomingInterview.scheduledAt)} at{' '}
              {new Date(upcomingInterview.scheduledAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Active reminders */}
      {activeReminders.length > 0 && !upcomingInterview && (
        <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-300">
            <Bell size={16} />
            <span className="text-sm">
              {activeReminders[0].message}
            </span>
            {activeReminders.length > 1 && (
              <span className="text-yellow-400 text-xs">
                +{activeReminders.length - 1} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Offer banner */}
      {application.status === 'offer' && application.offerAmount && (
        <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-300">
              <DollarSign size={16} />
              <span className="font-semibold">
                ${application.offerAmount.toLocaleString()}
                {application.salaryType === 'hourly' ? '/hr' : '/yr'}
              </span>
            </div>
            {application.offerDeadline && (
              <span className="text-green-400 text-sm">
                Deadline: {formatDate(application.offerDeadline)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {application.interviews.length > 0 && (
            <span>{application.interviews.filter(i => i.completed).length}/{application.interviews.length} interviews</span>
          )}
          {application.notes.length > 0 && (
            <span>{application.notes.length} notes</span>
          )}
          {application.hasPocket && (
            <span className="text-[#ffc425]">Pocket generated</span>
          )}
        </div>

        <ChevronRight size={18} className="text-slate-600" />
      </div>
    </motion.div>
  )
}

export default ApplicationCard
