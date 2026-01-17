'use client'

/**
 * OptimizationModal - ATS optimization flow with suggestions
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  FileText,
  Target,
  Loader2,
  Check,
  Copy
} from 'lucide-react'
import { ATSScoreCard, type ATSScoreBreakdown } from './ATSScoreCard'
import { KeywordSuggestions, type KeywordAnalysis } from './KeywordSuggestions'

export interface ATSSuggestion {
  type: 'critical' | 'important' | 'nice-to-have'
  category: 'keyword' | 'formatting' | 'content' | 'structure'
  title: string
  description: string
  example?: string
}

export interface OptimizationResult {
  score: number
  breakdown?: ATSScoreBreakdown
  keywords: KeywordAnalysis
  suggestions: ATSSuggestion[]
  formatting?: {
    score: number
    issues: string[]
  }
}

export interface OptimizationModalProps {
  isOpen: boolean
  onClose: () => void
  result: OptimizationResult | null
  isLoading?: boolean
  jobTitle?: string
  onApplySuggestion?: (suggestion: ATSSuggestion) => void
  onApplyAllSuggestions?: () => void
}

type TabId = 'overview' | 'keywords' | 'suggestions'

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'keywords', label: 'Keywords', icon: FileText },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb }
]

function getSuggestionIcon(type: string) {
  switch (type) {
    case 'critical':
      return <AlertTriangle size={16} className="text-red-400" />
    case 'important':
      return <AlertCircle size={16} className="text-yellow-400" />
    default:
      return <Lightbulb size={16} className="text-blue-400" />
  }
}

function getSuggestionBg(type: string) {
  switch (type) {
    case 'critical':
      return 'bg-red-500/10 border-red-500/20'
    case 'important':
      return 'bg-yellow-500/10 border-yellow-500/20'
    default:
      return 'bg-blue-500/10 border-blue-500/20'
  }
}

export function OptimizationModal({
  isOpen,
  onClose,
  result,
  isLoading = false,
  jobTitle,
  onApplySuggestion,
  onApplyAllSuggestions
}: OptimizationModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)

  if (!isOpen) return null

  const handleApplySuggestion = (suggestion: ATSSuggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
    }
    setAppliedSuggestions(prev => [...prev, suggestion.title])
  }

  const handleCopyExample = (example: string) => {
    navigator.clipboard.writeText(example)
    setCopiedText(example)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const criticalCount = result?.suggestions.filter(s => s.type === 'critical').length || 0
  const importantCount = result?.suggestions.filter(s => s.type === 'important').length || 0
  const niceToHaveCount = result?.suggestions.filter(s => s.type === 'nice-to-have').length || 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">ATS Optimization</h2>
                {jobTitle && (
                  <p className="text-sm text-muted-foreground">Optimizing for: {jobTitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Analyzing your resume...</p>
              <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && result && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 px-6 py-3 border-b border-border bg-background/50">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeTab === id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon size={16} />
                    {label}
                    {id === 'suggestions' && (criticalCount + importantCount > 0) && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                        {criticalCount + importantCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {activeTab === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Score Card */}
                    <ATSScoreCard
                      score={result.score}
                      breakdown={result.breakdown}
                      keywordMatchRate={result.keywords.matched.length > 0
                        ? Math.round((result.keywords.matched.length / (result.keywords.matched.length + result.keywords.missing.length)) * 100)
                        : 0
                      }
                      criticalSuggestions={criticalCount}
                      importantSuggestions={importantCount}
                    />

                    {/* Quick Stats */}
                    <div className="space-y-4">
                      {/* Issue Summary */}
                      <div className="bg-muted/50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-foreground mb-3">Issue Summary</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400">
                              <AlertTriangle size={16} />
                              <span className="text-sm">Critical Issues</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{criticalCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-yellow-400">
                              <AlertCircle size={16} />
                              <span className="text-sm">Important Improvements</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{importantCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-400">
                              <Lightbulb size={16} />
                              <span className="text-sm">Nice to Have</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">{niceToHaveCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Formatting Issues */}
                      {result.formatting && result.formatting.issues.length > 0 && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Formatting Issues</h4>
                          <ul className="space-y-2">
                            {result.formatting.issues.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                <AlertCircle size={14} className="mt-0.5 text-yellow-400 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Action */}
                      {onApplyAllSuggestions && criticalCount > 0 && (
                        <button
                          onClick={onApplyAllSuggestions}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-colors"
                        >
                          <Sparkles size={18} />
                          Auto-Fix Critical Issues
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'keywords' && (
                  <KeywordSuggestions
                    keywords={result.keywords}
                    jobTitle={jobTitle}
                  />
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {/* Group by type */}
                    {['critical', 'important', 'nice-to-have'].map((type) => {
                      const typeSuggestions = result.suggestions.filter(s => s.type === type)
                      if (typeSuggestions.length === 0) return null

                      return (
                        <div key={type}>
                          <h4 className={`text-sm font-medium mb-3 ${
                            type === 'critical' ? 'text-red-400' :
                            type === 'important' ? 'text-yellow-400' : 'text-blue-400'
                          }`}>
                            {type === 'critical' ? 'Critical Issues' :
                             type === 'important' ? 'Important Improvements' : 'Nice to Have'}
                          </h4>

                          <div className="space-y-3">
                            {typeSuggestions.map((suggestion, index) => {
                              const isApplied = appliedSuggestions.includes(suggestion.title)

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`p-4 rounded-xl border ${getSuggestionBg(suggestion.type)} ${
                                    isApplied ? 'opacity-50' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      {getSuggestionIcon(suggestion.type)}
                                      <div className="flex-1">
                                        <h5 className="font-medium text-foreground flex items-center gap-2">
                                          {suggestion.title}
                                          {isApplied && (
                                            <CheckCircle size={14} className="text-green-400" />
                                          )}
                                        </h5>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {suggestion.description}
                                        </p>
                                        {suggestion.example && (
                                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs text-muted-foreground">Example:</span>
                                              <button
                                                onClick={() => handleCopyExample(suggestion.example!)}
                                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                              >
                                                {copiedText === suggestion.example ? (
                                                  <>
                                                    <Check size={12} />
                                                    Copied
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy size={12} />
                                                    Copy
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                            <p className="text-sm text-foreground italic">
                                              &ldquo;{suggestion.example}&rdquo;
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {onApplySuggestion && !isApplied && (
                                      <button
                                        onClick={() => handleApplySuggestion(suggestion)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm"
                                      >
                                        Apply
                                        <ArrowRight size={14} />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {result.suggestions.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                        <h4 className="text-lg font-medium text-foreground mb-2">
                          Your resume looks great!
                        </h4>
                        <p className="text-muted-foreground">
                          No major issues found. Keep up the good work!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          {!isLoading && result && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/50">
              <p className="text-sm text-muted-foreground">
                {appliedSuggestions.length > 0 && (
                  <span className="text-green-400">
                    {appliedSuggestions.length} suggestion{appliedSuggestions.length > 1 ? 's' : ''} applied
                  </span>
                )}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OptimizationModal
