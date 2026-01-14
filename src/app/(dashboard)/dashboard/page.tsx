'use client'

import { useAuth } from '@/components/providers/auth-provider'
import {
  Calendar,
  Briefcase,
  MessageSquare,
  Award,
  ArrowRight,
  CheckCircle2,
  Circle,
  Zap
} from 'lucide-react'

// ============================================
// DASHBOARD HOME PAGE
// ============================================
// Task 4.2 Requirements:
// - Welcome section with user name
// - Tier badge
// - Daily Plan card (empty state)
// - Quick stats (0/0/0)
// - Next Steps card

export default function DashboardHomePage() {
  const { user } = useAuth()

  // Get user display name
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const firstName = displayName.split(' ')[0]

  // TODO: Fetch from database
  const tier = 'Essential' // Essential / Starter / Premium
  const stats = {
    applications: 0,
    interviews: 0,
    offers: 0,
  }

  // Next steps for new user
  const nextSteps = [
    { label: 'Complete onboarding', completed: true },
    { label: 'Build your resume', completed: false },
    { label: 'Apply to your first job', completed: false },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-400 mt-1">
            Let&apos;s find you a job today.
          </p>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffc425]/10 border border-[#ffc425]/20 w-fit">
          <Zap size={16} className="text-[#ffc425]" />
          <span className="text-sm font-semibold text-[#ffc425]">{tier} Tier</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.applications}</p>
          <p className="text-xs sm:text-sm text-slate-400">Applications</p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-purple-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.interviews}</p>
          <p className="text-xs sm:text-sm text-slate-400">Interviews</p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Award size={20} className="text-green-400" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">{stats.offers}</p>
          <p className="text-xs sm:text-sm text-slate-400">Offers</p>
        </div>
      </div>

      {/* Daily Plan Card (Empty State) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ffc425]/10 flex items-center justify-center">
            <Calendar size={20} className="text-[#ffc425]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Your Daily Plan</h2>
            <p className="text-sm text-slate-400">8 jobs curated for you</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Calendar size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            We&apos;re generating your first daily plan!
          </h3>
          <p className="text-slate-400 text-sm max-w-md">
            Check back in a few minutes. We&apos;ll find 8 jobs that match your skills,
            location, and salary needs.
          </p>
        </div>
      </div>

      {/* Next Steps Card (First-time user) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Get Started</h2>
          <span className="text-sm text-slate-400">
            {nextSteps.filter(s => s.completed).length}/{nextSteps.length} complete
          </span>
        </div>

        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-colors
                ${step.completed
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }
              `}
            >
              {step.completed ? (
                <CheckCircle2 size={24} className="text-green-400 flex-shrink-0" />
              ) : (
                <Circle size={24} className="text-slate-600 flex-shrink-0" />
              )}
              <span className={`flex-1 font-medium ${step.completed ? 'text-green-400' : 'text-white'}`}>
                {step.label}
              </span>
              {!step.completed && (
                <ArrowRight size={20} className="text-slate-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
