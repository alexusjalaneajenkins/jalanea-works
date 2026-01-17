'use client'

/**
 * Dashboard Home Page - "Shining Light" Design
 *
 * Mission Control home/dashboard page.
 * Designed for entry-level job seekers with:
 * - Welcoming, professional tone
 * - Clear daily action plan
 * - Gold accent "Shining Light" theme
 * - Accessible, clean layout
 *
 * Responsive:
 * - Mobile (<768px): Single column, compact padding
 * - Tablet (768-1023px): Stacked layout, medium padding
 * - Desktop (1024px+): 8/4 split grid, full padding
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Bus,
  CheckCircle2,
  FileText,
  Flame,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils/cn'
import { useJalaneaMode, modeLabel, modeDescription } from '@/lib/mode/ModeContext'
import { useDashboardData, useNextSteps } from '@/hooks/useDashboardData'
import {
  OnboardingGatekeeper,
  type OnboardingStep,
} from '@/components/dashboard/OnboardingGatekeeper'

// ---------------- COMPONENTS ----------------

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl md:rounded-3xl border p-3 md:p-4 transition-all duration-200',
        accent
          ? 'border-primary/30 bg-primary/5 shadow-[0_4px_24px_hsl(var(--primary)/0.08)]'
          : 'border-border bg-card/60'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'grid h-8 w-8 md:h-10 md:w-10 place-items-center rounded-lg md:rounded-xl border',
            accent
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background/60 text-muted-foreground'
          )}
        >
          {icon}
        </div>
        <span className="text-[10px] md:text-xs text-muted-foreground">{hint}</span>
      </div>
      <div
        className={cn(
          'mt-2 md:mt-3 text-xl md:text-2xl font-black tracking-tight',
          accent ? 'text-primary' : 'text-foreground'
        )}
        style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
      >
        {value}
      </div>
      <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-semibold text-muted-foreground">{label}</div>
    </div>
  )
}

function DailyPlanRow({
  title,
  org,
  meta,
  badge,
  isNew,
  onClick,
}: {
  title: string
  org: string
  meta: string
  badge: { label: string; tone: 'safe' | 'warn' | 'lynx' | 'featured' }
  isNew?: boolean
  onClick?: () => void
}) {
  // Badge colors: Yellow reserved for ACTION buttons only
  // Status badges use neutral or cool colors
  const badgeStyles = {
    safe: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warn: 'border-destructive/30 bg-destructive/10 text-destructive',
    lynx: 'border-border bg-background/60 text-muted-foreground',
    featured: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }

  const badgeIcons = {
    safe: <BadgeCheck size={12} />,
    warn: <ShieldCheck size={12} />,
    lynx: <Bus size={12} />,
    featured: <Star size={12} className="fill-current" />,
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group relative w-full text-left rounded-2xl border border-border bg-card/60 p-4 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
    >
      {/* Shining light effect */}
      <div className="jw-shining-light pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shrink-0',
            badgeStyles[badge.tone]
          )}
        >
          {badgeIcons[badge.tone]}
          {badge.label}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{title}</span>
            {isNew && (
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground uppercase">
                New
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{org}</div>
          <div className="mt-2 text-xs text-muted-foreground">{meta}</div>
        </div>

        <ArrowRight
          size={16}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        />
      </div>
    </motion.button>
  )
}

function AdvantageItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/40 p-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-muted/30 text-slate-500 dark:text-slate-400 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  )
}

