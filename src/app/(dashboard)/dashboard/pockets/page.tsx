'use client'

/**
 * My Pockets Page - "Shining Light" Design
 *
 * Entry-level focused pocket management with:
 * - Status-based filtering (Active / Applied / Expired)
 * - Clean, professional card design
 * - Gold "Shining Light" accents
 * - Credit tracking
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bookmark,
  Clock,
  Coins,
  Folder,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  Wand2,
  AlertCircle,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { useJalaneaMode, modeLabel, modeDescription } from '@/lib/mode/ModeContext'

// Types
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
  atsScore?: number
  scamCheck?: {
    severity: 'clean' | 'warning' | 'danger'
    reasons?: string[]
  }
}

interface UsageData {
  periodStart: string
  periodEnd: string
  byTier: Record<
    string,
    {
      used: number
      limit: number
      remaining: number
    }
  >
}

type StatusFilter = 'all' | 'active' | 'applied' | 'expired'

// -------------------- COMPONENTS --------------------

function StatusTab({
  value,
  active,
  count,
  onClick,
}: {
  value: StatusFilter
  active: boolean
  count: number
  onClick: () => void
}) {
  const labels: Record<StatusFilter, string> = {
    all: 'All',
    active: 'Active',
    applied: 'Applied',
    expired: 'Expired',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative h-[42px] rounded-2xl px-4 text-sm font-bold transition-all duration-200',
        active
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
          : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:text-foreground'
      )}
    >
      <span className="flex items-center gap-2">
        {labels[value]}
        <span
          className={cn(
            'rounded-lg px-1.5 py-0.5 text-[10px] font-bold',
            active
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {count}
        </span>
      </span>
    </button>
  )
}

function CreditDisplay({ usage }: { usage: UsageData | null }) {
  if (!usage) return null

  const advancedCredits = usage.byTier.premium || usage.byTier.starter
  const proCredits = usage.byTier.professional || usage.byTier.unlimited

  // Clamp credits to 0 (never show negative)
  const advancedRemaining = Math.max(0, advancedCredits?.remaining ?? 0)
  const proRemaining = Math.max(0, proCredits?.remaining ?? 0)

  // Hide credit display if both are 0 (user hasn't purchased any)
  if (advancedRemaining === 0 && proRemaining === 0) return null

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
        <Coins size={18} />
      </div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground">Pocket Credits</div>
        <div className="mt-1 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="font-bold text-foreground">{advancedRemaining}</span>
            <span className="text-muted-foreground">Advanced</span>
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span className="font-bold text-foreground">{proRemaining}</span>
            <span className="text-muted-foreground">Pro</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function PocketCard({
  pocket,
  onToggleFavorite,
  onDelete,
  onOpen,
}: {
  pocket: PocketSummary
  onToggleFavorite: () => void
  onDelete: () => void
  onOpen: () => void
}) {
  // Determine level from tier
  const level = pocket.tier === 'professional' || pocket.tier === 'unlimited'
    ? 'professional'
    : pocket.tier === 'premium' || pocket.tier === 'starter'
    ? 'advanced'
    : 'regular'

  // ATS score
  const atsScore = pocket.atsScore ?? 75

  // Scam severity
  const sevLabel = pocket.scamCheck?.severity === 'danger'
    ? 'Review Needed'
    : pocket.scamCheck?.severity === 'warning'
    ? 'Minor Concerns'
    : 'Verified'

  // Recommendation icon
  const RecIcon =
    pocket.summary.recommendation === 'APPLY_NOW'
      ? ThumbsUp
      : pocket.summary.recommendation === 'SKIP'
      ? ThumbsDown
      : Minus

  const levelAccent =
    level === 'regular'
      ? 'border-border'
      : level === 'advanced'
      ? 'border-primary/40'
      : 'border-primary/60'

  const levelGlow =
    level === 'regular'
      ? ''
      : level === 'advanced'
      ? 'shadow-[0_8px_40px_hsl(var(--primary)/0.1)]'
      : 'shadow-[0_12px_60px_hsl(var(--primary)/0.15)]'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-sm',
        'transition-all duration-300 hover:border-primary/30',
        levelAccent,
        levelGlow,
        pocket.isFavorite && 'ring-2 ring-primary/20',
        pocket.isExpired && 'opacity-60'
      )}
      role="article"
      aria-label={`${pocket.job?.title || 'Unknown Job'} at ${pocket.job?.company || 'Unknown Company'}`}
    >
      {/* Level indicator bar */}
      {level !== 'regular' && (
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1',
            level === 'advanced'
              ? 'bg-gradient-to-b from-primary via-primary/70 to-primary/30'
              : 'bg-gradient-to-b from-primary via-primary/80 to-primary/50'
          )}
        />
      )}

      {/* Shining light effect */}
      <div className="jw-shining-light pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'rounded-xl border px-3 py-1.5 text-xs font-bold',
                level === 'professional'
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : level === 'advanced'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-background/60 text-muted-foreground'
              )}
            >
              {level === 'professional'
                ? 'Professional'
                : level === 'advanced'
                ? 'Advanced'
                : 'Regular'}
            </span>
            {pocket.isFavorite && (
              <span className="inline-flex items-center gap-1 rounded-xl border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                <Star size={10} className="fill-current" /> Pinned
              </span>
            )}
            {pocket.isExpired && (
              <span className="rounded-xl border border-destructive/30 bg-destructive/10 px-2 py-1 text-[10px] font-bold text-destructive">
                Expired
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200',
                pocket.isFavorite
                  ? 'border-primary/30 bg-primary/15 text-primary'
                  : 'border-border bg-card/80 text-muted-foreground hover:border-primary/30 hover:text-primary'
              )}
              aria-label={pocket.isFavorite ? 'Unpin pocket' : 'Pin pocket'}
            >
              <Bookmark size={16} className={pocket.isFavorite ? 'fill-current' : ''} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground hover:border-destructive/30 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
              aria-label="Delete pocket"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Job info */}
        <div className="mt-4">
          <h3
            className={cn(
              'font-black tracking-tight text-foreground leading-tight',
              level === 'professional' ? 'text-lg' : 'text-base'
            )}
            style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
          >
            {pocket.job?.title || 'Unknown Job'}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              {pocket.job?.company || 'Unknown Company'}
            </span>
            {pocket.job?.location && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {pocket.job.location}
                </span>
              </>
            )}
          </div>

          {pocket.job?.salary && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
              <Wallet size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">{pocket.job.salary}</span>
            </div>
          )}
        </div>

        {/* Metrics row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* ATS Score */}
          <div className="rounded-2xl border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">ATS Match</span>
              <span
                className={cn(
                  'text-xs font-bold',
                  atsScore >= 80
                    ? 'text-primary'
                    : atsScore >= 60
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {atsScore}%
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${atsScore}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Recommendation
              </span>
              <RecIcon
                size={14}
                className={cn(
                  pocket.summary.recommendation === 'APPLY_NOW'
                    ? 'text-primary'
                    : pocket.summary.recommendation === 'SKIP'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              />
            </div>
            <div className="mt-1">
              <span
                className={cn(
                  'text-xs font-bold',
                  pocket.summary.recommendation === 'APPLY_NOW'
                    ? 'text-primary'
                    : pocket.summary.recommendation === 'SKIP'
                    ? 'text-destructive'
                    : 'text-foreground'
                )}
              >
                {pocket.summary.recommendation === 'APPLY_NOW'
                  ? 'Apply Now'
                  : pocket.summary.recommendation === 'SKIP'
                  ? 'Skip'
                  : 'Consider'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes preview */}
        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
          {pocket.summary.quickBrief}
        </p>

        {/* Created date */}
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          Created {new Date(pocket.createdAt).toLocaleDateString()}
        </div>

        {/* Action button */}
        {!pocket.isExpired && (
          <button
            onClick={onOpen}
            className={cn(
              'mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200',
              level === 'professional'
                ? 'bg-primary text-primary-foreground hover:opacity-90 jw-glow-card'
                : level === 'advanced'
                ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                : 'bg-background/60 text-foreground border border-border hover:bg-background/80'
            )}
          >
            Open Pocket
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </motion.article>
  )
}

function EmptyState({
  favoritesOnly,
  statusFilter,
  onClear,
}: {
  favoritesOnly: boolean
  statusFilter: StatusFilter
  onClear: () => void
}) {
  // Different empty states based on filter
  if (favoritesOnly) {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-border bg-muted/30 text-muted-foreground">
          <Star size={28} />
        </div>
        <h2
          className="mt-5 text-xl font-black text-foreground"
          style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
        >
          No pinned pockets
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Star your favorite pockets to find them quickly here.
        </p>
        <button
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
        >
          View all pockets
        </button>
      </div>
    )
  }

  if (statusFilter === 'applied') {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-border bg-muted/30 text-muted-foreground">
          <ThumbsUp size={28} />
        </div>
        <h2
          className="mt-5 text-xl font-black text-foreground"
          style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
        >
          No applications yet
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          When you apply to jobs through your pockets, they&apos;ll appear here.
        </p>
        <button
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
        >
          View all pockets
        </button>
      </div>
    )
  }

  if (statusFilter === 'expired') {
    return (
      <div className="rounded-3xl border border-border bg-card/60 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-border bg-muted/30 text-muted-foreground">
          <Clock size={28} />
        </div>
        <h2
          className="mt-5 text-xl font-black text-foreground"
          style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
        >
          No expired pockets
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Expired pockets will appear here. Good news — none yet!
        </p>
        <button
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
        >
          View all pockets
        </button>
      </div>
    )
  }

  // Default empty state - no pockets at all, show how to create one
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/30 p-8 md:p-12">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
          <Target size={28} />
        </div>
        <h2
          className="mt-5 text-2xl font-black text-foreground"
          style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
        >
          Your job intel starts here
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Pockets help you research jobs before you apply. We check for scams,
          match your skills, and prep you for interviews.
        </p>
      </div>

      {/* How it works steps */}
      <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border bg-background/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              1
            </span>
            <span className="text-sm font-bold text-foreground">Browse Jobs</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Find a job you&apos;re interested in from our curated listings.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              2
            </span>
            <span className="text-sm font-bold text-foreground">Create Pocket</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Click the <strong>Pocket</strong> button on any job card to generate intel.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background/40 p-4 text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
              3
            </span>
            <span className="text-sm font-bold text-foreground">Apply Smart</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Use our insights to apply with confidence.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card"
        >
          <Search size={16} />
          Browse Jobs
        </Link>
      </div>
    </div>
  )
}

// -------------------- MAIN PAGE --------------------

export default function PocketsPage() {
  const router = useRouter()
  const { mode } = useJalaneaMode()

  const [pockets, setPockets] = useState<PocketSummary[]>([])
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [userTier, setUserTier] = useState<string>('essential')
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  // Fetch pockets
  useEffect(() => {
    async function fetchPockets() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
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
  }, [favoritesOnly])

  // Toggle favorite
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/job-pockets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite }),
      })

      if (response.ok) {
        setPockets((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite } : p)))
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
        method: 'DELETE',
      })

      if (response.ok) {
        setPockets((prev) => prev.filter((p) => p.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (err) {
      console.error('Error deleting pocket:', err)
    }
  }

  // Filter and search pockets
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pockets
      .filter((p) => {
        // Status filter
        if (statusFilter === 'active' && (p.isExpired || p.appliedAfterViewing)) return false
        if (statusFilter === 'applied' && !p.appliedAfterViewing) return false
        if (statusFilter === 'expired' && !p.isExpired) return false

        // Search filter
        if (!q) return true
        const title = p.job?.title?.toLowerCase() || ''
        const company = p.job?.company?.toLowerCase() || ''
        const location = p.job?.location?.toLowerCase() || ''
        return title.includes(q) || company.includes(q) || location.includes(q)
      })
      .sort((a, b) => Number(Boolean(b.isFavorite)) - Number(Boolean(a.isFavorite)))
  }, [pockets, query, statusFilter])

  // Count by status
  const counts = useMemo(() => {
    return {
      all: pockets.length,
      active: pockets.filter((p) => !p.isExpired && !p.appliedAfterViewing).length,
      applied: pockets.filter((p) => p.appliedAfterViewing).length,
      expired: pockets.filter((p) => p.isExpired).length,
    }
  }, [pockets])

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary jw-glow-card">
              <Target size={26} />
            </div>
            <div>
              <h1
                className="text-3xl font-black tracking-tight text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                My Pockets
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{modeLabel(mode)} Mode</span> •{' '}
                {modeDescription(mode)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CreditDisplay usage={usage} />
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card"
            >
              <Search size={16} />
              Browse Jobs
            </Link>
          </div>
        </div>
      </header>

      {/* Filters row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusTab
            value="all"
            active={statusFilter === 'all'}
            count={counts.all}
            onClick={() => setStatusFilter('all')}
          />
          <StatusTab
            value="active"
            active={statusFilter === 'active'}
            count={counts.active}
            onClick={() => setStatusFilter('active')}
          />
          <StatusTab
            value="applied"
            active={statusFilter === 'applied'}
            count={counts.applied}
            onClick={() => setStatusFilter('applied')}
          />
          <StatusTab
            value="expired"
            active={statusFilter === 'expired'}
            count={counts.expired}
            onClick={() => setStatusFilter('expired')}
          />
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={cn(
              'h-[42px] rounded-2xl px-4 text-sm font-bold transition-all duration-200 flex items-center gap-2',
              favoritesOnly
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:text-foreground'
            )}
          >
            <Star size={14} className={favoritesOnly ? 'fill-current' : ''} />
            Pinned
          </button>
        </div>

        {/* Search - aligned with tabs height */}
        <div className="flex h-[42px] items-center gap-2 rounded-2xl border border-border bg-card/60 px-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pockets…"
            className="w-[200px] max-w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search pockets"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your pockets...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-border bg-card/60 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-muted bg-muted/30 text-muted-foreground">
            <RefreshCw size={28} />
          </div>
          <h2
            className="mt-5 text-xl font-black text-foreground"
            style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
          >
            Couldn&apos;t load your pockets
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong on our end. Give it another try?
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          favoritesOnly={favoritesOnly}
          statusFilter={statusFilter}
          onClear={() => {
            setFavoritesOnly(false)
            setStatusFilter('all')
          }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                onToggleFavorite={() =>
                  handleToggleFavorite(pocket.id, !pocket.isFavorite)
                }
                onDelete={() => handleDelete(pocket.id)}
                onOpen={() => router.push(`/dashboard/pockets/${pocket.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info card */}
      {!isLoading && !error && pockets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 rounded-3xl border border-border bg-card/60 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3
                className="text-sm font-bold text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                Understanding Pocket Levels
              </h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="text-xs font-bold text-foreground">Regular</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Track + notes. Free for all jobs.
                  </div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="text-xs font-bold text-primary">Advanced</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    AI intel: company, interview prep, red flags.
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                  <div className="text-xs font-bold text-primary">Professional</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Deep research + networking tracker + scripts.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  )
}
