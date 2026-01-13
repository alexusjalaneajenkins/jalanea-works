'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Sparkles, Rocket, CheckCircle2, Loader2 } from 'lucide-react'

export default function CompletePage() {
  const router = useRouter()
  const { data } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-submit on mount (this page is reached after completing all steps)
  useEffect(() => {
    async function submitOnboarding() {
      setIsSubmitting(true)
      setError(null)

      try {
        // In Task 2.3, we're only building UI - data submission comes in Task 3.2
        // For now, simulate a brief delay and mark as complete
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Log the collected data (for development verification)
        console.log('Onboarding data collected:', data)

        setIsComplete(true)
      } catch (err) {
        console.error('Onboarding submission error:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }

    submitOnboarding()
  }, [data])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleRetry = () => {
    setError(null)
    setIsSubmitting(true)
    // Retry the submission
    setTimeout(() => {
      setIsComplete(true)
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="text-center py-8 space-y-8">
      {/* Loading State */}
      {isSubmitting && (
        <div className="space-y-4 animate-pulse">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Setting Up Your Profile...</h1>
          <p className="text-slate-600">This will only take a moment.</p>
        </div>
      )}

      {/* Error State */}
      {error && !isSubmitting && (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Oops!</h1>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {isComplete && !error && !isSubmitting && (
        <div className="space-y-6">
          {/* Celebration Icon */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">You&apos;re All Set!</h1>
            <p className="text-lg text-slate-600">
              Welcome to Jalanea Works. Let&apos;s find you a job.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 text-left max-w-sm mx-auto">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Profile Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="text-slate-900 font-medium">{data.address || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max commute</span>
                <span className="text-slate-900 font-medium">{data.maxCommute} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Salary target</span>
                <span className="text-slate-900 font-medium">
                  ${(data.salaryMin / 1000).toFixed(0)}K - ${(data.salaryMax / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoToDashboard}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all flex items-center gap-2 mx-auto"
          >
            <Rocket className="w-5 h-5" />
            Go to Dashboard
          </button>

          {/* Motivational Note */}
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            We&apos;re already searching for jobs that match your profile. Check your dashboard for your first daily plan!
          </p>
        </div>
      )}
    </div>
  )
}
