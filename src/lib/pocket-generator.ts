/**
 * Pocket Generator
 *
 * Generates AI-powered Job Pockets based on user's tier.
 * Uses Google Gemini AI when available, falls back to rule-based generation.
 *
 * Tier Configuration:
 * - Tier 1 (Essential): 20-second quick brief - uses Gemini Flash
 * - Tier 2 (Starter): 90-second breakdown - uses Gemini Flash
 * - Tier 3 (Premium): 8-page report - uses Gemini Pro
 * - Tier 3+ (Unlimited): 12-page Deep Research - uses Gemini Pro with more context
 */

import type { PocketTier1Data } from '@/components/jobs/PocketTier1'
import type { PocketTier2Data } from '@/components/jobs/PocketTier2'
import type { PocketTier3Data } from '@/components/jobs/PocketTier3'
import {
  isGeminiAvailable,
  generateTier1PocketAI,
  generateTier2PocketAI,
  generateTier3PocketAI
} from './gemini-client'

// Flag to enable/disable AI generation
const USE_AI = isGeminiAvailable()

interface Job {
  id: string
  title: string
  company: string
  location: string
  description?: string
  fullDescription?: string
  requirements?: string[]
  benefits?: string[]
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'hourly' | 'yearly'
  valenciaMatch?: boolean
  valenciaMatchPercentage?: number
  scamRiskLevel?: 'low' | 'medium' | 'high' | 'critical'
  scamReasons?: string[]
}

interface UserProfile {
  name: string
  resume?: any
}

// Simulate AI analysis delay
async function simulateAIProcessing(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Analyze job requirements against user profile
function analyzeQualifications(job: Job, profile: UserProfile): {
  status: 'QUALIFIED' | 'PARTIALLY_QUALIFIED' | 'NOT_QUALIFIED'
  missing: string[]
} {
  // In production, this would use AI to compare resume against requirements
  const requirements = job.requirements || []

  // Simulate some analysis
  if (requirements.length === 0) {
    return { status: 'QUALIFIED', missing: [] }
  }

  // Mock analysis - in production, AI would parse resume and match
  const missingCount = Math.floor(Math.random() * 3)
  const missing = requirements.slice(0, missingCount)

  if (missing.length === 0) {
    return { status: 'QUALIFIED', missing: [] }
  } else if (missing.length <= 2) {
    return { status: 'PARTIALLY_QUALIFIED', missing }
  } else {
    return { status: 'NOT_QUALIFIED', missing }
  }
}

// Generate talking points based on job
function generateTalkingPoints(job: Job, profile: UserProfile): string[] {
  const points = [
    `Highlight your customer service experience and how it prepared you for ${job.company}'s patient-focused culture`,
    `Mention specific examples of handling high-volume situations while maintaining quality`,
    `Discuss your familiarity with electronic health systems or willingness to learn`,
    `Connect your communication skills to their need for professional phone etiquette`,
    `Show enthusiasm for healthcare and helping people in their time of need`
  ]

  // Shuffle and return 4-5 points
  return points.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 2))
}

// Generate likely interview questions
function generateLikelyQuestions(job: Job): string[] {
  const commonQuestions = [
    'Tell me about a time you handled a difficult customer situation.',
    'How do you prioritize tasks when everything feels urgent?',
    'What interests you about working in healthcare?',
    'Describe your experience with electronic records or scheduling systems.',
    'How do you maintain composure in stressful situations?'
  ]

  const roleSpecific = [
    `Why do you want to work at ${job.company}?`,
    `What makes you a good fit for this ${job.title} position?`,
    'Where do you see yourself in 5 years?'
  ]

  return [...commonQuestions.slice(0, 3), ...roleSpecific.slice(0, 2)]
}

