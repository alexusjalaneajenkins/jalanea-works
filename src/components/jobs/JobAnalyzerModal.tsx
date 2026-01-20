'use client'

/**
 * JobAnalyzerModal - Pre-Pocket Job Analyzer
 *
 * A "gatekeeper" for the user's time that provides immediate clarity
 * on whether a job is worth pursuing.
 *
 * Design Philosophy: Clarity → Efficiency → Jobs
 * - Verdict First: Immediate yes/no answer
 * - Opportunity Cost Dashboard: Fit, Time, Risk at a glance
 * - Smart Buttons: UI resists bad decisions
 * - Job Reality: Honest assessment beyond scam detection
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  PenLine,
  Lightbulb,
  FolderOpen,
  TrendingUp,
  Timer,
  AlertOctagon,
  Trash2,
  ChevronRight,
  Ban
} from 'lucide-react'
import type { AnalysisResult } from '@/lib/job-analyzer'

interface JobAnalyzerModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  jobId: string
  onProceed: () => void  // User wants to generate pocket
  onSkip: () => void     // User decides to skip/dismiss
}

// Verdict configuration with banner styles
const verdictConfig = {
  APPLY_NOW: {
    icon: CheckCircle2,
    label: 'Worth Pursuing',
    description: 'Good match with no red flags',
    color: 'text-emerald-700',
    bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100'
  },
  CONSIDER: {
    icon: AlertTriangle,
    label: 'Proceed with Caution',
    description: 'Some concerns worth reviewing',
    color: 'text-amber-700',
    bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100'
  },
  SKIP: {
    icon: Ban,
    label: 'Skip This One',
    description: 'Not worth your time right now',
    color: 'text-red-700',
    bgColor: 'bg-gradient-to-r from-red-50 to-orange-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100'
  }
}

// Risk level based on safety status
const riskConfig = {
  safe: { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  caution: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' },
  warning: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
  danger: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
}

// Quick win type icons
const quickWinIcons = {
  add_skill: PenLine,
  reframe: Lightbulb,
  learn: BookOpen
}

// Estimate time cost based on job data
function estimateTimeCost(analysis: AnalysisResult | null): string {
  if (!analysis) return '~15m'

  let minutes = 10 // Base application time

  // Add time for missing skills to address
  if (analysis.qualification.missingSkills.length > 2) {
    minutes += 5
  }

  // Add time if safety flags need review
  if (analysis.safety.flags.length > 0) {
    minutes += 5
  }

  // Add time for low match (more customization needed)
  if (analysis.qualification.matchPercentage < 50) {
    minutes += 10
  }

  return `~${minutes}m`
}

// Calculate potential fit if quick win is applied
function getPotentialFit(analysis: AnalysisResult | null): number | null {
  if (!analysis?.quickWin) return null

  // Parse the impact string for percentage boost
  const impactMatch = analysis.quickWin.impact.match(/\+(\d+)%/)
  if (impactMatch) {
    const boost = parseInt(impactMatch[1])
    return Math.min(100, analysis.qualification.matchPercentage + boost)
  }
  return null
}

export function JobAnalyzerModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  jobId,
  onProceed,
  onSkip
}: JobAnalyzerModalProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analysis when modal opens
  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true)
      setError(null)
      setAnalysis(null)

      fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to analyze job')
          return res.json()
        })
        .then(data => {
          setAnalysis(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Analysis error:', err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [isOpen, jobId])

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

  const safety = analysis?.safety
  const qualification = analysis?.qualification
  const quickWin = analysis?.quickWin
  const verdict = analysis?.verdict

  const verdictStyle = verdict ? verdictConfig[verdict.recommendation] : verdictConfig.CONSIDER
  const VerdictIcon = verdictStyle.icon
  const riskStyle = safety ? riskConfig[safety.status] : riskConfig.caution
  const QuickWinIcon = quickWin ? quickWinIcons[quickWin.type] : Zap

  const timeCost = estimateTimeCost(analysis)
  const potentialFit = getPotentialFit(analysis)

  // Determine if this is a "bad" job (Skip verdict)
  const isSkipVerdict = verdict?.recommendation === 'SKIP'
  const hasSafetyIssues = safety && safety.flags.length > 0

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#fffbf5] rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh] border border-amber-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#ffc425] flex items-center justify-center shadow-sm">
                  <Target size={22} className="text-[#1a1a1a]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Job Analyzer</h2>
                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                    {jobTitle} at {companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-4 border-amber-100 border-t-[#ffc425] mb-4"
                  />
                  <p className="text-gray-500">Analyzing job fit...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <XCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-2">Analysis Failed</p>
                  <p className="text-gray-500 text-sm">{error}</p>
                </div>
              ) : analysis ? (
                <>
                  {/* 1. VERDICT FIRST - Top Banner */}
                  <div className={`p-4 rounded-xl ${verdictStyle.bgColor} border ${verdictStyle.borderColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${verdictStyle.iconBg} flex items-center justify-center`}>
                        <VerdictIcon size={22} className={verdictStyle.color} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-base ${verdictStyle.color}`}>
                          Verdict: {verdictStyle.label}
                        </p>
                        <p className="text-sm text-gray-600">{verdict?.reason || verdictStyle.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. OPPORTUNITY COST DASHBOARD */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Fit Score */}
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                      <TrendingUp size={18} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xl font-bold text-gray-900">
                        {qualification?.matchPercentage || 0}%
                        {potentialFit && (
                          <span className="text-sm font-normal text-emerald-600"> → {potentialFit}%</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Fit Score</p>
                    </div>

                    {/* Time Cost */}
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm text-center">
                      <Timer size={18} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xl font-bold text-gray-900">{timeCost}</p>
                      <p className="text-xs text-gray-500">Time Cost</p>
                    </div>

                    {/* Risk Level */}
                    <div className={`p-3 rounded-xl ${riskStyle.bg} border border-gray-200 shadow-sm text-center`}>
                      <ShieldAlert size={18} className={`mx-auto ${riskStyle.color} mb-1`} />
                      <p className={`text-xl font-bold ${riskStyle.color}`}>{riskStyle.label}</p>
                      <p className="text-xs text-gray-500">Risk</p>
                    </div>
                  </div>

                  {/* 3. JOB REALITY (formerly Safety Flags) */}
                  {safety && safety.flags.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                        <AlertOctagon size={14} className="text-orange-500" />
                        Job Reality
                      </p>
                      <ul className="space-y-2">
                        {safety.flags.slice(0, 4).map((flag, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">⚠️</span>
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4. QUICK WIN (dimmed if Skip verdict due to safety) */}
                  {quickWin && (
                    <div className={`p-4 rounded-xl border shadow-sm transition-opacity ${
                      isSkipVerdict && hasSafetyIssues
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isSkipVerdict && hasSafetyIssues ? 'bg-gray-200' : 'bg-[#ffc425]'
                        }`}>
                          <QuickWinIcon size={18} className={isSkipVerdict && hasSafetyIssues ? 'text-gray-500' : 'text-[#1a1a1a]'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-semibold ${isSkipVerdict && hasSafetyIssues ? 'text-gray-500' : 'text-amber-800'}`}>
                              Quick Win
                            </p>
                            <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                              <Clock size={10} />
                              {quickWin.timeEstimate}
                            </span>
                          </div>
                          <p className={`text-sm ${isSkipVerdict && hasSafetyIssues ? 'text-gray-500' : 'text-gray-700'}`}>
                            {quickWin.action}
                          </p>
                          {isSkipVerdict && hasSafetyIssues ? (
                            <p className="text-xs text-gray-500 mt-1.5 italic">
                              Even with this fix, safety concerns remain.
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                              <Sparkles size={10} className="inline mr-1" />
                              {quickWin.impact}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Summary (compact) */}
                  {qualification && (qualification.matchedSkills.length > 0 || qualification.missingSkills.length > 0) && (
                    <div className="flex gap-3 text-xs">
                      {qualification.matchedSkills.length > 0 && (
                        <div className="flex-1">
                          <p className="text-gray-500 mb-1.5">✓ You have</p>
                          <div className="flex flex-wrap gap-1">
                            {qualification.matchedSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                                {skill}
                              </span>
                            ))}
                            {qualification.matchedSkills.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                +{qualification.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {qualification.missingSkills.length > 0 && (
                        <div className="flex-1">
                          <p className="text-gray-500 mb-1.5">○ They want</p>
                          <div className="flex flex-wrap gap-1">
                            {qualification.missingSkills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700">
                                {skill}
                              </span>
                            ))}
                            {qualification.missingSkills.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                +{qualification.missingSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* 5. SMART BUTTON LOGIC - Footer */}
            {!loading && !error && analysis && (
              <div className="flex-shrink-0 p-5 border-t border-amber-100 bg-white/50">
                {isSkipVerdict ? (
                  // Skip Verdict: Primary = Dismiss, Secondary = Create Anyway
                  <div className="flex gap-3">
                    <button
                      onClick={onProceed}
                      className="flex-1 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                    >
                      Create Pocket Anyway
                    </button>
                    <button
                      onClick={onSkip}
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Dismiss Job
                    </button>
                  </div>
                ) : (
                  // Apply/Consider Verdict: Primary = Create Pocket, Secondary = Skip
                  <div className="flex gap-3">
                    <button
                      onClick={onSkip}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Skip This Job
                    </button>
                    <button
                      onClick={onProceed}
                      className="flex-1 px-4 py-3 rounded-xl bg-[#ffc425] text-[#1a1a1a] font-semibold hover:bg-[#ffce4a] transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FolderOpen size={18} />
                      Create Pocket
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer for error state */}
            {!loading && error && (
              <div className="flex-shrink-0 p-5 border-t border-amber-100 bg-white/50">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default JobAnalyzerModal
