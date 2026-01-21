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

    // TEST MODE: Return mock pocket data (client stores in sessionStorage)
    if (jobId.startsWith('test-')) {
      const mockPocket = getTestPocket(jobId)
      const testPocketId = `test-pocket-${Date.now()}`

      return NextResponse.json({
        pocket: mockPocket.pocket,
        pocketId: testPocketId,
        tier: 'essential',
        cached: false,
        modelUsed: 'test-mock',
        generationTime: 500,
        tokensUsed: 0,
        isTestMode: true,
        testJob: mockPocket.job  // Include job data for test mode
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
        qualificationCheck: {
          status: 'NOT_QUALIFIED',
          missing: ['data entry', 'excel', 'typing']
        },
        recommendation: 'SKIP',
        matchScore: 15,
        atsScore: 35,
        quickBrief: 'Mystery Corp is looking for a Data Entry Clerk. This role has multiple red flags and low skill match.',
        talkingPoints: [
          'Highlight any data entry or typing experience you have',
          'Mention your attention to detail with specific examples'
        ],
        likelyQuestions: [
          'What is your typing speed?',
          'Describe your experience with data entry software.'
        ],
        redFlags: ['Vague description', 'No company website', 'Unusually high salary'],
        requirements: [
          { text: 'Data entry experience', met: false, proofPoint: 'Describe a time you maintained accurate records or processed high volumes of information.' },
          { text: 'Proficient in Excel', met: false },
          { text: 'Typing speed 60+ WPM', met: false },
          { text: 'Attention to detail', met: true, proofPoint: 'Share an example of catching an error that others missed.' }
        ],
        mission: 'Process and maintain accurate data records for our growing organization.',
        skillGaps: [
          {
            skill: 'Excel',
            gapType: 'software',
            learnTime: '2-4 hours',
            priority: 'critical',
            resourceTitle: 'Excel Essential Training - LinkedIn Learning',
            resourceUrl: 'https://www.linkedin.com/learning/excel-essential-training-microsoft-365',
            freeAlternative: 'YouTube: "Excel Tutorial for Beginners" by Kevin Stratvert',
            whyItMatters: 'Required for data analysis and reporting tasks'
          },
          {
            skill: 'Typing Speed',
            gapType: 'experience',
            learnTime: '2-4 weeks practice',
            priority: 'critical',
            resourceTitle: 'Typing.com (Free typing practice)',
            resourceUrl: 'https://www.typing.com/',
            freeAlternative: 'Typing.com - completely free',
            whyItMatters: 'Most roles require 40+ WPM for efficient work'
          }
        ],
        atsBypassStrategies: [
          {
            strategy: 'Apply Direct',
            action: 'Find and apply on Mystery Corp\'s careers page instead of through the job board',
            impact: '2x more likely to be seen by a human',
            timeEstimate: '5-10 min'
          },
          {
            strategy: 'LinkedIn Outreach',
            action: 'Find the hiring manager or HR recruiter for Mystery Corp on LinkedIn and send a personalized connection request',
            impact: '15% response rate vs 2% through ATS alone',
            timeEstimate: '10-15 min'
          }
        ]
      }
    },
    'test-consider': {
      pocket: {
        qualificationCheck: {
          status: 'PARTIALLY_QUALIFIED',
          missing: ['medical terminology', 'EMR systems']
        },
        recommendation: 'CONSIDER',
        matchScore: 58,
        atsScore: 62,
        quickBrief: 'Orlando Health is looking for a Customer Service Rep. You have a moderate match with some skill gaps to address.',
        talkingPoints: [
          'Lead with your customer service experience and conflict resolution skills',
          'Mention any healthcare exposure, even as a patient advocate',
          'Show enthusiasm for helping people in healthcare settings'
        ],
        likelyQuestions: [
          'Tell me about a time you handled a difficult customer.',
          'How do you stay calm under pressure?',
          'What interests you about working in healthcare?'
        ],
        redFlags: [],
        requirements: [
          { text: 'Customer service experience', met: true, proofPoint: 'Describe a time you turned an unhappy customer into a satisfied one by listening to their concerns and finding a solution.' },
          { text: 'Strong communication skills', met: true, proofPoint: 'Share an example of resolving a misunderstanding through active listening and clear communication.' },
          { text: 'Medical terminology knowledge', met: false },
          { text: 'EMR/EHR system experience', met: false },
          { text: 'Problem-solving abilities', met: true, proofPoint: 'Describe a situation where you identified a problem before it became critical and implemented a solution.' }
        ],
        mission: 'To ensure every patient at Orlando Health feels heard and receives excellent service from the moment they walk in.',
        skillGaps: [
          {
            skill: 'Medical Terminology',
            gapType: 'certification',
            learnTime: '10-20 hours',
            priority: 'critical',
            resourceTitle: 'Medical Terminology Course - Coursera',
            resourceUrl: 'https://www.coursera.org/learn/medical-terminology',
            freeAlternative: 'YouTube: "Medical Terminology Made Easy" series',
            whyItMatters: 'Essential for communication in healthcare settings'
          },
          {
            skill: 'EMR Systems',
            gapType: 'software',
            learnTime: '3-5 hours',
            priority: 'helpful',
            resourceTitle: 'Electronic Medical Records Training',
            freeAlternative: 'YouTube: "EMR Basics for Healthcare Workers"',
            whyItMatters: 'Required for patient documentation and care coordination'
          }
        ],
        atsBypassStrategies: [
          {
            strategy: 'Attend Career Fair',
            action: 'Orlando Health hosts regular career fairs - check their events page for upcoming dates',
            impact: 'Face-to-face interaction with recruiters',
            timeEstimate: '2-4 hours'
          },
          {
            strategy: 'Apply Direct',
            action: 'Find and apply on Orlando Health\'s careers page instead of through the job board',
            impact: '2x more likely to be seen by a human',
            timeEstimate: '5-10 min'
          },
          {
            strategy: 'LinkedIn Outreach',
            action: 'Find the hiring manager or HR recruiter for Orlando Health on LinkedIn and send a personalized connection request',
            impact: '15% response rate vs 2% through ATS alone',
            timeEstimate: '10-15 min'
          },
          {
            strategy: 'Find a Referral',
            action: 'Search LinkedIn for 1st or 2nd degree connections at Orlando Health who could refer you',
            impact: 'Referrals get ~50% interview rate',
            timeEstimate: '15-20 min'
          }
        ]
      }
    },
    'test-apply': {
      pocket: {
        qualificationCheck: {
          status: 'QUALIFIED',
          missing: ['banner system']
        },
        recommendation: 'APPLY_NOW',
        matchScore: 82,
        atsScore: 78,
        quickBrief: 'Valencia College is looking for an Administrative Assistant. This is a strong match with verified employer and excellent benefits.',
        talkingPoints: [
          'Lead with your Microsoft Office expertise and specific examples',
          'Highlight your organizational skills and how you manage multiple priorities',
          'Mention any experience in educational settings',
          'Show enthusiasm for supporting students and academic missions'
        ],
        likelyQuestions: [
          'How do you prioritize tasks when everything seems urgent?',
          'Describe your experience with calendar management.',
          'What software systems are you comfortable with?',
          'Why do you want to work in higher education?'
        ],
        redFlags: [],
        requirements: [
          { text: 'Microsoft Office proficiency', met: true, proofPoint: 'Mention specific projects where you used Excel for data analysis or Word for professional documents.' },
          { text: 'Calendar management', met: true, proofPoint: 'Describe how you organized a chaotic calendar or coordinated complex scheduling across multiple stakeholders.' },
          { text: 'Strong communication skills', met: true, proofPoint: 'Share an example of communicating effectively with different audiences (faculty, students, administrators).' },
          { text: 'Organizational skills', met: true, proofPoint: 'Describe your system for managing multiple projects and priorities simultaneously.' },
          { text: 'Data entry experience', met: true },
          { text: 'Banner System knowledge', met: false }
        ],
        mission: 'Support our academic department in delivering exceptional educational experiences to students.',
        skillGaps: [
          {
            skill: 'Banner System',
            gapType: 'software',
            learnTime: '2-4 hours',
            priority: 'helpful',
            resourceTitle: 'Banner Student Information System Training',
            freeAlternative: 'YouTube: "Banner Basics for Administrative Staff"',
            whyItMatters: 'Required for student registration and records management'
          }
        ],
        atsBypassStrategies: [
          {
            strategy: 'Contact Career Services',
            action: 'If you\'re a Valencia student/alum, contact Career Services for internal job posting access',
            impact: 'Priority consideration for Valencia candidates',
            timeEstimate: '30 min'
          },
          {
            strategy: 'Apply Direct',
            action: 'Find and apply on Valencia College\'s careers page instead of through the job board',
            impact: '2x more likely to be seen by a human',
            timeEstimate: '5-10 min'
          },
          {
            strategy: 'LinkedIn Outreach',
            action: 'Find the hiring manager or HR recruiter for Valencia College on LinkedIn and send a personalized connection request',
            impact: '15% response rate vs 2% through ATS alone',
            timeEstimate: '10-15 min'
          },
          {
            strategy: 'Find a Referral',
            action: 'Search LinkedIn for 1st or 2nd degree connections at Valencia College who could refer you',
            impact: 'Referrals get ~50% interview rate',
            timeEstimate: '15-20 min'
          }
        ]
      }
    }
  }

  return testPockets[jobId] || testPockets['test-skip']
}
