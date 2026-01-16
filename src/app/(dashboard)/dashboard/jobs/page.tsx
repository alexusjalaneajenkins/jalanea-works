'use client'

/**
 * Jobs Hub Page
 * Search and filter jobs with LYNX accessibility and Valencia matching
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Bus, MapPin, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import {
  JobSearchBar,
  JobFilters,
  JobList,
  defaultFilters,
  type JobFiltersState,
  type Job
} from '@/components/jobs'
import { createClient } from '@/lib/supabase/client'

// User location interface
interface UserLocation {
  lat: number
  lng: number
  address?: string
}

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
      const { data: { user } } = await supabase.auth.getUser()

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
            address: userData.location_address
          })
        } else if (userData?.location_address) {
          // User has address but no coords - will geocode on server
          setUserLocation({
            lat: 0,
            lng: 0,
            address: userData.location_address
          })
        }
      }
    }

    fetchUserLocation()
  }, [])

  // Fetch jobs
  const fetchJobs = useCallback(async (resetPage = true) => {
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

      // Add sort parameter
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
        setJobs(prev => [...prev, ...data.jobs])
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
  }, [query, location, filters, page, userLocation, sortBy])

  // Initial fetch and refetch on filter/sort changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(true)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, location, filters, sortBy, userLocation]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search
  const handleSearch = useCallback((newQuery: string, newLocation: string) => {
    setQuery(newQuery)
    setLocation(newLocation)
  }, [])

  // Load more
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchJobs(false)
    }
  }

  // Save/unsave jobs
  const handleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => [...prev, jobId])
    // TODO: Save to database
  }

  const handleUnsaveJob = (jobId: string) => {
    setSavedJobIds(prev => prev.filter(id => id !== jobId))
    // TODO: Remove from database
  }

  // Job click - navigate to job detail page
  const handleJobClick = (job: Job) => {
    router.push(`/dashboard/jobs/${job.id}`)
  }

  // Count active filters
  const activeFilterCount = [
    filters.maxCommute,
    filters.salaryMin,
    filters.salaryMax,
    filters.jobType.length > 0,
    filters.postedWithin,
    filters.lynxAccessible,
    filters.valenciaFriendly
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Jobs</h1>
        <p className="text-slate-400 mt-1">
          Find jobs that match your skills and location
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex gap-3">
          <div className="flex-1">
            <JobSearchBar
              initialQuery={query}
              initialLocation={location}
              onSearch={handleSearch}
              isSearching={isLoading}
            />
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors relative"
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffc425] text-[#0f172a] text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results count and sort options */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="text-sm text-slate-400">
            {total > 0 ? (
              <>
                Showing {jobs.length} of {total} jobs
                {query && <> for &quot;{query}&quot;</>}
                {location && <> in {location}</>}
              </>
            ) : (
              <>No jobs found</>
            )}
          </div>

          {/* Sort options */}
          {total > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    sortBy === 'date'
                      ? 'bg-[#ffc425] text-[#0f172a] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Newest
                </button>
                {hasTransitData && (
                  <button
                    onClick={() => setSortBy('commute')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                      sortBy === 'commute'
                        ? 'bg-[#ffc425] text-[#0f172a] font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bus size={12} />
                    Commute
                  </button>
                )}
                <button
                  onClick={() => setSortBy('salary')}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    sortBy === 'salary'
                      ? 'bg-[#ffc425] text-[#0f172a] font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Salary
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Transit location notice */}
      {!isLoading && hasTransitData && userLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
        >
          <MapPin size={14} />
          <span>
            Commute times calculated from {userLocation.address || 'your saved location'}
          </span>
        </motion.div>
      )}

      {/* Scam Shield notice */}
      {!isLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 flex items-center justify-between text-xs bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={14} className="text-green-400" />
            <span>Scam Shield is protecting your job search</span>
          </div>
          <Link
            href="/dashboard/jobs/blocked"
            className="text-slate-500 hover:text-[#ffc425] transition-colors"
          >
            View blocked jobs
          </Link>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block">
          <JobFilters
            filters={filters}
            onChange={setFilters}
            isOpen={true}
            onClose={() => {}}
            isMobile={false}
          />
        </div>

        {/* Job List */}
        <div className="flex-1 min-w-0">
          <JobList
            jobs={jobs}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={handleLoadMore}
            onJobClick={handleJobClick}
            onSaveJob={handleSaveJob}
            onUnsaveJob={handleUnsaveJob}
            savedJobIds={savedJobIds}
            emptyMessage={
              query || activeFilterCount > 0
                ? 'Try adjusting your search or filters to find more jobs.'
                : "We're searching for jobs that match your profile. Check back soon!"
            }
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        isMobile={true}
      />
    </div>
  )
}
