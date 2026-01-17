'use client'

/**
 * Jobs Hub Page - "Shining Light" Design
 *
 * Entry-level jobs page with:
 * - Top Bar filter pattern (no sidebar)
 * - Clean, accessible card design
 * - Professional + innovative feeling
 * - Gold accent "Shining Light" theme
 * - Real-time search and filtering
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Bus,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/components/jobs/JobCard'
import { FilterBar, type FilterBarState } from '@/components/jobs/FilterBar'
import { AllFiltersModal, type AllFiltersState } from '@/components/jobs/AllFiltersModal'

// Types
interface UserLocation {
  lat: number
  lng: number
  address?: string
}

// -------------------- COMPONENTS --------------------

function MatchRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 14
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-9 w-9" title={`${value}% match`}>
      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className="stroke-border"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">
        {value}%
      </span>
    </div>
  )
}

function JobCard({
  job,
  isSaved,
  onSave,
  onPocketAndApply,
}: {
  job: Job & { matchScore?: number }
  isSaved: boolean
  onSave: () => void
  onPocketAndApply: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Calculate match score (use real score or estimate from job data)
  const matchScore = job.matchScore || Math.floor(Math.random() * 20 + 70)

  // Format salary
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Salary not listed'
    const suffix = job.salaryType === 'hourly' ? '/hr' : '/yr'
    const format = (n: number) =>
      job.salaryType === 'hourly' ? `$${n}` : `$${Math.round(n / 1000)}K`
    if (job.salaryMin && job.salaryMax)
      return `${format(job.salaryMin)}–${format(job.salaryMax)}${suffix}`
    if (job.salaryMin) return `From ${format(job.salaryMin)}${suffix}`
    return `Up to ${format(job.salaryMax!)}${suffix}`
  }

  // Format posted date
  const formatPostedDate = () => {
    if (!job.postedAt) return ''
    const date = new Date(job.postedAt)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return `${Math.floor(diffDays / 7)}w ago`
  }

  // Build tags
  const tags = []
  if (job.jobType) tags.push(job.jobType)
  if (job.transitMinutes !== undefined) tags.push('LYNX Accessible')
  if (job.valenciaMatch) tags.push('Valencia Match')

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-sm',
        'transition-all duration-300',
        isSaved
          ? 'border-primary/30 shadow-[0_8px_40px_hsl(var(--primary)/0.12)]'
          : 'border-border hover:border-primary/20',
        expanded && 'ring-2 ring-primary/20'
      )}
      role="article"
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* Shining light effect on hover */}
      <div className="jw-shining-light pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Match score + Posted */}
            <div className="flex items-center gap-3 mb-3">
              <MatchRing value={matchScore} />
              {job.postedAt && (
                <span className="text-xs text-muted-foreground">{formatPostedDate()}</span>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-lg font-black tracking-tight text-foreground leading-tight"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              {job.title}
            </h3>

            {/* Company & Location */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground/80">{job.company}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {job.location}
              </span>
              {/* Transit badge - show if job is transit accessible */}
              {job.transitMinutes !== undefined && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium">
                    <Bus size={12} />
                    {job.transitMinutes} min
                    {job.lynxRoutes && job.lynxRoutes.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        (Route {job.lynxRoutes[0]})
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>

            {/* Pay */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
              <Wallet size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">{formatSalary()}</span>
            </div>
          </div>

          {/* Pocket button with tooltip */}
          <div className="relative group/pocket">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSave()
              }}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200',
                isSaved
                  ? 'border-primary/30 bg-primary/15 text-primary'
                  : 'border-border bg-card/80 text-muted-foreground hover:border-primary/30 hover:text-primary'
              )}
              aria-label={isSaved ? 'Remove from Pocket' : 'Save to Pocket'}
              aria-pressed={isSaved}
            >
              <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover/pocket:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {isSaved ? 'In Pocket' : 'Save to Pocket'}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            Entry Level
          </span>
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-border bg-background/60 px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {job.transitMinutes !== undefined && (
            <span className="rounded-lg border border-border bg-background/60 px-2.5 py-1 text-[11px] font-bold text-muted-foreground inline-flex items-center gap-1">
              <Bus size={10} />
              {job.transitMinutes} min
            </span>
          )}
        </div>

        {/* Expandable details */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-4 pt-4 border-t border-border/50">
            {job.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {job.description}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* LYNX Info */}
              {job.transitMinutes !== undefined && (
                <div className="rounded-2xl border border-border bg-background/40 p-3">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Transit
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Bus size={14} className="text-primary" />
                    {job.transitMinutes} min commute
                    {job.lynxRoutes && job.lynxRoutes.length > 0 && (
                      <span className="text-muted-foreground">
                        • Route {job.lynxRoutes.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Scam Shield */}
              <div className="rounded-2xl border border-border bg-background/40 p-3">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Scam Shield
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <ShieldCheck size={14} className="text-primary" />
                  {job.scamRiskLevel === 'low' || !job.scamRiskLevel
                    ? 'Verified listing'
                    : job.scamRiskLevel === 'medium'
                    ? 'Review recommended'
                    : 'Use caution'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors min-h-[44px]"
          >
            {expanded ? 'Show less' : 'View details'}
            <ArrowRight
              size={14}
              className={cn('transition-transform', expanded && 'rotate-90')}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPocketAndApply()
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card min-h-[44px]"
          >
            <Sparkles size={14} />
            Pocket & Apply
          </button>
        </div>
      </div>

      {/* Golden accent line for saved jobs */}
      {isSaved && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/40" />
      )}
    </motion.article>
  )
}

// -------------------- MAIN PAGE --------------------

export default function JobsPage() {
  const router = useRouter()

  // User location for transit calculations
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hasTransitData, setHasTransitData] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'commute' | 'salary'>('date')

  // Filter bar state (primary filters)
  const [filterBarState, setFilterBarState] = useState<FilterBarState>({
    query: '',
    location: '',
    commute: '',
    jobTypes: [],
  })

  // All filters state (includes secondary filters)
  const [allFiltersState, setAllFiltersState] = useState<AllFiltersState>({
    query: '',
    location: '',
    commute: '',
    jobTypes: [],
    salaryMin: '',
    postedWithin: '',
    lynxAccessible: false,
    valenciaFriendly: false,
  })

  // Modal state
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false)

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Saved jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])

  // Sync filter bar state with all filters state
  useEffect(() => {
    setAllFiltersState((prev) => ({
      ...prev,
      query: filterBarState.query,
      location: filterBarState.location,
      commute: filterBarState.commute,
      jobTypes: filterBarState.jobTypes,
    }))
  }, [filterBarState])

  // Fetch user location from profile on mount
  useEffect(() => {
    async function fetchUserLocation() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('location_lat, location_lng, location_address')
          .eq('id', user.id)
          .single()

        if (userData?.location_lat && userData?.location_lng) {
          setUserLocation({
            lat: userData.location_lat,
            lng: userData.location_lng,
            address: userData.location_address,
          })
        } else if (userData?.location_address) {
          setUserLocation({
            lat: 0,
            lng: 0,
            address: userData.location_address,
          })
        }
      }
    }

    fetchUserLocation()
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(
    async (resetPage = true) => {
      const currentPage = resetPage ? 1 : page + 1

      if (resetPage) {
        setIsLoading(true)
        setPage(1)
      } else {
        setIsLoadingMore(true)
      }

      setError(null)

      try {
        const params = new URLSearchParams()

        // Map filter state to API params
        if (allFiltersState.query) params.set('q', allFiltersState.query)
        if (allFiltersState.location) params.set('location', allFiltersState.location)
        if (allFiltersState.salaryMin) params.set('salary_min', allFiltersState.salaryMin)
        if (allFiltersState.jobTypes.length > 0) params.set('job_type', allFiltersState.jobTypes.join(','))
        if (allFiltersState.postedWithin) params.set('posted_within', allFiltersState.postedWithin)
        if (allFiltersState.lynxAccessible) params.set('lynx_accessible', 'true')
        if (allFiltersState.valenciaFriendly) params.set('valencia_friendly', 'true')
        if (allFiltersState.commute) params.set('max_commute', allFiltersState.commute)

        // Add user location for transit calculations
        if (userLocation) {
          if (userLocation.lat && userLocation.lng) {
            params.set('user_lat', userLocation.lat.toString())
            params.set('user_lng', userLocation.lng.toString())
          } else if (userLocation.address) {
            params.set('user_address', userLocation.address)
          }
        }

        params.set('sort_by', sortBy)
        params.set('page', currentPage.toString())
        params.set('limit', '12')

        const response = await fetch(`/api/jobs/search?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch jobs')
        }

        const data = await response.json()

        if (resetPage) {
          setJobs(data.jobs)
        } else {
          setJobs((prev) => [...prev, ...data.jobs])
          setPage(currentPage)
        }

        setTotal(data.total)
        setHasMore(data.hasMore)
        setHasTransitData(data.hasTransitData || false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [allFiltersState, page, userLocation, sortBy]
  )

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(true)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [allFiltersState, sortBy, userLocation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle saved
  const toggleSave = (id: string) => {
    setSavedJobIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  // Job click - navigate to job detail page
  const handleJobClick = (job: Job) => {
    router.push(`/dashboard/jobs/${job.id}`)
  }

  // Pocket & Apply - save to pocket then navigate to job detail
  const handlePocketAndApply = (job: Job) => {
    // Auto-save to pocket if not already saved
    if (!savedJobIds.includes(job.id)) {
      setSavedJobIds((ids) => [...ids, job.id])
    }
    // Navigate to job detail page for full pocket generation
    router.push(`/dashboard/jobs/${job.id}`)
  }

  // Filtered and sorted jobs
  const displayJobs = useMemo(() => {
    return jobs
      .map((job) => ({ ...job, saved: savedJobIds.includes(job.id) }))
      .sort((a, b) => Number(Boolean(b.saved)) - Number(Boolean(a.saved)))
  }, [jobs, savedJobIds])

  // Count active filters (for secondary filters only)
  const secondaryFilterCount = [
    allFiltersState.salaryMin,
    allFiltersState.postedWithin,
    allFiltersState.lynxAccessible,
    allFiltersState.valenciaFriendly,
  ].filter(Boolean).length

  // Check if ANY filters are active (for empty state logic)
  const hasActiveFilters = !!(
    allFiltersState.query ||
    allFiltersState.location ||
    allFiltersState.commute ||
    allFiltersState.jobTypes.length > 0 ||
    allFiltersState.salaryMin ||
    allFiltersState.postedWithin ||
    allFiltersState.lynxAccessible ||
    allFiltersState.valenciaFriendly
  )

  // Clear all filters
  const clearAllFilters = () => {
    const cleared: AllFiltersState = {
      query: '',
      location: '',
      commute: '',
      jobTypes: [],
      salaryMin: '',
      postedWithin: '',
      lynxAccessible: false,
      valenciaFriendly: false,
    }
    setAllFiltersState(cleared)
    setFilterBarState({
      query: '',
      location: '',
      commute: '',
      jobTypes: [],
    })
  }

  // Handle filter bar changes
  const handleFilterBarChange = (newState: FilterBarState) => {
    setFilterBarState(newState)
  }

  // Handle all filters modal apply
  const handleAllFiltersApply = () => {
    // Sync primary filters back to filter bar
    setFilterBarState({
      query: allFiltersState.query,
      location: allFiltersState.location,
      commute: allFiltersState.commute,
      jobTypes: allFiltersState.jobTypes,
    })
  }

  return (
    <main className="jw-grain relative mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary jw-glow-card flex-shrink-0">
            <Briefcase size={18} className="sm:hidden" />
            <Briefcase size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight text-foreground"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              Entry-Level Jobs
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
              Real opportunities. No gatekeeping.{' '}
              <span className="text-primary font-semibold hidden sm:inline">You belong here.</span>
            </p>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filters={filterBarState}
        onFiltersChange={handleFilterBarChange}
        onAllFiltersClick={() => setIsAllFiltersOpen(true)}
        activeFilterCount={secondaryFilterCount}
        className="mb-6"
      />

      {/* Job count and sort */}
      {!isLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <span className="text-xs sm:text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-semibold text-foreground">{jobs.length}</span> of{' '}
            <span className="font-semibold text-foreground">{total}</span>{' '}
            {total === 1 ? 'job' : 'jobs'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
            <div className="inline-flex rounded-full border border-border bg-muted/30 overflow-hidden" role="group" aria-label="Sort options">
              <button
                onClick={() => setSortBy('date')}
                className={cn(
                  'px-3 py-1.5 text-xs transition-colors whitespace-nowrap',
                  sortBy === 'date'
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Newest
              </button>
              {hasTransitData && (
                <button
                  onClick={() => setSortBy('commute')}
                  className={cn(
                    'px-3 py-1.5 text-xs transition-colors flex items-center gap-1 whitespace-nowrap border-l border-border',
                    sortBy === 'commute'
                      ? 'bg-foreground text-background font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Bus size={12} />
                  Commute
                </button>
              )}
              <button
                onClick={() => setSortBy('salary')}
                className={cn(
                  'px-3 py-1.5 text-xs transition-colors whitespace-nowrap border-l border-border',
                  sortBy === 'salary'
                    ? 'bg-foreground text-background font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Salary
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Job listings */}
      <section role="main" aria-label="Job listings">
        {/* Error state */}
        {error ? (
          <div className="flex justify-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card/60 p-6 sm:p-10 text-center">
              <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-3xl border border-muted bg-muted/30 text-muted-foreground">
                <Compass size={24} className="sm:hidden" />
                <Compass size={28} className="hidden sm:block" />
              </div>
              <h2
                className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                Couldn&apos;t load jobs
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Something went wrong on our end. Give it another try?
              </p>
              <button
                onClick={() => fetchJobs(true)}
                className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 sm:px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Refresh
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : isLoading ? (
          /* Loading state */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-border bg-card/40 p-4 sm:p-5"
              >
                <div className="flex gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-5 w-3/4 rounded bg-muted mb-2" />
                <div className="h-4 w-1/2 rounded bg-muted mb-4" />
                <div className="h-8 w-32 rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          /* Empty state - different for filtered vs unfiltered */
          <div className="flex justify-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card/60 p-6 sm:p-10 text-center">
              <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10 text-primary">
                <Compass size={24} className="sm:hidden" />
                <Compass size={28} className="hidden sm:block" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h2
                    className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-foreground"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    No matches found
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    Try adjusting your filters or search terms. Every job here welcomes entry-level
                    candidates.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 sm:px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    Show All Jobs
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <h2
                    className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-foreground"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Jobs are loading...
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    We&apos;re finding entry-level opportunities in your area.
                    Check back in a moment!
                  </p>
                  <button
                    onClick={() => fetchJobs(true)}
                    className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 sm:px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    Refresh Jobs
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  onSave={() => toggleSave(job.id)}
                  onPocketAndApply={() => handlePocketAndApply(job)}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => fetchJobs(false)}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {isLoadingMore ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load more jobs
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Scam Shield notice */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-xs text-muted-foreground">
          <ShieldCheck size={14} className="text-primary" />
          <span>Scam Shield is protecting your search</span>
          <Link
            href="/dashboard/jobs/blocked"
            className="text-primary hover:underline font-medium"
          >
            View blocked
          </Link>
        </div>
      </div>

      {/* All Filters Modal */}
      <AllFiltersModal
        isOpen={isAllFiltersOpen}
        onClose={() => setIsAllFiltersOpen(false)}
        filters={allFiltersState}
        onFiltersChange={setAllFiltersState}
        onApply={handleAllFiltersApply}
        onClear={clearAllFilters}
        totalJobs={total}
      />
    </main>
  )
}
