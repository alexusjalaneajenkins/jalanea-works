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

      // Fetch daily plan (if daily_plans table exists)
      // For now, we'll return empty array since daily_plans might not be populated yet
      // TODO: Implement daily plan fetching when the job scraping system is ready
      setDailyPlanJobs([])
      setCompletedJobsCount(0)

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