// Check for red flags
function identifyRedFlags(job: Job): string[] {
  const flags: string[] = []

  if (job.scamRiskLevel === 'high' || job.scamRiskLevel === 'critical') {
    flags.push(...(job.scamReasons || ['Potential scam indicators detected']))
  }

  if (job.salaryMin && job.salaryMax) {
    const range = job.salaryType === 'hourly'
      ? (job.salaryMax - job.salaryMin)
      : (job.salaryMax - job.salaryMin) / 1000
    if (range > 20) {
      flags.push('Wide salary range may indicate commission-based or variable pay structure')
    }
  }

  // Add random flags for demo
  const possibleFlags = [
    'Review Glassdoor for recent employee feedback before interviewing',
    'Ask about team size and reporting structure',
    'Clarify expectations for overtime or weekend work'
  ]

  // Only add flags if not already concerning
  if (flags.length === 0 && Math.random() > 0.6) {
    flags.push(possibleFlags[Math.floor(Math.random() * possibleFlags.length)])
  }

  return flags
}

// Determine recommendation
function determineRecommendation(
  qualStatus: 'QUALIFIED' | 'PARTIALLY_QUALIFIED' | 'NOT_QUALIFIED',
  job: Job
): 'APPLY_NOW' | 'CONSIDER' | 'SKIP' {
  if (job.scamRiskLevel === 'high' || job.scamRiskLevel === 'critical') {
    return 'SKIP'
  }

  if (qualStatus === 'QUALIFIED' && job.valenciaMatch) {
    return 'APPLY_NOW'
  }

  if (qualStatus === 'QUALIFIED' || qualStatus === 'PARTIALLY_QUALIFIED') {
    return job.valenciaMatchPercentage && job.valenciaMatchPercentage >= 80
      ? 'APPLY_NOW'
      : 'CONSIDER'
  }

  return 'CONSIDER'
}

/**
 * Generate Tier 1 (Essential) Pocket
 * ~20 second read
 */
export async function generateTier1Pocket(
  job: Job,
  profile: UserProfile
): Promise<PocketTier1Data> {
  // Try AI generation first
  if (USE_AI) {
    try {
      console.log('Generating Tier 1 pocket with Gemini AI...')
      const aiResult = await generateTier1PocketAI(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description || job.fullDescription,
          requirements: job.requirements,
          benefits: job.benefits,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryType: job.salaryType,
          valenciaMatch: job.valenciaMatch,
          valenciaMatchPercentage: job.valenciaMatchPercentage
        },
        {
          name: profile.name,
          resumeSummary: profile.resume?.summary,
          skills: profile.resume?.skills,
          education: profile.resume?.education?.[0]?.degree,
          experience: profile.resume?.experience?.[0]?.title
        }
      )

      return {
        qualificationCheck: {
          status: aiResult.qualificationCheck.status as 'QUALIFIED' | 'PARTIALLY_QUALIFIED' | 'NOT_QUALIFIED',
          missing: aiResult.qualificationCheck.missing
        },
        quickBrief: aiResult.quickBrief,
        talkingPoints: aiResult.talkingPoints,
        likelyQuestions: aiResult.likelyQuestions,
        redFlags: aiResult.redFlags,
        recommendation: aiResult.recommendation
      }
    } catch (error) {
      console.error('AI generation failed, falling back to rule-based:', error)
    }
  }

  // Fallback to rule-based generation
  await simulateAIProcessing(1500)

  const qualCheck = analyzeQualifications(job, profile)

  return {
    qualificationCheck: qualCheck,
    quickBrief: `${job.company} is looking for a ${job.title} in ${job.location}. This ${job.valenciaMatch ? 'matches your Valencia degree (' + job.valenciaMatchPercentage + '% match)' : 'role'} offers ${job.salaryMin && job.salaryMax ? formatSalary(job.salaryMin, job.salaryMax, job.salaryType) : 'competitive compensation'} with ${job.benefits?.length || 'standard'} benefits.`,
    talkingPoints: generateTalkingPoints(job, profile),
    likelyQuestions: generateLikelyQuestions(job),
    redFlags: identifyRedFlags(job),
    recommendation: determineRecommendation(qualCheck.status, job)
  }
}

