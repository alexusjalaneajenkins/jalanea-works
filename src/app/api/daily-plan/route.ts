/**
 * Daily Plan API
 *
 * GET /api/daily-plan
 *   Get today's plan for the authenticated user
 *   Query params:
 *     - regenerate: boolean (force regeneration)
 *
 * POST /api/daily-plan
 *   Generate a new daily plan with custom options
 *   Request body:
 *     - targetJobCount: number (optional)
 *     - forceRegenerate: boolean (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateDailyPlan,
  type DailyPlan,
  type UserProfile,
  type JobForRanking
} from '@/lib/daily-plan-generator'

// Tier-based job counts
const TIER_JOB_COUNTS: Record<string, number> = {
  essential: 8,
  starter: 24,
  premium: 50,
  unlimited: 100
}

/**
 * Transform database user to UserProfile format
 */
function transformUserToProfile(user: Record<string, unknown>): UserProfile {
  const salaryTarget = (user.salary_target as Record<string, unknown>) || {}
  const credentials = (user.credentials as Record<string, unknown>[]) || []

  // Find Valencia credential
  const valenciaCredential = credentials.find(
    (c) => c.valencia_credential === true
  )

  return {
    id: user.id as string,
    name: (user.full_name as string) || 'Job Seeker',
    location: {
      lat: (user.location_lat as number) || 28.5383, // Default: Orlando
      lng: (user.location_lng as number) || -81.3792
    },
    maxCommute: (user.max_commute_minutes as number) || 45,
    preferredJobTypes: ['Full-time', 'Part-time'],
    skills: (user.skills as string[]) || [
      'customer service',
      'microsoft office',
      'communication',
      'data entry',
      'teamwork',
      'problem-solving'
    ],
    education: valenciaCredential
      ? `${valenciaCredential.credential_type} in ${valenciaCredential.program}`
      : 'Associate Degree',
    experience: 'Entry-level',
    salaryMin: (salaryTarget.min as number) || 30000,
    salaryMax: (salaryTarget.max as number) || 55000,
    valenciaProgram: valenciaCredential
      ? (valenciaCredential.program as string)
      : undefined
  }
}

/**
 * Transform database job to JobForRanking format
 */
function transformJobForRanking(job: Record<string, unknown>): JobForRanking {
  return {
    id: job.id as string,
    title: job.title as string,
    company: job.company as string,
    location: job.location as string,
    locationCoords: job.location_lat
      ? {
          lat: job.location_lat as number,
          lng: job.location_lng as number
        }
      : undefined,
    salaryMin: job.salary_min as number | undefined,
    salaryMax: job.salary_max as number | undefined,
    salaryType: (job.salary_type as 'hourly' | 'yearly') || 'yearly',
    jobType: job.job_type as string | undefined,
    description: job.description as string | undefined,
    requirements: (job.requirements as string[]) || [],
    postedAt: (job.posted_at as string) || new Date().toISOString(),
    applicationUrl:
      (job.application_url as string) ||
      (job.url as string) ||
      'https://example.com/apply',
    transitMinutes: job.transit_minutes as number | undefined,
    lynxRoutes: (job.lynx_routes as string[]) || [],
    valenciaMatch: (job.valencia_match as boolean) || false,
    valenciaMatchPercentage: job.valencia_match_percentage as number | undefined
  }
}

/**
 * Save generated plan to database
 */
