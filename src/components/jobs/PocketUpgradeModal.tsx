'use client'

/**
 * Pocket Upgrade Modal
 *
 * Confirmation modal for upgrading a job pocket to a higher tier.
 * Warns users that this action is IRREVERSIBLE and uses credits.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  AlertTriangle,
  ArrowUp,
  Sparkles,
  Zap,
  Check,
  Loader2,
  CreditCard,
  Info
} from 'lucide-react'
import type { PocketType } from '@/lib/stripe'

interface PocketUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  pocketId: string
  jobTitle: string
  company: string
  currentType: PocketType
  targetType: 'advanced' | 'professional'
  creditsRemaining: number
  creditsAfterUpgrade: number
  canPurchase?: boolean
  onPurchaseClick?: () => void
}

// Type display configuration
const POCKET_TYPE_CONFIG = {
  regular: {
    name: 'Regular',
    description: '20-second quick brief',
    color: 'gray',
    icon: Sparkles
  },
  advanced: {
    name: 'Advanced',
    description: '90-second detailed breakdown',
    color: 'blue',
    icon: Zap
  },
  professional: {
    name: 'Professional',
    description: 'Full deep-research report',
    color: 'purple',
    icon: Sparkles
  }
}

export default function PocketUpgradeModal({
  isOpen,
  onClose,
  onConfirm,
  pocketId,
  jobTitle,
  company,
  currentType,
  targetType,
  creditsRemaining,
  creditsAfterUpgrade,
  canPurchase = false,
  onPurchaseClick
}: PocketUpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const targetConfig = POCKET_TYPE_CONFIG[targetType]
  const currentConfig = POCKET_TYPE_CONFIG[currentType]
  const hasCredits = creditsRemaining > 0

  const handleConfirm = async () => {
    if (!confirmed) {
      setError('Please acknowledge that this action cannot be undone')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade pocket')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-5 text-white ${
            targetType === 'advanced'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Upgrade Pocket</h2>
                  <p className="text-sm opacity-80">
                    {currentConfig.name} → {targetConfig.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Job Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 truncate">{jobTitle}</p>
              <p className="text-sm text-gray-500">{company}</p>
            </div>

            {/* Upgrade Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <targetConfig.icon className={`w-5 h-5 ${
                    targetType === 'advanced' ? 'text-blue-600' : 'text-purple-600'
                  }`} />
                  <span className="font-medium text-gray-900">{targetConfig.name} Pocket</span>
                </div>
                <span className="text-sm text-gray-500">{targetConfig.description}</span>
              </div>

              {/* Credits Info */}
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Credit Cost</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-900">1</span>
                  <span className="text-sm text-amber-700 ml-1">credit</span>
                </div>
              </div>

              {/* Remaining Credits */}
              {hasCredits ? (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Credits remaining after upgrade:</span>
                  <span className={`font-semibold ${
                    creditsAfterUpgrade === 0 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {creditsAfterUpgrade}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    No {targetType} credits remaining this month
                  </p>
                  {canPurchase && onPurchaseClick && (
                    <button
                      onClick={onPurchaseClick}
                      className="mt-2 w-full py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Purchase À La Carte (${targetType === 'advanced' ? 5 : 10})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800">
                    This action cannot be undone
                  </p>
                  <p className="text-xs text-amber-700">
                    Once upgraded, you cannot downgrade this pocket or get your credit back.
                    The upgrade will regenerate the pocket with {targetConfig.description.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            {hasCredits && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I understand this upgrade is <strong>permanent</strong> and will use 1 {targetType} credit.
                </span>
              </label>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 p-5 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !hasCredits || !confirmed}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                targetType === 'advanced'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirm Upgrade
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Hook to manage pocket upgrade modal state
 */
export function usePocketUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalProps, setModalProps] = useState<{
    pocketId: string
    jobTitle: string
    company: string
    currentType: PocketType
    targetType: 'advanced' | 'professional'
    creditsRemaining: number
    creditsAfterUpgrade: number
    canPurchase?: boolean
  } | null>(null)

  const open = (props: NonNullable<typeof modalProps>) => {
    setModalProps(props)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setModalProps(null)
  }

  return {
    isOpen,
    modalProps,
    open,
    close
  }
}
