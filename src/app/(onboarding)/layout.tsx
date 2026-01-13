'use client'

import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context'
import { usePathname } from 'next/navigation'
import { Check, Sparkles } from 'lucide-react'
import { useTranslation } from '@/i18n/config'

const STEPS = [
  { path: '/foundation', labelKey: 'onboarding.steps.foundation', step: 1 },
  { path: '/transportation', labelKey: 'onboarding.steps.transportation', step: 2 },
  { path: '/availability', labelKey: 'onboarding.steps.availability', step: 3 },
  { path: '/salary', labelKey: 'onboarding.steps.salary', step: 4 },
  { path: '/challenges', labelKey: 'onboarding.steps.challenges', step: 5 },
]

function ProgressIndicator() {
  const pathname = usePathname()
  const { currentStep, data } = useOnboarding()
  const { t } = useTranslation(data.preferredLanguage)

  // Don't show progress on complete page
  if (pathname === '/complete') {
    return null
  }

  // Determine current step from pathname
  const currentStepFromPath = STEPS.findIndex(s => pathname === s.path) + 1 || currentStep
  const currentStepLabel = t(STEPS[currentStepFromPath - 1]?.labelKey || 'onboarding.steps.complete')

  return (
    <div className="shrink-0 py-3 px-4">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {STEPS.map((step, idx) => {
          const isCurrentStep = idx + 1 === currentStepFromPath
          const isCompletedStep = idx + 1 < currentStepFromPath

          return (
            <div key={step.path} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCurrentStep
                    ? 'bg-amber-500 text-white scale-110 ring-4 ring-amber-500/30'
                    : isCompletedStep
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                }`}
                aria-current={isCurrentStep ? 'step' : undefined}
              >
                {isCompletedStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-4 h-1 rounded-full transition-all ${
                  isCompletedStep ? 'bg-amber-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step label - ARIA live region for screen readers */}
      <div className="text-center" aria-live="polite" aria-atomic="true">
        <div className="text-amber-600 font-bold text-base">
          {t('onboarding.stepOf', { current: currentStepFromPath, total: 5 })}
        </div>
        <div className="text-slate-500 text-sm">
          {currentStepLabel}
        </div>
      </div>
    </div>
  )
}

function OnboardingContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh min-h-dvh flex flex-col bg-white pt-safe pb-safe">
      {/* Fixed Header - 60px */}
      <header className="shrink-0 h-[60px] flex items-center justify-center border-b border-slate-100">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-amber-600">Jalanea Works</span>
        </div>
      </header>

      {/* Progress Indicator - ~48px */}
      <ProgressIndicator />

      {/* Scrollable Content Area - flex-1 */}
      <main className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
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
