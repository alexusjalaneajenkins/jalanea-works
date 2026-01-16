'use client'

/**
 * JobDetail - Full job information display
 */

import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Briefcase,
  CheckCircle2,
  Star,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { LynxBadge } from './LynxBadge'
import { ValenciaBadge } from './ValenciaBadge'
import { ScamShieldBadge, type ScamRiskLevel } from './ScamShieldBadge'
import type { Job } from './JobCard'

interface JobDetailProps {
  job: Job & {
    requirements?: string[]
    benefits?: string[]
    fullDescription?: string
  }
  onGeneratePocket: () => void
  onApply: () => void
  onSave: () => void
  onUnsave: () => void
  isSaved?: boolean
  isGeneratingPocket?: boolean
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

export function JobDetail({
  job,
  onGeneratePocket,
  onApply,
  onSave,
  onUnsave,
  isSaved = false,
  isGeneratingPocket = false
}: JobDetailProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={20} />
        <span>Back to Jobs</span>
      </Link>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            {/* Company logo */}
            <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={32} className="text-slate-500" />
              )}
            </div>

            {/* Title & Company */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
              <p className="text-lg text-slate-400 mb-3">{job.company}</p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={16} />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                </span>
                {job.jobType && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={16} />
                    {job.jobType}
                  </span>
                )}
                {job.postedAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {formatPostedDate(job.postedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={isSaved ? onUnsave : onSave}
              className={`p-3 rounded-xl transition-colors flex-shrink-0 ${
                isSaved
                  ? 'bg-[#ffc425]/10 text-[#ffc425]'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isSaved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
            </button>
          </div>
        </div>

        {/* Badges section */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
          <div className="flex flex-wrap gap-3">
            {job.transitMinutes !== undefined && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                <LynxBadge
                  transitMinutes={job.transitMinutes}
                  routeNumbers={job.lynxRoutes}
                  size="md"
                />
                {job.lynxRoutes && job.lynxRoutes.length > 0 && (
                  <span className="text-sm text-slate-400">
                    via Route {job.lynxRoutes.join(', ')}
                  </span>
                )}
              </div>
            )}

            {job.valenciaMatch && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                <ValenciaBadge
                  matchPercentage={job.valenciaMatchPercentage}
                  size="md"
                />
                <span className="text-sm text-slate-400">Matches your degree</span>
              </div>
            )}

            {job.scamRiskLevel && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                <ScamShieldBadge
                  riskLevel={job.scamRiskLevel}
                  reasons={job.scamReasons}
                  size="md"
                />
                <span className="text-sm text-slate-400">
                  {job.scamRiskLevel === 'low' ? 'Verified safe' : 'Review carefully'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FileText size={20} className="text-[#ffc425]" />
            Description
          </h2>
          <div className="text-slate-300 whitespace-pre-line leading-relaxed">
            {job.fullDescription || job.description || 'No description available.'}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[#ffc425]" />
              Requirements
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Star size={20} className="text-[#ffc425]" />
              Benefits
            </h2>
            <ul className="space-y-2">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-6 bg-slate-800/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGeneratePocket}
              disabled={isGeneratingPocket}
              className="flex-1 px-6 py-4 rounded-xl border-2 border-[#ffc425] text-[#ffc425] font-semibold hover:bg-[#ffc425]/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPocket ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#ffc425] border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Job Pocket
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onApply}
              className="flex-1 px-6 py-4 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors flex items-center justify-center gap-2"
            >
              Apply Now
              <ExternalLink size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default JobDetail
