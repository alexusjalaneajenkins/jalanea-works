'use client'

/**
 * PocketTier1 - Essential tier pocket display (20 sec read)
 * Shows: Qualification check, quick brief, talking points, likely questions, red flags, recommendation
 */

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react'

export interface PocketTier1Data {
  // Core fields
  qualificationCheck: {
    status: 'QUALIFIED' | 'PARTIALLY_QUALIFIED' | 'NOT_QUALIFIED'
    missing: string[]
  }
  recommendation: 'APPLY_NOW' | 'CONSIDER' | 'SKIP'
  matchScore?: number
  atsScore?: number  // ATS compatibility score (0-100)

  // Legacy field (deprecated - use structured zones instead)
  quickBrief?: string

  // Prep tab fields
  talkingPoints: string[]
  likelyQuestions: string[]
  redFlags: string[]

  // Zone A: Logistics (Where & When)
  logistics?: {
    locationType: 'on-site' | 'hybrid' | 'remote'
    locationAddress?: string
    schedule: string
    employmentType: string
    transitInfo?: string
    payRate?: string
  }

  // Zone B: Profile (Who & Why) - Enhanced with Proof Points
  requirements?: {
    text: string
    met: boolean
    proofPoint?: string  // Script for proving soft skills in interview
  }[]
  mission?: string

  // Zone C: Execution - Legacy (kept for backwards compatibility)
  dailyTasks?: {
    title: string
    description: string
  }[]
  toolsUsed?: string[]

  // Zone C: Reality Check (replaces dailyTasks with insider perspective)
  realityCheck?: {
    official: string      // Corporate speak: "Assist Customers"
    reality: string       // Truth: "You're the emotional firewall"
    intensity: 'low' | 'medium' | 'high'
  }[]

  // Skill Gaps - Learning bridge for missing skills (Enhanced)
  skillGaps?: {
    skill: string
    gapType: 'software' | 'certification' | 'experience'
    learnTime: string
    priority: 'critical' | 'helpful' | 'nice-to-have'
    resourceTitle: string
    resourceUrl?: string
    freeAlternative?: string
    whyItMatters?: string
  }[]

  // Day Timeline - Visualize the actual workday rhythm
  dayTimeline?: {
    time: string
    activity: string
    description: string
    intensity: 'calm' | 'busy' | 'rush'
  }[]

  // ATS Bypass Strategies - Ways to get past automated screening
  atsBypassStrategies?: {
    strategy: string
    action: string
    impact: string
    timeEstimate: string
  }[]
}

interface PocketTier1Props {
  data: PocketTier1Data
}

const recommendationConfig = {
  APPLY_NOW: {
    icon: ThumbsUp,
    label: 'Apply Now',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'This job is a strong match for your profile'
  },
  CONSIDER: {
    icon: Minus,
    label: 'Consider',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'This job may be worth exploring further'
  },
  SKIP: {
    icon: ThumbsDown,
    label: 'Skip',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'This job may not be the best fit right now'
  }
}

const qualificationConfig = {
  QUALIFIED: {
    icon: CheckCircle2,
    label: 'Fully Qualified',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  PARTIALLY_QUALIFIED: {
    icon: AlertTriangle,
    label: 'Partially Qualified',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10'
  },
  NOT_QUALIFIED: {
    icon: XCircle,
    label: 'Not Qualified',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  }
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
        <Icon size={16} className="text-[#ffc425]" />
        {title}
      </h3>
      {children}
    </motion.div>
  )
}

export function PocketTier1({ data }: PocketTier1Props) {
  const qualConfig = qualificationConfig[data.qualificationCheck.status]
  const recConfig = recommendationConfig[data.recommendation]
  const QualIcon = qualConfig.icon
  const RecIcon = recConfig.icon

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-4 rounded-xl border ${recConfig.bgColor} ${recConfig.borderColor}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${recConfig.bgColor} flex items-center justify-center`}>
            <RecIcon size={24} className={recConfig.color} />
          </div>
          <div>
            <p className={`text-lg font-bold ${recConfig.color}`}>{recConfig.label}</p>
            <p className="text-sm text-slate-400">{recConfig.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Qualification check */}
      <Section title="Qualification Check" icon={CheckCircle2} delay={0.1}>
        <div className={`p-3 rounded-lg ${qualConfig.bgColor} flex items-center gap-2`}>
          <QualIcon size={20} className={qualConfig.color} />
          <span className={`font-medium ${qualConfig.color}`}>{qualConfig.label}</span>
        </div>
        {data.qualificationCheck.missing.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1">Missing qualifications:</p>
            <ul className="space-y-1">
              {data.qualificationCheck.missing.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                  <XCircle size={14} className="text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Quick brief */}
      <Section title="Quick Brief" icon={Zap} delay={0.2}>
        <p className="text-slate-300 leading-relaxed">{data.quickBrief}</p>
      </Section>

      {/* Talking points */}
      <Section title="Your Talking Points" icon={MessageSquare} delay={0.3}>
        <ul className="space-y-2">
          {data.talkingPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300">
              <span className="w-6 h-6 rounded-full bg-[#ffc425]/20 text-[#ffc425] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ul>
      </Section>

      {/* Likely questions */}
      <Section title="Likely Questions" icon={HelpCircle} delay={0.4}>
        <ul className="space-y-2">
          {data.likelyQuestions.map((question, i) => (
            <li key={i} className="p-3 rounded-lg bg-slate-800/50 text-slate-300 text-sm">
              &quot;{question}&quot;
            </li>
          ))}
        </ul>
      </Section>

      {/* Red flags */}
      {data.redFlags.length > 0 && (
        <Section title="Red Flags" icon={AlertTriangle} delay={0.5}>
          <ul className="space-y-2">
            {data.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-red-300 text-sm">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                {flag}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

export default PocketTier1
