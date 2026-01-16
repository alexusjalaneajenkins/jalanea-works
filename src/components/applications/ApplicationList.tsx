'use client'

/**
 * ApplicationList - List of applications with loading and empty states
 */

import { motion } from 'framer-motion'
import { FolderOpen, Loader2 } from 'lucide-react'
import { ApplicationCard } from './ApplicationCard'
import { type Application, type ApplicationStatus } from './types'

interface ApplicationListProps {
  applications: Application[]
  isLoading?: boolean
  statusFilter?: ApplicationStatus | 'all'
  onApplicationClick?: (application: Application) => void
  onEdit?: (application: Application) => void
  onDelete?: (applicationId: string) => void
  onViewPocket?: (application: Application) => void
}

export function ApplicationList({
  applications,
  isLoading = false,
  statusFilter = 'all',
  onApplicationClick,
  onEdit,
  onDelete,
  onViewPocket
}: ApplicationListProps) {
  // Filter applications by status
  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status === statusFilter)

  // Sort: active statuses first, then by most recent activity
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    // Prioritize statuses with upcoming actions
    const priorityOrder: Record<ApplicationStatus, number> = {
      offer_received: 1,
      offer: 1,
      offer_accepted: 2,
      accepted: 2,
      interviewing: 3,
      screening: 4,
      applied: 5,
      pocketed: 6,
      saved: 6,
      discovered: 7,
      rejected: 8,
      withdrawn: 9,
      archived: 10
    }

    const priorityDiff = priorityOrder[a.status] - priorityOrder[b.status]
    if (priorityDiff !== 0) return priorityDiff

    // Then by most recent update
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#ffc425] mb-4" />
        <p className="text-slate-400">Loading applications...</p>
      </div>
    )
  }

  // Empty state
  if (sortedApplications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <FolderOpen size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {statusFilter === 'all'
              ? 'No applications yet'
              : `No ${statusFilter} applications`}
          </h3>
          <p className="text-slate-400 max-w-sm">
            {statusFilter === 'all'
              ? 'Start tracking your job applications to stay organized and never miss an opportunity.'
              : `You don't have any applications with "${statusFilter}" status.`}
          </p>
        </div>
      </motion.div>
    )
  }

  // Application list
  return (
    <div className="space-y-4">
      {sortedApplications.map((application, index) => (
        <ApplicationCard
          key={application.id}
          application={application}
          onClick={onApplicationClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewPocket={onViewPocket}
          index={index}
        />
      ))}
    </div>
  )
}

export default ApplicationList
