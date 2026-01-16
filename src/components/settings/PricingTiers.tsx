'use client'

/**
 * PricingTiers - Display all 4 subscription tiers for comparison/upgrade
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Star, Crown, Sparkles, Rocket } from 'lucide-react'
import { type SubscriptionTier, subscriptionPlans, getTierLevel } from './types'

interface PricingTiersProps {
  isOpen: boolean
  onClose: () => void
  currentTier: SubscriptionTier
  onSelectTier: (tier: SubscriptionTier) => void
}

export function PricingTiers({ isOpen, onClose, currentTier, onSelectTier }: PricingTiersProps) {
  const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
    essential: <Zap size={28} />,
    starter: <Star size={28} />,
    premium: <Crown size={28} />,
    unlimited: <Rocket size={28} />,
    owner: <Sparkles size={28} />
  }

  const tierColors: Record<SubscriptionTier, {
    bg: string
    light: string
    text: string
    border: string
  }> = {
    essential: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    starter: {
      bg: 'from-[#ffc425] to-orange-500',
      light: 'bg-[#ffc425]/10',
      text: 'text-[#ffc425]',
      border: 'border-[#ffc425]/30'
    },
    premium: {
      bg: 'from-purple-500 to-pink-500',
      light: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    unlimited: {
      bg: 'from-emerald-500 to-teal-500',
      light: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    owner: {
      bg: 'from-amber-500 to-primary',
      light: 'bg-primary/10',
      text: 'text-primary',
      border: 'border-primary/30'
    }
  }

  const currentTierLevel = getTierLevel(currentTier)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-[#ffc425]" />
                  Choose Your Plan
                </h2>
                <p className="text-slate-400 mt-1">
                  Unlock more features to accelerate your job search
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Pricing grid - 4 columns for 4 tiers */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map((plan) => {
                const colors = tierColors[plan.id]
                const isCurrent = currentTier === plan.id
                const planTierLevel = getTierLevel(plan.id)
                const isDowngrade = planTierLevel < currentTierLevel
                const isUpgrade = planTierLevel > currentTierLevel

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -4 }}
                    className={`relative rounded-2xl border-2 transition-colors ${
                      plan.highlighted
                        ? `${colors.border} bg-slate-800/50`
                        : plan.id === 'unlimited'
                        ? `${colors.border} bg-gradient-to-b from-slate-800/80 to-slate-800/30`
                        : 'border-slate-700/50 bg-slate-800/30'
                    }`}
                  >
                    {/* Highlighted badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colors.bg} text-white whitespace-nowrap`}>
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Unlimited special badge */}
                    {plan.id === 'unlimited' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colors.bg} text-white whitespace-nowrap`}>
                          Best Value
                        </span>
                      </div>
                    )}

                    {/* Current badge */}
                    {isCurrent && (
                      <div className="absolute -top-3 right-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Current
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Icon and name */}
                      <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center mb-3 ${colors.text}`}>
                        {tierIcons[plan.id]}
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{plan.description}</p>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-slate-400 text-sm">/mo</span>
                      </div>

                      {/* Features - condensed for 4-column layout */}
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 6).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check size={14} className={`${colors.text} flex-shrink-0 mt-0.5`} />
                            <span className="text-xs text-slate-300 line-clamp-2">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 6 && (
                          <li className="text-xs text-slate-500 pl-5">
                            +{plan.features.length - 6} more features
                          </li>
                        )}
                      </ul>

                      {/* Limitations */}
                      {plan.limitations.length > 0 && (
                        <div className="mb-4 pt-3 border-t border-slate-700/50">
                          <ul className="space-y-1">
                            {plan.limitations.slice(0, 2).map((limitation, index) => (
                              <li key={index} className="text-xs text-slate-500">
                                • {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA button */}
                      <button
                        onClick={() => !isCurrent && isUpgrade && onSelectTier(plan.id)}
                        disabled={isCurrent || isDowngrade}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          isCurrent
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : isDowngrade
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : plan.id === 'unlimited'
                            ? `bg-gradient-to-r ${colors.bg} text-white hover:opacity-90`
                            : plan.highlighted
                            ? `bg-gradient-to-r ${colors.bg} text-[#0f172a] hover:opacity-90`
                            : `border-2 ${colors.border} ${colors.text} hover:bg-slate-700/50`
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : isDowngrade ? 'Downgrade' : `Choose ${plan.name}`}
                      </button>

                      {isDowngrade && !isCurrent && (
                        <p className="text-xs text-slate-500 text-center mt-2">
                          Contact support
                        </p>
                      )}

                      {/* ROI callout for Unlimited */}
                      {plan.id === 'unlimited' && !isCurrent && (
                        <p className="text-xs text-emerald-400/80 text-center mt-2">
                          16,567% ROI if you land a $75k job
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/50 p-6 text-center">
              <p className="text-slate-400 text-sm">
                All plans include a 7-day money-back guarantee. Cancel anytime.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                30% of all revenue goes to the Community Fund for Valencia grad businesses
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PricingTiers