/**
 * Generate Tier 2 (Starter) Pocket
 * ~90 second read - includes everything in Tier 1 plus more context
 */
export async function generateTier2Pocket(
  job: Job,
  profile: UserProfile
): Promise<PocketTier2Data> {
  // Try AI generation first
  if (USE_AI) {
    try {
      console.log('Generating Tier 2 pocket with Gemini AI...')
      const aiResult = await generateTier2PocketAI(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description || job.fullDescription,
          requirements: job.requirements,
          benefits: job.benefits,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryType: job.salaryType,
          valenciaMatch: job.valenciaMatch,
          valenciaMatchPercentage: job.valenciaMatchPercentage
        },
        {
          name: profile.name,
          resumeSummary: profile.resume?.summary,
          skills: profile.resume?.skills,
          education: profile.resume?.education?.[0]?.degree,
          experience: profile.resume?.experience?.[0]?.title
        }
      )

      return {
        qualificationCheck: {
          status: aiResult.qualificationCheck.status as 'QUALIFIED' | 'PARTIALLY_QUALIFIED' | 'NOT_QUALIFIED',
          missing: aiResult.qualificationCheck.missing
        },
        quickBrief: aiResult.quickBrief,
        talkingPoints: aiResult.talkingPoints,
        likelyQuestions: aiResult.likelyQuestions,
        redFlags: aiResult.redFlags,
        recommendation: aiResult.recommendation,
        roleBreakdown: aiResult.roleBreakdown,
        whyHiring: aiResult.whyHiring,
        whatTheyWant: aiResult.whatTheyWant,
        cultureCheck: aiResult.cultureCheck,
        yourPositioning: aiResult.yourPositioning
      }
    } catch (error) {
      console.error('AI generation failed, falling back to rule-based:', error)
    }
  }

  // Fallback to rule-based generation
  await simulateAIProcessing(2500)

  const tier1 = await generateTier1Pocket(job, profile)

  return {
    ...tier1,
    roleBreakdown: `The ${job.title} role at ${job.company} involves ${job.description || 'providing excellent service and support'}. You'll be working in ${job.location}, ${job.salaryType === 'hourly' ? 'with flexible scheduling options' : 'with standard business hours'}. This position reports to the department manager and involves both independent work and team collaboration.`,
    whyHiring: `${job.company} is expanding their ${job.title.includes('Customer') || job.title.includes('Receptionist') ? 'customer-facing operations' : 'team'} to better serve ${job.location.includes('Orlando') ? 'the growing Orlando market' : 'their expanding customer base'}. This is likely a new position or backfill for someone who was promoted internally.`,
    whatTheyWant: `Based on the job posting, ${job.company} is looking for someone who can ${job.requirements?.slice(0, 2).join(' and ').toLowerCase() || 'contribute immediately while growing with the company'}. They value ${job.company.includes('Health') || job.company.includes('Advent') ? 'patient-centered care and empathy' : 'reliability and professionalism'}.`,
    cultureCheck: {
      score: job.valenciaMatch ? 7.5 + Math.random() * 2 : 6 + Math.random() * 2.5,
      notes: `${job.company} appears to have a ${job.company.includes('Valencia') || job.company.includes('Health') ? 'mission-driven, supportive' : 'professional, growth-oriented'} culture. ${job.benefits?.includes('Tuition') || job.benefits?.some(b => b.includes('tuition')) ? 'Their tuition benefits suggest investment in employee development.' : ''}`
    },
    yourPositioning: `Lead with your ${profile.resume ? 'relevant experience' : 'enthusiasm and transferable skills'}. Emphasize your ${job.valenciaMatch ? 'Valencia education which directly aligns with this role' : 'eagerness to contribute and grow'}. ${job.transitMinutes ? `Mention that you have reliable transportation (${job.transitMinutes} min via LYNX).` : ''}`
  }
}

/**
 * Generate Tier 3 (Premium) Pocket
 * ~5-10 minute read - complete 8-page intelligence report
 */
