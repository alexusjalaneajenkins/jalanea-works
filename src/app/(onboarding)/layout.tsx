'use client'

import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const steps = [
  { path: '/foundation', label: 'Foundation', number: 1 },
  { path: '/transportation', label: 'Transportation', number: 2 },
  { path: '/availability', label: 'Availability', number: 3 },
  { path: '/salary', label: 'Salary', number: 4 },
  { path: '/challenges', label: 'Challenges', number: 5 },
]

function ProgressIndicator() {
  const { currentStep, totalSteps } = useOnboarding()
  const pathname = usePathname()

  // Determine current step from pathname
  const activeStep = steps.find(s => pathname.includes(s.path))?.number || currentStep

  return (
    <div className="mb-8">
      {/* Step counter */}
      <p className="text-sm text-gray-500 text-center mb-4">
        Step {activeStep} of {totalSteps}
      </p>

      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.path} className="flex items-center">
            {/* Step circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step.number < activeStep
                  ? 'bg-green-500 text-white'
                  : step.number === activeStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.number < activeStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 mx-1 transition-colors ${
                  step.number < activeStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="text-center mt-3 font-medium text-gray-900">
        {steps.find(s => s.number === activeStep)?.label}
      </p>
    </div>
  )
}

function OnboardingLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setCurrentStep } = useOnboarding()

  // Update current step based on pathname
  useEffect(() => {
    const step = steps.find(s => pathname.includes(s.path))
    if (step) {
      setCurrentStep(step.number)
    }
  }, [pathname, setCurrentStep])

  // Skip progress indicator on complete page
  const isCompletePage = pathname.includes('/complete')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jalanea Works</h1>
          <p className="text-gray-600 text-sm">Let&apos;s set up your profile</p>
        </div>

        {/* Progress indicator */}
        {!isCompletePage && <ProgressIndicator />}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingProvider>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </OnboardingProvider>
  )
}
