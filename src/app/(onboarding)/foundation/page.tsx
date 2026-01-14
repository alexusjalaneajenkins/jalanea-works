'use client'

/**
 * Foundation Page - Entry Point for Onboarding v2
 *
 * Renders the single-page OnboardingFlow component and handles:
 * - Data transformation from v2 format to API format
 * - Submitting completed onboarding to /api/onboarding
 * - Redirecting to dashboard on success
 */

import { OnboardingFlow } from '@/components/onboarding-v2'
import { careerPhases } from '@/components/onboarding-v2/constants'
import { EducationDetails } from '@/components/onboarding-v2/types'

/**
 * Transform v2 onboarding answers to API format
 */
function transformAnswersToApiFormat(answers: Record<string, unknown>) {
  // Get career phase for salary calculation
  const careerPhaseValue = answers['career-phase'] as string | undefined
  const careerPhase = careerPhases.find(p => p.value === careerPhaseValue)

  // Calculate salary based on career phase
  let salaryMin = 20000 // Default fallback
  let salaryMax = 30000
  if (careerPhase) {
    // Parse salary from "$XK - $YK/yr" format
    const salaryParts = careerPhase.salary.match(/\$(\d+)K\s*-\s*\$?(\d+)K/)
    if (salaryParts) {
      salaryMin = parseInt(salaryParts[1]) * 1000
      salaryMax = parseInt(salaryParts[2]) * 1000
    }
  }

  // Get education details
  const educationDetails = answers['education-details'] as EducationDetails | undefined

  // Build credentials array
  const credentials = []
  if (educationDetails) {
    credentials.push({
      id: crypto.randomUUID(),
      school: mapSchoolValue(answers.school as string),
      program: educationDetails.degreeName || 'General Studies',
      degreeType: mapDegreeType(educationDetails.degreeType),
      graduationYear: educationDetails.gradYear || new Date().getFullYear().toString(),
      status: 'alumni' as const,
    })
  } else if (answers.school) {
    // If they selected a school but didn't fill education details
    credentials.push({
      id: crypto.randomUUID(),
      school: mapSchoolValue(answers.school as string),
      program: 'General Studies',
      degreeType: 'certificate' as const,
      graduationYear: new Date().getFullYear().toString(),
      status: 'alumni' as const,
    })
  }

  // Get education level - if high school or some college, don't require school
  const educationLevel = answers['education-level'] as string | undefined
  if ((!credentials.length) && (educationLevel === 'high-school' || educationLevel === 'some-college')) {
    credentials.push({
      id: crypto.randomUUID(),
      school: 'other' as const,
      program: educationLevel === 'high-school' ? 'High School Diploma' : 'Some College',
      degreeType: 'other' as const,
      graduationYear: new Date().getFullYear().toString(),
      status: 'alumni' as const,
    })
  }

  // Fallback if still no credentials
  if (!credentials.length) {
    credentials.push({
      id: crypto.randomUUID(),
      school: 'other' as const,
      program: 'Other',
      degreeType: 'certificate' as const,
      graduationYear: new Date().getFullYear().toString(),
      status: 'alumni' as const,
    })
  }

  // Map schedule days to specific days format
  const scheduleDays = answers['schedule-days'] as string[] | undefined

  // Transform to API format
  return {
    preferredLanguage: (answers.language as string) === 'spanish' ? 'es' : 'en',
    fullName: (answers.name as string) || 'User',
    address: (answers.location as string) || 'Orlando, FL',
    addressCoords: null,
    linkedInUrl: '',
    portfolioUrl: '',
    credentials,
    transportMethods: (answers.transport as string[]) || ['car'],
    maxCommute: parseInt(answers.commute as string) || 30,
    availability: mapAvailability(answers.schedule as string),
    specificDays: scheduleDays || [],
    preferredShifts: (answers.shifts as string[]) || ['morning'],
    salaryMin,
    salaryMax,
    challenges: (answers.challenges as string[]) || [],
    realityContext: '',
  }
}

/**
 * Map v2 school values to API format
 */
function mapSchoolValue(school: string): 'valencia' | 'ucf' | 'seminole' | 'orange' | 'fullsail' | 'other' {
  const mapping: Record<string, 'valencia' | 'ucf' | 'seminole' | 'orange' | 'fullsail' | 'other'> = {
    'seminole': 'seminole',
    'valencia': 'valencia',
    'ucf': 'ucf',
    'fullsail': 'fullsail',
    'orlando-tech': 'orange',
    'other': 'other',
  }
  return mapping[school] || 'other'
}

/**
 * Map v2 degree types to API format
 */
function mapDegreeType(degreeType: string): 'certificate' | 'associate' | 'bachelor' | 'other' {
  const mapping: Record<string, 'certificate' | 'associate' | 'bachelor' | 'other'> = {
    'certificate': 'certificate',
    'associates': 'associate',
    'bachelors': 'bachelor',
    'masters': 'other',
    'doctorate': 'other',
  }
  return mapping[degreeType] || 'other'
}

/**
 * Map v2 schedule to API availability format
 */
function mapAvailability(schedule: string): 'open' | 'weekdays' | 'weekends' | 'specific' {
  const mapping: Record<string, 'open' | 'weekdays' | 'weekends' | 'specific'> = {
    'flexible': 'open',
    'specific': 'specific',
  }
  return mapping[schedule] || 'open'
}

export default function FoundationPage() {
  const handleComplete = async (answers: Record<string, unknown>) => {
    console.log('Onboarding v2 answers:', answers)

    // Transform answers to API format
    const apiData = transformAnswersToApiFormat(answers)
    console.log('Transformed API data:', apiData)

    // Submit to API
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Onboarding submission failed:', error)
      throw new Error(error.message || 'Failed to save onboarding data')
    }

    console.log('Onboarding saved successfully!')
    // OnboardingFlow will handle redirect to dashboard
  }

  return <OnboardingFlow onComplete={handleComplete} />
}
