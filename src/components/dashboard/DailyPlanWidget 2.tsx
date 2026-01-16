'use client'

/**
 * DailyPlanWidget - Enhanced daily job plan display
 * Shows AI-curated jobs for today with progress tracking
 * Tier-based job counts: Essential (8), Starter (24), Premium (50), Unlimited (100)
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Circle,
  RefreshCw,
  Sparkles,
  Building2,
  Clock,
  ChevronDown,
  Bus,
  Bookmark,
  X,
  Target,
  TrendingUp,
  Loader2
} from 'lucide-react'

export interface DailyPlanJob {
  id: string
  jobId?: string
  title: string
  company: string
  companyLogo?: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  matchScore?: number
  matchReasons?: string[]
  priority?: 'high' | 'medium' | 'low'
  transitMinutes?: number
  lynxRoutes?: string[]
  applicationUrl?: string
  estimatedApplicationTime?: number
  tipsForApplying?: string[]
  postedDaysAgo?: number
  valenciaMatch?: boolean
  status: 'pending' | 'applied' | 'skipped' | 'saved' | 'viewed'
  position?: number
}

export interface DailyPlan {
  id: string
  date: string
  totalJobs: number
  totalEstimatedTime: number
  focusArea?: string
  motivationalMessage?: string
  stats?: {
    avgMatchScore: number
    avgSalary: number
    avgCommute: number
    valenciaMatchCount: number
  }
  jobs: DailyPlanJob[]
}

interface DailyPlanWidgetProps {
  plan: DailyPlan | null
  isLoading?: boolean
  onRefresh?: () => void
  onJobClick?: (job: DailyPlanJob) => void
  onStatusChange?: (jobId: string, status: DailyPlanJob['status']) => Promise<void>
}

function formatSalary(min?: number, max?: number, type?: 'hourly' | 'yearly'): string {
  if (!min && !max) return 'Salary not listed'

  const suffix = type === 'hourly' ? '/hr' : 'K'
  const format = (val: number) => {
    if (type === 'hourly') return `$${val}`
    return `$${Math.round(val / 1000)}`
  }

  if (min && max) return `${format(min)}${suffix} - ${format(max)}${suffix}`
  if (min) return `${format(min)}${suffix}+`
  if (max) return `Up to ${format(max)}${suffix}`
  return 'Salary not listed'
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'high':
      return 'text-green-400 bg-green-500/10'
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10'
    case 'low':
      return 'text-slate-400 bg-slate-500/10'
    default:
      return 'text-slate-400 bg-slate-500/10'
  }
}

function JobCard({
  job,
  index,
  onJobClick,
  onStatusChange,
  isUpdating
}: {
  job: DailyPlanJob
  index: number
  onJobClick?: (job: DailyPlanJob) => void
  onStatusChange?: (jobId: string, status: DailyPlanJob['status']) => Promise<void>
  isUpdating: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [localUpdating, setLocalUpdating] = useState(false)

  const handleStatusChange = async (status: DailyPlanJob['status']) => {
    if (!onStatusChange || localUpdating) return
    setLocalUpdating(true)
    try {
      await onStatusChange(job.id, status)
    } finally {
      setLocalUpdating(false)
    }
  }

  const isCompleted = job.status === 'applied'
  const isSkipped = job.status === 'skipped'
  const isSaved = job.status === 'saved'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-4 rounded-xl border transition-all
        ${isCompleted
          ? 'bg-green-500/5 border-green-500/20'
          : isSkipped
            ? 'bg-slate-800/20 border-slate-800 opacity-60'
            : isSaved
              ? 'bg-[#ffc425]/5 border-[#ffc425]/20'
              : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={() => handleStatusChange(isCompleted ? 'pending' : 'applied')}
          disabled={localUpdating || isUpdating}
          className="mt-0.5 flex-shrink-0 disabled:opacity-50"
        >
          {localUpdating ? (
            <Loader2 size={20} className="text-slate-400 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 size={20} className="text-green-400" />
          ) : (
            <Circle size={20} className="text-slate-600 hover:text-slate-400 transition-colors" />
          )}
        </button>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${isCompleted ? 'text-green-400 line-through' : isSkipped ? 'text-slate-500 line-through' : 'text-white'}`}>
                {job.title}
              </h4>
              <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                <Building2 size={14} />
                <span className="truncate">{job.company}</span>
              </div>
            </div>

            {/* Priority badge */}
            {job.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(job.priority)}`}>
                {job.priority}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
            </span>
            {job.transitMinutes && (
              <span className="flex items-center gap-1">
                <Bus size={12} />
                {job.transitMinutes} min
              </span>
            )}
            {job.matchScore && (
              <span className="flex items-center gap-1 text-[#ffc425]">
                <Target size={12} />
                {job.matchScore}% match
              </span>
            )}
          </div>

          {/* Match reasons (expandable) */}
          {job.matchReasons && job.matchReasons.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-400"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}
              />
              Why this job?
            </button>
          )}

          <AnimatePresence>
            {showDetails && job.matchReasons && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ul className="mt-2 space-y-1">
                  {job.matchReasons.map((reason, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <Sparkles size={10} className="text-[#ffc425] mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
                {job.tipsForApplying && job.tipsForApplying.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 font-medium mb-1">Tips for applying:</p>
                    <ul className="space-y-1">
                      {job.tipsForApplying.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <TrendingUp size={10} className="text-green-400 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1">
          <AnimatePresence>
            {(isHovered || job.status !== 'pending') && !isCompleted && !isSkipped && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col gap-1"
              >
                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleStatusChange('viewed')}
                    className="px-3 py-1.5 rounded-lg bg-[#ffc425] text-[#0f172a] text-xs font-semibold hover:bg-[#ffd85d] transition-colors flex items-center gap-1"
                  >
                    Apply
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => handleStatusChange(isSaved ? 'pending' : 'saved')}
                  disabled={localUpdating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                    isSaved
                      ? 'bg-[#ffc425]/20 text-[#ffc425]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Bookmark size={12} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => handleStatusChange('skipped')}
                  disabled={localUpdating}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Skip
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Valencia match indicator */}
      {job.valenciaMatch && (
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <span className="inline-flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
            <Sparkles size={10} />
            Valencia Match
          </span>
        </div>
      )}
    </motion.div>
  )
}

function EmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Calendar size={32} className="text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        We&apos;re generating your daily plan!
      </h3>
      <p className="text-slate-400 text-sm max-w-md mb-4">
        Check back in a few minutes. We&apos;ll find jobs that match your skills,
        location, and salary needs.
      </p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
        >
          <RefreshCw size={14} />
          Generate Plan
        </button>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-700" />
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-slate-700 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-700 rounded mb-2" />
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DailyPlanWidget({
  plan,
  isLoading,
  onRefresh,
  onJobClick,
  onStatusChange
}: DailyPlanWidgetProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const jobs = plan?.jobs || []
  const completedCount = jobs.filter(j => j.status === 'applied').length
  const totalCount = jobs.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isAllComplete = completedCount === totalCount && totalCount > 0

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing])

  const handleStatusChange = useCallback(async (jobId: string, status: DailyPlanJob['status']) => {
    if (!onStatusChange) return
    setIsUpdating(true)
    try {
      await onStatusChange(jobId, status)
    } finally {
      setIsUpdating(false)
    }
  }, [onStatusChange])

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffc425]/10 flex items-center justify-center">
            <Calendar size={20} className="text-[#ffc425]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Your Daily Plan</h2>
            <p className="text-sm text-slate-400">
              {plan?.focusArea || `${totalCount} jobs curated for today`}
            </p>
          </div>
        </div>

        {onRefresh && jobs.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Regenerate plan"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Motivational message */}
      {plan?.motivationalMessage && !isLoading && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-300">{plan.motivationalMessage}</p>
        </div>
      )}

      {/* Stats bar */}
      {plan?.stats && !isLoading && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <p className="text-lg font-bold text-white">{plan.stats.avgMatchScore}%</p>
            <p className="text-xs text-slate-500">Avg Match</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <p className="text-lg font-bold text-white">
              ${Math.round(plan.stats.avgSalary / 1000)}k
            </p>
            <p className="text-xs text-slate-500">Avg Salary</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <p className="text-lg font-bold text-white">{plan.stats.avgCommute}</p>
            <p className="text-xs text-slate-500">Avg Commute</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <p className="text-lg font-bold text-purple-400">{plan.stats.valenciaMatchCount}</p>
            <p className="text-xs text-slate-500">Valencia</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {jobs.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              {completedCount}/{totalCount} applied
            </span>
            {isAllComplete && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <Sparkles size={14} />
                All done!
              </span>
            )}
            {plan?.totalEstimatedTime && !isAllComplete && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                ~{plan.totalEstimatedTime} min total
              </span>
            )}
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${isAllComplete ? 'bg-green-500' : 'bg-[#ffc425]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : jobs.length === 0 ? (
        <EmptyState onRefresh={onRefresh} />
      ) : (
        <>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {jobs
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onJobClick={onJobClick}
                  onStatusChange={handleStatusChange}
                  isUpdating={isUpdating}
                />
              ))}
          </div>

          {/* Encouragement message */}
          {isAllComplete ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
            >
              <p className="text-green-400 font-medium">
                Amazing work! You&apos;ve applied to all today&apos;s jobs.
              </p>
              <p className="text-sm text-green-400/70 mt-1">
                Come back tomorrow for a fresh batch!
              </p>
            </motion.div>
          ) : completedCount > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 text-center">
              <p className="text-sm text-slate-400">
                {totalCount - completedCount} more to go. You&apos;ve got this!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DailyPlanWidget
