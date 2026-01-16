'use client'

import { useOnboarding } from '@/contexts/onboarding-context'

/**
 * Simple hook for onboarding step navigation
 *
 * The pages use useMemo + validateX functions directly for validation.
 * This hook provides convenient access to context data and navigation helpers.
 */
export function useOnboardingStep() {
  const { data, updateData, currentStep, setCurrentStep, totalSteps } = useOnboarding()

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return {
    data,
    updateData,
    currentStep,
    totalSteps,
    goNext,
    goBack,
  }
}
