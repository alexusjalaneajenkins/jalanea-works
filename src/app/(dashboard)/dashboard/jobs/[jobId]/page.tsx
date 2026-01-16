'use client'

/**
 * Job Detail Page
 * Shows full job information and allows generating Job Pockets
 * Includes scam warning for high-risk jobs
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

import {
  JobDetail,
  JobPocketModal,
  ScamWarningModal,
  type Job,
  type UserTier,
  type PocketTier1Data,
  type PocketTier2Data,
  type PocketTier3Data
} from '@/components/jobs'
import { createClient } from '@/lib/supabase/client'

interface ExtendedJob extends Job {
  requirements?: string[]
  benefits?: string[]
  fullDescription?: string
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  // Job state
  const [job, setJob] = useState<ExtendedJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Save state
  const [isSaved, setIsSaved] = useState(false)

  // Pocket modal state
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false)
  const [isGeneratingPocket, setIsGeneratingPocket] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [pocketData, setPocketData] = useState<PocketTier1Data | PocketTier2Data | PocketTier3Data | null>(null)
  const [userTier, setUserTier] = useState<UserTier>('essential')

  // Scam warning modal state
  const [isScamWarningOpen, setIsScamWarningOpen] = useState(false)

  // Fetch job details
  useEffect(() => {
    async function fetchJob() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/jobs/${jobId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found')
          }
          throw new Error('Failed to fetch job')
        }

        const data = await response.json()
        setJob(data.job)
        setIsSaved(data.isSaved || false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch user tier from users table
    async function fetchUserTier() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', user.id)
          .single()

        if (userData?.tier) {
          setUserTier(userData.tier as UserTier)
        }
      }
    }

    fetchJob()
    fetchUserTier()
  }, [jobId])

  // Generate job pocket
  const handleGeneratePocket = useCallback(async () => {
    if (!job) return

    setIsPocketModalOpen(true)
    setIsGeneratingPocket(true)
    setGenerationProgress(0)
    setPocketData(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // Call the API
      const response = await fetch('/api/job-pockets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          tier: userTier
        })
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Failed to generate pocket')
      }

      const data = await response.json()
      setGenerationProgress(100)

      // Small delay to show 100% before showing content
      await new Promise(resolve => setTimeout(resolve, 300))
      setPocketData(data.pocket)
    } catch (err) {
      console.error('Error generating pocket:', err)
      // Show error state
    } finally {
      setIsGeneratingPocket(false)
    }
  }, [job, userTier])

  // Track and apply to job
  const trackAndApply = useCallback(async () => {
    if (!job?.applicationUrl) return

    // Track the application in the database
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply' })
      })
    } catch (err) {
      // Don't block the user from applying even if tracking fails
      console.error('Error tracking application:', err)
    }

    // Open the external application URL
    window.open(job.applicationUrl, '_blank', 'noopener,noreferrer')
  }, [job])

  // Apply to job - shows warning for high-risk jobs
  const handleApply = useCallback(async () => {
    if (!job?.applicationUrl) return

    // Show warning modal for high-risk jobs
    if (job.scamRiskLevel === 'high' || job.scamRiskLevel === 'medium') {
      setIsScamWarningOpen(true)
      return
    }

    // For low-risk jobs, apply directly
    trackAndApply()
  }, [job, trackAndApply])

  // Handle confirming to apply despite warning
  const handleConfirmApply = useCallback(() => {
    setIsScamWarningOpen(false)
    trackAndApply()
  }, [trackAndApply])

  // Save job
  const handleSave = useCallback(async () => {
    if (!job) return

    try {
      const response = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      })

      if (response.ok) {
        setIsSaved(true)
      }
    } catch (err) {
      console.error('Error saving job:', err)
    }
  }, [job])

  // Unsave job
  const handleUnsave = useCallback(async () => {
    if (!job) return

    try {
      const response = await fetch('/api/jobs/save', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      })

      if (response.ok) {
        setIsSaved(false)
      }
    } catch (err) {
      console.error('Error unsaving job:', err)
    }
  }, [job])

  // Handle upgrade
  const handleUpgrade = useCallback(() => {
    router.push('/dashboard/subscription')
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffc425] mb-4" />
          <p className="text-slate-400">Loading job details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-4">
            {error === 'Job not found' ? 'Job Not Found' : 'Error Loading Job'}
          </h1>
          <p className="text-slate-400 mb-6">
            {error === 'Job not found'
              ? 'This job listing may have been removed or the link is incorrect.'
              : 'We had trouble loading this job. Please try again.'}
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </Link>
        </motion.div>
      </div>
    )
  }

  // No job found
  if (!job) {
    return null
  }

  // Create scam flags for the warning modal
  const scamFlags = (job.scamReasons || []).map((reason, index) => ({
    id: `scam-flag-${index}`,
    rule: 'job-listing-warning',
    severity: (job.scamRiskLevel === 'high' ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low',
    matched: true,
    description: reason
  }))

  return (
    <>
      <JobDetail
        job={job}
        onGeneratePocket={handleGeneratePocket}
        onApply={handleApply}
        onSave={handleSave}
        onUnsave={handleUnsave}
        isSaved={isSaved}
        isGeneratingPocket={isGeneratingPocket}
      />

      <JobPocketModal
        isOpen={isPocketModalOpen}
        onClose={() => setIsPocketModalOpen(false)}
        jobTitle={job.title}
        companyName={job.company}
        userTier={userTier}
        pocketData={pocketData}
        isGenerating={isGeneratingPocket}
        generationProgress={Math.round(generationProgress)}
        onUpgrade={handleUpgrade}
      />

      <ScamWarningModal
        isOpen={isScamWarningOpen}
        onClose={() => setIsScamWarningOpen(false)}
        onConfirm={handleConfirmApply}
        jobTitle={job.title}
        companyName={job.company}
        flags={scamFlags}
      />
    </>
  )
}
