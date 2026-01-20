/**
 * Job Analyzer API
 *
 * POST /api/jobs/analyze
 *   Analyze a job for fit, safety, and quick win suggestions BEFORE pocket generation.
 *
 *   Request body:
 *     - jobId: string - The job ID to analyze (UUID or external_id)
 *
 *   Response:
 *     - safety: Safety status from Scam Shield
 *     - qualification: Match percentage and skill gaps
 *     - quickWin: Actionable suggestion to improve fit
 *     - verdict: APPLY_NOW | CONSIDER | SKIP recommendation
 *     - analyzedAt: Timestamp
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzeJob, type JobForAnalysis, type UserProfile } from '@/lib/job-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    // TEST MODE: Return mock responses for test scenarios
    // Usage: test-skip, test-consider, test-apply
    if (jobId.startsWith('test-')) {
      return NextResponse.json(getMockAnalysis(jobId))
    }

    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Get job from database
    const adminSupabase = createAdminClient()
    let job = null

    // Check if jobId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUUID = uuidRegex.test(jobId)

    if (isUUID) {
      const { data } = await adminSupabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .is('deleted_at', null)
        .single()

      if (data) job = data
    }

    // If not found by UUID, try external_id
    if (!job) {
      const { data } = await adminSupabase
        .from('jobs')
        .select('*')
        .eq('external_id', jobId)
        .is('deleted_at', null)
        .single()

      if (data) job = data
    }

    // Try with prefixes
    if (!job && !jobId.startsWith('indeed_')) {
      const { data } = await adminSupabase
        .from('jobs')
        .select('*')
        .eq('external_id', `indeed_${jobId}`)
        .is('deleted_at', null)
        .single()

      if (data) job = data
    }

    if (!job && !jobId.startsWith('jsearch_')) {
      const { data } = await adminSupabase
        .from('jobs')
        .select('*')
        .eq('external_id', `jsearch_${jobId}`)
        .is('deleted_at', null)
        .single()

      if (data) job = data
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // 3. Get user profile + resume skills
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    // Get user's active resume to extract skills
    const { data: resume } = await supabase
      .from('resumes')
      .select('skills, experience')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build user profile for analysis
    const userProfile: UserProfile = {
      skills: resume?.skills || [],
      experienceYears: extractExperienceYears(resume?.experience)
    }

    // 4. Transform job data for analyzer
    const jobForAnalysis: JobForAnalysis = {
      id: job.id,
      title: job.title,
      company: job.company,
      company_website: job.company_website,
      description: job.description,
      requirements: job.requirements,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      contact_email: undefined,
      location_address: job.location_address,
      apply_url: job.apply_url
    }

    // 5. Run analysis
    const analysis = await analyzeJob(jobForAnalysis, userProfile)

    // 6. Track analytics event (fire and forget)
    adminSupabase.from('events').insert({
      user_id: user.id,
      event_name: 'job_analyzed',
      event_data: {
        job_id: job.id,
        verdict: analysis.verdict.recommendation,
        match_percentage: analysis.qualification.matchPercentage,
        safety_status: analysis.safety.status
      }
    }).then(() => {})

    // Return analysis result
    return NextResponse.json({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      ...analysis
    })
  } catch (error) {
    console.error('Error analyzing job:', error)
    return NextResponse.json(
      { error: 'Failed to analyze job' },
      { status: 500 }
    )
  }
}

/**
 * Extract total years of experience from resume experience array
 */
function extractExperienceYears(experience: unknown): number | undefined {
  if (!experience || !Array.isArray(experience)) {
    return undefined
  }

  let totalMonths = 0

  for (const exp of experience) {
    if (exp && typeof exp === 'object') {
      const startDate = (exp as any).startDate || (exp as any).start_date
      const endDate = (exp as any).endDate || (exp as any).end_date || 'present'

      if (startDate) {
        try {
          const start = new Date(startDate)
          const end = endDate.toLowerCase() === 'present'
            ? new Date()
            : new Date(endDate)

          const months = Math.max(0,
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth())
          )
          totalMonths += months
        } catch {
          // Skip if dates are invalid
        }
      }
    }
  }

  return totalMonths > 0 ? Math.round(totalMonths / 12) : undefined
}

/**
 * Generate mock analysis for test scenarios
 * Used for UI testing without hitting the database
 */
function getMockAnalysis(jobId: string) {
  const scenarios: Record<string, any> = {
    'test-skip': {
      jobId: 'test-skip',
      jobTitle: 'Data Entry Clerk',
      company: 'Mystery Corp',
      safety: {
        status: 'warning',
        flags: [
          'Very vague job description (less than 50 words)',
          'No company website found',
          'Salary range seems unusually high for role',
          'Missing contact information'
        ],
        scamScore: 65
      },
      qualification: {
        matchPercentage: 15,
        matchedSkills: [],
        missingSkills: ['data entry', 'excel', 'typing', 'attention to detail'],
        experienceMatch: false
      },
      quickWin: {
        type: 'add_skill',
        action: 'Add "Excel" to your skills section if applicable',
        timeEstimate: '2 min',
        impact: '+25% match'
      },
      verdict: {
        recommendation: 'SKIP',
        reason: 'Multiple safety concerns and low skill match. Your time is better spent elsewhere.'
      },
      analyzedAt: new Date().toISOString()
    },
    'test-consider': {
      jobId: 'test-consider',
      jobTitle: 'Customer Service Rep',
      company: 'Orlando Health',
      safety: {
        status: 'caution',
        flags: [
          'Job reposted multiple times (may indicate high turnover)'
        ],
        scamScore: 25
      },
      qualification: {
        matchPercentage: 58,
        matchedSkills: ['communication', 'customer service', 'problem solving'],
        missingSkills: ['medical terminology', 'EMR systems'],
        experienceMatch: true
      },
      quickWin: {
        type: 'learn',
        action: 'Watch a 5-min intro video on medical terminology basics',
        timeEstimate: '5 min',
        impact: '+15% match'
      },
      verdict: {
        recommendation: 'CONSIDER',
        reason: 'Decent match with minor concerns. Worth applying if you can address the skill gap.'
      },
      analyzedAt: new Date().toISOString()
    },
    'test-apply': {
      jobId: 'test-apply',
      jobTitle: 'Administrative Assistant',
      company: 'Valencia College',
      safety: {
        status: 'safe',
        flags: [],
        scamScore: 5
      },
      qualification: {
        matchPercentage: 82,
        matchedSkills: ['microsoft office', 'scheduling', 'communication', 'organization', 'data entry'],
        missingSkills: ['banner system'],
        experienceMatch: true
      },
      quickWin: {
        type: 'reframe',
        action: 'Highlight your "database management" experience as similar to Banner System',
        timeEstimate: '3 min',
        impact: '+10% match'
      },
      verdict: {
        recommendation: 'APPLY_NOW',
        reason: 'Strong match with verified employer. This is worth your time!'
      },
      analyzedAt: new Date().toISOString()
    }
  }

  return scenarios[jobId] || scenarios['test-skip']
}
