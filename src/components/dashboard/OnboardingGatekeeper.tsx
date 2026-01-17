'use client'

/**
 * OnboardingGatekeeper - Gamified onboarding checklist
 *
 * Features:
 * - "Endowed Progress" effect (starts at 1/4 with Account Created)
 * - Prominent gatekeeper card above Daily Plan
 * - Blurs/locks Daily Plan until complete
 * - Celebration animation on completion
 *
 * References:
 * - Duolingo progress bars
 * - Trello blank slate
 * - Asana celebration moments
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  PartyPopper,
  UserCircle,
  FileText,
  MapPin,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface OnboardingStep {
  id: string
  label: string
  description: string
  href: string
  icon: React.ReactNode
  completed: boolean
}

interface OnboardingGatekeeperProps {
  steps: OnboardingStep[]
  children: React.ReactNode // The Daily Plan content to show below
  onComplete?: () => void
}

// Default steps with "Account Created" as the free endowed step
export const defaultOnboardingSteps: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'account',
    label: 'Account Created',
    description: 'Welcome to JalaneaWorks!',
    href: '/dashboard',
    icon: <UserCircle size={20} />,
  },
  {
    id: 'profile',
    label: 'Complete Your Profile',
    description: 'Tell us about your skills and experience',
    href: '/foundation',
    icon: <MapPin size={20} />,
  },
  {
    id: 'resume',
    label: 'Upload Your Resume',
    description: 'Let us help translate your experience',
    href: '/dashboard/resume',
    icon: <FileText size={20} />,
  },
  {
    id: 'first-apply',
    label: 'Apply to Your First Job',
    description: 'Take the first step on your journey',
    href: '/dashboard/jobs',
    icon: <Briefcase size={20} />,
  },
]

export function OnboardingGatekeeper({
  steps,
  children,
  onComplete,
}: OnboardingGatekeeperProps) {
  const [showCelebration, setShowCelebration] = useState(false)
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false)

  // Pre-generate confetti animation values using deterministic pseudo-random based on index
  const confettiParticles = useMemo(() => {
    // Simple seeded pseudo-random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return x - Math.floor(x)
    }

    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      color: ['#FCD34D', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][i % 5],
      left: seededRandom(i * 1.1) * 100,
      xOffset: (seededRandom(i * 2.2) - 0.5) * 100,
      rotateDir: seededRandom(i * 3.3) > 0.5 ? 1 : -1,
      duration: 2 + seededRandom(i * 4.4),
      delay: seededRandom(i * 5.5) * 0.5,
    }))
  }, [])

  const completedCount = steps.filter((s) => s.completed).length
  const totalSteps = steps.length
  const progressPercent = (completedCount / totalSteps) * 100
  const isComplete = completedCount === totalSteps

  // Trigger celebration when all steps complete
  // This is a valid pattern for triggering a modal on completion
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isComplete && !hasCompletedBefore) {
      setShowCelebration(true)
      setHasCompletedBefore(true)
      onComplete?.()

      // Auto-hide celebration after animation
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isComplete, hasCompletedBefore, onComplete])
  /* eslint-enable react-hooks/set-state-in-effect */

  // If already complete (returning user), just show the content
  if (isComplete && !showCelebration) {
    return <>{children}</>
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-2xl max-w-md mx-4"
            >
              {/* Confetti effect */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                {confettiParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: particle.color,
                      left: `${particle.left}%`,
                      top: '-10%',
                    }}
                    animate={{
                      y: ['0vh', '120vh'],
                      x: [0, particle.xOffset],
                      rotate: [0, 360 * particle.rotateDir],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                >
                  <PartyPopper size={40} className="text-primary" />
                </motion.div>

                <h2
                  className="text-2xl font-black text-foreground mb-2"
                  style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                >
                  You&apos;re All Set!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your profile is complete. Now let&apos;s find you the perfect job.
                </p>

                <Link
                  href="/dashboard/jobs"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={16} />
                  Start Browsing Jobs
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gatekeeper Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl md:rounded-[2rem] border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 md:p-6 shadow-lg shadow-primary/10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Get Started
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-black text-foreground"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              Complete Your Profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Finish these steps to unlock personalized job recommendations.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16">
              {/* Background circle */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  className="stroke-primary/20"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: `0 100` }}
                  animate={{ strokeDasharray: `${progressPercent} 100` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-black text-foreground">
                  {completedCount}/{totalSteps}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps list */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.completed ? '#' : step.href}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                step.completed
                  ? 'bg-primary/10 border-primary/30 cursor-default'
                  : 'bg-background/60 border-border hover:border-primary/30 hover:bg-background/80'
              )}
              onClick={(e) => step.completed && e.preventDefault()}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                  step.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                )}
              >
                {step.completed ? <Check size={18} /> : step.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'text-sm font-bold truncate',
                    step.completed ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">{step.description}</div>
              </div>
              {!step.completed && (
                <ArrowRight size={16} className="text-muted-foreground shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Locked Daily Plan */}
      <div className="relative">
        {/* Lock overlay */}
        <div className="absolute inset-0 z-10 rounded-2xl md:rounded-[2rem] bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/80 flex items-center justify-center">
              <Lock size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Daily Plan Locked</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete your profile to unlock personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Blurred content preview */}
        <div className="opacity-50 pointer-events-none select-none">{children}</div>
      </div>
    </div>
  )
}
