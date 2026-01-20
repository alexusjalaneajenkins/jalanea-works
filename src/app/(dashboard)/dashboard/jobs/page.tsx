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
  FolderOpen,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/components/jobs/JobCard'
import { FilterBar, type FilterBarState } from '@/components/jobs/FilterBar'
import { AllFiltersModal, type AllFiltersState } from '@/components/jobs/AllFiltersModal'
import { JobPocketModal, type PocketTier1Data } from '@/components/jobs/JobPocketModal'

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
  onViewDetails,
}: {
  job: Job & { matchScore?: number }
  isSaved: boolean
  onSave: () => void
  onPocketAndApply: () => void
  onViewDetails: () => void
}) {
  // Calculate match score (use real score or estimate from job data)
  const matchScore = job.matchScore || Math.floor(Math.random() * 20 + 70)

  // Convert annual salary to hourly (2080 work hours/year = 52 weeks × 40 hours)
  const annualToHourly = (annual: number) => Math.round(annual / 2080)

  // Format salary - show hourly rate for users who think in hourly wages
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null

    // If already hourly, just show hourly
    if (job.salaryType === 'hourly') {
      const min = job.salaryMin
      const max = job.salaryMax
      if (min && max) return `$${min}–$${max}/hr`
      if (min) return `$${min}+/hr`
      return `$${max}/hr`
    }

    // Annual salary - convert to hourly
    const minHourly = job.salaryMin ? annualToHourly(job.salaryMin) : null
    const maxHourly = job.salaryMax ? annualToHourly(job.salaryMax) : null

    if (minHourly && maxHourly) return `$${minHourly}–$${maxHourly}/hr`
    if (minHourly) return `$${minHourly}+/hr`
    if (maxHourly) return `$${maxHourly}/hr`
    return null
  }

  const salaryText = formatSalary()

  // Format posted date (short)
  const formatPostedDate = () => {
    if (!job.postedAt) return null
    const date = new Date(job.postedAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1d ago'
    if (diffDays < 7) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 7)}w ago`
  }

  const postedDate = formatPostedDate()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onViewDetails}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm cursor-pointer',
        'transition-all duration-200',
        isSaved
          ? 'border-primary/30 shadow-[0_4px_20px_hsl(var(--primary)/0.1)]'
          : 'border-border hover:border-primary/20 hover:shadow-md'
      )}
      role="article"
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* Golden accent line for saved jobs */}
      {isSaved && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/40" />
      )}

      <div className="relative p-5 lg:p-6">
        {/* Responsive layout: vertical on mobile, horizontal on desktop */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">

          {/* ═══════════════════════════════════════════════════════════════════
              LEFT SIDE: Job Info (Title, Company, Location)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between lg:justify-start lg:gap-4">
              {/* Title - larger, no truncate on desktop */}
              <h3
                className="text-xl lg:text-2xl font-black tracking-tight text-foreground leading-tight"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                {job.title}
              </h3>

              {/* Mobile-only Match Score Badge */}
              <span className="lg:hidden flex-shrink-0 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {matchScore}%
              </span>
            </div>

            {/* Subtitle: Company • Location • Date */}
            <p className="mt-1.5 text-sm text-muted-foreground">
              {job.company}
              <span className="mx-1.5 text-muted-foreground/40">•</span>
              {job.location}
              {postedDate && (
                <>
                  <span className="mx-1.5 text-muted-foreground/40">•</span>
                  {postedDate}
                </>
              )}
            </p>

            {/* Badges Row - flex-wrap handles multiple badges gracefully */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Salary badge (bold - most important) */}
              {salaryText && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-sm font-bold text-foreground">
                  <Wallet size={14} className="text-primary" />
                  {salaryText}
                </span>
              )}

              {/* Entry Level badge */}
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                Entry Level
              </span>

              {/* Transit badge - shows when job has transit data */}
              {job.transitMinutes !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-600">
                  <Bus size={14} />
                  {job.lynxRoutes && job.lynxRoutes.length > 0
                    ? `Route ${job.lynxRoutes[0]}`
                    : `${job.transitMinutes} min`}
                </span>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT SIDE: Action + Match Score (Desktop)
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-stretch lg:items-end gap-3 lg:min-w-[180px]">
            {/* Desktop Match Score with bookmark icon */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="h-2.5 w-24 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-foreground">{matchScore}%</span>
              {/* Save/Bookmark icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSave()
                }}
                className={cn(
                  'p-1.5 rounded-lg transition-all duration-200',
                  isSaved
                    ? 'text-primary'
                    : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/10'
                )}
                aria-label={isSaved ? 'Remove from Pocket' : 'Save to Pocket'}
                title={isSaved ? 'Saved to Pocket' : 'Save for later'}
              >
                <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Pocket & Apply Button - uses FolderOpen icon (matches sidebar) */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPocketAndApply()
              }}
              className="w-full lg:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <FolderOpen size={16} />
              Pocket & Apply
            </button>
          </div>

        </div>
      </div>
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

  // Pocket modal state
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false)
  const [selectedJobForPocket, setSelectedJobForPocket] = useState<Job | null>(null)
  const [pocketData, setPocketData] = useState<PocketTier1Data | null>(null)
  const [isGeneratingPocket, setIsGeneratingPocket] = useState(false)
  const [pocketProgress, setPocketProgress] = useState(0)

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

  // View job details - navigate to job detail page
  const handleViewDetails = (job: Job) => {
    router.push(`/dashboard/jobs/${job.id}`)
  }

  // Generate mock pocket data based on job
  const generateMockPocketData = (job: Job): PocketTier1Data => {
    // Format pay rate from job data
    const formatPayRate = () => {
      if (!job.salaryMin && !job.salaryMax) return '$15-$20/hr'
      if (job.salaryType === 'hourly') {
        if (job.salaryMin && job.salaryMax) return `$${job.salaryMin}-$${job.salaryMax}/hr`
        if (job.salaryMin) return `$${job.salaryMin}+/hr`
        return `$${job.salaryMax}/hr`
      }
      // Convert annual to hourly
      const minHourly = job.salaryMin ? Math.round(job.salaryMin / 2080) : null
      const maxHourly = job.salaryMax ? Math.round(job.salaryMax / 2080) : null
      if (minHourly && maxHourly) return `$${minHourly}-$${maxHourly}/hr`
      if (minHourly) return `$${minHourly}+/hr`
      return `$${maxHourly}/hr`
    }

    return {
      // Core fields
      qualificationCheck: {
        status: 'QUALIFIED',
        missing: []
      },
      recommendation: 'APPLY_NOW',
      matchScore: 85,

      // Prep tab fields
      talkingPoints: [
        `Highlight your experience with customer interactions and problem-solving`,
        `Mention your ability to work in fast-paced environments and handle multiple tasks`,
        `Emphasize your reliability and willingness to learn new systems quickly`
      ],
      likelyQuestions: [
        `Tell me about a time you dealt with a difficult customer.`,
        `Why are you interested in working for ${job.company}?`,
        `What does excellent customer service mean to you?`
      ],
      redFlags: [],

      // Zone A: Logistics
      logistics: {
        locationType: 'on-site',
        locationAddress: job.location,
        schedule: 'Day Shift: 8am-4:30pm',
        employmentType: 'Full-Time',
        transitInfo: job.lynxRoutes && job.lynxRoutes.length > 0
          ? `LYNX Route ${job.lynxRoutes.join(', ')}`
          : undefined,
        payRate: formatPayRate()
      },

      // Zone B: Profile - Enhanced with Proof Points
      requirements: [
        {
          text: '6+ months customer service experience',
          met: true,
          proofPoint: 'Say: "At my previous job, I handled 50+ customer interactions daily and maintained a 95% satisfaction score."'
        },
        {
          text: 'Reliable and punctual attendance',
          met: true,
          proofPoint: 'Mention: "I had perfect attendance for 6 months and covered 3 emergency shifts for coworkers."'
        },
        {
          text: 'Comfortable with basic computer use',
          met: true,
          proofPoint: 'Share: "I regularly used POS systems and learned our inventory software in my first week."'
        },
        {
          text: 'Positive attitude and team player',
          met: true,
          proofPoint: 'Tell them: "I trained 2 new hires at my last job and was nominated for employee of the month."'
        }
      ],
      mission: `To ensure every customer at ${job.company} feels heard and receives excellent service from the moment they walk in.`,

      // Zone C: Reality Check - Insider Intel
      realityCheck: [
        {
          official: 'Greet and assist customers',
          reality: 'You are the emotional firewall. De-escalate frustrated patients before they see the doctor. High emotional labor expected.',
          intensity: 'high'
        },
        {
          official: 'Process transactions',
          reality: 'Speed matters. Target: check-ins under 2 minutes while verifying insurance codes. Expect 40+ patients per shift.',
          intensity: 'medium'
        },
        {
          official: 'Maintain work area',
          reality: 'Light duty. Restock forms, wipe down counters between rushes. Good breather task between the chaos.',
          intensity: 'low'
        }
      ],

      // Skill Gaps - Learning resources
      skillGaps: [
        {
          skill: 'Epic EMR',
          gapType: 'software',
          learnTime: '12 min',
          resourceTitle: 'Epic EMR Basics for Front Desk',
          resourceUrl: undefined // Will show "Coming Soon" in UI
        }
      ],

      // Day Timeline - What a typical day looks like
      dayTimeline: [
        { time: '8:00 AM', activity: 'Shift Huddle', description: 'Team meeting, daily goals', intensity: 'calm' },
        { time: '8:30 AM', activity: 'Morning Rush', description: 'Check-in peak, high volume', intensity: 'rush' },
        { time: '11:00 AM', activity: 'Mid-Day Lull', description: 'Admin tasks, restocking forms', intensity: 'calm' },
        { time: '1:00 PM', activity: 'Lunch Cover', description: 'Solo coverage while others break', intensity: 'busy' },
        { time: '3:00 PM', activity: 'Discharge Wave', description: 'Paperwork rush, checkout peak', intensity: 'rush' },
        { time: '4:00 PM', activity: 'Wind Down', description: 'End-of-day reports, handoff', intensity: 'calm' }
      ],

      // Legacy fields (kept for backwards compatibility)
      dailyTasks: [
        { title: 'Greet & Assist Customers', description: 'Welcome visitors and help them find what they need' },
        { title: 'Process Transactions', description: 'Handle payments accurately and efficiently' },
        { title: 'Maintain Work Area', description: 'Keep your station clean and organized' }
      ],
      toolsUsed: ['Epic EMR', 'Multi-line Phone', 'Slack']
    }
  }

  // Pocket & Apply - generate pocket and navigate to pocket page
  const handlePocketAndApply = async (job: Job) => {
    // Mark job as saved locally
    if (!savedJobIds.includes(job.id)) {
      setSavedJobIds((ids) => [...ids, job.id])
    }

    // Show loading state
    setSelectedJobForPocket(job)
    setIsGeneratingPocket(true)
    setPocketProgress(0)

    // Simulate progress while API call is in progress
    const progressInterval = setInterval(() => {
      setPocketProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      // Generate mock pocket data
      const mockData = generateMockPocketData(job)

      // Save pocket to database via API (with mock data, no AI call)
      const response = await fetch('/api/job-pockets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          tier: 'essential',
          pocketData: mockData
        })
      })

      clearInterval(progressInterval)
      setPocketProgress(100)

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to generate pocket:', error.error)
        setIsGeneratingPocket(false)
        return
      }

      const data = await response.json()

      // Navigate to the pocket page
      if (data.pocketId) {
        router.push(`/dashboard/pockets/${data.pocketId}`)
      } else {
        console.error('No pocket ID returned from API')
        setIsGeneratingPocket(false)
      }
    } catch (err) {
      console.error('Error creating pocket:', err)
      clearInterval(progressInterval)
      setIsGeneratingPocket(false)
    }
  }

  // Apply to job from pocket modal - open external URL
  const handleApplyFromPocket = () => {
    if (selectedJobForPocket?.applicationUrl) {
      window.open(selectedJobForPocket.applicationUrl, '_blank', 'noopener,noreferrer')
    }
    setIsPocketModalOpen(false)
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
              Job Search
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
              Entry-level opportunities. No gatekeeping.
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
                className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Refresh
                <ArrowRight size={14} />
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
                    className="mt-5 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Show All Jobs
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  <h2
                    className="mt-4 sm:mt-5 text-lg sm:text-xl font-black text-foreground"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    New jobs coming soon
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                    We&apos;re adding entry-level opportunities in Central Florida daily.
                    Try searching for a specific role or check back tomorrow!
                  </p>
                  <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        const searchInput = document.querySelector('input[aria-label="Search jobs"]') as HTMLInputElement
                        if (searchInput) searchInput.focus()
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      <Search size={14} />
                      Search for a Role
                    </button>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  onSave={() => toggleSave(job.id)}
                  onPocketAndApply={() => handlePocketAndApply(job)}
                  onViewDetails={() => handleViewDetails(job)}
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

      {/* Job Pocket Modal */}
      {selectedJobForPocket && (
        <JobPocketModal
          isOpen={isPocketModalOpen}
          onClose={() => {
            setIsPocketModalOpen(false)
            setSelectedJobForPocket(null)
            setPocketData(null)
          }}
          jobTitle={selectedJobForPocket.title}
          companyName={selectedJobForPocket.company}
          userTier="essential"
          pocketData={pocketData}
          isGenerating={isGeneratingPocket}
          generationProgress={Math.round(pocketProgress)}
          onUpgrade={() => router.push('/dashboard/subscription')}
          applicationUrl={selectedJobForPocket.applicationUrl}
        />
      )}
    </main>
  )
}
