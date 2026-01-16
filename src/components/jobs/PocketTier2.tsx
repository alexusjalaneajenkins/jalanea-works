'use client'

/**
 * PocketTier2 - Starter tier pocket display (90 sec read)
 * Includes all of Tier 1 plus: Role breakdown, why hiring, what they want, culture check, positioning
 */

import { motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  Target,
  Users,
  Sparkles,
  Star
} from 'lucide-react'
import { PocketTier1, type PocketTier1Data } from './PocketTier1'

export interface PocketTier2Data extends PocketTier1Data {
  roleBreakdown: string
  whyHiring: string
  whatTheyWant: string
  cultureCheck: {
    score: number
    notes: string
  }
  yourPositioning: string
}

interface PocketTier2Props {
  data: PocketTier2Data
}

function Section({
  title,
  icon: Icon,
  children,
  delay = 0
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
        <Icon size={16} className="text-blue-400" />
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

function CultureScore({ score }: { score: number }) {
  const percentage = (score / 10) * 100
  const getColor = () => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full ${getColor()}`}
        />
      </div>
      <span className="text-lg font-bold text-white">{score.toFixed(1)}</span>
      <span className="text-sm text-slate-400">/10</span>
    </div>
  )
}

export function PocketTier2({ data }: PocketTier2Props) {
  // Extract Tier 1 data
  const tier1Data: PocketTier1Data = {
    qualificationCheck: data.qualificationCheck,
    quickBrief: data.quickBrief,
    talkingPoints: data.talkingPoints,
    likelyQuestions: data.likelyQuestions,
    redFlags: data.redFlags,
    recommendation: data.recommendation
  }

  return (
    <div className="space-y-8">
      {/* Tier 1 content */}
      <PocketTier1 data={tier1Data} />

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[#0f172a] text-sm text-blue-400 font-semibold flex items-center gap-2">
            <Sparkles size={16} />
            Starter Insights
          </span>
        </div>
      </div>

      {/* Role breakdown */}
      <Section title="Role Breakdown" icon={Briefcase} delay={0.1}>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-slate-300 leading-relaxed">{data.roleBreakdown}</p>
        </div>
      </Section>

      {/* Why they're hiring */}
      <Section title="Why They're Hiring" icon={Building2} delay={0.2}>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-slate-300 leading-relaxed">{data.whyHiring}</p>
        </div>
      </Section>

      {/* What they want */}
      <Section title="What They're Looking For" icon={Target} delay={0.3}>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-slate-300 leading-relaxed">{data.whatTheyWant}</p>
        </div>
      </Section>

      {/* Culture check */}
      <Section title="Culture Fit" icon={Users} delay={0.4}>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
          <CultureScore score={data.cultureCheck.score} />
          <p className="text-slate-400 text-sm">{data.cultureCheck.notes}</p>
        </div>
      </Section>

      {/* Your positioning */}
      <Section title="How to Position Yourself" icon={Star} delay={0.5}>
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300 leading-relaxed">{data.yourPositioning}</p>
        </div>
      </Section>
    </div>
  )
}

export default PocketTier2
