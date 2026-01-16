'use client'

/**
 * JobCard - Individual job listing card
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react'
import { LynxBadge } from './LynxBadge'
import { ValenciaBadge } from './ValenciaBadge'
import { ScamShieldBadge, type ScamRiskLevel } from './ScamShieldBadge'

export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  jobType?: string
  description?: string
  postedAt?: string
  applicationUrl?: string

  // Jalanea-specific fields
  transitMinutes?: number
  lynxRoutes?: string[]
  valenciaMatch?: boolean
  valenciaMatchPercentage?: number
  scamRiskLevel?: ScamRiskLevel
  scamReasons?: string[]
}

interface JobCardProps {
  job: Job
  onSave?: (jobId: string) => void
  onUnsave?: (jobId: string) => void
  onClick?: (job: Job) => void
  isSaved?: boolean
  index?: number
}

function formatSalary(min?: number, max?: number, type?: 'hourly' | 'yearly'): string {
  if (!min && !max) return 'Salary not listed'

  const suffix = type === 'hourly' ? '/hr' : '/yr'
  const format = (n: number) => {
    if (type === 'hourly') return `$${n}`
    return `$${Math.round(n / 1000)}K`
  }

  if (min && max) return `${format(min)} - ${format(max)}${suffix}`
  if (min) return `From ${format(min)}${suffix}`
  if (max) return `Up to ${format(max)}${suffix}`
  return 'Salary not listed'
}

function formatPostedDate(dateStr?: string): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Posted today'
  if (diffDays === 1) return 'Posted yesterday'
  if (diffDays < 7) return `Posted ${diffDays} days ago`
  if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`
  return `Posted ${Math.floor(diffDays / 30)} months ago`
}

export function JobCard({
  job,
  onSave,
  onUnsave,
  onClick,
  isSaved = false,
  index = 0
}: JobCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSaved) {
      onUnsave?.(job.id)
    } else {
      onSave?.(job.id)
    }
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Don't show critical scam jobs
  if (job.scamRiskLevel === 'critical') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(job)}
      className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 size={24} className="text-slate-500" />
          )}
        </div>

        {/* Title & Company */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-1">{job.company}</p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
            isSaved
              ? 'bg-[#ffc425]/10 text-[#ffc425]'
              : 'hover:bg-slate-800 text-slate-500 hover:text-white'
          }`}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {job.transitMinutes !== undefined && (
          <LynxBadge
            transitMinutes={job.transitMinutes}
            routeNumbers={job.lynxRoutes}
          />
        )}
        {job.valenciaMatch && (
          <ValenciaBadge matchPercentage={job.valenciaMatchPercentage} />
        )}
        {job.scamRiskLevel && job.scamRiskLevel !== 'low' && (
          <ScamShieldBadge
            riskLevel={job.scamRiskLevel}
            reasons={job.scamReasons}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={14} />
          {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
        </span>
        {job.jobType && (
          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs">
            {job.jobType}
          </span>
        )}
      </div>

      {/* Description preview */}
      {job.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        {job.postedAt && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={12} />
            {formatPostedDate(job.postedAt)}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyClick}
            className="px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] text-sm font-semibold hover:bg-[#ffd85d] transition-colors flex items-center gap-1"
          >
            Quick Apply
            <ExternalLink size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default JobCard
