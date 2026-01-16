'use client'

/**
 * Blocked Jobs Page
 * Shows jobs that were automatically blocked by Scam Shield (CRITICAL severity)
 * Provides transparency and FTC reporting links
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface BlockedJob {
  id: string
  title: string
  company: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  postedAt?: string
  scamReasons: string[]
  scamScore: number
  blockedAt: string
}

function formatSalary(min?: number, max?: number, type?: 'hourly' | 'yearly'): string {
  if (!min && !max) return 'Not listed'

  const suffix = type === 'hourly' ? '/hr' : '/yr'
  const format = (n: number) => {
    if (type === 'hourly') return `$${n}`
    return `$${Math.round(n / 1000)}K`
  }

  if (min && max) return `${format(min)} - ${format(max)}${suffix}`
  if (min) return `From ${format(min)}${suffix}`
  if (max) return `Up to ${format(max)}${suffix}`
  return 'Not listed'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function BlockedJobsPage() {
  const [blockedJobs, setBlockedJobs] = useState<BlockedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlockedJobs() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/jobs/blocked')
        if (response.ok) {
          const data = await response.json()
          setBlockedJobs(data.jobs || [])
        }
      } catch (error) {
        console.error('Error fetching blocked jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlockedJobs()
  }, [])

  const toggleJobDetails = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/jobs"
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert size={32} className="text-red-500" />
            Blocked Jobs
          </h1>
          <p className="text-slate-400 mt-1">
            Jobs automatically blocked by Scam Shield for your protection
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Why are these jobs blocked?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Our Scam Shield technology automatically analyzes every job listing for common scam
              patterns. Jobs on this page have <strong>CRITICAL</strong> red flags that strongly
              indicate fraudulent activity, such as requesting upfront payments, involving money
              transfers, or being part of known scam schemes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://reportfraud.ftc.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <ExternalLink size={16} />
                Report to FTC
              </a>
              <a
                href="https://consumer.ftc.gov/articles/job-scams"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Info size={16} />
                Learn About Job Scams
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{blockedJobs.length}</p>
              <p className="text-sm text-slate-400">Blocked Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Protected</p>
              <p className="text-sm text-slate-400">Your Status</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-slate-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && blockedJobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <ShieldCheck size={40} className="text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No Blocked Jobs
            </h2>
            <p className="text-slate-400 max-w-md mb-6">
              Great news! We haven&apos;t detected any critical scams in your job searches yet.
              Our Scam Shield is actively protecting you with every search.
            </p>
            <Link
              href="/dashboard/jobs"
              className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors"
            >
              <span>Continue Job Search</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Blocked Jobs List */}
      {!isLoading && blockedJobs.length > 0 && (
        <div className="space-y-4">
          {blockedJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#0f172a] border border-red-500/20 rounded-2xl overflow-hidden"
            >
              {/* Job Header */}
              <button
                onClick={() => toggleJobDetails(job.id)}
                className="w-full p-4 sm:p-5 text-left hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Blocked Icon */}
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert size={24} className="text-red-400" />
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-medium">
                        BLOCKED
                      </span>
                      <span className="text-xs text-slate-500">
                        Score: {job.scamScore}/100
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-1">
                      {job.company || 'Company not provided'}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight
                    size={20}
                    className={`text-slate-500 transition-transform ${
                      expandedJobId === job.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Quick Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-3 ml-15">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location || 'Location not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} />
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                  </span>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedJobId === job.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-red-500/20"
                >
                  <div className="p-4 sm:p-5 bg-red-500/5">
                    <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Why This Job Was Blocked
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {job.scamReasons.map((reason, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-red-500/20">
                      <a
                        href="https://reportfraud.ftc.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Report to FTC
                      </a>
                      <span className="text-xs text-slate-500 self-center">
                        Blocked on {formatDate(job.blockedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-slate-500 py-4"
      >
        <p>
          Scam Shield uses deterministic pattern matching to detect common job scam indicators.
          <br />
          If you believe a job was blocked incorrectly,{' '}
          <a href="mailto:support@jalanea.works" className="text-[#ffc425] hover:underline">
            contact support
          </a>.
        </p>
      </motion.div>
    </div>
  )
}