async function savePlanToDatabase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  plan: DailyPlan,
  tier: string
): Promise<string | null> {
  try {
    // Create the daily plan record
    const { data: planRecord, error: planError } = await supabase
      .from('daily_plans')
      .upsert(
        {
          user_id: userId,
          plan_date: plan.date,
          total_jobs: plan.jobs.length,
          total_estimated_time: plan.totalEstimatedTime,
          focus_area: plan.focusArea,
          motivational_message: plan.motivationalMessage,
          stats: plan.stats,
          tier_at_generation: tier,
          generated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,plan_date' }
      )
      .select('id')
      .single()

    if (planError) {
      console.error('Error saving daily plan:', planError)
      return null
    }

    // Delete old jobs for this plan (in case of regeneration)
    await supabase
      .from('daily_plan_jobs')
      .delete()
      .eq('daily_plan_id', planRecord.id)

    // Insert the jobs
    const jobRecords = plan.jobs.map((job, index) => ({
      daily_plan_id: planRecord.id,
      job_id: job.jobId.startsWith('mock-') ? null : job.jobId,
      user_id: userId,
      job_title: job.title,
      company: job.company,
      location: job.location,
      salary_min: job.salaryRange
        ? parseInt(job.salaryRange.replace(/[^0-9]/g, ''))
        : null,
      salary_max: null,
      match_score: job.matchScore,
      match_reasons: job.matchReasons,
      priority: job.priority,
      transit_minutes: job.transitMinutes,
      lynx_routes: job.lynxRoutes || [],
      application_url: job.applicationUrl,
      estimated_application_time: job.estimatedApplicationTime,
      tips_for_applying: job.tipsForApplying || [],
      posted_days_ago: job.postedDaysAgo,
      valencia_match: job.matchReasons?.some((r) =>
        r.toLowerCase().includes('valencia')
      ),
      status: 'pending',
      position: index
    }))

    const { error: jobsError } = await supabase
      .from('daily_plan_jobs')
      .insert(jobRecords)

    if (jobsError) {
      console.error('Error saving daily plan jobs:', jobsError)
    }

    return planRecord.id
  } catch (error) {
    console.error('Error in savePlanToDatabase:', error)
    return null
  }
}

/**
 * GET - Retrieve today's daily plan
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const regenerate = searchParams.get('regenerate') === 'true'

  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile with credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(
        `
        *,
        credentials (
          institution,
          credential_type,
          program,
          status,
          valencia_credential
        )
      `
      )
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userTier = (userData.tier as string) || 'essential'
    const targetJobCount = TIER_JOB_COUNTS[userTier] || 8

    // Check for existing plan today (unless regenerate is requested)
    if (!regenerate) {
      const { data: existingPlan } = await supabase.rpc(
        'get_daily_plan_with_jobs',
        { p_user_id: user.id }
      )

      if (existingPlan) {
        return NextResponse.json({
          success: true,
          plan: existingPlan,
          cached: true
        })
      }
    }

    // Get user profile for generation
    const userProfile = transformUserToProfile(userData)

    // Get available jobs from database
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .is('deleted_at', null)
      .gte(
        'posted_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ) // Last 30 days
      .order('posted_at', { ascending: false })
      .limit(500) // Limit for performance

    let availableJobs: JobForRanking[] = []

    if (jobsError || !jobsData || jobsData.length === 0) {
      // Fall back to mock jobs if no real jobs available
      console.log('No jobs in database, using mock data')
      availableJobs = getMockJobs()
    } else {
      availableJobs = jobsData.map(transformJobForRanking)
    }

    // Generate the plan
    const plan = await generateDailyPlan(
      userProfile,
      availableJobs,
      targetJobCount
    )

    // Save to database
    const planId = await savePlanToDatabase(supabase, user.id, plan, userTier)

    // Get the saved plan with jobs (for consistent format)
    if (planId) {
      const { data: savedPlan } = await supabase.rpc(
        'get_daily_plan_with_jobs',
        { p_user_id: user.id }
      )

      if (savedPlan) {
        return NextResponse.json({
          success: true,
          plan: savedPlan,
          cached: false
        })
      }
    }

    // Return generated plan if save failed
    return NextResponse.json({
      success: true,
      plan: {
        id: planId || 'temp-' + Date.now(),
        date: plan.date,
        userId: plan.userId,
        totalJobs: plan.jobs.length,
        totalEstimatedTime: plan.totalEstimatedTime,
        focusArea: plan.focusArea,
        motivationalMessage: plan.motivationalMessage,
        stats: plan.stats,
        generatedAt: new Date().toISOString(),
        jobs: plan.jobs.map((job, index) => ({
          id: `temp-${job.jobId}`,
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          matchScore: job.matchScore,
          matchReasons: job.matchReasons,
          priority: job.priority,
          transitMinutes: job.transitMinutes,
          lynxRoutes: job.lynxRoutes,
          applicationUrl: job.applicationUrl,
          estimatedApplicationTime: job.estimatedApplicationTime,
          tipsForApplying: job.tipsForApplying,
          postedDaysAgo: job.postedDaysAgo,
          status: 'pending',
          position: index
        }))
      },
      cached: false
    })
  } catch (error) {
    console.error('Daily plan GET error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily plan' },
      { status: 500 }
    )
  }
}

/**
 * POST - Generate a new daily plan with custom options
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetJobCount } = body

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(
        `
        *,
        credentials (
          institution,
          credential_type,
          program,
          status,
          valencia_credential
        )
      `
      )
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const userTier = (userData.tier as string) || 'essential'
    const maxJobs = TIER_JOB_COUNTS[userTier] || 8
    const jobCount = Math.min(targetJobCount || maxJobs, maxJobs)

    // Get user profile
    const userProfile = transformUserToProfile(userData)

    // Get available jobs
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .is('deleted_at', null)
      .gte(
        'posted_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('posted_at', { ascending: false })
      .limit(500)

    const availableJobs =
      jobsData && jobsData.length > 0
        ? jobsData.map(transformJobForRanking)
        : getMockJobs()

    // Generate plan
    const plan = await generateDailyPlan(userProfile, availableJobs, jobCount)

    // Save to database
    const planId = await savePlanToDatabase(supabase, user.id, plan, userTier)

    // Get the saved plan
    if (planId) {
      const { data: savedPlan } = await supabase.rpc(
        'get_daily_plan_with_jobs',
        { p_user_id: user.id }
      )

      if (savedPlan) {
        return NextResponse.json({
          success: true,
          plan: savedPlan
        })
      }
    }

    return NextResponse.json({
      success: true,
      plan
    })
  } catch (error) {
    console.error('Daily plan POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily plan' },
      { status: 500 }
    )
  }
}

/**
 * Mock jobs for fallback (when database is empty)
 */
function getMockJobs(): JobForRanking[] {
  return [
    {
      id: 'mock-1',
      title: 'Customer Service Representative',
      company: 'Orlando Health',
      location: 'Orlando, FL',
      salaryMin: 32000,
      salaryMax: 40000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description:
        'Handle patient inquiries, schedule appointments, provide excellent customer service.',
      requirements: ['customer service', 'communication', 'microsoft office'],
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/1',
      transitMinutes: 25,
      lynxRoutes: ['21', '51'],
      valenciaMatch: true,
      valenciaMatchPercentage: 85
    },
    {
      id: 'mock-2',
      title: 'Administrative Assistant',
      company: 'Valencia College',
      location: 'Orlando, FL',
      salaryMin: 35000,
      salaryMax: 42000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description:
        'Support administrative operations. Manage calendars, coordinate meetings.',
      requirements: ['organization', 'microsoft office', 'communication'],
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/2',
      transitMinutes: 15,
      lynxRoutes: ['8'],
      valenciaMatch: true,
      valenciaMatchPercentage: 92
    },
    {
      id: 'mock-3',
      title: 'Help Desk Technician',
      company: 'Lockheed Martin',
      location: 'Orlando, FL',
      salaryMin: 45000,
      salaryMax: 55000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description:
        'Provide technical support, troubleshoot hardware and software issues.',
      requirements: ['technical support', 'problem-solving', 'communication'],
      postedAt: new Date().toISOString(),
      applicationUrl: 'https://example.com/apply/3',
      transitMinutes: 40,
      lynxRoutes: ['37'],
      valenciaMatch: true,
      valenciaMatchPercentage: 78
    },
    {
      id: 'mock-4',
      title: 'Medical Receptionist',
      company: 'AdventHealth',
      location: 'Winter Park, FL',
      salaryMin: 30000,
      salaryMax: 38000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description: 'Front desk receptionist for busy medical office.',
      requirements: ['customer service', 'data entry', 'healthcare'],
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/4',
      transitMinutes: 28,
      lynxRoutes: ['102', '9'],
      valenciaMatch: true,
      valenciaMatchPercentage: 88
    },
    {
      id: 'mock-5',
      title: 'Retail Sales Associate',
      company: 'Target',
      location: 'Orlando, FL',
      salaryMin: 15,
      salaryMax: 18,
      salaryType: 'hourly',
      jobType: 'Part-time',
      description:
        'Help guests find what they need, provide exceptional shopping experience.',
      requirements: ['customer service', 'teamwork', 'communication'],
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/5',
      transitMinutes: 35,
      lynxRoutes: ['42', '55'],
      valenciaMatch: false
    },
    {
      id: 'mock-6',
      title: 'Junior Web Developer',
      company: 'Tech Orlando',
      location: 'Orlando, FL',
      salaryMin: 48000,
      salaryMax: 62000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description: 'Work with React, Node.js, and modern web technologies.',
      requirements: ['javascript', 'html', 'css', 'react'],
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/6',
      transitMinutes: 22,
      lynxRoutes: ['21'],
      valenciaMatch: true,
      valenciaMatchPercentage: 95
    },
    {
      id: 'mock-7',
      title: 'Bank Teller',
      company: 'Bank of America',
      location: 'Orlando, FL',
      salaryMin: 34000,
      salaryMax: 40000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description:
        'Process customer transactions, open accounts, provide financial guidance.',
      requirements: ['customer service', 'math skills', 'attention to detail'],
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/7',
      transitMinutes: 20,
      lynxRoutes: ['21', '40'],
      valenciaMatch: true,
      valenciaMatchPercentage: 80
    },
    {
      id: 'mock-8',
      title: 'Warehouse Associate',
      company: 'Amazon',
      location: 'Orlando, FL',
      salaryMin: 17,
      salaryMax: 21,
      salaryType: 'hourly',
      jobType: 'Full-time',
      description:
        'Pick, pack, and ship customer orders. Must be able to lift 50 lbs.',
      requirements: ['physical fitness', 'teamwork', 'attention to detail'],
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/8',
      transitMinutes: 30,
      lynxRoutes: ['42'],
      valenciaMatch: false
    },
    {
      id: 'mock-9',
      title: 'Guest Services Agent',
      company: 'Walt Disney World',
      location: 'Lake Buena Vista, FL',
      salaryMin: 16,
      salaryMax: 20,
      salaryType: 'hourly',
      jobType: 'Full-time',
      description:
        'Create magical experiences for guests. Provide information and assistance.',
      requirements: [
        'customer service',
        'communication',
        'teamwork',
        'positive attitude'
      ],
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      applicationUrl: 'https://example.com/apply/9',
      transitMinutes: 50,
      lynxRoutes: ['50', '56'],
      valenciaMatch: false
    },
    {
      id: 'mock-10',
      title: 'Office Manager',
      company: 'Local Business',
      location: 'Orlando, FL',
      salaryMin: 40000,
      salaryMax: 50000,
      salaryType: 'yearly',
      jobType: 'Full-time',
      description:
        'Manage daily office operations, supervise staff, handle budgets.',
      requirements: [
        'management',
        'organization',
        'microsoft office',
        'communication'
      ],
      postedAt: new Date().toISOString(),
      applicationUrl: 'https://example.com/apply/10',
      transitMinutes: 18,
      lynxRoutes: ['21'],
      valenciaMatch: true,
      valenciaMatchPercentage: 90
    }
  ]
}
