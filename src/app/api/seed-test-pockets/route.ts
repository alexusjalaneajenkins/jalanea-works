import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Seed test pockets for development/testing
 * GET /api/seed-test-pockets
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate UUIDs for test data
  const jobId1 = crypto.randomUUID()
  const jobId2 = crypto.randomUUID()
  const jobId3 = crypto.randomUUID()
  const pocketId1 = crypto.randomUUID()
  const pocketId2 = crypto.randomUUID()
  const pocketId3 = crypto.randomUUID()

  // Create test jobs first
  const testJobs = [
    {
      id: jobId1,
      external_id: 'test_001',
      source: 'test',
      title: 'Customer Service Representative',
      company: 'Orlando Health',
      location_address: 'Orlando, FL',
      location_city: 'Orlando',
      location_state: 'FL',
      salary_min: 32000,
      salary_max: 40000,
      salary_period: 'annual',
      description: 'Join our team as a Customer Service Representative. Handle patient inquiries, schedule appointments, and provide excellent customer service in a fast-paced healthcare environment.',
      apply_url: 'https://orlandohealth.com/careers/csr-001',
      posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      valencia_friendly: true,
      valencia_match_score: 85
    },
    {
      id: jobId2,
      external_id: 'test_002',
      source: 'test',
      title: 'Administrative Assistant',
      company: 'Valencia College',
      location_address: 'Orlando, FL',
      location_city: 'Orlando',
      location_state: 'FL',
      salary_min: 35000,
      salary_max: 45000,
      salary_period: 'annual',
      description: 'Support our administrative team with scheduling, correspondence, and office management. Great opportunity for organized individuals who enjoy helping others.',
      apply_url: 'https://valenciacollege.edu/careers/admin-001',
      posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      valencia_friendly: true,
      valencia_match_score: 78
    },
    {
      id: jobId3,
      external_id: 'test_003',
      source: 'test',
      title: 'Retail Sales Associate',
      company: 'Target',
      location_address: 'Orlando, FL',
      location_city: 'Orlando',
      location_state: 'FL',
      salary_min: 15,
      salary_max: 19,
      salary_period: 'hourly',
      description: 'Join the Target team! Help guests find products, maintain store presentation, and provide excellent customer service.',
      apply_url: 'https://target.com/careers/retail-001',
      posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      valencia_friendly: false,
      valencia_match_score: 65
    }
  ]

  // Insert jobs (delete old test jobs first, then insert fresh)
  await supabase.from('jobs').delete().eq('source', 'test')

  const { data: jobsData, error: jobsError } = await supabase
    .from('jobs')
    .insert(testJobs)
    .select()

  if (jobsError) {
    return NextResponse.json({
      error: 'Failed to insert jobs: ' + jobsError.message,
      details: jobsError
    }, { status: 500 })
  }

  console.log('Jobs inserted:', jobsData?.length)

  // Test pocket data
  const testPocketData = [
    {
      id: pocketId1,
      user_id: user.id,
      job_id: jobId1,
      tier: 'essential',
      pocket_data: {
        qualificationCheck: {
          status: 'QUALIFIED',
          missing: []
        },
        recommendation: 'APPLY_NOW',
        matchScore: 85,
        talkingPoints: [
          'Emphasize your customer service experience in healthcare settings',
          'Mention your ability to handle high-volume phone calls',
          'Highlight your experience with scheduling software'
        ],
        likelyQuestions: [
          'Tell me about a time you handled a difficult customer',
          'How do you prioritize multiple tasks?',
          'What experience do you have with medical terminology?'
        ],
        redFlags: [],
        logistics: {
          locationType: 'on-site',
          locationAddress: 'Orlando, FL',
          schedule: 'Day Shift: 8am-4:30pm',
          employmentType: 'Full-Time',
          payRate: '$15-$19/hr'
        },
        requirements: [
          { text: '6+ months customer service experience', met: true, proofPoint: 'Talk about your previous role handling customer inquiries' },
          { text: 'Reliable and punctual attendance', met: true, proofPoint: 'Mention your track record of punctuality' },
          { text: 'Comfortable with basic computer use', met: true },
          { text: 'Positive attitude and team player', met: true, proofPoint: 'Share a story about collaborating with colleagues' }
        ],
        mission: 'To ensure every customer at Orlando Health feels heard and receives excellent service from the moment they walk in.',
        realityCheck: [
          { official: 'Assist customers with inquiries', reality: 'You\'ll be the first point of contact - expect high call volume', intensity: 'medium' },
          { official: 'Schedule appointments', reality: 'Fast-paced scheduling with complex insurance coordination', intensity: 'medium' },
          { official: 'Maintain patient records', reality: 'Strict HIPAA compliance required, attention to detail critical', intensity: 'low' }
        ],
        skillGaps: [
          { skill: 'Medical Terminology', gapType: 'certification', learnTime: '2-3 hours', resourceTitle: 'Medical Terms Basics', resourceUrl: 'https://youtube.com/watch?v=example' }
        ],
        dayTimeline: [
          { time: '8:00 AM', activity: 'Opening procedures', description: 'Log in, check messages, review schedule', intensity: 'calm' },
          { time: '9:00 AM', activity: 'Peak call hours', description: 'Handle incoming patient calls and walk-ins', intensity: 'rush' },
          { time: '12:00 PM', activity: 'Lunch break', description: 'Staggered lunch to maintain coverage', intensity: 'calm' },
          { time: '2:00 PM', activity: 'Follow-ups', description: 'Process paperwork and return calls', intensity: 'busy' },
          { time: '4:00 PM', activity: 'End of day', description: 'Wrap up tasks and prepare for tomorrow', intensity: 'calm' }
        ]
      },
      is_favorite: true,
      viewed_at: new Date().toISOString(),
      applied_after_viewing: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: pocketId2,
      user_id: user.id,
      job_id: jobId2,
      tier: 'essential',
      pocket_data: {
        qualificationCheck: {
          status: 'PARTIALLY_QUALIFIED',
          missing: ['2 years administrative experience']
        },
        recommendation: 'CONSIDER',
        matchScore: 78,
        talkingPoints: [
          'Highlight your organizational skills',
          'Discuss your proficiency with Microsoft Office',
          'Mention any experience with scheduling or calendar management'
        ],
        likelyQuestions: [
          'How do you stay organized when managing multiple priorities?',
          'Describe your experience with office software',
          'Tell me about a time you improved a process'
        ],
        redFlags: [],
        logistics: {
          locationType: 'hybrid',
          locationAddress: 'Orlando, FL',
          schedule: 'M-F 9am-5pm, 2 days remote',
          employmentType: 'Full-Time',
          payRate: '$35k-$45k/year'
        },
        requirements: [
          { text: 'High school diploma or equivalent', met: true },
          { text: '2 years administrative experience', met: false, proofPoint: 'Emphasize transferable skills from other roles' },
          { text: 'Proficient in Microsoft Office', met: true },
          { text: 'Excellent communication skills', met: true }
        ],
        mission: 'Supporting educational excellence through efficient administrative operations.',
        realityCheck: [
          { official: 'Manage calendars and schedules', reality: 'Coordinating across multiple departments with competing priorities', intensity: 'medium' },
          { official: 'Handle correspondence', reality: 'High volume of emails and calls requiring quick responses', intensity: 'busy' }
        ],
        skillGaps: [],
        dayTimeline: [
          { time: '9:00 AM', activity: 'Morning check-in', description: 'Review emails and daily priorities', intensity: 'calm' },
          { time: '10:00 AM', activity: 'Administrative tasks', description: 'Handle correspondence and scheduling', intensity: 'busy' },
          { time: '1:00 PM', activity: 'Meetings', description: 'Support team meetings and take notes', intensity: 'busy' },
          { time: '4:00 PM', activity: 'Wrap up', description: 'Complete tasks and plan for tomorrow', intensity: 'calm' }
        ]
      },
      is_favorite: false,
      viewed_at: new Date().toISOString(),
      applied_after_viewing: false,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: pocketId3,
      user_id: user.id,
      job_id: jobId3,
      tier: 'essential',
      pocket_data: {
        qualificationCheck: {
          status: 'QUALIFIED',
          missing: []
        },
        recommendation: 'APPLY_NOW',
        matchScore: 65,
        talkingPoints: [
          'Show enthusiasm for customer interaction',
          'Discuss your ability to work flexible hours',
          'Mention any retail or sales experience'
        ],
        likelyQuestions: [
          'Why do you want to work at Target?',
          'How would you handle an upset customer?',
          'Are you comfortable working weekends and holidays?'
        ],
        redFlags: ['Requires weekend/holiday availability'],
        logistics: {
          locationType: 'on-site',
          locationAddress: 'Orlando, FL',
          schedule: 'Flexible, includes weekends',
          employmentType: 'Part-Time',
          payRate: '$15-$19/hr'
        },
        requirements: [
          { text: 'Able to work flexible hours', met: true },
          { text: 'Customer service oriented', met: true },
          { text: 'Able to lift up to 40 lbs', met: true }
        ],
        mission: 'Creating a welcoming shopping experience for all guests.',
        realityCheck: [
          { official: 'Assist guests', reality: 'Fast-paced environment, especially during holidays', intensity: 'high' },
          { official: 'Maintain store presentation', reality: 'Constant restocking and cleaning required', intensity: 'medium' }
        ],
        skillGaps: [],
        dayTimeline: [
          { time: 'Shift Start', activity: 'Check in', description: 'Get assigned area and tasks', intensity: 'calm' },
          { time: 'Mid-Shift', activity: 'Floor coverage', description: 'Help guests and maintain area', intensity: 'busy' },
          { time: 'End of Shift', activity: 'Close out', description: 'Final zone and handoff', intensity: 'calm' }
        ]
      },
      is_favorite: false,
      viewed_at: new Date().toISOString(),
      applied_after_viewing: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Delete existing pockets for these jobs first
  await supabase
    .from('job_pockets')
    .delete()
    .in('job_id', [jobId1, jobId2, jobId3])

  // Insert pockets
  const { data: pockets, error: pocketError } = await supabase
    .from('job_pockets')
    .insert(testPocketData)
    .select()

  if (pocketError) {
    return NextResponse.json({
      error: 'Failed to insert pockets: ' + pocketError.message,
      details: pocketError
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Test pockets created successfully',
    jobs: jobsData?.length || 0,
    pockets: pockets?.length || 0
  })
}