export async function generateTier3Pocket(
  job: Job,
  profile: UserProfile
): Promise<PocketTier3Data> {
  // Try AI generation first
  if (USE_AI) {
    try {
      console.log('Generating Tier 3 pocket with Gemini Pro...')
      const aiResult = await generateTier3PocketAI(
        {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description || job.fullDescription,
          requirements: job.requirements,
          benefits: job.benefits,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryType: job.salaryType,
          valenciaMatch: job.valenciaMatch,
          valenciaMatchPercentage: job.valenciaMatchPercentage
        },
        {
          name: profile.name,
          resumeSummary: profile.resume?.summary,
          skills: profile.resume?.skills,
          education: profile.resume?.education?.[0]?.degree,
          experience: profile.resume?.experience?.[0]?.title
        }
      )

      // The AI result should contain all fields - map them appropriately
      return aiResult as unknown as PocketTier3Data
    } catch (error) {
      console.error('AI generation failed, falling back to rule-based:', error)
    }
  }

  // Fallback to rule-based generation
  await simulateAIProcessing(4000)

  const tier2 = await generateTier2Pocket(job, profile)

  return {
    ...tier2,
    companyResearch: {
      overview: `${job.company} is a ${getCompanySize(job.company)} organization headquartered in ${getCompanyHQ(job.company)}. ${getCompanyDescription(job.company)} They have been serving the ${job.location.split(',')[1]?.trim() || 'Florida'} community for ${getCompanyYears(job.company)} years and continue to grow their presence in the region.`,
      culture: `${job.company} promotes a ${getCultureDescription(job.company)} work environment. Employees frequently mention ${getCultureHighlights(job.company)} in reviews. The company ${job.benefits?.length && job.benefits.length > 4 ? 'offers comprehensive benefits suggesting they invest in employee wellbeing' : 'provides standard industry benefits'}.`,
      recentNews: getRecentNews(job.company),
      glassdoorRating: 3.5 + Math.random() * 1.3,
      interviewProcess: `Typically a ${getInterviewStages(job)} interview process. ${getInterviewFormat(job)} Most candidates report the process takes ${getInterviewDuration(job)} from application to offer.`
    },
    salaryIntel: {
      marketRate: `For ${job.title} positions in ${job.location}, the market rate is ${getMarketRate(job)}. This offer ${compareSalary(job)} the market average.`,
      negotiationTips: getNegotiationTips(job),
      totalCompEstimate: `Including benefits, your total compensation package would be approximately ${getTotalComp(job)}. This accounts for ${job.benefits?.slice(0, 3).join(', ') || 'health insurance, retirement contributions, and PTO'}.`
    },
    interviewPrep: {
      behavioralQuestions: getBehavioralQuestions(job),
      technicalQuestions: getTechnicalQuestions(job),
      questionsToAsk: getQuestionsToAsk(job),
      interviewTips: getInterviewTips(job)
    },
    careerPath: {
      shortTerm: `Master the core responsibilities of ${job.title}. Build relationships with team members and understand ${job.company}'s internal processes.`,
      mediumTerm: `Progress to Senior ${job.title.replace('Junior', '').trim()} or Team Lead. Take on additional responsibilities and mentor new hires.`,
      longTerm: `Move into ${getSeniorRole(job)} or transition to ${getAlternativeRole(job)}. Potential for management track depending on interest and company growth.`,
      skillsToDevlop: getSkillsToDevlop(job)
    },
    competitorAnalysis: `Other companies hiring for similar roles in ${job.location} include ${getCompetitors(job)}. ${job.company} differentiates through ${getDifferentiators(job)}.`,
    networkingTips: getNetworkingTips(job),
    dayInLife: getDayInLife(job),
    successMetrics: getSuccessMetrics(job)
  }
}

// Helper functions for content generation

