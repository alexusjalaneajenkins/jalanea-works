'use client'

/**
 * Job Pockets History Page
 * Shows all generated pockets for the user with filtering and usage stats
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Star,
  StarOff,
  Clock,
  Sparkles,
  Building2,
  MapPin,
  ChevronRight,
  Trash2,
  RefreshCw,
  Filter,
  TrendingUp,
  Loader2,
  AlertCircle,
  ThumbsUp,
  Minus,
  ThumbsDown
} from 'lucide-react'
import { PocketUsageIndicator } from '@/components/jobs/PocketUsageIndicator'

interface PocketSummary {
  id: string
  jobId: string
  tier: string
  job: {
    id: string
    title: string
    company: string
    location: string
    salary: string | null
    valenciaMatch: boolean
    valenciaMatchScore: number | null
  } | null
  summary: {
    recommendation: string
    matchStatus: string
    quickBrief: string
  }
  modelUsed: string | null
  isFavorite: boolean
  viewedAt: string | null
  appliedAfterViewing: boolean
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
}

interface UsageData {
  periodStart: string
  periodEnd: string
  byTier: Record<string, {
    used: number
    limit: number
    remaining: number
  }>
}

const tierConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  essential: {
    label: 'Essential',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  starter: {
    label: 'Starter',
    color: 'text-[#ffc425]',
    bgColor: 'bg-[#ffc425]/20'
  },
  premium: {
    label: 'Premium',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  unlimited: {
    label: 'Unlimited',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20'
  }
}

const recommendationConfig: Record<string, { icon: typeof ThumbsUp; color: string }> = {
  APPLY_NOW: { icon: ThumbsUp, color: 'text-green-400' },
  CONSIDER: { icon: Minus, color: 'text-yellow-400' },
  SKIP: { icon: ThumbsDown, color: 'text-red-400' }
}

function PocketCard({
  pocket,
  onToggleFavorite,
  onDelete
}: {
  pocket: PocketSummary
  onToggleFavorite: (id: string, isFavorite: boolean) => void
  onDelete: (id: string) => void
}) {
  const tier = tierConfig[pocket.tier] || tierConfig.essential
  const recommendation = recommendationConfig[pocket.summary.recommendation] || recommendationConfig.CONSIDER
  const RecIcon = recommendation.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl bg-slate-800/50 border transition-colors ${
        pocket.isExpired ? 'border-slate-700 opacity-60' : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Recommendation icon */}
        <div className={`w-10 h-10 rounded-xl ${tier.bgColor} flex items-center justify-center flex-shrink-0`}>
          <RecIcon size={20} className={recommendation.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold text-white truncate">
                {pocket.job?.title || 'Unknown Job'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Building2 size={14} />
                <span className="truncate">{pocket.job?.company || 'Unknown Company'}</span>
                {pocket.job?.location && (
                  <>
                    <span>•</span>
                    <MapPin size={14} />
                    <span className="truncate">{pocket.job.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onToggleFavorite(pocket.id, !pocket.isFavorite)
                }}
                className={`p-2 rounded-lg transition-colors ${
                  pocket.isFavorite
                    ? 'text-[#ffc425] hover:bg-[#ffc425]/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                }`}
                title={pocket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {pocket.isFavorite ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onDelete(pocket.id)
                }}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete pocket"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Quick brief */}
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
            {pocket.summary.quickBrief}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Tier badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                {tier.label}
              </span>

              {/* Valencia match */}
              {pocket.job?.valenciaMatch && (
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  Valencia Match
                </span>
              )}

              {/* Created date */}
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                {new Date(pocket.createdAt).toLocaleDateString()}
              </span>

              {/* Expired badge */}
              {pocket.isExpired && (
                <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  Expired
                </span>
              )}
            </div>

            {/* View link */}
            {!pocket.isExpired && (
              <Link
                href={`/dashboard/pockets/${pocket.id}`}
                className="flex items-center gap-1 text-sm text-[#ffc425] hover:text-[#ffd85d] transition-colors"
              >
                View Pocket
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function PocketsPage() {
  const [pockets, setPockets] = useState<PocketSummary[]>([])
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [userTier, setUserTier] = useState<string>('essential')
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [tierFilter, setTierFilter] = useState<string>('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Fetch pockets
  useEffect(() => {
    async function fetchPockets() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (tierFilter) params.set('tier', tierFilter)
        if (favoritesOnly) params.set('favorites_only', 'true')

        const response = await fetch(`/api/job-pockets?${params}`)
        if (!response.ok) throw new Error('Failed to fetch pockets')

        const data = await response.json()
        setPockets(data.pockets)
        setTotal(data.total)
        setUsage(data.usage)
        setUserTier(data.userTier)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPockets()
  }, [tierFilter, favoritesOnly])

  // Toggle favorite
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/job-pockets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite })
      })

      if (response.ok) {
        setPockets(prev =>
          prev.map(p => (p.id === id ? { ...p, isFavorite } : p))
        )
      }
    } catch (err) {
      console.error('Error updating favorite:', err)
    }
  }

  // Delete pocket
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pocket?')) return

    try {
      const response = await fetch(`/api/job-pockets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPockets(prev => prev.filter(p => p.id !== id))
        setTotal(prev => prev - 1)
      }
    } catch (err) {
      console.error('Error deleting pocket:', err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Job Pockets</h1>
            <p className="text-slate-400">
              AI-powered intelligence reports for your job applications
            </p>
          </div>

          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            <Sparkles size={18} />
            Generate New Pocket
          </Link>
        </div>

        {/* Usage indicator */}
        {usage && (
          <PocketUsageIndicator
            userTier={userTier}
            usage={usage}
          />
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={16} />
          <span className="text-sm">Filter:</span>
        </div>

        {/* Tier filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffc425] focus:border-transparent"
        >
          <option value="">All Tiers</option>
          <option value="essential">Essential</option>
          <option value="starter">Starter</option>
          <option value="premium">Premium</option>
          <option value="unlimited">Unlimited</option>
        </select>

        {/* Favorites toggle */}
        <button
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            favoritesOnly
              ? 'bg-[#ffc425]/20 border-[#ffc425]/30 text-[#ffc425]'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Star size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
          Favorites
        </button>

        {/* Results count */}
        <span className="ml-auto text-sm text-slate-500">
          {total} pocket{total !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffc425] mb-4" />
          <p className="text-slate-400">Loading your pockets...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Pockets</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      ) : pockets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
            <FileText size={40} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Pockets Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            {favoritesOnly
              ? "You haven't favorited any pockets yet. Star your best pockets to find them quickly!"
              : 'Generate your first Job Pocket to get AI-powered insights for your job applications.'}
          </p>
          <Link
            href="/dashboard/jobs"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            <Sparkles size={20} />
            Browse Jobs
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {pockets.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
