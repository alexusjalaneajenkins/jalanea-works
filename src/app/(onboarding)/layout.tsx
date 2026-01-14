'use client'

/**
 * Onboarding Layout v2
 *
 * Single-page onboarding flow with 4 phases:
 * 1. About You - Language, Name, Location
 * 2. Education - Level, School, Degree Details
 * 3. Work Preferences - Transport, Commute, Schedule, Shifts
 * 4. Goals - Career Phase, Salary Breakdown, Challenges
 */

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The layout now just wraps children - the actual flow is rendered in page.tsx
  return <>{children}</>
}
