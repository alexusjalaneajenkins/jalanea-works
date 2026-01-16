'use client'

/**
 * JobPocketModal - Modal for displaying generated Job Pockets
 * Shows tier-appropriate content based on user's subscription
 *
 * Tiers:
 * - Essential ($15): Tier 1 - 20-second quick intel
 * - Starter ($25): Tier 2 - 90-second breakdown
 * - Premium ($75): Tier 3 - 8-page deep dive (5/month)
 * - Unlimited ($150): Tier 3 - 12-page Deep Research (10/month)
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
  FileText
} from 'lucide-react'
import { PocketTier1, type PocketTier1Data } from './PocketTier1'
import { PocketTier2, type PocketTier2Data } from './PocketTier2'
import { PocketTier3, type PocketTier3Data } from './PocketTier3'

export type UserTier = 'essential' | 'starter' | 'premium' | 'unlimited'

interface JobPocketModalProps {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
  companyName: string
  userTier: UserTier
  pocketData: PocketTier1Data | PocketTier2Data | PocketTier3Data | null
  isGenerating?: boolean
  generationProgress?: number // 0-100
  onUpgrade?: () => void
}

const tierConfig = {
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
    label: 'Premium',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    readTime: '5-10 minutes',
    description: 'Complete 8-page intelligence report'
  },
  unlimited: {
    label: 'Unlimited',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    readTime: '10-15 minutes',
    description: '12-page Deep Research report with advanced analytics'
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
  targetTier: 'starter' | 'premium' | 'unlimited'
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

// Get the next tier to upgrade to
function getNextTier(currentTier: UserTier): 'starter' | 'premium' | 'unlimited' | null {
  switch (currentTier) {
    case 'essential':
      return 'starter'
    case 'starter':
      return 'premium'
    case 'premium':
      return 'unlimited'
    case 'unlimited':
      return null // Already at top tier
  }
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
  onUpgrade
}: JobPocketModalProps) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const config = tierConfig[userTier]

  useEffect(() => {
    // Show upgrade prompt after viewing pocket for a bit
    if (pocketData && !isGenerating) {
      const timer = setTimeout(() => {
        if (userTier !== 'unlimited') {
          setShowUpgradePrompt(true)
        }
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [pocketData, isGenerating, userTier])

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
                {/* Tier badge */}
                <div className={`px-3 py-1.5 rounded-full ${config.bgColor} flex items-center gap-2`}>
                  <Sparkles size={14} className={config.color} />
                  <span className={`text-sm font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Read time */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-sm">
                  <Clock size={14} />
                  {config.readTime}
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
                  {/* Render appropriate tier */}
                  {userTier === 'essential' && (
                    <>
                      <PocketTier1 data={pocketData as PocketTier1Data} />
                      {showUpgradePrompt && nextTier && (
                        <UpgradePrompt
                          currentTier={userTier}
                          targetTier={nextTier}
                          onUpgrade={onUpgrade}
                        />
                      )}
                    </>
                  )}

                  {userTier === 'starter' && (
                    <>
                      <PocketTier2 data={pocketData as PocketTier2Data} />
                      {showUpgradePrompt && nextTier && (
                        <UpgradePrompt
                          currentTier={userTier}
                          targetTier={nextTier}
                          onUpgrade={onUpgrade}
                        />
                      )}
                    </>
                  )}

                  {/* Premium and Unlimited both get Tier 3, but Unlimited gets extended version */}
                  {(userTier === 'premium' || userTier === 'unlimited') && (
                    <>
                      <PocketTier3
                        data={pocketData as PocketTier3Data}
                        jobTitle={jobTitle}
                        companyName={companyName}
                      />
                      {showUpgradePrompt && nextTier && (
                        <UpgradePrompt
                          currentTier={userTier}
                          targetTier={nextTier}
                          onUpgrade={onUpgrade}
                        />
                      )}
                    </>
                  )}
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
