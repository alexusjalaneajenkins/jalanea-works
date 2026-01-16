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
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Bus,
  CheckCircle2,
  Circle,
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
        'rounded-3xl border p-4 transition-all duration-200',
        accent
          ? 'border-primary/30 bg-primary/5 shadow-[0_4px_24px_hsl(var(--primary)/0.08)]'
          : 'border-border bg-card/60'
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl border',
            accent
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background/60 text-muted-foreground'
          )}
        >
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div
        className={cn(
          'mt-3 text-2xl font-black tracking-tight',
          accent ? 'text-primary' : 'text-foreground'
        )}
        style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
      >
        {value}
      </div>
      <div className="mt-1 text-sm font-semibold text-muted-foreground">{label}</div>
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
  const badgeStyles = {
    safe: 'border-primary/30 bg-primary/10 text-primary',
    warn: 'border-destructive/30 bg-destructive/10 text-destructive',
    lynx: 'border-border bg-background/60 text-muted-foreground',
    featured: 'border-primary/40 bg-primary/15 text-primary',
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
      <div className="grid h-8 w-8 place-items-center rounded-lg border border-primary/20 bg-primary/5 text-primary shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
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
  const [seed, setSeed] = useState(0)

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

  // Step navigation
  const getStepHref = (stepId: string) => {
    switch (stepId) {
      case 'onboarding':
        return '/foundation'
      case 'resume':
        return '/dashboard/resume'
      case 'first-apply':
        return '/dashboard/jobs'
      default:
        return '/dashboard'
    }
  }

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Hero card */}
        <div className="lg:col-span-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-8">
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

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
                    <Target size={14} />
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
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-5 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
                >
                  <Target size={16} />
                  Job Pockets
                </Link>
              </div>
            </div>

            {/* Stats row */}
            <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Daily Plan */}
        <div className="lg:col-span-8">
          <div className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-7">
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

          {/* Next Steps Card - Show only if incomplete steps exist */}
          {!stepsLoading && nextSteps.some((s) => !s.completed) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-7"
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-black text-foreground"
                  style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                >
                  Get Started
                </h2>
                <span className="text-sm text-muted-foreground">
                  {nextSteps.filter((s) => s.completed).length}/{nextSteps.length} complete
                </span>
              </div>

              <div className="space-y-3">
                {nextSteps.map((step) => (
                  <Link
                    key={step.id}
                    href={getStepHref(step.id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                      step.completed
                        ? 'bg-primary/5 border-primary/20 cursor-default'
                        : 'bg-background/40 border-border hover:border-primary/20 hover:bg-background/60'
                    )}
                  >
                    {step.completed ? (
                      <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                    ) : (
                      <Circle size={24} className="text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        'flex-1 font-semibold',
                        step.completed ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    {!step.completed && <ArrowRight size={20} className="text-muted-foreground" />}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Steps Complete - Celebration */}
          {!stepsLoading && nextSteps.every((s) => s.completed) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 rounded-[2rem] border border-primary/20 bg-primary/5 p-6 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center jw-glow-card">
                <CheckCircle2 size={32} className="text-primary" />
              </div>
              <h3
                className="text-lg font-black text-foreground mb-2"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                You&apos;re all set up!
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your profile is complete. Now focus on your daily job applications.
              </p>
              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
              >
                Browse Jobs
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Your Advantage */}
        <div className="lg:col-span-4">
          <div className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-7">
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
                title="Job Pockets"
                desc="Turn any listing into an application strategy."
              />
            </div>

            <Link
              href="/dashboard/pockets"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              Start a Job Pocket
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Stats Card */}
          <div className="mt-6 rounded-[2rem] border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-7">
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
