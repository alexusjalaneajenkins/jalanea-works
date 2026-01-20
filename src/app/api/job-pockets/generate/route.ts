/**
 * Job Pockets API
 *
 * GET /api/job-pockets/generate?job_id=xxx
 *   Retrieve a cached pocket if available
 *
 * POST /api/job-pockets/generate
 *   Generate a Job Pocket (AI-powered job intelligence report)
 *   Request body:
 *     - jobId: string - The job ID to generate pocket for
 *     - tier: 'essential' | 'starter' | 'premium' | 'unlimited' - User's subscription tier
 *     - forceRegenerate: boolean - Skip cache and regenerate
 *     - pocketData: object (optional) - Pre-generated pocket data (skips AI generation)
 *
 * Tier mapping:
 *   - Essential ($15): Tier 1 pocket (20-second intel) - Unlimited
 *   - Starter ($25): Tier 2 pocket (90-second breakdown) - Unlimited
 *   - Premium ($75): Tier 3 pocket (8-page report) - 5/month
 *   - Unlimited ($150): Tier 3+ pocket (12-page Deep Research) - 10/month
 *
 * Caching:
 *   - Pockets are cached for 7 days
 *   - Cache key: user_id + job_id + tier
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateTier1Pocket,
  generateTier2Pocket,
  generateTier3Pocket
} from '@/lib/pocket-generator'
import { estimateTokens } from '@/lib/gemini-client'

// Cache TTL: 7 days in milliseconds
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Tier levels for comparison
const TIER_LEVELS: Record<string, number> = {
  essential: 1,
  starter: 2,
  premium: 3,
  unlimited: 4
}

// Monthly pocket limits per tier (for Tier 3 pockets)
const TIER_LIMITS: Record<string, number> = {
  essential: 999999,   // Unlimited Tier 1 pockets
  starter: 999999,     // Unlimited Tier 2 pockets
  premium: 5,          // 5 Tier 3 pockets per month
  unlimited: 10        // 10 Tier 3+ pockets per month
}

/**
 * GET - Retrieve cached pocket
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const jobId = searchParams.get('job_id')

  if (!jobId) {
    return NextResponse.json(
      { error: 'job_id is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for cached pocket (any tier)
    const { data: cachedPockets } = await supabase
      .from('job_pockets')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (cachedPockets && cachedPockets.length > 0) {
      // Get the most recent pocket
      const pocket = cachedPockets[0]
      const createdAt = new Date(pocket.created_at).getTime()
      const isExpired = Date.now() - createdAt > CACHE_TTL_MS

      if (!isExpired) {
        return NextResponse.json({
          pocket: pocket.pocket_data,
          tier: pocket.tier,
          cached: true,
          createdAt: pocket.created_at,
          expiresAt: new Date(createdAt + CACHE_TTL_MS).toISOString(),
          modelUsed: pocket.model_used,
          isFavorite: pocket.is_favorite
        })
      }
    }

    return NextResponse.json({
      pocket: null,
      cached: false,
      message: 'No cached pocket found. Use POST to generate.'
    })
  } catch (error) {
    console.error('Error fetching cached pocket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pocket' },
      { status: 500 }
    )
  }
}

/**
 * POST - Generate new pocket (with caching and usage tracking)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { jobId, tier, forceRegenerate, pocketData: providedPocketData } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // TEST MODE: Return mock pocket for test scenarios
    if (jobId.startsWith('test-')) {
      const mockPocket = getTestPocket(jobId)
      return NextResponse.json({
        pocket: mockPocket.pocket,
        pocketId: `test-pocket-${Date.now()}`,
        tier: 'essential',
        cached: false,
        modelUsed: 'mock',
        generationTime: 500,
        tokensUsed: 0,
        isTestMode: true
      })
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to verify tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, first_name, last_name')
      .eq('id', user.id)
      .single()

    // Also check users table if profiles doesn't have subscription_tier
    let userTier = profile?.subscription_tier
    if (!userTier) {
      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()
      userTier = userData?.tier || 'essential'
    }

    const requestedTier = tier || userTier

    // Ensure user can only access their tier or lower
    if ((TIER_LEVELS[requestedTier] || 1) > (TIER_LEVELS[userTier] || 1)) {
      return NextResponse.json(
        {
          error: 'Upgrade required to access this tier',
          currentTier: userTier,
          requestedTier: requestedTier
        },
        { status: 403 }
      )
    }

    // Check rate limit for Premium/Unlimited tiers (Tier 3 pockets)
    if (requestedTier === 'premium' || requestedTier === 'unlimited') {
      const canGenerate = await checkUsageLimit(supabase, user.id, requestedTier)
      if (!canGenerate.allowed) {
        return NextResponse.json(
          {
            error: 'Monthly pocket limit reached',
            limit: canGenerate.limit,
            used: canGenerate.used,
            resetsAt: canGenerate.resetsAt
          },
          { status: 429 }
        )
      }
    }

    // Check for valid cached pocket (unless force regenerate)
    if (!forceRegenerate) {
      const { data: cachedPocket } = await supabase
        .from('job_pockets')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .eq('tier', requestedTier)
        .single()

      if (cachedPocket) {
        const createdAt = new Date(cachedPocket.created_at).getTime()
        const isExpired = Date.now() - createdAt > CACHE_TTL_MS

        if (!isExpired) {
          console.log(`Returning cached pocket for job ${jobId}`)
          return NextResponse.json({
            pocket: cachedPocket.pocket_data,
            tier: requestedTier,
            cached: true,
            createdAt: cachedPocket.created_at,
            expiresAt: new Date(createdAt + CACHE_TTL_MS).toISOString(),
            modelUsed: cachedPocket.model_used,
            isFavorite: cachedPocket.is_favorite
          })
        }
      }
    }

    // Only fetch job from database if we need to generate real pocket data
    // When providedPocketData is set, we skip this lookup entirely
    let job = null
    let jobData = null
    let userProfile = {
      name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Candidate',
      resume: null as any
    }

    if (!providedPocketData) {
      // Fetch job details directly from database
      const { data: jobResult, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError || !jobResult) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
      job = jobResult

      // Get user's resume/profile data for personalization
      const { data: resumeData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      userProfile.resume = resumeData

      // Transform job data for pocket generation
      jobData = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location_address || `${job.location_city || ''}, ${job.location_state || 'FL'}`.trim(),
        description: job.description,
        fullDescription: job.description,
        requirements: job.requirements ? (typeof job.requirements === 'string' ? job.requirements.split('\n') : job.requirements) : [],
        benefits: job.benefits ? (typeof job.benefits === 'string' ? job.benefits.split('\n') : job.benefits) : [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryType: job.salary_period === 'hourly' ? 'hourly' as const : 'yearly' as const,
        valenciaMatch: job.valencia_friendly,
        valenciaMatchPercentage: job.valencia_match_score,
        scamRiskLevel: job.scam_severity?.toLowerCase() as 'low' | 'medium' | 'high' | 'critical' | undefined,
        scamReasons: job.scam_flags || []
      }
    }

    // Generate pocket based on tier (or use provided mock data)
    let pocket
    let modelUsed: string

    if (providedPocketData) {
      // Use provided pocket data (mock data for UI development)
      console.log(`Using provided pocket data for job ${jobId}`)
      pocket = providedPocketData
      modelUsed = 'mock'
    } else {
      // jobData is guaranteed to be set when providedPocketData is false
      if (!jobData) {
        return NextResponse.json(
          { error: 'Failed to prepare job data for pocket generation' },
          { status: 500 }
        )
      }

      console.log(`Generating ${requestedTier} pocket for job ${jobId}...`)

      switch (requestedTier) {
        case 'unlimited':
          // Unlimited users get the extended 12-page Deep Research report
          pocket = await generateTier3Pocket(jobData, userProfile)
          modelUsed = 'gemini-2.0-pro'
          break
        case 'premium':
          // Premium users get the 8-page comprehensive report
          pocket = await generateTier3Pocket(jobData, userProfile)
          modelUsed = 'gemini-2.0-pro'
          break
        case 'starter':
          pocket = await generateTier2Pocket(jobData, userProfile)
          modelUsed = 'gemini-2.0-flash'
          break
        case 'essential':
        default:
          pocket = await generateTier1Pocket(jobData, userProfile)
          modelUsed = 'gemini-2.0-flash'
          break
      }
    }

    const generationTime = Date.now() - startTime
    const tokensUsed = providedPocketData ? 0 : estimateTokens(JSON.stringify(pocket))

    // Save pocket to database and get the ID back
    console.log('Saving pocket for job:', jobId, 'user:', user.id, 'tier:', requestedTier)
    const { data: savedPocket, error: saveError } = await supabase
      .from('job_pockets')
      .upsert({
        user_id: user.id,
        job_id: jobId,
        tier: requestedTier,
        pocket_data: pocket,
        model_used: modelUsed,
        generation_time_ms: generationTime,
        tokens_used: tokensUsed,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString()
      }, {
        onConflict: 'user_id,job_id,tier'
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('Error saving pocket:', saveError)
      // Return error with details for debugging
      return NextResponse.json(
        { error: 'Failed to save pocket', details: saveError.message, code: saveError.code },
        { status: 500 }
      )
    }

    // Fallback: If upsert didn't return ID, query for it
    let pocketId = savedPocket?.id
    if (!pocketId) {
      console.log('Upsert did not return ID, querying for pocket...')
      const { data: existingPocket } = await supabase
        .from('job_pockets')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .eq('tier', requestedTier)
        .single()
      pocketId = existingPocket?.id
    }

    console.log('Pocket saved successfully:', pocketId)

    // Increment usage for Premium/Unlimited tiers (skip for mock data)
    if (!providedPocketData && (requestedTier === 'premium' || requestedTier === 'unlimited')) {
      await incrementUsage(supabase, user.id, requestedTier, tokensUsed)
    }

    // Track analytics event
    await supabase.from('events').insert({
      user_id: user.id,
      event_name: providedPocketData ? 'pocket_saved' : 'pocket_generated',
      event_data: {
        job_id: jobId,
        tier: requestedTier,
        model: modelUsed,
        generation_time_ms: generationTime,
        tokens_used: tokensUsed,
        pocket_id: pocketId
      }
    }).then(() => {}) // Fire and forget

    console.log(`Pocket ${providedPocketData ? 'saved' : 'generated'} in ${generationTime}ms using ${modelUsed}`)

    return NextResponse.json({
      pocket,
      pocketId,
      tier: requestedTier,
      cached: false,
      modelUsed,
      generationTime,
      tokensUsed
    })
  } catch (error) {
    console.error('Error generating pocket:', error)
    return NextResponse.json(
      { error: 'Failed to generate pocket' },
      { status: 500 }
    )
  }
}

/**
 * Check if user has remaining usage for their tier
 */
