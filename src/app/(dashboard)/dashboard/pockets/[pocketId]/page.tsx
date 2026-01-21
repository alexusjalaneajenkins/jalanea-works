'use client'

/**
 * Pocket Workbench Page
 * Full-page workspace for managing a job application
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import {
  WorkbenchLayout,
  type WorkbenchTab,
  JobIntelTab,
  TrackerTab,
  type ApplicationStatus,
  ResumeTab,
  CoverLetterTab,
  InterviewPrepTab
} from '@/components/workbench'

import { type PocketTier1Data } from '@/components/jobs/PocketTier1'

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
  data: PocketTier1Data
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

interface Contact {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  linkedin?: string
}

interface FollowUp {
  id: string
  date: string
  note: string
  completed: boolean
}

interface Resume {
  id: string
  name: string
  template: string
  updatedAt: string
  atsScore?: number
}

export default function PocketWorkbenchPage() {
  const params = useParams()
  const pocketId = params.pocketId as string

  // Data state
  const [pocket, setPocket] = useState<PocketData | null>(null)
  const [job, setJob] = useState<JobData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Workbench state
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('intel')
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('not_applied')
  const [notes, setNotes] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [preparedAnswers, setPreparedAnswers] = useState<Record<string, string>>({})
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLetterTemplate, setCoverLetterTemplate] = useState<'professional' | 'casual' | 'direct'>('professional')
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)

  // Mock resumes (would come from API)
  const [availableResumes] = useState<Resume[]>([
    { id: 'master-1', name: 'Master Resume', template: 'Professional', updatedAt: '2025-01-10', atsScore: 85 },
    { id: 'customer-service', name: 'Customer Service Focus', template: 'Modern', updatedAt: '2025-01-08', atsScore: 78 }
  ])
  const [forkedResumeId, setForkedResumeId] = useState<string | undefined>()

  // Fetch pocket details
  useEffect(() => {
    async function fetchPocket() {
      setIsLoading(true)
      setError(null)

      try {
        // Check for test pocket in sessionStorage
        if (pocketId.startsWith('test-pocket-')) {
          const testData = sessionStorage.getItem(`test-pocket-${pocketId}`)
          if (testData) {
            const parsed = JSON.parse(testData)
            setPocket(parsed.pocket)
            setJob(parsed.job)
            setIsLoading(false)
            return
          }
        }

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

        // Initialize status from pocket data if available
        if (data.pocket.appliedAfterViewing) {
          setApplicationStatus('applied')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPocket()
  }, [pocketId])

  // Handle apply
  const handleApply = useCallback(() => {
    if (!job?.applyUrl) return

    // Update status
    setApplicationStatus('applied')

    // Update pocket in database
    fetch(`/api/job-pockets/${pocketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appliedAfterViewing: true })
    }).catch(console.error)

    // Open application URL
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer')
  }, [job, pocketId])

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    setPreparedAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  // Handle fork resume
  const handleForkResume = useCallback((resumeId: string) => {
    // In reality, this would call an API to create a forked copy
    setForkedResumeId(`forked-${resumeId}-${Date.now()}`)
  }, [])

  // Handle generate cover letter
  const handleGenerateCoverLetter = useCallback(async () => {
    if (!job) return
    setIsGeneratingCoverLetter(true)

    // Simulate AI generation (would be API call)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const generated = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background and skills, I am confident I would be a valuable addition to your team.

${job.location !== 'Remote' ? `I am excited about the opportunity to work in ${job.location} and contribute to your organization's success.` : "I am excited about the opportunity to contribute to your organization's success in a remote capacity."}

I look forward to the opportunity to discuss how my qualifications align with your needs.

Best regards,
[Your Name]`

    setCoverLetter(generated)
    setIsGeneratingCoverLetter(false)
  }, [job])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffc425] mx-auto mb-4" />
          <p className="text-slate-500">Loading workbench...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {error === 'Pocket not found' ? 'Pocket Not Found' : 'Error Loading Workbench'}
          </h1>
          <p className="text-slate-500 mb-6">
            {error === 'Pocket not found'
              ? 'This pocket may have been deleted or expired.'
              : 'We had trouble loading this pocket. Please try again.'}
          </p>
          <Link
            href="/dashboard/pockets"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-slate-900 font-semibold hover:bg-[#ffcd4a] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Pockets
          </Link>
        </motion.div>
      </div>
    )
  }

  // No data
  if (!pocket || !job) {
    return null
  }

  // Extract data from pocket
  const pocketData = pocket.data

  // Build interview prep props
  const likelyQuestions = pocketData.likelyQuestions || []
  const talkingPoints = pocketData.talkingPoints || []

  return (
    <WorkbenchLayout
      jobTitle={job.title}
      companyName={job.company}
      applicationUrl={job.applyUrl}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onApply={handleApply}
    >
      {activeTab === 'intel' && (
        <JobIntelTab
          data={pocketData}
          jobDescription={job.description}
        />
      )}

      {activeTab === 'tracker' && (
        <TrackerTab
          status={applicationStatus}
          onStatusChange={setApplicationStatus}
          appliedAt={pocket.appliedAfterViewing ? pocket.viewedAt : undefined}
          notes={notes}
          onNotesChange={setNotes}
          contacts={contacts}
          onContactsChange={setContacts}
          followUps={followUps}
          onFollowUpsChange={setFollowUps}
          linkedResume={forkedResumeId ? { id: forkedResumeId, name: `Resume for ${job.title}` } : undefined}
          linkedCoverLetter={coverLetter ? { id: 'cover-1', name: `Cover Letter for ${job.company}` } : undefined}
        />
      )}

      {activeTab === 'resume' && (
        <ResumeTab
          availableResumes={availableResumes}
          onForkResume={handleForkResume}
          forkedResumeId={forkedResumeId}
          jobTitle={job.title}
          companyName={job.company}
        />
      )}

      {activeTab === 'cover-letter' && (
        <CoverLetterTab
          jobTitle={job.title}
          companyName={job.company}
          coverLetter={coverLetter}
          onCoverLetterChange={setCoverLetter}
          template={coverLetterTemplate}
          onTemplateChange={setCoverLetterTemplate}
          isGenerating={isGeneratingCoverLetter}
          onGenerate={handleGenerateCoverLetter}
        />
      )}

      {activeTab === 'prep' && (
        <InterviewPrepTab
          likelyQuestions={likelyQuestions}
          talkingPoints={talkingPoints}
          preparedAnswers={preparedAnswers}
          onAnswerChange={handleAnswerChange}
        />
      )}
    </WorkbenchLayout>
  )
}