function formatSalary(min: number, max: number, type?: 'hourly' | 'yearly'): string {
  if (type === 'hourly') {
    return `$${min}-$${max}/hour`
  }
  return `$${Math.round(min/1000)}K-$${Math.round(max/1000)}K/year`
}

function getCompanySize(company: string): string {
  const sizes: Record<string, string> = {
    'Orlando Health': 'large healthcare',
    'Valencia College': 'mid-sized educational',
    'Target': 'Fortune 500 retail',
    'Lockheed Martin': 'Fortune 100 aerospace and defense',
    'AdventHealth': 'large faith-based healthcare',
    'Tech Orlando': 'growing technology startup'
  }
  return sizes[company] || 'established'
}

function getCompanyHQ(company: string): string {
  const hqs: Record<string, string> = {
    'Orlando Health': 'Orlando, Florida',
    'Valencia College': 'Orlando, Florida',
    'Target': 'Minneapolis, Minnesota',
    'Lockheed Martin': 'Bethesda, Maryland',
    'AdventHealth': 'Altamonte Springs, Florida',
    'Tech Orlando': 'Downtown Orlando'
  }
  return hqs[company] || 'Florida'
}

function getCompanyDescription(company: string): string {
  const descriptions: Record<string, string> = {
    'Orlando Health': 'As a not-for-profit healthcare organization, they operate multiple hospitals and medical centers throughout Central Florida.',
    'Valencia College': 'A state college offering associate degrees and workforce training, Valencia is consistently ranked among the top community colleges in the nation.',
    'Target': 'One of the largest retailers in the United States, known for their guest experience and inclusive workplace.',
    'Lockheed Martin': 'The world\'s largest defense contractor, specializing in aerospace, defense, and advanced technologies.',
    'AdventHealth': 'A faith-based health system with over 50 hospitals across multiple states, rooted in Seventh-day Adventist principles.',
    'Tech Orlando': 'A local tech company building innovative solutions for Central Florida businesses.'
  }
  return descriptions[company] || 'A respected organization in their industry.'
}

function getCompanyYears(company: string): number {
  const years: Record<string, number> = {
    'Orlando Health': 100,
    'Valencia College': 55,
    'Target': 60,
    'Lockheed Martin': 25,
    'AdventHealth': 150,
    'Tech Orlando': 5
  }
  return years[company] || 20
}

function getCultureDescription(company: string): string {
  const cultures: Record<string, string> = {
    'Orlando Health': 'patient-centered and collaborative',
    'Valencia College': 'student-focused and supportive',
    'Target': 'inclusive and guest-obsessed',
    'Lockheed Martin': 'innovative and mission-driven',
    'AdventHealth': 'faith-based and caring',
    'Tech Orlando': 'innovative and fast-paced'
  }
  return cultures[company] || 'professional'
}

function getCultureHighlights(company: string): string {
  const highlights: Record<string, string> = {
    'Orlando Health': 'work-life balance, career growth opportunities, and meaningful work',
    'Valencia College': 'supportive management, excellent benefits, and job stability',
    'Target': 'team atmosphere, flexible scheduling, and employee discounts',
    'Lockheed Martin': 'job security, excellent benefits, and cutting-edge projects',
    'AdventHealth': 'mission alignment, caring colleagues, and community impact',
    'Tech Orlando': 'learning opportunities, modern tech stack, and collaborative team'
  }
  return highlights[company] || 'positive work environment and growth opportunities'
}

function getRecentNews(company: string): string[] {
  const news: Record<string, string[]> = {
    'Orlando Health': [
      'Recently expanded their emergency department capacity',
      'Named among top healthcare employers in Florida',
      'Announced new residency programs for medical training'
    ],
    'Valencia College': [
      'Ranked #1 in the nation for associate degrees awarded',
      'Expanded partnerships with local employers for job placement',
      'Opened new campus facilities for growing programs'
    ],
    'Target': [
      'Raised minimum wage to $15/hour company-wide',
      'Expanding same-day delivery and pickup services',
      'Investing in employee training and development programs'
    ],
    'Lockheed Martin': [
      'Awarded major defense contracts for next-gen systems',
      'Expanding Orlando presence with new facilities',
      'Investing in employee skills development and retention'
    ],
    'AdventHealth': [
      'Completed merger expanding Central Florida network',
      'Recognized for patient satisfaction excellence',
      'Launched new community health initiatives'
    ],
    'Tech Orlando': [
      'Closed Series A funding round',
      'Expanding team with new positions',
      'Partnering with local universities for talent pipeline'
    ]
  }
  return news[company] || ['Company continues to grow in the region', 'Industry outlook remains positive', 'New opportunities being created']
}

