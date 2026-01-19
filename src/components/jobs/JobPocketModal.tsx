'use client'

/**
 * JobPocketModal - Tabbed "Sandwich" Layout
 *
 * Structure:
 * - Zone A (Fixed Header): Title, Company, Match Score, Tabs
 * - Zone B (Dynamic Body): Tab content (no scroll)
 * - Zone C (Fixed Footer): Close + Apply Now buttons
 *
 * Tabs:
 * - Overview: Qualification Check + Quick Brief (The Decision)
 * - Prep: Talking Points + Likely Questions (The Cheat Sheet)
 * - Strategy: Upgrade prompt / Deep dive (The Upsell)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Share2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  MessageSquare,
  HelpCircle,
  Lock,
  ArrowRight,
  FileText,
  Eye,
  BookOpen,
  Rocket,
  MapPin,
  Clock,
  Briefcase,
  Bus,
  Check,
  Target,
  Wrench,
  Lightbulb,
  Flame,
  Calendar,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Quote,
  DollarSign
} from 'lucide-react'
import type { PocketType } from '@/lib/stripe'
import type { PocketTier1Data } from './PocketTier1'

// Re-export for consumers importing from this file
export type { PocketTier1Data }

// Types
export type UserTier = 'essential' | 'starter' | 'premium' | 'unlimited' | 'professional' | 'max' | 'free'

interface JobPocketModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  userTier: UserTier
  pocketType?: PocketType
  pocketData: PocketTier1Data | null
  isGenerating?: boolean
  generationProgress?: number
  onUpgrade?: () => void
  applicationUrl?: string
  onApply?: () => void
}

type TabId = 'overview' | 'prep' | 'strategy'

const tabs: { id: TabId; label: string; icon: typeof Eye }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'prep', label: 'Prep', icon: BookOpen },
  { id: 'strategy', label: 'Strategy', icon: Rocket },
]

const qualificationConfig = {
  QUALIFIED: {
    icon: CheckCircle2,
    label: 'Fully Qualified',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  PARTIALLY_QUALIFIED: {
    icon: AlertTriangle,
    label: 'Partially Qualified',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  NOT_QUALIFIED: {
    icon: XCircle,
    label: 'Not Qualified',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
}

// Loading State Component
function LoadingState({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-[#ffc425] mb-6"
      />
      <h3 className="text-xl font-bold text-white mb-2">Generating Your Pocket</h3>
      <p className="text-slate-400 text-center mb-6">
        Analyzing the job and creating your cheat sheet...
      </p>

      <div className="w-full max-w-xs">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#ffc425] rounded-full"
          />
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">{progress}%</p>
      </div>

      <div className="mt-8 space-y-2 text-sm text-slate-500">
        <motion.p animate={{ opacity: progress >= 25 ? 1 : 0.3 }}>
          {progress >= 25 ? '✓' : '○'} Analyzing requirements
        </motion.p>
        <motion.p animate={{ opacity: progress >= 50 ? 1 : 0.3 }}>
          {progress >= 50 ? '✓' : '○'} Matching your profile
        </motion.p>
        <motion.p animate={{ opacity: progress >= 75 ? 1 : 0.3 }}>
          {progress >= 75 ? '✓' : '○'} Building talking points
        </motion.p>
        <motion.p animate={{ opacity: progress >= 100 ? 1 : 0.3 }}>
          {progress >= 100 ? '✓' : '○'} Finalizing pocket
        </motion.p>
      </div>
    </div>
  )
}

// Logistics Pill Component - Compact horizontal display
function LogisticsPill({
  icon: Icon,
  value,
  sub
}: {
  icon: typeof MapPin
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/40">
      <Icon size={12} className="text-slate-400" />
      <span className="text-xs font-medium text-white">{value}</span>
      {sub && <span className="text-xs text-slate-500">• {sub}</span>}
    </div>
  )
}

// Overview Tab Content - Job DNA Profile (3 Zones)
function OverviewTab({ data }: { data: PocketTier1Data }) {
  const qualConfig = qualificationConfig[data.qualificationCheck.status]
  const QualIcon = qualConfig.icon
  const matchScore = data.matchScore || 85

  // State for expanded proof points
  const [expandedProof, setExpandedProof] = useState<number | null>(null)

  // Format location type for display
  const formatLocationType = (type: string) => {
    switch (type) {
      case 'on-site': return 'On-Site'
      case 'hybrid': return 'Hybrid'
      case 'remote': return 'Remote'
      default: return type
    }
  }

  return (
    <div className="space-y-5 h-full overflow-y-auto">
      {/* Status Banner - Compact */}
      <div className={`p-3 rounded-xl border ${qualConfig.bgColor} ${qualConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QualIcon size={18} className={qualConfig.color} />
            <span className={`font-semibold text-sm ${qualConfig.color}`}>{qualConfig.label}</span>
            <span className="text-xs text-slate-400">• {matchScore}% Match</span>
          </div>
          {/* Mini progress ring */}
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" className="stroke-slate-700" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                className="stroke-[#ffc425]" strokeWidth="3"
                strokeDasharray={`${matchScore * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ZONE A: Logistics (Where & When) - Compact Pill Row
          Goal: Instant validation - "Can I physically do this?"
      ═══════════════════════════════════════════════════════════════════ */}
      {data.logistics && (
        <div className="flex flex-wrap gap-2">
          <LogisticsPill
            icon={MapPin}
            value={formatLocationType(data.logistics.locationType)}
            sub={data.logistics.locationAddress}
          />
          <LogisticsPill
            icon={Clock}
            value={data.logistics.schedule}
          />
          <LogisticsPill
            icon={Briefcase}
            value={data.logistics.employmentType}
          />
          {data.logistics.payRate && (
            <LogisticsPill
              icon={DollarSign}
              value={data.logistics.payRate}
            />
          )}
          {data.logistics.transitInfo && (
            <LogisticsPill
              icon={Bus}
              value={data.logistics.transitInfo}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ZONE B: Profile (Who & Why) - Enhanced with Proof Points
          Goal: Mirror check - "Is this me?" + "How do I prove it?"
      ═══════════════════════════════════════════════════════════════════ */}
      {(data.requirements || data.mission) && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Target size={12} className="text-slate-500" />
            Profile Match
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {/* Left: Who They Want - with Collapsible Proof Points */}
            {data.requirements && data.requirements.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Check size={12} className="text-green-400" />
                  Who They Want
                </h4>
                <ul className="space-y-2">
                  {data.requirements.map((req, i) => (
                    <li key={i} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {req.met ? (
                            <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-red-400 flex-shrink-0" />
                          )}
                          <span className={req.met ? 'text-slate-300' : 'text-red-300'}>{req.text}</span>
                        </div>
                        {/* Proof Point Toggle Button */}
                        {req.proofPoint && (
                          <button
                            onClick={() => setExpandedProof(expandedProof === i ? null : i)}
                            className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
                              expandedProof === i
                                ? 'bg-[#ffc425]/20 text-[#ffc425]'
                                : 'bg-slate-700/50 text-slate-400 hover:text-[#ffc425] hover:bg-slate-700'
                            }`}
                            title="How to prove this"
                          >
                            <MessageCircle size={12} />
                          </button>
                        )}
                      </div>
                      {/* Collapsible Proof Point */}
                      <AnimatePresence>
                        {req.proofPoint && expandedProof === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 ml-6 p-2.5 rounded-lg bg-slate-700/30 border border-slate-600/30">
                              <div className="flex items-start gap-2">
                                <Lightbulb size={12} className="text-[#ffc425] flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-300 leading-relaxed">{req.proofPoint}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Right: The Mission - Quote Style */}
            {data.mission && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/40 relative overflow-hidden">
                {/* Decorative quote mark */}
                <Quote size={48} className="absolute top-2 right-2 text-slate-700/30 rotate-180" />
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-slate-500" />
                  The Mission
                </h4>
                <p className="text-base text-white italic leading-relaxed font-serif relative z-10">
                  &ldquo;{data.mission}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ZONE C: Reality Check (Insider Intel)
          Goal: "What's it REALLY like?" - Surface vs Reality
      ═══════════════════════════════════════════════════════════════════ */}
      {data.realityCheck && data.realityCheck.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Eye size={12} className="text-slate-500" />
            Reality Check
          </h3>
          <div className="space-y-3">
            {data.realityCheck.map((item, i) => {
              const intensityConfig = {
                low: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'EASY' },
                medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'MODERATE' },
                high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'INTENSE' }
              }
              const config = intensityConfig[item.intensity]
              return (
                <div key={i} className={`p-3 rounded-xl ${config.bg} border ${config.border}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Official:</p>
                      <p className="text-sm text-slate-400 mb-2">&ldquo;{item.official}&rdquo;</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reality:</p>
                      <p className="text-sm text-white leading-relaxed">{item.reality}</p>
                    </div>
                    <div className={`flex-shrink-0 px-2 py-1 rounded-full ${config.bg} border ${config.border}`}>
                      <div className="flex items-center gap-1">
                        {item.intensity === 'high' && <Flame size={10} className={config.color} />}
                        <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legacy: Daily Tasks fallback for data without realityCheck */}
      {!data.realityCheck && data.dailyTasks && data.dailyTasks.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Wrench size={12} className="text-slate-500" />
            What You&apos;ll Do
          </h3>
          <div className="space-y-2 mb-4">
            {data.dailyTasks.map((task, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <p className="font-semibold text-sm text-white">{task.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
              </div>
            ))}
          </div>
          {data.toolsUsed && data.toolsUsed.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Tools & Systems:</p>
              <div className="flex flex-wrap gap-2">
                {data.toolsUsed.map((tool, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300 border border-slate-600/50">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SKILL GAPS - Learning Bridge
          Goal: "How do I close the gap?" - Quick upskill resources
      ═══════════════════════════════════════════════════════════════════ */}
      {data.skillGaps && data.skillGaps.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
            <AlertTriangle size={12} />
            Skill Gaps Detected
          </h3>
          <div className="space-y-2">
            {data.skillGaps.map((gap, i) => (
              <div key={i} className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-orange-300">{gap.skill}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Fix: Watch &ldquo;{gap.resourceTitle}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {gap.learnTime}
                    </span>
                    {gap.resourceUrl ? (
                      <a
                        href={gap.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ffc425] text-[#0f172a] text-xs font-semibold hover:bg-[#ffd85d] transition-colors"
                      >
                        <Play size={10} />
                        Watch
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium">
                        <Play size={10} />
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DAY IN THE LIFE - Timeline
          Goal: "What does a typical day look like?"
      ═══════════════════════════════════════════════════════════════════ */}
      {data.dayTimeline && data.dayTimeline.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <Calendar size={12} className="text-slate-500" />
            A Day in the Life
          </h3>
          <div className="relative pl-4 border-l-2 border-slate-700 space-y-4">
            {data.dayTimeline.map((slot, i) => {
              const intensityConfig = {
                calm: { dot: 'bg-green-400', ring: 'ring-green-400/30' },
                busy: { dot: 'bg-yellow-400', ring: 'ring-yellow-400/30' },
                rush: { dot: 'bg-red-400', ring: 'ring-red-400/30' }
              }
              const config = intensityConfig[slot.intensity]
              return (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${config.dot} ring-4 ${config.ring}`} />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{slot.time}</span>
                      {slot.intensity === 'rush' && <Flame size={10} className="text-red-400" />}
                    </div>
                    <p className="font-semibold text-sm text-white">{slot.activity}</p>
                    <p className="text-xs text-slate-400">{slot.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legacy: Quick Brief fallback for old data without structured zones */}
      {!data.logistics && !data.requirements && !data.dailyTasks && data.quickBrief && (
        <div className="flex-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Zap size={14} className="text-slate-500" />
            Quick Brief
          </h3>
          <p className="text-slate-300 leading-relaxed">{data.quickBrief}</p>
        </div>
      )}

      {/* Red flags if any */}
      {data.redFlags.length > 0 && (
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
            <AlertTriangle size={12} />
            Heads Up
          </h3>
          <ul className="space-y-1">
            {data.redFlags.map((flag, i) => (
              <li key={i} className="text-sm text-orange-300">{flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Prep Tab Content (The Cheat Sheet)
function PrepTab({ data }: { data: PocketTier1Data }) {
  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Talking Points */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          <MessageSquare size={14} className="text-slate-500" />
          Your Talking Points
        </h3>
        <ul className="space-y-2">
          {data.talkingPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-slate-300 text-sm">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Likely Questions */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          <HelpCircle size={14} className="text-slate-500" />
          They&apos;ll Probably Ask
        </h3>
        <ul className="space-y-2">
          {data.likelyQuestions.map((question, i) => (
            <li key={i} className="p-3 rounded-lg bg-slate-800/50 text-slate-300 text-sm italic">
              &ldquo;{question}&rdquo;
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Strategy Tab Content (The Upsell)
function StrategyTab({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#ffc425]/20 flex items-center justify-center mb-4">
        <Lock size={32} className="text-[#ffc425]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        Unlock Deeper Insights
      </h3>
      <p className="text-slate-400 mb-6 max-w-sm">
        Get company culture analysis, salary negotiation tips, and a 90-second role breakdown with Starter.
      </p>
      <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
      >
        Upgrade to Starter
        <ArrowRight size={18} />
      </button>
      <p className="text-xs text-slate-500 mt-3">
        Starting at $25/month
      </p>
    </div>
  )
}

export function JobPocketModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  userTier,
  pocketData,
  isGenerating = false,
  generationProgress = 0,
  onUpgrade,
  applicationUrl,
  onApply
}: JobPocketModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview')
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job Pocket: ${jobTitle} at ${companyName}`,
          text: `Check out this job opportunity!`
        })
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal - Fixed height, no scroll on container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-20 bg-[#0f172a] rounded-2xl border border-slate-800 z-50 flex flex-col max-h-[90vh]"
          >
            {/* === ZONE A: Fixed Header with Tabs === */}
            <div className="flex-shrink-0">
              {/* Title Row */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffc425]/20 flex items-center justify-center">
                    <FileText size={20} className="text-[#ffc425]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-none">
                      {jobTitle}
                    </h2>
                    <p className="text-sm text-slate-400">{companyName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isGenerating && pocketData && (
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Tabs Row - Only show when not generating */}
              {!isGenerating && pocketData && (
                <div className="flex border-b border-slate-800">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                          isActive
                            ? 'text-[#ffc425]'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffc425]"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* === ZONE B: Dynamic Content Body === */}
            <div className="flex-1 overflow-hidden p-4 sm:p-6">
              {isGenerating ? (
                <LoadingState progress={generationProgress} />
              ) : pocketData ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="h-full"
                  >
                    {activeTab === 'overview' && <OverviewTab data={pocketData} />}
                    {activeTab === 'prep' && <PrepTab data={pocketData} />}
                    {activeTab === 'strategy' && <StrategyTab onUpgrade={onUpgrade} />}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText size={48} className="text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Pocket Data</h3>
                  <p className="text-slate-400">Something went wrong. Please try again.</p>
                </div>
              )}
            </div>

            {/* === ZONE C: Fixed Footer === */}
            {!isGenerating && pocketData && (
              <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-800/30">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (onApply) {
                        onApply()
                      } else if (applicationUrl) {
                        window.open(applicationUrl, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default JobPocketModal
