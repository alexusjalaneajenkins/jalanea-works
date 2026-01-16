'use client'

/**
 * JobPocketModal - Modal for displaying generated Job Pockets
 * Shows tier-appropriate content based on pocket type
 *
 * Pocket Types (Updated January 2026):
 * - Regular: 20-second quick intel (free with subscription)
 * - Advanced: 90-second breakdown ($5 à la carte or included in tiers)
 * - Professional: Full deep-research report ($10 à la carte or included in tiers)
 *
 * Subscription Tiers:
 * - Essential ($15): 30 regular pockets
 * - Starter ($25): 100 regular + 1 advanced/month
 * - Professional ($50): Unlimited regular + 5 advanced or professional/month
 * - Max ($100): Unlimited regular + 10 advanced or professional/month
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  Share2,
  Printer,
  Sparkles,
  Clock,
  Lock,
  ArrowRight,
  ArrowUp,
  FileText,
  Zap
} from 'lucide-react'
import { PocketTier1, type PocketTier1Data } from './PocketTier1'
import { PocketTier2, type PocketTier2Data } from './PocketTier2'
import { PocketTier3, type PocketTier3Data } from './PocketTier3'
import type { PocketType, SubscriptionTier } from '@/lib/stripe'

// Legacy support - map old tier names to new structure
export type UserTier = 'essential' | 'starter' | 'premium' | 'unlimited' | 'professional' | 'max' | 'free'

interface JobPocketModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  userTier: UserTier
  pocketType?: PocketType // New: explicit pocket type
  pocketData: PocketTier1Data | PocketTier2Data | PocketTier3Data | null
  isGenerating?: boolean
  generationProgress?: number // 0-100
  onUpgrade?: () => void
  onUpgradePocket?: (targetType: 'advanced' | 'professional') => void // New: pocket upgrade handler
  canUpgradeTo?: {
    advanced: boolean
    professional: boolean
  }
}

// Pocket type configuration (primary display)
const pocketTypeConfig = {
  regular: {
    label: 'Regular',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    readTime: '20 seconds',
    description: 'Quick qualification check and key talking points'
  },
  advanced: {
    label: 'Advanced',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    readTime: '90 seconds',
    description: 'Role breakdown, culture fit, and positioning strategy'
  },
  professional: {
    label: 'Professional',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    readTime: '5-10 minutes',
    description: 'Complete deep-research intelligence report'
  }
}

// Legacy tier config for backwards compatibility
const tierConfig = {
  free: {
    label: 'Free',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    readTime: '20 seconds',
    description: 'Quick qualification check and key talking points'
  },
  essential: {
    label: 'Essential',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    readTime: '20 seconds',
    description: 'Quick qualification check and key talking points'
  },
  starter: {
    label: 'Starter',
    color: 'text-[#ffc425]',
    bgColor: 'bg-[#ffc425]/20',
    readTime: '90 seconds',
    description: 'Role breakdown, culture fit, and positioning strategy'
  },
  premium: {
    label: 'Professional',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    readTime: '5-10 minutes',
    description: 'Complete 8-page intelligence report'
  },
  professional: {
    label: 'Professional',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    readTime: '5-10 minutes',
    description: 'Complete deep-research intelligence report'
  },
  unlimited: {
    label: 'Max',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    readTime: '10-15 minutes',
    description: '12-page Deep Research report with advanced analytics'
  },
  max: {
    label: 'Max',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    readTime: '10-15 minutes',
    description: 'Deep Research report with advanced analytics'
  }
}

function LoadingState({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-[#ffc425] mb-6"
      />
      <h3 className="text-xl font-bold text-white mb-2">Generating Your Job Pocket</h3>
      <p className="text-slate-400 text-center mb-6">
        Our AI is analyzing the job posting and creating personalized insights...
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#ffc425] rounded-full"
          />
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">{progress}% complete</p>
      </div>

      <div className="mt-8 space-y-2 text-sm text-slate-500">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress >= 20 ? 1 : 0 }}
        >
          ✓ Analyzing job requirements...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress >= 40 ? 1 : 0 }}
        >
          ✓ Matching with your profile...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress >= 60 ? 1 : 0 }}
        >
          ✓ Generating talking points...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: progress >= 80 ? 1 : 0 }}
        >
          ✓ Preparing interview insights...
        </motion.p>
      </div>
    </div>
  )
}

function UpgradePrompt({
  currentTier,
  targetTier,
  onUpgrade
}: {
  currentTier: UserTier
  targetTier: 'starter' | 'premium' | 'unlimited' | 'professional' | 'max'
  onUpgrade?: () => void
}) {
  const config = tierConfig[targetTier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#ffc425]/20 flex items-center justify-center flex-shrink-0">
          <Lock size={24} className="text-[#ffc425]" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-1">
            Unlock {config.label} Insights
          </h4>
          <p className="text-slate-400 text-sm mb-4">
            {config.description}. Upgrade to get {config.readTime} of additional intelligence.
          </p>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            Upgrade to {config.label}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Pocket upgrade prompt (for upgrading pocket type within the same job)
function PocketUpgradePrompt({
  currentType,
  canUpgradeTo,
  onUpgrade
}: {
  currentType: PocketType
  canUpgradeTo?: { advanced: boolean; professional: boolean }
  onUpgrade?: (targetType: 'advanced' | 'professional') => void
}) {
  if (!canUpgradeTo || (!canUpgradeTo.advanced && !canUpgradeTo.professional)) {
    return null
  }

  const nextType = currentType === 'regular'
    ? (canUpgradeTo.advanced ? 'advanced' : canUpgradeTo.professional ? 'professional' : null)
    : currentType === 'advanced'
      ? (canUpgradeTo.professional ? 'professional' : null)
      : null

  if (!nextType) return null

  const config = pocketTypeConfig[nextType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <ArrowUp size={24} className={config.color} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-1">
            Upgrade to {config.label} Pocket
          </h4>
          <p className="text-slate-400 text-sm mb-4">
            {config.description}. Get {config.readTime} of detailed intelligence.
          </p>
          <button
            onClick={() => onUpgrade?.(nextType)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              nextType === 'advanced'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            Upgrade This Pocket
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Get the next subscription tier to upgrade to
function getNextTier(currentTier: UserTier): 'starter' | 'premium' | 'unlimited' | 'professional' | 'max' | null {
  switch (currentTier) {
    case 'free':
      return 'starter'
    case 'essential':
      return 'starter'
    case 'starter':
      return 'professional'
    case 'premium':
    case 'professional':
      return 'max'
    case 'unlimited':
    case 'max':
      return null // Already at top tier
    default:
      return null
  }
}

export function JobPocketModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  userTier,
  pocketType = 'regular',
  pocketData,
  isGenerating = false,
  generationProgress = 0,
  onUpgrade,
  onUpgradePocket,
  canUpgradeTo
}: JobPocketModalProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const config = tierConfig[userTier]
  const pocketConfig = pocketTypeConfig[pocketType]

  useEffect(() => {
    // Show upgrade prompt after viewing pocket for a bit
    if (pocketData && !isGenerating) {
      const timer = setTimeout(() => {
        // Show pocket upgrade prompt if not at max tier and can upgrade pocket
        if (pocketType !== 'professional' && (canUpgradeTo?.advanced || canUpgradeTo?.professional)) {
          setShowUpgradePrompt(true)
        }
        // Or show subscription upgrade prompt if not at max tier
        else if (!['max', 'unlimited'].includes(userTier)) {
          setShowUpgradePrompt(true)
        }
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [pocketData, isGenerating, userTier, pocketType, canUpgradeTo])

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

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job Pocket: ${jobTitle} at ${companyName}`,
          text: `Check out this job opportunity!`
        })
      } catch (err) {
        // User cancelled or share failed
      }
    }
  }

  const nextTier = getNextTier(userTier)

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-24 bg-[#0f172a] rounded-2xl border border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffc425]/20 flex items-center justify-center">
                  <FileText size={20} className="text-[#ffc425]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Job Pocket</h2>
                  <p className="text-sm text-slate-400">
                    {jobTitle} at {companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Pocket type badge (primary) */}
                <div className={`px-3 py-1.5 rounded-full ${pocketConfig.bgColor} flex items-center gap-2`}>
                  {pocketType === 'advanced' ? (
                    <Zap size={14} className={pocketConfig.color} />
                  ) : (
                    <Sparkles size={14} className={pocketConfig.color} />
                  )}
                  <span className={`text-sm font-medium ${pocketConfig.color}`}>
                    {pocketConfig.label}
                  </span>
                </div>

                {/* Read time */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                  <Clock size={14} />
                  {pocketConfig.readTime}
                </div>

                {/* Actions */}
                {!isGenerating && pocketData && (
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Print"
                    >
                      <Printer size={18} />
                    </button>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isGenerating ? (
                <LoadingState progress={generationProgress} />
              ) : pocketData ? (
                <div>
                  {/* Render based on pocket type (primary) or fall back to user tier */}
                  {pocketType === 'regular' || (userTier === 'essential' || userTier === 'free') ? (
                    <>
                      <PocketTier1 data={pocketData as PocketTier1Data} />
                      {showUpgradePrompt && (
                        <>
                          {/* Show pocket upgrade prompt first if available */}
                          {(canUpgradeTo?.advanced || canUpgradeTo?.professional) && (
                            <PocketUpgradePrompt
                              currentType={pocketType}
                              canUpgradeTo={canUpgradeTo}
                              onUpgrade={onUpgradePocket}
                            />
                          )}
                          {/* Show subscription upgrade prompt if applicable */}
                          {nextTier && !canUpgradeTo?.advanced && !canUpgradeTo?.professional && (
                            <UpgradePrompt
                              currentTier={userTier}
                              targetTier={nextTier}
                              onUpgrade={onUpgrade}
                            />
                          )}
                        </>
                      )}
                    </>
                  ) : pocketType === 'advanced' || userTier === 'starter' ? (
                    <>
                      <PocketTier2 data={pocketData as PocketTier2Data} />
                      {showUpgradePrompt && (
                        <>
                          {/* Show pocket upgrade prompt first if available */}
                          {canUpgradeTo?.professional && (
                            <PocketUpgradePrompt
                              currentType={pocketType}
                              canUpgradeTo={canUpgradeTo}
                              onUpgrade={onUpgradePocket}
                            />
                          )}
                          {/* Show subscription upgrade prompt if applicable */}
                          {nextTier && !canUpgradeTo?.professional && (
                            <UpgradePrompt
                              currentTier={userTier}
                              targetTier={nextTier}
                              onUpgrade={onUpgrade}
                            />
                          )}
                        </>
                      )}
                    </>
                  ) : (pocketType === 'professional' || userTier === 'premium' || userTier === 'professional' || userTier === 'unlimited' || userTier === 'max') ? (
                    <>
                      <PocketTier3
                        data={pocketData as PocketTier3Data}
                        jobTitle={jobTitle}
                        companyName={companyName}
                      />
                      {/* Professional pockets have no upgrade, but may show subscription upgrade */}
                      {showUpgradePrompt && nextTier && (
                        <UpgradePrompt
                          currentTier={userTier}
                          targetTier={nextTier}
                          onUpgrade={onUpgrade}
                        />
                      )}
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText size={48} className="text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Pocket Data</h3>
                  <p className="text-slate-400">
                    Something went wrong generating your pocket. Please try again.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isGenerating && pocketData && (
              <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-800/30">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.open(`/dashboard/jobs/${encodeURIComponent(jobTitle.toLowerCase().replace(/ /g, '-'))}/apply`, '_blank')}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
                  >
                    Apply to This Job
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