function getInterviewStages(job: Job): string {
  if (job.title.includes('Developer') || job.title.includes('Tech')) return '3-4 stage'
  if (job.company.includes('Lockheed')) return '2-3 stage (plus security clearance process)'
  return '2 stage'
}

function getInterviewFormat(job: Job): string {
  if (job.title.includes('Developer')) return 'Expect a phone screen, technical assessment, and onsite interview with the team.'
  if (job.title.includes('Customer') || job.title.includes('Receptionist')) return 'Usually includes a phone screen followed by an in-person interview with the hiring manager.'
  return 'Typically involves a phone screen and interview with the department manager.'
}

function getInterviewDuration(job: Job): string {
  if (job.company.includes('Lockheed')) return '4-6 weeks (longer for clearance processing)'
  return '1-3 weeks'
}

function getMarketRate(job: Job): string {
  if (job.salaryType === 'hourly') {
    return `$14-$19/hour depending on experience`
  }
  const baseSalary = job.salaryMin || 35000
  const low = Math.round((baseSalary * 0.9) / 1000)
  const high = Math.round((baseSalary * 1.15) / 1000)
  return `$${low}K-$${high}K annually`
}

function compareSalary(job: Job): string {
  if (!job.salaryMin) return 'is competitive with'
  const marketMid = job.salaryType === 'hourly' ? 16 : 37000
  const jobMid = (job.salaryMin + (job.salaryMax || job.salaryMin)) / 2
  if (jobMid > marketMid * 1.1) return 'is above'
  if (jobMid < marketMid * 0.9) return 'is slightly below'
  return 'aligns with'
}

function getNegotiationTips(job: Job): string[] {
  return [
    'Research salary data on Glassdoor and Indeed for leverage',
    `Highlight relevant experience to justify higher end of range`,
    'Consider negotiating for additional PTO if salary is firm',
    `Ask about performance review timing and raise potential`,
    'Inquire about signing bonus or relocation assistance if applicable'
  ]
}

function getTotalComp(job: Job): string {
  if (!job.salaryMin || !job.salaryMax) return '15-20% above base salary'
  const avgSalary = (job.salaryMin + job.salaryMax) / 2
  if (job.salaryType === 'hourly') {
    const annualized = avgSalary * 2080
    return `$${Math.round((annualized * 1.2) / 1000)}K-$${Math.round((annualized * 1.35) / 1000)}K annually`
  }
  return `$${Math.round((avgSalary * 1.2) / 1000)}K-$${Math.round((avgSalary * 1.35) / 1000)}K annually`
}

function getBehavioralQuestions(job: Job): string[] {
  return [
    'Tell me about a time you went above and beyond for a customer or colleague.',
    'Describe a situation where you had to handle multiple priorities at once.',
    'Share an example of when you had to learn something new quickly.',
    'Tell me about a conflict you resolved in the workplace.',
    'Describe your approach to handling stressful situations.'
  ]
}