// Daily Plan content component (extracted for reuse with OnboardingGatekeeper)
function DailyPlanContent({
  isLoading,
  dayPlan,
  router,
  setSeed,
  refresh,
}: {
  isLoading: boolean
  dayPlan: Array<{
    id: string
    title: string
    org: string
    meta: string
    badge: { label: string; tone: 'safe' | 'warn' | 'lynx' | 'featured' }
    isNew?: boolean
  }>
  router: ReturnType<typeof useRouter>
  setSeed: React.Dispatch<React.SetStateAction<number>>
  refresh: () => void
}) {
  return (
    <div className="rounded-2xl md:rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5 md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-lg font-black text-foreground"
            style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
          >
            Your Daily Plan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated jobs based on your skills, location, and goals.
          </p>
        </div>
        <button
          onClick={() => {
            setSeed((s) => s + 1)
            refresh()
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
        >
          <Sparkles size={14} className="text-primary" />
          Refresh
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border bg-card/40 p-4"
            >
              <div className="flex gap-3">
                <div className="h-6 w-20 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))
        ) : (
          dayPlan.map((job) => (
            <DailyPlanRow
              key={job.id}
              title={job.title}
              org={job.org}
              meta={job.meta}
              badge={job.badge}
              isNew={job.isNew}
              onClick={() => router.push(`/dashboard/jobs?job=${job.id}`)}
            />
          ))
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          View all jobs
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/dashboard/resume"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
        >
          Resume Studio
          <Sparkles size={14} className="text-primary" />
        </Link>
      </div>
    </div>
  )
}

// ---------------- MAIN PAGE ----------------

export default function DashboardHomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.id
  const { mode } = useJalaneaMode()
  const [, setSeed] = useState(0) // Used to trigger refresh

  // Fetch dashboard data
  const {
    profile,
    stats,
    dailyPlanJobs,
    completedJobsCount,
    isLoading,
    refresh,
  } = useDashboardData(userId)

  // Fetch next steps
  const { steps: nextSteps, isLoading: stepsLoading } = useNextSteps(userId)

  // Get user display info
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'there'
  const firstName = displayName.split(' ')[0]

  // Time-based greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Transform daily plan jobs into display format
  const dayPlan = useMemo(() => {
    if (dailyPlanJobs.length === 0) {
      // Default jobs when none loaded
      return [
        {
          id: '1',
          title: 'Customer Service Representative',
          org: 'BrightPath Insurance',
          meta: '$17–$20/hr • Entry level • Benefits included',
          badge: { label: 'Best Match', tone: 'featured' as const },
          isNew: true,
        },
        {
          id: '2',
          title: 'Retail Sales Associate',
          org: 'Target • Colonial Plaza',
          meta: 'Scam Shield: CLEAN • Flexible schedule',
          badge: { label: 'Verified', tone: 'safe' as const },
        },
        {
          id: '3',
          title: 'Administrative Assistant',
          org: 'Orlando Health',
          meta: 'LYNX Route 36 • 22 min commute',
          badge: { label: 'Transit OK', tone: 'lynx' as const },
        },
      ]
    }

    return dailyPlanJobs.slice(0, 4).map((job, index) => {
      // Determine badge based on job properties
      let badge: { label: string; tone: 'safe' | 'warn' | 'lynx' | 'featured' } = {
        label: 'Verified',
        tone: 'safe',
      }

      if (index === 0 || (job.matchScore && job.matchScore >= 90)) {
        badge = { label: 'Best Match', tone: 'featured' }
      } else if (job.transitMinutes && job.lynxRoutes?.length) {
        badge = { label: 'Transit OK', tone: 'lynx' }
      }

      // Format salary
      let salaryStr = ''
      if (job.salaryMin || job.salaryMax) {
        const type = job.salaryType === 'hourly' ? '/hr' : '/yr'
        if (job.salaryMin && job.salaryMax) {
          salaryStr = `$${job.salaryMin.toLocaleString()}–$${job.salaryMax.toLocaleString()}${type}`
        } else if (job.salaryMin) {
          salaryStr = `$${job.salaryMin.toLocaleString()}+${type}`
        }
      }

      // Build meta string
      const metaParts = []
      if (salaryStr) metaParts.push(salaryStr)
      if (job.transitMinutes) metaParts.push(`${job.transitMinutes} min commute`)
      if (job.postedDaysAgo !== undefined) {
        metaParts.push(job.postedDaysAgo === 0 ? 'Posted today' : `${job.postedDaysAgo}d ago`)
      }

      return {
        id: job.id,
        title: job.title,
        org: job.company,
        meta: metaParts.join(' • ') || 'Entry level position',
        badge,
        isNew: job.postedDaysAgo === 0,
      }
    })
  }, [dailyPlanJobs])

  // Transform nextSteps into OnboardingStep format
  const onboardingSteps: OnboardingStep[] = useMemo(() => {
    // Always include "Account Created" as completed (endowed progress effect)
    const accountStep: OnboardingStep = {
      id: 'account',
      label: 'Account Created',
      description: 'Welcome to JalaneaWorks!',
      href: '/dashboard',
      icon: <CheckCircle2 size={20} />,
      completed: true, // Always completed - you're logged in!
    }

    // Map the remaining steps from the API
    const mappedSteps: OnboardingStep[] = nextSteps.map((step) => ({
      id: step.id,
      label: step.label,
      description: step.id === 'onboarding'
        ? 'Tell us about your skills and experience'
        : step.id === 'resume'
        ? 'Let us help translate your experience'
        : 'Take the first step on your journey',
      href: step.id === 'onboarding'
        ? '/foundation'
        : step.id === 'resume'
        ? '/dashboard/resume'
        : '/dashboard/jobs',
      icon: step.id === 'onboarding'
        ? <Target size={20} />
        : step.id === 'resume'
        ? <FileText size={20} />
        : <Briefcase size={20} />,
      completed: step.completed,
    }))

    return [accountStep, ...mappedSteps]
  }, [nextSteps])

  // Check if onboarding is complete
  const isOnboardingComplete = onboardingSteps.every((s) => s.completed)

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-3 py-4 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-10">
      <div className="grid gap-4 md:gap-6 lg:grid-cols-12">
        {/* Hero card */}
        <div className="lg:col-span-12">
          <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6 md:p-8">
            {/* Ambient glow */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary jw-glow-card">
                    <Lightbulb size={26} />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-black tracking-tight text-foreground sm:text-4xl"
                      style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                    >
                      {greeting}, {firstName}.
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="text-primary font-semibold">JalaneaWorks</span> — for
                      people LinkedIn left behind.
                    </p>
                  </div>
                </motion.div>

                {/* Mode badges - use color coding based on urgency, NOT yellow */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold',
                      mode === 'survival'
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : mode === 'bridge'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        mode === 'survival'
                          ? 'bg-rose-500'
                          : mode === 'bridge'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                    />
                    {modeLabel(mode)} Mode
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    <TrendingUp size={14} />
                    {modeDescription(mode)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/jobs"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card"
                >
                  <Briefcase size={16} />
                  Browse Jobs
                </Link>
                <Link
                  href="/dashboard/pockets"
                  className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Target size={16} />
                  Saved Pockets
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative mt-4 md:mt-6 grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Briefcase size={18} />}
                label="Jobs for you"
                value={isLoading ? '...' : String(dailyPlanJobs.length || 24)}
                hint="Entry-level"
                accent
              />
              <StatCard
                icon={<Bus size={18} />}
                label="Transit-friendly"
                value={
                  isLoading
                    ? '...'
                    : String(dailyPlanJobs.filter((j) => j.lynxRoutes?.length).length || 18)
                }
                hint="LYNX reachable"
              />
              <StatCard
                icon={<ShieldCheck size={18} />}
                label="Scam Shield"
                value="Active"
                hint="Protection on"
              />
              <StatCard
                icon={<Flame size={18} />}
                label="Streak"
                value={isLoading ? '...' : `${stats.daysActive} days`}
                hint="Keep going!"
              />
            </div>
          </div>
        </div>

        {/* Daily Plan with Onboarding Gatekeeper */}
        <div className="lg:col-span-8">
          {/* Show OnboardingGatekeeper if steps are not complete */}
          {!stepsLoading && !isOnboardingComplete ? (
            <OnboardingGatekeeper steps={onboardingSteps}>
              {/* This is the Daily Plan content that gets blurred/locked */}
              <DailyPlanContent
                isLoading={isLoading}
                dayPlan={dayPlan}
                router={router}
                setSeed={setSeed}
                refresh={refresh}
              />
            </OnboardingGatekeeper>
          ) : (
            /* Show Daily Plan directly when onboarding is complete */
            <DailyPlanContent
              isLoading={isLoading}
              dayPlan={dayPlan}
              router={router}
              setSeed={setSeed}
              refresh={refresh}
            />
          )}
        </div>

        {/* Sidebar - Your Advantage */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl md:rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5 md:p-7">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h2
                  className="text-lg font-black text-foreground"
                  style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                >
                  Your Advantage
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tools designed for entry-level success.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <AdvantageItem
                icon={<ShieldCheck size={16} />}
                title="Scam Shield"
                desc="Blocks predatory job posts automatically."
              />
              <AdvantageItem
                icon={<Bus size={16} />}
                title="Transit Filter"
                desc="Only see jobs you can actually reach."
              />
              <AdvantageItem
                icon={<Sparkles size={16} />}
                title="Resume Translation"
                desc="Turn retail experience into office language."
              />
              <AdvantageItem
                icon={<Target size={16} />}
                title="Saved Pockets"
                desc="Turn any listing into an application strategy."
              />
            </div>

            <Link
              href="/dashboard/pockets"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/80 transition-colors"
            >
              View Saved Pockets
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Stats Card */}
          <div className="mt-4 md:mt-6 rounded-2xl md:rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5 md:p-7">
            <h3
              className="text-base font-black text-foreground mb-4"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              Your Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Applications</span>
                <span className="text-sm font-bold text-foreground">
                  {isLoading ? '...' : stats.applications}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Interviews</span>
                <span className="text-sm font-bold text-foreground">
                  {isLoading ? '...' : stats.interviews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offers</span>
                <span className="text-sm font-bold text-primary">
                  {isLoading ? '...' : stats.offers}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today&apos;s progress</span>
                <span className="text-sm font-bold text-primary">
                  {completedJobsCount}/{dailyPlanJobs.length || 4}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
