'use client'

/**
 * JobList - List of job cards with infinite scroll or pagination
 */

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { JobCard, type Job } from './JobCard'

interface JobListProps {
  jobs: Job[]
  isLoading: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  error?: string | null
  onLoadMore?: () => void
  onJobClick?: (job: Job) => void
  onSaveJob?: (jobId: string) => void
  onUnsaveJob?: (jobId: string) => void
  savedJobIds?: string[]
  emptyMessage?: string
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800" />
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-slate-800 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="h-6 w-20 bg-slate-800 rounded-full" />
            <div className="h-6 w-24 bg-slate-800 rounded-full" />
          </div>
          <div className="flex gap-4 mb-3">
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="h-4 w-32 bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
        <Search size={40} className="text-slate-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
      <p className="text-slate-400 max-w-md mx-auto">{message}</p>
    </motion.div>
  )
}

function ErrorState({
  error,
  onRetry
}: {
  error: string
  onRetry?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
    >
      <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-red-300 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </motion.div>
  )
}

export function JobList({
  jobs,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  error,
  onLoadMore,
  onJobClick,
  onSaveJob,
  onUnsaveJob,
  savedJobIds = [],
  emptyMessage = 'Try adjusting your search or filters to find more jobs.'
}: JobListProps) {
  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore()
      }
    },
    [hasMore, isLoadingMore, onLoadMore]
  )

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [handleObserver])

  // Initial loading state
  if (isLoading && jobs.length === 0) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error && jobs.length === 0) {
    return <ErrorState error={error} onRetry={onLoadMore} />
  }

  // Empty state
  if (!isLoading && jobs.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            onClick={onJobClick}
            onSave={onSaveJob}
            onUnsave={onUnsaveJob}
            isSaved={savedJobIds.includes(job.id)}
          />
        ))}
      </AnimatePresence>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#ffc425]" />
          <span className="ml-2 text-slate-400">Loading more jobs...</span>
        </div>
      )}

      {/* End of results */}
      {!hasMore && jobs.length > 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          You&apos;ve seen all {jobs.length} jobs
        </div>
      )}
    </div>
  )
}

export default JobList