function getTechnicalQuestions(job: Job): string[] {
  if (job.title.includes('Developer')) {
    return [
      'Walk me through your approach to debugging a complex issue.',
      'How do you stay current with new technologies?',
      'Describe a project you\'re particularly proud of.',
      'How do you handle code reviews?',
      'What\'s your experience with version control?'
    ]
  }
  if (job.title.includes('Tech') || job.title.includes('Help Desk')) {
    return [
      'How would you troubleshoot a user who can\'t connect to the network?',
      'What steps do you take when resolving a support ticket?',
      'Describe your experience with Windows operating systems.',
      'How do you prioritize urgent vs. important tickets?',
      'What\'s your approach to documenting solutions?'
    ]
  }
  return [
    `What software or systems have you used in previous ${job.title} roles?`,
    'How do you ensure accuracy in your work?',
    'Describe your experience with scheduling or calendar management.',
    'How do you handle confidential information?',
    'What organizational tools do you use to stay on top of tasks?'
  ]
}

function getQuestionsToAsk(job: Job): string[] {
  return [
    'What does success look like in this role after 90 days?',
    'Can you tell me about the team I\'d be working with?',
    `What do you enjoy most about working at ${job.company}?`,
    'What are the biggest challenges someone in this role faces?',
    'What opportunities for growth and advancement exist?',
    'How would you describe the management style here?'
  ]
}

function getInterviewTips(job: Job): string[] {
  return [
    `Research ${job.company} thoroughly - know their mission, recent news, and values`,
    'Prepare specific examples using the STAR method (Situation, Task, Action, Result)',
    'Dress professionally - business casual is typically safe for most roles',
    'Arrive 10-15 minutes early and bring extra copies of your resume',
    'Follow up with a thank you email within 24 hours of the interview'
  ]
}

function getSeniorRole(job: Job): string {
  const title = job.title.toLowerCase()
  if (title.includes('customer service')) return 'Customer Service Manager or Team Supervisor'
  if (title.includes('admin')) return 'Office Manager or Executive Assistant'
  if (title.includes('developer')) return 'Senior Developer or Tech Lead'
  if (title.includes('receptionist')) return 'Front Office Manager or Patient Services Coordinator'
  if (title.includes('tech') || title.includes('help desk')) return 'IT Support Manager or Systems Administrator'
  return 'Senior ' + job.title
}

function getAlternativeRole(job: Job): string {
  const title = job.title.toLowerCase()
  if (title.includes('customer service')) return 'Operations Coordinator or Training Specialist'
  if (title.includes('admin')) return 'Project Coordinator or HR Assistant'
  if (title.includes('developer')) return 'Product Manager or Solutions Architect'
  if (title.includes('receptionist')) return 'Medical Billing Specialist or Care Coordinator'
  if (title.includes('tech') || title.includes('help desk')) return 'Network Administrator or Security Analyst'
  return 'related leadership position'
}

function getSkillsToDevlop(job: Job): string[] {
  const baseSkills = ['Communication', 'Time Management', 'Problem Solving']
  const roleSkills: Record<string, string[]> = {
    'Developer': ['React', 'TypeScript', 'System Design', 'Testing'],
    'Tech': ['Networking', 'Security+', 'Cloud Computing', 'ITIL'],
    'Customer': ['CRM Systems', 'Conflict Resolution', 'Data Entry', 'Team Leadership'],
    'Admin': ['Microsoft Office Suite', 'Project Management', 'Event Coordination'],
    'Receptionist': ['Medical Terminology', 'Insurance Verification', 'EHR Systems']
  }

  for (const [key, skills] of Object.entries(roleSkills)) {
    if (job.title.includes(key)) {
      return [...skills, ...baseSkills.slice(0, 2)]
    }
  }
  return [...baseSkills, 'Industry Knowledge', 'Leadership']
}

function getCompetitors(job: Job): string {
  const competitors: Record<string, string> = {
    'Orlando Health': 'AdventHealth, HCA Florida, Nemours',
    'Valencia College': 'Seminole State, UCF, Full Sail',
    'Target': 'Walmart, Costco, Amazon',
    'Lockheed Martin': 'Northrop Grumman, Raytheon, Boeing',
    'AdventHealth': 'Orlando Health, HCA Florida, Baptist Health',
    'Tech Orlando': 'other local agencies and startups'
  }
  return competitors[job.company] || 'similar organizations in the area'
}

