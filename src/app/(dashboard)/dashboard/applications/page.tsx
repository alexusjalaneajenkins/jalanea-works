'use client'

/**
 * Applications Tracker Page
 * Track job applications with status updates — now with Shining Light design.
 * Mode-aware filtering (Survival / Bridge / Career).
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Plus,
  Search,
  Target,
  RefreshCw,
  Send,
  Users,
  Gift,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  LayoutGrid,
  List,
  Bus,
  DollarSign,
  Clock,
  Archive,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

import {
  type Application,
  type ApplicationStatus,
  type ApplicationStats,
  ApplicationDetailModal,
  AddApplicationModal,
  UpcomingEventsCard
} from '@/components/applications'
import { cn } from '@/lib/utils'

// Mode type for Jalanea Works
type Mode = 'survival' | 'bridge' | 'career'

// Map application status to display stage
type DisplayStage = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'

function getDisplayStage(status: ApplicationStatus): DisplayStage {
  if (['discovered', 'pocketed', 'saved'].includes(status)) return 'Saved'
  if (['applied'].includes(status)) return 'Applied'
  if (['screening', 'interviewing'].includes(status)) return 'Interview'
  if (['offer', 'offer_received', 'accepted', 'offer_accepted'].includes(status)) return 'Offer'
  return 'Rejected'
}

// Derive mode from application salary or other heuristics
function deriveMode(app: Application): Mode {
  const salaryType = app.salaryType || ''
  const title = app.jobTitle?.toLowerCase() || ''

  // Simple heuristic: survival = hourly/low pay, career = senior/lead, bridge = everything else
  if (salaryType === 'hourly' || title.includes('associate') || title.includes('clerk')) {
    return 'survival'
  }
  if (title.includes('senior') || title.includes('lead') || title.includes('manager') || title.includes('director')) {
    return 'career'
  }
  return 'bridge'
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MatchRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 14
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-9 w-9 flex-shrink-0">
      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-foreground">
        {value}
      </span>
    </div>
  )
}

function StagePill({
  active,
  label,
  count,
  onClick
}: {
  active: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-extrabold transition-colors',
        active
          ? 'border-primary/25 bg-primary/10 text-foreground'
          : 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', active ? 'bg-primary' : 'bg-border')} />
      {label}
      <span className="rounded-full border border-border bg-card/50 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
        {count}
      </span>
    </button>
  )
}

function ModeChip({
  active,
  mode,
  onClick
}: {
  active: boolean
  mode: Mode | 'all'
  onClick: () => void
}) {
  const label = mode === 'all' ? 'All modes' : mode === 'survival' ? 'Survival' : mode === 'bridge' ? 'Bridge' : 'Career'

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-extrabold transition-colors',
        active
          ? 'border-primary/25 bg-primary/10 text-foreground'
          : 'border-border bg-background/40 text-muted-foreground hover:text-foreground'
      )}
    >
      <Target size={16} className={cn(active ? 'text-primary' : 'text-muted-foreground')} />
      {label}
    </button>
  )
}

// View toggle component (Board | List)
type ViewMode = 'board' | 'list'

function ViewToggle({
  viewMode,
  onChange
}: {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-border bg-card/40 p-1">
      <button
        onClick={() => onChange('board')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors',
          viewMode === 'board'
            ? 'bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutGrid size={14} />
        Board
      </button>
      <button
        onClick={() => onChange('list')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors',
          viewMode === 'list'
            ? 'bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <List size={14} />
        List
      </button>
    </div>
  )
}

// Helper: Check if application is stale (>14 days in Applied status)
function isStaleApplication(app: Application): boolean {
  const stage = getDisplayStage(app.status)
  if (stage !== 'Applied') return false

  const appliedDate = app.appliedAt ? new Date(app.appliedAt) : null
  if (!appliedDate) return false

  const daysSinceApplied = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
  return daysSinceApplied > 14
}

// Helper: Get days since applied
function getDaysSinceApplied(app: Application): number | null {
  const appliedDate = app.appliedAt ? new Date(app.appliedAt) : null
  if (!appliedDate) return null
  return Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
}

function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border bg-card/60 p-4"
    >
      <div className="flex items-center gap-3">
        <div className={cn('grid h-10 w-10 place-items-center rounded-2xl', color)}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function AppCard({
  app,
  mode,
  onClick,
  onMoveToInterview,
  onArchive,
  onFollowUp
}: {
  app: Application
  mode: Mode
  onClick: () => void
  onMoveToInterview?: (app: Application) => void
  onArchive?: (app: Application) => void
  onFollowUp?: (app: Application) => void
}) {
  const stage = getDisplayStage(app.status)
  // Use a default match score since Application type doesn't have matchScore
  const match = 75
  const stale = isStaleApplication(app)
  const daysSince = getDaysSinceApplied(app)

  // Format date
  const dateLabel = app.appliedAt
    ? `Applied ${new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : app.createdAt
    ? `Saved ${new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'Recently added'

  // Format salary display
  const salaryDisplay = app.salaryMin || app.salaryMax
    ? app.salaryType === 'hourly'
      ? `$${app.salaryMin || app.salaryMax}/hr`
      : `$${((app.salaryMin || app.salaryMax || 0) / 1000).toFixed(0)}k`
    : null

  // Check for transit accessibility based on location (Orlando area = LYNX reachable)
  const isTransitAccessible = app.location?.toLowerCase().includes('orlando') ||
    app.location?.toLowerCase().includes('kissimmee') ||
    app.location?.toLowerCase().includes('sanford') ||
    app.location?.toLowerCase().includes('altamonte')

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-3xl border border-border p-4 transition-all hover:bg-card/60',
        mode === 'survival' ? 'bg-card/40' : mode === 'bridge' ? 'bg-primary/5' : 'bg-accent/5',
        stale && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <MatchRing value={match} />
        <div className="min-w-0 flex-1">
          {/* Top row: Mode + Stage badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-[11px] font-extrabold',
                mode === 'survival' && 'border-border bg-background/40 text-muted-foreground',
                mode === 'bridge' && 'border-primary/25 bg-primary/10 text-primary',
                mode === 'career' && 'border-accent/25 bg-accent/10 text-foreground'
              )}
            >
              {mode === 'survival' ? 'Survival Mode' : mode === 'bridge' ? 'Bridge Mode' : 'Career Mode'}
            </span>
            <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-bold text-muted-foreground">
              {stage}
            </span>
            {stale && (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600">
                <Clock size={10} className="mr-1 inline" />
                {daysSince}d waiting
              </span>
            )}
          </div>

          {/* Job title */}
          <div
            className="mt-2 text-sm font-black tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
          >
            {app.jobTitle}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{app.company}</div>

          {/* Info badges row: salary, transit, date */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {salaryDisplay && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/10 px-2.5 py-1 text-[11px] font-bold text-green-600">
                <DollarSign size={12} />
                {salaryDisplay}
              </span>
            )}
            {isTransitAccessible && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                <Bus size={12} />
                LYNX
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <Calendar size={12} />
              {dateLabel}
            </span>
          </div>

          {/* Stale actions or Move to Interview button */}
          {stale && (onArchive || onFollowUp) && (
            <div className="mt-3 flex items-center gap-2">
              {onFollowUp && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFollowUp(app)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/20"
                >
                  <MessageSquare size={12} />
                  Follow Up
                </button>
              )}
              {onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(app)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/40 px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground"
                >
                  <Archive size={12} />
                  Archive
                </button>
              )}
            </div>
          )}

          {/* Move to Interview button for Applied stage (non-stale) */}
          {stage === 'Applied' && !stale && onMoveToInterview && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveToInterview(app)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:opacity-90"
              >
                Move to Interview
                <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
        <button
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-background/40 text-muted-foreground hover:text-foreground"
          aria-label="Open"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const router = useRouter()

  // Data state
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [activeStage, setActiveStage] = useState<DisplayStage | 'All'>('All')
  const [activeMode, setActiveMode] = useState<Mode | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/applications')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      const data = await response.json()
      setApplications(data.applications || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Compute stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<DisplayStage, number> = { Saved: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 }
    for (const app of applications) {
      const stage = getDisplayStage(app.status)
      counts[stage] += 1
    }
    return counts
  }, [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Stage filter
      if (activeStage !== 'All' && getDisplayStage(app.status) !== activeStage) {
        return false
      }

      // Mode filter
      if (activeMode !== 'all' && deriveMode(app) !== activeMode) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          app.jobTitle.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query) ||
          app.location?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [applications, activeStage, activeMode, searchQuery])

  // Handlers
  const handleApplicationClick = useCallback((application: Application) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }, [])

  const handleAddApplication = useCallback(
    async (applicationData: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData)
        })

        if (response.ok) {
          const { application } = await response.json()
          setApplications((prev) => [application, ...prev])
          if (stats) {
            setStats({
              ...stats,
              total: stats.total + 1,
              applied: stats.applied + (application.status === 'applied' ? 1 : 0)
            })
          }
        }
      } catch (err) {
        console.error('Error adding application:', err)
      }
    },
    [stats]
  )

  const handleUpdateApplication = useCallback(async (updatedApp: Application) => {
    try {
      const response = await fetch(`/api/applications/${updatedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApp)
      })

      if (response.ok) {
        const { application } = await response.json()
        setApplications((prev) => prev.map((app) => (app.id === application.id ? { ...app, ...application } : app)))
        setSelectedApplication((prev) => (prev ? { ...prev, ...application } : null))
      }
    } catch (err) {
      console.error('Error updating application:', err)
    }
  }, [])

  const handleDeleteApplication = useCallback(
    async (applicationId: string) => {
      try {
        const response = await fetch(`/api/applications/${applicationId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setApplications((prev) => prev.filter((app) => app.id !== applicationId))
          setIsDetailModalOpen(false)
          setSelectedApplication(null)
          if (stats) {
            setStats({
              ...stats,
              total: stats.total - 1
            })
          }
        }
      } catch (err) {
        console.error('Error deleting application:', err)
      }
    },
    [stats]
  )

  // Handler for viewing associated pocket (used by detail modal)
  const _handleViewPocket = useCallback(
    (application: Application) => {
      if (application.pocketId) {
        router.push(`/dashboard/pockets/${application.pocketId}`)
      } else if (application.jobId) {
        router.push(`/dashboard/jobs/${application.jobId}`)
      }
    },
    [router]
  )
  void _handleViewPocket // Suppress unused warning - available for future use

  const handleUpcomingEventClick = useCallback(
    (applicationId: string) => {
      const application = applications.find((app) => app.id === applicationId)
      if (application) {
        handleApplicationClick(application)
      }
    },
    [applications, handleApplicationClick]
  )

  // Handler for "Move to Interview" button
  const handleMoveToInterview = useCallback(async (app: Application) => {
    try {
      const response = await fetch(`/api/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...app, status: 'interviewing' })
      })

      if (response.ok) {
        const { application } = await response.json()
        setApplications((prev) => prev.map((a) => (a.id === application.id ? { ...a, ...application } : a)))
      }
    } catch (err) {
      console.error('Error moving to interview:', err)
    }
  }, [])

  // Handler for "Archive" button (marks as rejected/archived)
  const handleArchive = useCallback(async (app: Application) => {
    try {
      const response = await fetch(`/api/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...app, status: 'rejected' })
      })

      if (response.ok) {
        const { application } = await response.json()
        setApplications((prev) => prev.map((a) => (a.id === application.id ? { ...a, ...application } : a)))
      }
    } catch (err) {
      console.error('Error archiving application:', err)
    }
  }, [])

  // Handler for "Follow Up" button (opens detail modal with follow-up context)
  const handleFollowUp = useCallback((app: Application) => {
    setSelectedApplication(app)
    setIsDetailModalOpen(true)
    // The detail modal would have follow-up functionality
  }, [])

  const stages: DisplayStage[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']

  // Group applications by stage for board view
  const applicationsByStage = useMemo(() => {
    const grouped: Record<DisplayStage, Application[]> = {
      Saved: [],
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: []
    }

    for (const app of filteredApplications) {
      const stage = getDisplayStage(app.status)
      grouped[stage].push(app)
    }

    return grouped
  }, [filteredApplications])

  // ─────────────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-destructive/25 bg-destructive/10 text-destructive">
            <RefreshCw size={28} />
          </div>
          <h2
            className="mt-6 text-xl font-black text-foreground"
            style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
          >
            Error Loading Applications
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchApplications}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-95"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isLoading && applications.length === 0) {
    return (
      <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <Briefcase size={18} />
            </div>
            <div>
              <h1
                className="text-3xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
              >
                Applications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Track your job applications</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-95"
          >
            <Plus size={16} />
            Add Application
          </button>
        </div>

        {/* Empty State Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border border-border bg-card/40 p-10 text-center"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-primary/25 bg-primary/10 text-primary">
            <FolderOpen size={28} />
          </div>
          <div
            className="mt-6 text-xl font-black text-foreground"
            style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
          >
            No applications yet
          </div>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            Start by searching for jobs and applying! We&apos;ll help you track every application from discovery to offer.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-95"
            >
              Search Jobs
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/40 px-5 py-3 text-sm font-extrabold text-foreground hover:bg-card/60"
            >
              <Plus size={16} />
              Add Manually
            </button>
          </div>
        </motion.div>

        <AddApplicationModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddApplication} />
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <Briefcase size={18} />
          </div>
          <div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
            >
              Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your pipeline by stage — and by the mode you&apos;re optimizing for.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-95"
        >
          <Plus size={16} />
          Add Application
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="mt-5">
        <UpcomingEventsCard onEventClick={handleUpcomingEventClick} />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Send} label="Applied" value={stats.applied} color="border-blue-500/25 bg-blue-500/10 text-blue-500" />
          <StatCard icon={Users} label="Interviewing" value={stats.interviewing} color="border-purple-500/25 bg-purple-500/10 text-purple-500" />
          <StatCard icon={Gift} label="Offers" value={stats.offers} color="border-green-500/25 bg-green-500/10 text-green-500" />
          <StatCard icon={TrendingUp} label="Total" value={stats.total} color="border-primary/25 bg-primary/10 text-primary" />
        </div>
      )}

      {/* Search */}
      <div className="mt-5 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applications..."
          className="w-full rounded-2xl border border-border bg-card/40 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>

      {/* Mode Chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ModeChip active={activeMode === 'all'} mode="all" onClick={() => setActiveMode('all')} />
        <ModeChip active={activeMode === 'survival'} mode="survival" onClick={() => setActiveMode('survival')} />
        <ModeChip active={activeMode === 'bridge'} mode="bridge" onClick={() => setActiveMode('bridge')} />
        <ModeChip active={activeMode === 'career'} mode="career" onClick={() => setActiveMode('career')} />
      </div>

      {/* Stage Pills + View Toggle */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StagePill active={activeStage === 'All'} label="All" count={applications.length} onClick={() => setActiveStage('All')} />
          {stages.map((s) => (
            <StagePill key={s} active={activeStage === s} label={s} count={stageCounts[s]} onClick={() => setActiveStage(s)} />
          ))}
        </div>
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {/* Application Cards - List View */}
      {viewMode === 'list' && (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-32 rounded-3xl border border-border bg-card/40 animate-pulse"
                />
              ))
            ) : filteredApplications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-2 rounded-3xl border border-border bg-card/40 p-10 text-center"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl border border-primary/25 bg-primary/10 text-primary">
                  <Search size={22} />
                </div>
                <div
                  className="mt-4 text-xl font-black text-foreground"
                  style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
                >
                  No matching applications
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? `No applications match "${searchQuery}"` : 'Try switching mode or stage — or add your next application.'}
                </p>
              </motion.div>
            ) : (
              filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <AppCard
                    app={app}
                    mode={deriveMode(app)}
                    onClick={() => handleApplicationClick(app)}
                    onMoveToInterview={handleMoveToInterview}
                    onArchive={handleArchive}
                    onFollowUp={handleFollowUp}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Application Cards - Board View (Kanban) */}
      {viewMode === 'board' && (
        <div className="mt-5 overflow-x-auto pb-4">
          {isLoading ? (
            <div className="flex gap-4">
              {stages.map((stage) => (
                <div key={stage} className="min-w-[280px] flex-shrink-0">
                  <div className="h-8 w-24 rounded-lg bg-card/40 animate-pulse mb-3" />
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-32 rounded-3xl border border-border bg-card/40 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4">
              {stages.map((stage) => (
                <div key={stage} className="min-w-[300px] flex-shrink-0">
                  {/* Column header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        stage === 'Saved' && 'bg-gray-400',
                        stage === 'Applied' && 'bg-blue-500',
                        stage === 'Interview' && 'bg-purple-500',
                        stage === 'Offer' && 'bg-green-500',
                        stage === 'Rejected' && 'bg-red-400'
                      )} />
                      <span className="text-sm font-bold text-foreground">{stage}</span>
                    </div>
                    <span className="rounded-full border border-border bg-card/40 px-2 py-0.5 text-xs font-bold text-muted-foreground">
                      {applicationsByStage[stage].length}
                    </span>
                  </div>

                  {/* Column cards */}
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {applicationsByStage[stage].length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-2xl border border-dashed border-border bg-card/20 p-4 text-center"
                        >
                          <p className="text-xs text-muted-foreground">No applications</p>
                        </motion.div>
                      ) : (
                        applicationsByStage[stage].map((app) => (
                          <motion.div
                            key={app.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AppCard
                              app={app}
                              mode={deriveMode(app)}
                              onClick={() => handleApplicationClick(app)}
                              onMoveToInterview={handleMoveToInterview}
                              onArchive={handleArchive}
                              onFollowUp={handleFollowUp}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddApplicationModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddApplication} />

      <ApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        onUpdate={handleUpdateApplication}
        onDelete={handleDeleteApplication}
      />
    </main>
  )
}
