'use client'

/**
 * ATSScoreCard - Display ATS compatibility score with breakdown
 */

import { motion } from 'framer-motion'
import {
  Target,
  FileText,
  Type,
  BookOpen,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'

export interface ATSScoreBreakdown {
  keywords: number // 0-35
  sections: number // 0-30
  formatting: number // 0-20
  readability: number // 0-15
}

export interface ATSScoreCardProps {
  score: number
  breakdown?: ATSScoreBreakdown
  keywordMatchRate?: number
  criticalSuggestions?: number
  importantSuggestions?: number
  onOptimize?: () => void
  isCompact?: boolean
}

const scoreConfig = [
  { key: 'keywords', label: 'Keywords', max: 35, icon: Target },
  { key: 'sections', label: 'Sections', max: 30, icon: BookOpen },
  { key: 'formatting', label: 'Formatting', max: 20, icon: FileText },
  { key: 'readability', label: 'Readability', max: 15, icon: Type }
] as const

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-400'
  if (score >= 60) return 'bg-yellow-400'
  return 'bg-red-400'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 50) return 'Needs Work'
  return 'Poor'
}

export function ATSScoreCard({
  score,
  breakdown,
  keywordMatchRate,
  criticalSuggestions = 0,
  importantSuggestions = 0,
  onOptimize,
  isCompact = false
}: ATSScoreCardProps) {
  const scoreColor = getScoreColor(score)
  const scoreBgColor = getScoreBgColor(score)
  const scoreLabel = getScoreLabel(score)

  if (isCompact) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
            <div>
              <div className="text-sm font-medium text-white">ATS Score</div>
              <div className={`text-xs ${scoreColor}`}>{scoreLabel}</div>
            </div>
          </div>
          {onOptimize && (
            <button
              onClick={onOptimize}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffc425]/10 text-[#ffc425] hover:bg-[#ffc425]/20 transition-colors text-sm font-medium"
            >
              <TrendingUp size={16} />
              Optimize
            </button>
          )}
        </div>
        {(criticalSuggestions > 0 || importantSuggestions > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700">
            {criticalSuggestions > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={14} />
                {criticalSuggestions} critical
              </div>
            )}
            {importantSuggestions > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                <AlertCircle size={14} />
                {importantSuggestions} important
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Target size={20} className="text-[#ffc425]" />
          ATS Compatibility Score
        </h3>
        {keywordMatchRate !== undefined && (
          <div className="text-sm text-slate-400">
            {keywordMatchRate}% keyword match
          </div>
        )}
      </div>

      {/* Main Score */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-slate-700"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className={scoreBgColor}
              strokeDasharray={`${score * 3.52} 352`}
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${score * 3.52} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-4xl font-bold ${scoreColor}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-slate-400">out of 100</span>
          </div>
        </div>
        <div className={`mt-2 text-lg font-medium ${scoreColor}`}>
          {scoreLabel}
        </div>
      </div>

      {/* Score Breakdown */}
      {breakdown && (
        <div className="space-y-3 mb-6">
          {scoreConfig.map(({ key, label, max, icon: Icon }) => {
            const value = breakdown[key as keyof ATSScoreBreakdown]
            const percentage = Math.round((value / max) * 100)
            const isGood = percentage >= 70

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon size={14} className="text-slate-500" />
                    <span className="text-slate-300">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      {value}/{max}
                    </span>
                    {isGood ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <AlertCircle size={14} className="text-yellow-400" />
                    )}
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      percentage >= 70 ? 'bg-green-400' :
                      percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Issues Summary */}
      {(criticalSuggestions > 0 || importantSuggestions > 0) && (
        <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl mb-4">
          {criticalSuggestions > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm text-slate-300">
                {criticalSuggestions} critical issue{criticalSuggestions > 1 ? 's' : ''}
              </span>
            </div>
          )}
          {importantSuggestions > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm text-slate-300">
                {importantSuggestions} improvement{importantSuggestions > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Optimize Button */}
      {onOptimize && (
        <button
          onClick={onOptimize}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
        >
          <TrendingUp size={18} />
          Optimize Resume
        </button>
      )}

      {/* Tips */}
      <div className="mt-4 text-xs text-slate-500">
        {score >= 80 ? (
          <p>Your resume is well-optimized for ATS systems.</p>
        ) : score >= 60 ? (
          <p>Good progress! Address the suggestions to improve your score.</p>
        ) : (
          <p>Focus on adding missing keywords and improving formatting.</p>
        )}
      </div>
    </div>
  )
}

export default ATSScoreCard
