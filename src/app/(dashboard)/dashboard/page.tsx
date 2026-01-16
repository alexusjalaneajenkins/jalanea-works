'use client'

/**
 * Dashboard Home Page
 * Shows user stats, tier badge, daily plan, and next steps
 */

import { useAuth } from '@/components/providers/auth-provider'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react'
import Link from 'next/link'

import { StatsCards, getDefaultStats } from '@/components/dashboard/StatsCards'
import { TierBadge, type Tier } from '@/components/dashboard/TierBadge'
import { DailyPlanWidget, type DailyPlan, type DailyPlanJob } from '@/components/dashboard/DailyPlanWidget'
import { useDashboardData, useNextSteps } from '@/hooks/useDashboardData'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const userId = user?.id

  // Fetch dashboard data
  const {
    profile,
    stats,
    dailyPlanJobs,
    completedJobsCount,
    isLoading,
    refresh
  } = useDashboardData(userId)

  // Fetch next steps
  const { steps: nextSteps, isLoading: stepsLoading } = useNextSteps(userId)

  // Get user display info
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]
  const tier: Tier = profile?.tier || 'essential'

  // Determine how many jobs in daily plan based on tier
  // Essential: 8, Starter: 24, Premium: 50, Unlimited: unlimited (100 for display)
  const dailyPlanTotal = tier === 'essential' ? 8 : tier === 'starter' ? 24 : tier === 'premium' ? 50 : 100

  // Construct daily plan object for the widget
  const dailyPlan: DailyPlan | null = dailyPlanJobs.length > 0 ? {
    id: `daily-plan-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    totalJobs: dailyPlanJobs.length,
    totalEstimatedTime: dailyPlanJobs.length * 5, // Estimate 5 min per application
    focusArea: `${dailyPlanJobs.length} jobs curated for today`,
    motivationalMessage: completedJobsCount > 0
      ? `Great progress! You've applied to ${completedJobsCount} jobs today.`
      : "Let's find your next opportunity!",
    jobs: dailyPlanJobs
  } : null

  // Get stats for cards
  const statCards = getDefaultStats(stats)

  // Step navigation
  const getStepHref = (stepId: string) => {
    switch (stepId) {
      case 'onboarding':
        return '/foundation'
      case 'resume':
        return '/dashboard/resume'
      case 'first-apply':
        return '/dashboard/jobs'
      default:
        return '/dashboard'
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-400 mt-1">
            Let&apos;s find you a job today.
          </p>
        </div>

        {/* Tier Badge */}
        <TierBadge tier={tier} size="md" />
      </motion.div>

      {/* Quick Stats */}
      <StatsCards stats={statCards} isLoading={isLoading} />

      {/* Daily Plan Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DailyPlanWidget
          plan={dailyPlan}
          isLoading={isLoading}
          onRefresh={refresh}
          onJobClick={(job) => {
            // TODO: Navigate to job details
            console.log('Job clicked:', job.id)
          }}
          onStatusChange={async (jobId, status) => {
            // TODO: Implement status change
            console.log('Status change:', jobId, status)
          }}
        />
      </motion.div>

      {/* Next Steps Card */}
      {!stepsLoading && nextSteps.some(s => !s.completed) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Get Started</h2>
            <span className="text-sm text-slate-400">
              {nextSteps.filter(s => s.completed).length}/{nextSteps.length} complete
            </span>
          </div>

          <div className="space-y-3">
            {nextSteps.map((step) => (
              <Link
                key={step.id}
                href={getStepHref(step.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border transition-colors
                  ${step.completed
                    ? 'bg-green-500/5 border-green-500/20 cursor-default'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                  }
                `}
              >
                {step.completed ? (
                  <CheckCircle2 size={24} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Circle size={24} className="text-slate-600 flex-shrink-0" />
                )}
                <span className={`flex-1 font-medium ${step.completed ? 'text-green-400' : 'text-white'}`}>
                  {step.label}
                </span>
                {!step.completed && (
                  <ArrowRight size={20} className="text-slate-500" />
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Steps Complete - Celebration */}
      {!stepsLoading && nextSteps.every(s => s.completed) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            You&apos;re all set up! 🎉
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Your profile is complete. Now focus on your daily job applications.
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            Browse Jobs
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      )}
    </div>
  )
}
