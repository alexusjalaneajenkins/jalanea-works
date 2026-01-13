'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface OnboardingData {
  // Step 1: Foundation
  address: string
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
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  totalSteps: number
}

const initialData: OnboardingData = {
  address: '',
  education: '',
  valenciaProgram: '',
  otherInstitution: '',
  transportMethods: [],
  maxCommute: 30,
  availability: '',
  specificDays: [],
  preferredShifts: [],
  salaryMin: 30000,
  salaryMax: 45000,
  challenges: [],
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
