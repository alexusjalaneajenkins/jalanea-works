'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Credential type for multiple education entries
export interface Credential {
  id: string
  school: 'valencia' | 'ucf' | 'seminole' | 'orange' | 'fullsail' | 'other'
  program: string
  degreeType: 'certificate' | 'associate' | 'bachelor' | 'other'
  graduationYear: string
  status: 'current' | 'alumni'
}

export interface OnboardingData {
  // Language preference (asked first in Foundation)
  preferredLanguage: 'en' | 'es'

  // Step 1: Foundation (Identity + Education)
  fullName: string
  address: string
  addressCoords: { lat: number; lng: number } | null
  linkedInUrl: string
  portfolioUrl: string

  // Education (multiple credentials)
  credentials: Credential[]

  // Legacy fields (kept for backwards compatibility during migration)
  education: 'valencia' | 'other_college' | 'high_school' | 'ged' | 'none' | ''
  valenciaProgram: string
  otherInstitution: string

  // Step 2: Transportation
  transportMethods: string[]
  maxCommute: number

  // Step 3: Availability
  availability: 'open' | 'weekdays' | 'weekends' | 'specific' | ''
  specificDays: string[]
  preferredShifts: string[]

  // Step 4: Salary
  salaryMin: number
  salaryMax: number

  // Step 5: Challenges (optional)
  challenges: string[]
  realityContext: string
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  totalSteps: number
}

const initialData: OnboardingData = {
  // Language preference
  preferredLanguage: 'en',

  // Step 1: Foundation
  fullName: '',
  address: '',
  addressCoords: null,
  linkedInUrl: '',
  portfolioUrl: '',

  // Education (multiple credentials)
  credentials: [],

  // Legacy fields (for backwards compatibility)
  education: '',
  valenciaProgram: '',
  otherInstitution: '',

  // Step 2: Transportation
  transportMethods: [],
  maxCommute: 30,

  // Step 3: Availability
  availability: '',
  specificDays: [],
  preferredShifts: [],

  // Step 4: Salary
  salaryMin: 30000,
  salaryMax: 45000,

  // Step 5: Challenges
  challenges: [],
  realityContext: '',
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, currentStep, setCurrentStep, totalSteps }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
