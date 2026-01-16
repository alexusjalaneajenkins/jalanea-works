'use client'

/**
 * ApplicationKanban - Kanban board view for applications (Starter+ feature)
 * Drag and drop applications between status columns
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  MoreVertical,
  GripVertical,
  Lock
} from 'lucide-react'
import { type Application, type ApplicationStatus, statusConfig } from './types'
import { StatusBadge } from './StatusBadge'
import { canTransition } from '@/lib/application-state-machine'

interface KanbanColumn {
  id: ApplicationStatus
  title: string
  color: string
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'applied', title: 'Applied', color: 'blue' },
  { id: 'interviewing', title: 'Interviewing', color: 'purple' },
  { id: 'offer_received', title: 'Offers', color: 'green' },
  { id: 'rejected', title: 'Rejected', color: 'red' }
]

interface ApplicationKanbanProps {
  applications: Application[]
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void
  onApplicationClick?: (application: Application) => void
  isLocked?: boolean // For tier-gating
}

interface KanbanCardProps {
  application: Application
  onClick?: () => void
  isDragging?: boolean
}

function formatSalary(min?: number, max?: number, type?: 'hourly' | 'yearly'): string {
  if (!min && !max) return ''
  const suffix = type === 'hourly' ? '/hr' : '/yr'
  const format = (n: number) => type === 'hourly' ? `$${n}` : `$${Math.round(n / 1000)}K`
  if (min && max) return `${format(min)}-${format(max)}${suffix}`
  if (min) return `${format(min)}${suffix}`
  if (max) return `${format(max)}${suffix}`
  return ''
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function KanbanCard({ application, onClick, isDragging }: KanbanCardProps) {
  const salary = formatSalary(application.salaryMin, application.salaryMax, application.salaryType)
  const hasUpcomingInterview = application.interviews.some(
    i => !i.completed && new Date(i.scheduledAt) > new Date()
  )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        bg-[#0f172a] border border-slate-700 rounded-xl p-3 cursor-pointer
        hover:border-slate-600 transition-colors
        ${isDragging ? 'shadow-xl ring-2 ring-[#ffc425]/50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
          {application.companyLogo ? (
            <img
              src={application.companyLogo}
              alt={application.company}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Building2 size={16} className="text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">
            {application.jobTitle}
          </h4>
          <p className="text-xs text-slate-400 truncate">{application.company}</p>
        </div>
        <div className="p-1 rounded hover:bg-slate-800 text-slate-500 cursor-grab">
          <GripVertical size={14} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {application.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {application.location.split(',')[0]}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1">
            <DollarSign size={10} />
            {salary}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-500">
          {application.appliedAt ? formatRelativeDate(application.appliedAt) : formatRelativeDate(application.createdAt)}
        </span>
        {hasUpcomingInterview && (
          <span className="flex items-center gap-1 text-xs text-purple-400">
            <Clock size={10} />
            Interview
          </span>
        )}
      </div>
    </motion.div>
  )
}

interface KanbanColumnComponentProps {
  column: KanbanColumn
  applications: Application[]
  onDrop: (applicationId: string, newStatus: ApplicationStatus) => void
  onApplicationClick?: (application: Application) => void
  isDragOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
}

function KanbanColumnComponent({
  column,
  applications,
  onDrop,
  onApplicationClick,
  isDragOver,
  onDragOver,
  onDragLeave
}: KanbanColumnComponentProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const applicationId = e.dataTransfer.getData('applicationId')
    if (applicationId) {
      onDrop(applicationId, column.id)
    }
    onDragLeave()
  }

  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/30',
    purple: 'border-purple-500/30',
    green: 'border-green-500/30',
    red: 'border-red-500/30'
  }

  const headerColorMap: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    red: 'text-red-400'
  }

  return (
    <div
      className={`
        flex-1 min-w-[280px] max-w-[320px]
        bg-slate-800/30 rounded-xl border-2 transition-colors
        ${isDragOver ? `${colorMap[column.color]} bg-slate-800/50` : 'border-transparent'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${headerColorMap[column.color]}`}>
            {column.title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {applications.map((app) => (
            <div
              key={app.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('applicationId', app.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
            >
              <KanbanCard
                application={app}
                onClick={() => onApplicationClick?.(app)}
              />
            </div>
          ))}
        </AnimatePresence>

        {applications.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">
            No applications
          </div>
        )}
      </div>
    </div>
  )
}

export function ApplicationKanban({
  applications,
  onStatusChange,
  onApplicationClick,
  isLocked = false
}: ApplicationKanbanProps) {
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null)

  const handleDrop = useCallback((applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === applicationId)
    if (!app) return

    // Check if transition is allowed
    if (canTransition(app.status, newStatus)) {
      onStatusChange(applicationId, newStatus)
    }
  }, [applications, onStatusChange])

  const getColumnApplications = (status: ApplicationStatus): Application[] => {
    // Include related statuses
    const statusMap: Record<string, ApplicationStatus[]> = {
      applied: ['applied', 'screening'],
      interviewing: ['interviewing'],
      offer_received: ['offer', 'offer_received', 'accepted', 'offer_accepted'],
      rejected: ['rejected', 'withdrawn']
    }
    const statuses = statusMap[status] || [status]
    return applications.filter(app => statuses.includes(app.status))
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700">
        <Lock size={48} className="text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Kanban View</h3>
        <p className="text-slate-400 text-center max-w-md mb-4">
          Upgrade to Starter or higher to unlock the drag-and-drop Kanban board
          for managing your applications visually.
        </p>
        <button className="px-6 py-2 bg-[#ffc425] text-[#0f172a] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors">
          Upgrade Now
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      {KANBAN_COLUMNS.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          applications={getColumnApplications(column.id)}
          onDrop={handleDrop}
          onApplicationClick={onApplicationClick}
          isDragOver={dragOverColumn === column.id}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOverColumn(column.id)
          }}
          onDragLeave={() => setDragOverColumn(null)}
        />
      ))}
    </div>
  )
}

export default ApplicationKanban
