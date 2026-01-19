/**
 * Type definitions for the JalaneaWorks Onboarding Flow v2
 */

import { ReactNode } from 'react'

/**
 * Configuration for a single onboarding question
 */
export interface QuestionConfig {
  id: string
  phase: number
  icon: ReactNode
  title: string
  subtitle?: string
  type: 'single' | 'multi' | 'input' | 'chips' | 'school' | 'education-details' | 'schedule-days' | 'career-phase' | 'salary-breakdown' | 'career-paths'
  options?: QuestionOption[]
  placeholder?: string
  showWhen?: (answers: Record<string, unknown>) => boolean
}

/**
 * Option for single/multi-select questions
 */
export interface QuestionOption {
  value: string
  label: string
  icon?: ReactNode
  sublabel?: string
}

/**
 * Phase definition for progress tracking
 */
export interface Phase {
  id: number
  name: string
  icon: ReactNode
}

/**
 * School information for education selection
 */
export interface School {
  value: string
  name: string
  abbr: string
  color: string
}

/**
 * Degree type option
 */
export interface DegreeType {
  value: string
  label: string
}

/**
 * Day of week for schedule selection
 */
export interface DayOfWeek {
  value: string
  label: string
  full: string
}

/**
 * Career phase with salary and affordability data
 */
export interface CareerPhase {
  value: string
  name: string
  icon: ReactNode
  salary: string
  color: string
  requirements: string
  description: string
  monthly: MonthlyBudget
}

/**
 * Monthly budget breakdown
 */
export interface MonthlyBudget {
  gross: number
  rent: number
  car: number
  remaining: number
}

/**
 * Education details collected from user
 */
export interface EducationDetails {
  school: string
  degreeType: string
  degreeName: string
  programKey?: string  // Database key for career path lookup
  gradYear: string
  gpa?: string
}
