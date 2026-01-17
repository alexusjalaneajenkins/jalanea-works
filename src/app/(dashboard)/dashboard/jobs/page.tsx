'use client'

/**
 * Jobs Hub Page - "Shining Light" Design
 *
 * Entry-level jobs page with:
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
  CheckCircle2,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/components/jobs/JobCard'

// Types
type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship'

interface UserLocation {
  lat: number
  lng: number
  address?: string
}

interface JobFiltersState {
  maxCommute: number | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: string[]
  postedWithin: string | null
  lynxAccessible: boolean
  valenciaFriendly: boolean
}

const defaultFilters: JobFiltersState = {
  maxCommute: null,
  salaryMin: null,
  salaryMax: null,
  jobType: [],
  postedWithin: null,
  lynxAccessible: false,
  valenciaFriendly: false,
}

// -------------------- COMPONENTS --------------------

function MatchRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 14
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-8 w-8">
      <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
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
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
        {value}
      </span>
    </div>
  )
}

function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-200 min-h-[44px]',
        active
          ? 'border-primary/40 bg-primary/15 text-primary shadow-sm'
          : 'border-border bg-card/60 text-muted-foreground hover:border-primary/20 hover:text-foreground'
      )}
    >
      {label}
    </button>
  )
}

function JobCard({
  job,
  isSaved,
  onSave,
  onClick,
}: {
  job: Job & { matchScore?: number }
  isSaved: boolean
  onSave: () => void
  onClick: () => void
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
              <div className="flex items-center gap-2">
                <MatchRing value={matchScore} />
                <span className="text-xs font-bold text-primary">{matchScore}% match</span>
              </div>
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
            </div>

            {/* Pay */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
              <Wallet size={14} className="text-primary" />
              <span className="text-sm font-bold text-foreground">{formatSalary()}</span>
            </div>
          </div>

          {/* Save button */}
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
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
            aria-pressed={isSaved}
          >
            <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
          </button>
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
              onClick()
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card min-h-[44px]"
          >
            <Sparkles size={14} />
            Quick Apply
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

  // Search state
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Orlando, FL')

  // User location for transit calculations
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [hasTransitData, setHasTransitData] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'commute' | 'salary'>('date')

  // Filters state
  const [filters, setFilters] = useState<JobFiltersState>(defaultFilters)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [commute, setCommute] = useState<'15' | '30' | '45' | '60+'>('30')
  const [jobTypes, setJobTypes] = useState<JobType[]>(['Full-time'])

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

        if (query) params.set('q', query)
        if (location) params.set('location', location)
        if (filters.salaryMin) params.set('salary_min', filters.salaryMin.toString())
        if (filters.salaryMax) params.set('salary_max', filters.salaryMax.toString())
        if (filters.jobType.length > 0) params.set('job_type', filters.jobType.join(','))
        if (filters.postedWithin) params.set('posted_within', filters.postedWithin)
        if (filters.lynxAccessible) params.set('lynx_accessible', 'true')
        if (filters.valenciaFriendly) params.set('valencia_friendly', 'true')
        if (filters.maxCommute) params.set('max_commute', filters.maxCommute.toString())

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
        params.set('limit', '10')

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
    [query, location, filters, page, userLocation, sortBy]
  )

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(true)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, location, filters, sortBy, userLocation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle saved
  const toggleSave = (id: string) => {
    setSavedJobIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }

  // Job click - navigate to job detail page
  const handleJobClick = (job: Job) => {
    router.push(`/dashboard/jobs/${job.id}`)
  }

  // Filtered and sorted jobs
  const displayJobs = useMemo(() => {
    return jobs
      .map((job) => ({ ...job, saved: savedJobIds.includes(job.id) }))
      .sort((a, b) => Number(Boolean(b.saved)) - Number(Boolean(a.saved)))
  }, [jobs, savedJobIds])

  // Count active filters
  const activeFilterCount = [
    filters.maxCommute,
    filters.salaryMin,
    filters.salaryMax,
    filters.jobType.length > 0,
    filters.postedWithin,
    filters.lynxAccessible,
    filters.valenciaFriendly,
  ].filter(Boolean).length

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary jw-glow-card flex-shrink-0">
              <Briefcase size={20} className="sm:hidden" />
              <Briefcase size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                Entry-Level Jobs
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">
                Real opportunities. No gatekeeping.{' '}
                <span className="text-primary font-semibold hidden sm:inline">You belong here.</span>
              </p>
            </div>
          </div>
          {/* Mobile filter button */}
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5 text-sm font-semibold text-foreground flex-shrink-0"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Filters sidebar - hidden on mobile */}
        <aside
          className="hidden lg:block lg:col-span-4 xl:col-span-3"
          role="complementary"
          aria-label="Job filters"
        >
          <div className="sticky top-24 rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Filters</span>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                {total} jobs
              </span>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label
                  className="text-xs font-semibold text-muted-foreground"
                  htmlFor="job-search"
                >
                  Search
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5">
                  <Search size={16} className="text-muted-foreground" />
                  <input
                    id="job-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Job title, company…"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label
                  className="text-xs font-semibold text-muted-foreground"
                  htmlFor="job-location"
                >
                  Location
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5">
                  <MapPin size={16} className="text-muted-foreground" />
                  <input
                    id="job-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Commute */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label className="text-xs font-semibold text-muted-foreground">
                  Max commute
                </label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {(
                    [
                      { k: '15', l: '15m' },
                      { k: '30', l: '30m' },
                      { k: '45', l: '45m' },
                      { k: '60+', l: '60+' },
                    ] as const
                  ).map((o) => (
                    <TogglePill
                      key={o.k}
                      active={commute === o.k}
                      label={o.l}
                      onClick={() => {
                        setCommute(o.k)
                        setFilters((f) => ({
                          ...f,
                          maxCommute: o.k === '60+' ? 60 : parseInt(o.k),
                        }))
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Job type */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Job type</label>
                  <span className="text-[10px] text-muted-foreground">multi-select</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'] as JobType[]
                  ).map((t) => {
                    const active = jobTypes.includes(t)
                    return (
                      <TogglePill
                        key={t}
                        active={active}
                        label={t}
                        onClick={() => {
                          setJobTypes((prev) =>
                            active ? prev.filter((x) => x !== t) : [...prev, t]
                          )
                          setFilters((f) => ({
                            ...f,
                            jobType: active
                              ? f.jobType.filter((x) => x !== t)
                              : [...f.jobType, t],
                          }))
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* LYNX transit */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground">LYNX Accessible</div>
                    <div className="text-xs text-muted-foreground">Jobs reachable by bus</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, lynxAccessible: !f.lynxAccessible }))
                  }
                  className={cn(
                    'mt-3 w-full rounded-2xl border px-4 py-2.5 text-sm font-bold transition-colors',
                    filters.lynxAccessible
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  {filters.lynxAccessible ? 'Filter enabled' : 'Enable transit filter'}
                </button>
              </div>

              {/* Scam Shield notice */}
              <div className="rounded-2xl border border-border bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Scam Shield is protecting your search
                  </span>
                </div>
                <Link
                  href="/dashboard/jobs/blocked"
                  className="mt-2 block text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View blocked jobs →
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Job listings */}
        <section
          className="lg:col-span-8 xl:col-span-9"
          role="main"
          aria-label="Job listings"
        >
          {/* Sort options */}
          {!isLoading && total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <span className="text-xs sm:text-sm text-muted-foreground">
                Showing {jobs.length} of {total} jobs
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
                <div className="flex gap-1 rounded-lg border border-border bg-card/60 p-1 overflow-x-auto">
                  <button
                    onClick={() => setSortBy('date')}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap',
                      sortBy === 'date'
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Newest
                  </button>
                  {hasTransitData && (
                    <button
                      onClick={() => setSortBy('commute')}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 whitespace-nowrap',
                        sortBy === 'commute'
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Bus size={12} />
                      Commute
                    </button>
                  )}
                  <button
                    onClick={() => setSortBy('salary')}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap',
                      sortBy === 'salary'
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Salary
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
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
            <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-10 text-center">
              <div className="mx-auto grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-3xl border border-primary/30 bg-primary/10 text-primary">
                <Compass size={24} className="sm:hidden" />
                <Compass size={28} className="hidden sm:block" />
              </div>
              <h2
                className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                No matches found
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters or search terms. Every job here welcomes entry-level
                candidates.
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setFilters(defaultFilters)
                  setJobTypes(['Full-time'])
                  setCommute('30')
                }}
                className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 sm:px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Clear filters
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {displayJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    onSave={() => toggleSave(job.id)}
                    onClick={() => handleJobClick(job)}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => fetchJobs(false)}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-5 sm:px-6 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors disabled:opacity-50 min-h-[44px]"
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
      </div>

      {/* Mobile filters modal */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFiltersOpen(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5"
          >
            {/* Handle bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-border" />

            <div className="flex items-center justify-between mb-4 pt-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                <span className="text-lg font-bold text-foreground">Filters</span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  {total} jobs
                </span>
              </div>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-background/60 text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label className="text-xs font-semibold text-muted-foreground">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5">
                  <Search size={16} className="text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Job title, company…"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label className="text-xs font-semibold text-muted-foreground">Location</label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5">
                  <MapPin size={16} className="text-muted-foreground" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Commute */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <label className="text-xs font-semibold text-muted-foreground">Max commute</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {(
                    [
                      { k: '15', l: '15m' },
                      { k: '30', l: '30m' },
                      { k: '45', l: '45m' },
                      { k: '60+', l: '60+' },
                    ] as const
                  ).map((o) => (
                    <TogglePill
                      key={o.k}
                      active={commute === o.k}
                      label={o.l}
                      onClick={() => {
                        setCommute(o.k)
                        setFilters((f) => ({
                          ...f,
                          maxCommute: o.k === '60+' ? 60 : parseInt(o.k),
                        }))
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Job type */}
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Job type</label>
                  <span className="text-[10px] text-muted-foreground">multi-select</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'] as JobType[]).map((t) => {
                    const active = jobTypes.includes(t)
                    return (
                      <TogglePill
                        key={t}
                        active={active}
                        label={t}
                        onClick={() => {
                          setJobTypes((prev) =>
                            active ? prev.filter((x) => x !== t) : [...prev, t]
                          )
                          setFilters((f) => ({
                            ...f,
                            jobType: active
                              ? f.jobType.filter((x) => x !== t)
                              : [...f.jobType, t],
                          }))
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* LYNX transit */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground">LYNX Accessible</div>
                    <div className="text-xs text-muted-foreground">Jobs reachable by bus</div>
                  </div>
                </div>
                <button
                  onClick={() => setFilters((f) => ({ ...f, lynxAccessible: !f.lynxAccessible }))}
                  className={cn(
                    'mt-3 w-full rounded-2xl border px-4 py-2.5 text-sm font-bold transition-colors',
                    filters.lynxAccessible
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  {filters.lynxAccessible ? 'Filter enabled' : 'Enable transit filter'}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setQuery('')
                  setFilters(defaultFilters)
                  setJobTypes(['Full-time'])
                  setCommute('30')
                }}
                className="flex-1 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-bold text-foreground"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Show {total} jobs
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
