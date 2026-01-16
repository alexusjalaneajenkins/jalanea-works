'use client'

/**
 * Pocket Detail Page
 * Shows full pocket content with job details
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Star,
  StarOff,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Clock,
  Sparkles,
  Share2,
  Printer,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

import { PocketTier1, type PocketTier1Data } from '@/components/jobs/PocketTier1'
import { PocketTier2, type PocketTier2Data } from '@/components/jobs/PocketTier2'
import { PocketTier3, type PocketTier3Data } from '@/components/jobs/PocketTier3'

interface JobData {
  id: string
  title: string
  company: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  salaryPeriod: string | null
  description: string
  requirements: string[] | null
  benefits: string[] | null
  applyUrl: string
  postedAt: string
  valenciaMatch: boolean
  valenciaMatchScore: number | null
  scamSeverity: string | null
  scamFlags: string[] | null
}

interface PocketData {
  id: string
  jobId: string
  tier: string
  data: PocketTier1Data | PocketTier2Data | PocketTier3Data
  modelUsed: string | null
  generationTimeMs: number | null
  tokensUsed: number | null
  isFavorite: boolean
  viewedAt: string
  appliedAfterViewing: boolean
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
}

const tierConfig: Record<string, { label: string; color: string; bgColor: string; readTime: string }> = {
  essential: {
    label: 'Essential',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    readTime: '20 seconds'
  },
  starter: {
    label: 'Starter',
    color: 'text-[#ffc425]',
    bgColor: 'bg-[#ffc425]/20',
    readTime: '90 seconds'
  },
  premium: {
    label: 'Premium',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    readTime: '5-10 minutes'
  },
  unlimited: {
    label: 'Unlimited',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    readTime: '10-15 minutes'
  }
}

export default function PocketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pocketId = params.pocketId as string

  const [pocket, setPocket] = useState<PocketData | null>(null)
  const [job, setJob] = useState<JobData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pocket details
  useEffect(() => {
    async function fetchPocket() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/job-pockets/${pocketId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Pocket not found')
          }
          throw new Error('Failed to fetch pocket')
        }

        const data = await response.json()
        setPocket(data.pocket)
        setJob(data.job)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPocket()
  }, [pocketId])

  // Toggle favorite
  const handleToggleFavorite = useCallback(async () => {
    if (!pocket) return

    try {
      const response = await fetch(`/api/job-pockets/${pocketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !pocket.isFavorite })
      })

      if (response.ok) {
        setPocket(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
      }
    } catch (err) {
      console.error('Error updating favorite:', err)
    }
  }, [pocket, pocketId])

  // Mark as applied
  const handleMarkApplied = useCallback(async () => {
    if (!pocket) return

    try {
      const response = await fetch(`/api/job-pockets/${pocketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appliedAfterViewing: true })
      })

      if (response.ok) {
        setPocket(prev => prev ? { ...prev, appliedAfterViewing: true } : null)
      }
    } catch (err) {
      console.error('Error marking applied:', err)
    }
  }, [pocket, pocketId])

  // Handle apply
  const handleApply = useCallback(() => {
    if (!job?.applyUrl) return
    handleMarkApplied()
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer')
  }, [job, handleMarkApplied])

  // Handle print
  const handlePrint = () => window.print()

  // Handle share
  const handleShare = async () => {
    if (navigator.share && job) {
      try {
        await navigator.share({
          title: `Job Pocket: ${job.title} at ${job.company}`,
          text: `Check out this job opportunity!`
        })
      } catch (err) {
        // User cancelled
      }
    }
  }

  // Format salary
  const formatSalary = (min: number | null, max: number | null, period: string | null) => {
    if (!min && !max) return null

    const format = (amount: number) => {
      if (period === 'hourly') return `$${amount}/hr`
      return `$${Math.round(amount / 1000)}k`
    }

    if (min && max) return `${format(min)} - ${format(max)}`
    if (min) return `${format(min)}+`
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffc425] mb-4" />
          <p className="text-slate-400">Loading pocket...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            {error === 'Pocket not found' ? 'Pocket Not Found' : 'Error Loading Pocket'}
          </h1>
          <p className="text-slate-400 mb-6">
            {error === 'Pocket not found'
              ? 'This pocket may have been deleted or expired.'
              : 'We had trouble loading this pocket. Please try again.'}
          </p>
          <Link
            href="/dashboard/pockets"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Pockets
          </Link>
        </motion.div>
      </div>
    )
  }

  // No pocket found
  if (!pocket || !job) {
    return null
  }

  const config = tierConfig[pocket.tier] || tierConfig.essential
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/pockets"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back to Pockets
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Job info card */}
        <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <span className="flex items-center gap-2">
                  <Building2 size={16} />
                  {job.company}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {job.location}
                </span>
                {salary && (
                  <span className="flex items-center gap-2">
                    <DollarSign size={16} />
                    {salary}
                  </span>
                )}
                {job.postedAt && (
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Posted {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  pocket.isFavorite
                    ? 'text-[#ffc425] bg-[#ffc425]/20 hover:bg-[#ffc425]/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={pocket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {pocket.isFavorite ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Print"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {/* Tier badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${config.bgColor} ${config.color}`}>
              <Sparkles size={14} />
              {config.label} Pocket
            </span>

            {/* Read time */}
            <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm flex items-center gap-2">
              <Clock size={14} />
              {config.readTime} read
            </span>

            {/* Valencia match */}
            {job.valenciaMatch && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                Valencia Match {job.valenciaMatchScore && `(${job.valenciaMatchScore}%)`}
              </span>
            )}

            {/* Applied badge */}
            {pocket.appliedAfterViewing && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium flex items-center gap-1">
                <CheckCircle size={14} />
                Applied
              </span>
            )}

            {/* Expired badge */}
            {pocket.isExpired && (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                Expired
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={!job.applyUrl || pocket.appliedAfterViewing}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pocket.appliedAfterViewing ? (
              <>
                <CheckCircle size={20} />
                Already Applied
              </>
            ) : (
              <>
                <ExternalLink size={20} />
                Apply to This Job
              </>
            )}
          </button>

          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <FileText size={20} />
            View Job Details
          </Link>
        </div>
      </motion.div>

      {/* Pocket content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl bg-slate-800/30 border border-slate-700"
      >
        {pocket.tier === 'essential' && (
          <PocketTier1 data={pocket.data as PocketTier1Data} />
        )}

        {pocket.tier === 'starter' && (
          <PocketTier2 data={pocket.data as PocketTier2Data} />
        )}

        {(pocket.tier === 'premium' || pocket.tier === 'unlimited') && (
          <PocketTier3
            data={pocket.data as PocketTier3Data}
            jobTitle={job.title}
            companyName={job.company}
          />
        )}
      </motion.div>

      {/* Generation info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center text-sm text-slate-500"
      >
        <p>
          Generated on {new Date(pocket.createdAt).toLocaleDateString()} at {new Date(pocket.createdAt).toLocaleTimeString()}
          {pocket.modelUsed && ` • Model: ${pocket.modelUsed}`}
          {pocket.generationTimeMs && ` • ${(pocket.generationTimeMs / 1000).toFixed(1)}s`}
        </p>
        {pocket.expiresAt && !pocket.isExpired && (
          <p className="mt-1">
            Expires on {new Date(pocket.expiresAt).toLocaleDateString()}
          </p>
        )}
      </motion.div>
    </div>
  )
}
