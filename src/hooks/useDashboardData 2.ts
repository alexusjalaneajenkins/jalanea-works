'use client'

/**
 * useDashboardData - Hook to fetch dashboard statistics and user data
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tier } from '@/components/dashboard/TierBadge'
import type { DailyPlanJob } from '@/components/dashboard/DailyPlanWidget'

interface DashboardStats {
  applications: number
  interviews: number
  offers: number
  daysActive: number
}

interface UserProfile {
  id: string
  full_name: string
  tier: Tier
  subscription_status: string
  created_at: string
}

interface DashboardData {
  profile: UserProfile | null
  stats: DashboardStats
  dailyPlanJobs: DailyPlanJob[]
  completedJobsCount: number
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useDashboardData(userId: string | undefined): DashboardData {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    interviews: 0,
    offers: 0,
    daysActive: 0
  })
  const [dailyPlanJobs, setDailyPlanJobs] = useState<DailyPlanJob[]>([])
  const [completedJobsCount, setCompletedJobsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id, full_name, tier, subscription_status, created_at')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is ok for new users
        console.error('Profile fetch error:', profileError)
      }

      if (profileData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          tier: (profileData.tier as Tier) || 'essential',
          subscription_status: profileData.subscription_status || 'trial',
          created_at: profileData.created_at
        })

        // Calculate days active
        const createdAt = new Date(profileData.created_at)
        const now = new Date()
        const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        // Fetch application stats
        const { data: applicationData, error: appError } = await supabase
          .from('applications')
          .select('status')
          .eq('user_id', userId)

        if (appError) {
          console.error('Applications fetch error:', appError)
        }

        const applications = applicationData || []
        const interviews = applications.filter(a => a.status === 'interviewing').length
        const offers = applications.filter(a =>
          a.status === 'offer_received' || a.status === 'offer_accepted'
        ).length

        setStats({
          applications: applications.length,
          interviews,
          offers,
          daysActive: Math.max(1, daysActive)
        })
      } else {
        // New user - use defaults
        setProfile(null)
        setStats({
          applications: 0,
          interviews: 0,
          offers: 0,
          daysActive: 1
        })
      }

      // Fetch daily plan from API
      try {
        const dailyPlanResponse = await fetch('/api/daily-plan')
        if (dailyPlanResponse.ok) {
          const dailyPlanData = await dailyPlanResponse.json()

          if (dailyPlanData.success && dailyPlanData.plan) {
            const plan = dailyPlanData.plan
            const jobs: DailyPlanJob[] = (plan.jobs || []).map((job: Record<string, unknown>) => ({
              id: job.id as string,
              jobId: job.job_id as string || job.jobId as string,
              title: (job.job_title as string) || (job.title as string) || 'Unknown Position',
              company: (job.company as string) || 'Unknown Company',
              location: (job.location as string) || 'Orlando, FL',
              salaryMin: job.salary_min as number | undefined,
              salaryMax: job.salary_max as number | undefined,
              salaryType: (job.salary_type as 'hourly' | 'yearly') || 'yearly',
              matchScore: job.match_score as number || job.matchScore as number,
              matchReasons: (job.match_reasons as string[]) || (job.matchReasons as string[]),
              priority: job.priority as 'high' | 'medium' | 'low' | undefined,
              transitMinutes: job.transit_minutes as number || job.transitMinutes as number,
              lynxRoutes: (job.lynx_routes as string[]) || (job.lynxRoutes as string[]),
              applicationUrl: (job.application_url as string) || (job.applicationUrl as string),
              estimatedApplicationTime: job.estimated_application_time as number || job.estimatedApplicationTime as number,
              tipsForApplying: (job.tips_for_applying as string[]) || (job.tipsForApplying as string[]),
              postedDaysAgo: job.posted_days_ago as number || job.postedDaysAgo as number,
              valenciaMatch: (job.valencia_match as boolean) || (job.valenciaMatch as boolean),
              status: (job.status as DailyPlanJob['status']) || 'pending',
              position: job.position as number | undefined
            }))

            setDailyPlanJobs(jobs)
            setCompletedJobsCount(jobs.filter(j => j.status === 'applied').length)
          } else {
            setDailyPlanJobs([])
            setCompletedJobsCount(0)
          }
        } else {
          console.warn('Daily plan API returned non-OK status:', dailyPlanResponse.status)
          setDailyPlanJobs([])
          setCompletedJobsCount(0)
        }
      } catch (dailyPlanError) {
        console.warn('Failed to fetch daily plan:', dailyPlanError)
        setDailyPlanJobs([])
        setCompletedJobsCount(0)
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    profile,
    stats,
    dailyPlanJobs,
    completedJobsCount,
    isLoading,
    error,
    refresh: fetchData
  }
}

// Hook for managing next steps / onboarding checklist
export function useNextSteps(userId: string | undefined) {
  const [steps, setSteps] = useState([
    { id: 'onboarding', label: 'Complete onboarding', completed: false },
    { id: 'resume', label: 'Build your resume', completed: false },
    { id: 'first-apply', label: 'Apply to your first job', completed: false }
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const checkSteps = async () => {
      const supabase = createClient()

      try {
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed_at')
          .eq('id', userId)
          .single()

        // Check if resume exists
        const { data: resumes } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        // Check if any applications exist
        const { data: applications } = await supabase
          .from('applications')
          .select('id')
          .eq('user_id', userId)
          .limit(1)

        setSteps([
          {
            id: 'onboarding',
            label: 'Complete onboarding',
            completed: !!profile?.onboarding_completed_at
          },
          {
            id: 'resume',
            label: 'Build your resume',
            completed: (resumes?.length ?? 0) > 0
          },
          {
            id: 'first-apply',
            label: 'Apply to your first job',
            completed: (applications?.length ?? 0) > 0
          }
        ])
      } catch (err) {
        console.error('Next steps check error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkSteps()
  }, [userId])

  return { steps, isLoading }
}

export default useDashboardData