async function checkUsageLimit(
  supabase: any,
  userId: string,
  tier: string
): Promise<{ allowed: boolean; limit: number; used: number; resetsAt: string }> {
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0) // Last day of current month

  // Get current usage
  const { data: usage } = await supabase
    .from('pocket_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('tier', tier)
    .gte('period_start', periodStart.toISOString().split('T')[0])
    .single()

  const limit = TIER_LIMITS[tier] || 999999
  const used = usage?.pockets_generated || 0

  return {
    allowed: used < limit,
    limit,
    used,
    resetsAt: periodEnd.toISOString()
  }
}

/**
 * Increment usage count for user
 */
async function incrementUsage(
  supabase: any,
  userId: string,
  tier: string,
  tokensUsed: number
): Promise<void> {
  const periodStart = new Date()
  periodStart.setDate(1)
  periodStart.setHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0)

  const limit = TIER_LIMITS[tier] || 999999

  // Upsert usage record
  await supabase
    .from('pocket_usage')
    .upsert({
      user_id: userId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      tier,
      pockets_generated: 1,
      pockets_limit: limit,
      tokens_used: tokensUsed
    }, {
      onConflict: 'user_id,period_start,tier',
      ignoreDuplicates: false
    })
    .then(async ({ error }: { error: any }) => {
      if (error) {
        // If upsert failed, try incrementing existing record
        await supabase
          .from('pocket_usage')
          .update({
            pockets_generated: supabase.sql`pockets_generated + 1`,
            tokens_used: supabase.sql`tokens_used + ${tokensUsed}`,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('period_start', periodStart.toISOString().split('T')[0])
          .eq('tier', tier)
      }
    })
}

/**
 * Generate mock pocket data for test scenarios
 */
function getTestPocket(jobId: string) {
  const testPockets: Record<string, any> = {
    'test-skip': {
      pocket: {
        jobTitle: 'Data Entry Clerk',
        company: 'Mystery Corp',
        location: 'Orlando, FL',
        matchScore: 15,
        matchLabel: 'Low Match',
        salary: { min: 35000, max: 45000, period: 'yearly' },
        schedule: 'Full-Time',
        workType: 'On-Site',
        requirements: [
          { text: 'Data entry experience', met: false },
          { text: 'Proficient in Excel', met: false },
          { text: 'Typing speed 60+ WPM', met: false },
          { text: 'Attention to detail', met: true }
        ],
        mission: 'Process and maintain accurate data records for our growing organization.',
        realityCheck: {
          official: 'Fast-paced environment with growth opportunities',
          reality: 'High-volume data entry with strict quotas. May involve repetitive tasks.',
          intensity: 'High'
        },
        scamRisk: 'medium',
        scamFlags: ['Vague description', 'No company website', 'Unusually high salary'],
        quickTips: [
          'This job has multiple red flags - proceed with caution',
          'Research the company thoroughly before applying',
          'Never pay for training or equipment upfront'
        ]
      }
    },
    'test-consider': {
      pocket: {
        jobTitle: 'Customer Service Rep',
        company: 'Orlando Health',
        location: 'Orlando, FL',
        matchScore: 58,
        matchLabel: 'Moderate Match',
        salary: { min: 32000, max: 40000, period: 'yearly' },
        schedule: 'Day Shift: 8am-4:30pm',
        workType: 'On-Site',
        requirements: [
          { text: 'Customer service experience', met: true },
          { text: 'Strong communication skills', met: true },
          { text: 'Medical terminology knowledge', met: false },
          { text: 'EMR/EHR system experience', met: false },
          { text: 'Problem-solving abilities', met: true }
        ],
        mission: 'To ensure every customer at Orlando Health feels heard and receives excellent service from the moment they walk in.',
        realityCheck: {
          official: 'Join our award-winning customer service team!',
          reality: 'You are the emotional firewall. De-escalate frustrated patients before they see the doctor. High emotional labor.',
          intensity: 'Moderate'
        },
        scamRisk: 'low',
        scamFlags: [],
        quickTips: [
          'Healthcare customer service can be emotionally demanding',
          'Highlight any experience with difficult customers',
          'Mention any medical office or healthcare exposure'
        ]
      }
    },
    'test-apply': {
      pocket: {
        jobTitle: 'Administrative Assistant',
        company: 'Valencia College',
        location: 'Orlando, FL',
        matchScore: 82,
        matchLabel: 'Strong Match',
        salary: { min: 38000, max: 45000, period: 'yearly' },
        schedule: 'Day Shift: 8am-5pm',
        workType: 'On-Site',
        requirements: [
          { text: 'Microsoft Office proficiency', met: true },
          { text: 'Calendar management', met: true },
          { text: 'Strong communication skills', met: true },
          { text: 'Organizational skills', met: true },
          { text: 'Data entry experience', met: true },
          { text: 'Banner System knowledge', met: false }
        ],
        mission: 'Support our academic department in delivering exceptional educational experiences to students.',
        realityCheck: {
          official: 'Support our growing academic team',
          reality: 'Steady work environment with predictable schedule. State benefits and tuition assistance available.',
          intensity: 'Low'
        },
        scamRisk: 'low',
        scamFlags: [],
        quickTips: [
          'Valencia College is a verified employer with good reviews',
          'Mention any experience in educational settings',
          'Banner System is learnable - highlight similar database experience'
        ]
      }
    }
  }

  return testPockets[jobId] || testPockets['test-skip']
}
