'use client'

import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context'
import { usePathname } from 'next/navigation'
import { Check, Sparkles } from 'lucide-react'

const STEPS = [
  { path: '/foundation', label: 'Foundation', step: 1 },
  { path: '/transportation', label: 'Transportation', step: 2 },
  { path: '/availability', label: 'Availability', step: 3 },
  { path: '/salary', label: 'Salary', step: 4 },
  { path: '/challenges', label: 'Challenges', step: 5 },
]

function ProgressIndicator() {
  const pathname = usePathname()
  const { currentStep } = useOnboarding()

  // Don't show progress on complete page
  if (pathname === '/complete') {
    return null
  }

  // Determine current step from pathname
  const currentStepFromPath = STEPS.findIndex(s => pathname === s.path) + 1 || currentStep

  return (
    <div className="mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {STEPS.map((step, idx) => {
          const isCurrentStep = idx + 1 === currentStepFromPath
          const isCompletedStep = idx + 1 < currentStepFromPath

          return (
            <div key={step.path} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCurrentStep
                    ? 'bg-amber-500 text-white scale-110 ring-4 ring-amber-500/30'
                    : isCompletedStep
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                }`}
              >
                {isCompletedStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 h-1 rounded-full transition-all ${
                  isCompletedStep ? 'bg-amber-500' : 'bg-slate-700'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step label */}
      <div className="text-center">
        <div className="text-amber-500 font-bold text-lg">
          Step {currentStepFromPath} of 5
        </div>
        <div className="text-slate-400 text-sm">
          {STEPS[currentStepFromPath - 1]?.label || 'Complete'}
        </div>
      </div>
    </div>
  )
}

function OnboardingContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-500">Jalanea Works Onboarding</span>
          </div>
        </div>

        <ProgressIndicator />

        {/* Page content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
      <OnboardingContent>{children}</OnboardingContent>
    </OnboardingProvider>
  )
}
