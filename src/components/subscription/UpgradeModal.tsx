'use client'

/**
 * UpgradeModal - Modal for prompting users to upgrade their subscription
 *
 * Used when users try to access features beyond their current tier.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lock,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  Star
} from 'lucide-react'
import { SUBSCRIPTION_TIERS, type SubscriptionTier, getTierConfig } from '@/lib/stripe'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: SubscriptionTier
  requiredTier: SubscriptionTier
  featureName: string
  featureDescription?: string
  onUpgrade?: (tierId: SubscriptionTier) => Promise<void>
}

// Tier display colors
const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'gray',
  essential: 'blue',
  starter: 'purple',
  premium: 'amber',
  unlimited: 'emerald'
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  requiredTier,
  featureName,
  featureDescription,
  onUpgrade
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(requiredTier)

  const requiredTierConfig = getTierConfig(requiredTier)
  const selectedTierConfig = getTierConfig(selectedTier)

  // Get tiers at or above required tier
  const availableTiers = SUBSCRIPTION_TIERS.filter(
    t => t.id !== 'free' &&
    SUBSCRIPTION_TIERS.findIndex(st => st.id === t.id) >=
    SUBSCRIPTION_TIERS.findIndex(st => st.id === requiredTier)
  )

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      if (onUpgrade) {
        await onUpgrade(selectedTier)
      } else {
        // Default behavior: redirect to subscription page
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: selectedTier })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl
          }
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to start checkout')
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Something went wrong. Please try again.')
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
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Upgrade Required</h2>
                  <p className="text-purple-100 text-sm">{featureName}</p>
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
          <div className="p-6">
            {/* Feature Description */}
            <div className="mb-6">
              <p className="text-gray-600">
                {featureDescription ||
                  `This feature requires a ${requiredTierConfig?.name || requiredTier} subscription or higher.`}
              </p>
            </div>

            {/* Tier Selection */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700">Select a plan:</p>
              {availableTiers.map((tier) => {
                const isSelected = selectedTier === tier.id
                const isRequired = tier.id === requiredTier

                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as SubscriptionTier)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {tier.popular ? (
                            <Star className="w-5 h-5" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{tier.name}</span>
                            {tier.popular && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                            {isRequired && !tier.popular && (
                              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                Minimum
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{tier.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ${tier.price}
                        </span>
                        <span className="text-gray-500 text-sm">/mo</span>
                      </div>
                    </div>

                    {/* Features Preview */}
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-purple-200"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {tier.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Trial Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>All plans include a <strong>7-day free trial</strong>. Cancel anytime.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade to {selectedTierConfig?.name}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Hook to manage upgrade modal state
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalProps, setModalProps] = useState<{
    requiredTier: SubscriptionTier
    featureName: string
    featureDescription?: string
  } | null>(null)

  const open = (
    requiredTier: SubscriptionTier,
    featureName: string,
    featureDescription?: string
  ) => {
    setModalProps({ requiredTier, featureName, featureDescription })
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