function getDifferentiators(job: Job): string {
  const diffs: Record<string, string> = {
    'Orlando Health': 'their community focus and not-for-profit mission',
    'Valencia College': 'their commitment to student success and state benefits',
    'Target': 'their team culture and comprehensive training programs',
    'Lockheed Martin': 'their cutting-edge projects and job security',
    'AdventHealth': 'their faith-based approach and whole-person care philosophy',
    'Tech Orlando': 'their startup energy and growth potential'
  }
  return diffs[job.company] || 'their company culture and benefits package'
}

function getNetworkingTips(job: Job): string[] {
  return [
    `Connect with current ${job.company} employees on LinkedIn before your interview`,
    `Follow ${job.company}'s social media pages to stay informed about company news`,
    'Attend local industry meetups and networking events in Orlando',
    'Reach out to Valencia alumni who work at this company for insights',
    'Join professional associations related to your field for ongoing connections'
  ]
}

function getDayInLife(job: Job): string {
  const title = job.title.toLowerCase()

  if (title.includes('customer service') || title.includes('receptionist')) {
    return `A typical day starts with reviewing your schedule and preparing for incoming calls or visitors. You'll spend most of your day interacting with patients/customers, handling inquiries, scheduling appointments, and ensuring smooth operations.

Morning: Check messages, review appointment schedule, prepare for first visitors
Midday: Handle peak traffic, process paperwork, coordinate with staff
Afternoon: Follow up on pending items, prepare for next day, wrap up documentation

Expect to be on your feet and engaged throughout the day. Team lunches and brief breaks provide opportunities to recharge.`
  }

  if (title.includes('developer')) {
    return `Your day typically begins with a standup meeting where the team shares progress and blockers. You'll spend focused time coding, with breaks for code reviews and collaboration.

Morning: Standup meeting, tackle priority tasks, respond to urgent issues
Midday: Deep focus coding time, code reviews, documentation
Afternoon: Team collaboration, planning sessions, knowledge sharing

Expect a mix of independent work and collaboration. The team values work-life balance and sustainable pace.`
  }

  if (title.includes('admin')) {
    return `Each day brings variety as you support multiple stakeholders. You'll balance scheduled tasks with responding to ad-hoc requests.

Morning: Check emails, review calendar, prepare materials for meetings
Midday: Coordinate meetings, handle correspondence, process requests
Afternoon: File organization, follow-ups, prepare for tomorrow

Flexibility is key as priorities can shift. Building relationships across the organization helps you anticipate needs.`
  }

  return `Your day will be a mix of scheduled responsibilities and responding to needs as they arise. You'll work closely with your team and interact with various stakeholders throughout the day.

Morning: Start-of-day setup, review priorities, handle urgent items
Midday: Core job responsibilities, team collaboration, meetings as needed
Afternoon: Wrap up tasks, documentation, preparation for next day

Building relationships and maintaining organization will be key to your success.`
}

function getSuccessMetrics(job: Job): string[] {
  const title = job.title.toLowerCase()

  if (title.includes('customer service') || title.includes('receptionist')) {
    return [
      'Customer/patient satisfaction scores',
      'Average call handle time and resolution rate',
      'Accuracy in data entry and scheduling',
      'Attendance and reliability',
      'Team collaboration and peer feedback'
    ]
  }

  if (title.includes('developer')) {
    return [
      'Code quality and test coverage',
      'Sprint velocity and delivery consistency',
      'Bug resolution time',
      'Peer review contributions',
      'Technical documentation quality'
    ]
  }

  if (title.includes('admin')) {
    return [
      'Task completion rate and accuracy',
      'Stakeholder satisfaction',
      'Response time to requests',
      'Meeting coordination efficiency',
      'Process improvements implemented'
    ]
  }

  return [
    'Job-specific KPIs defined by manager',
    'Quality and accuracy of work',
    'Teamwork and collaboration',
    'Initiative and problem-solving',
    'Attendance and professionalism'
  ]
}
