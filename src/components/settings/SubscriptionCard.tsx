'use client'

/**
 * SubscriptionCard - Display current subscription and usage
 */

import { motion } from 'framer-motion'
import { Crown, Zap, Star, Sparkles, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { type UserSubscription, type UsageStats, getPlanByTier, type SubscriptionTier } from './types'

interface SubscriptionCardProps {
  subscription: UserSubscription
  usage: UsageStats
  onManage: () => void
  onUpgrade: () => void
}

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const percentage = limit ? Math.min((used / limit) * 100, 100) : 0
  const isUnlimited = limit === null
  const isNearLimit = limit && percentage >= 80

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={isNearLimit ? 'text-orange-400' : 'text-slate-300'}>
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isNearLimit ? 'bg-orange-500' : 'bg-[#ffc425]'
            }`}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 bg-gradient-to-r from-[#ffc425]/20 to-[#ffc425]/5 rounded-full" />
      )}
    </div>
  )
}

export function SubscriptionCard({ subscription, usage, onManage, onUpgrade }: SubscriptionCardProps) {
  const plan = getPlanByTier(subscription.tier)
  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
    essential: <Zap size={24} className="text-blue-400" />,
    starter: <Star size={24} className="text-[#ffc425]" />,
    premium: <Crown size={24} className="text-purple-400" />,
    unlimited: <Sparkles size={24} className="text-emerald-400" />,
    owner: <Crown size={24} className="text-primary" />
  }

  const tierGradients: Record<SubscriptionTier, string> = {
    essential: 'from-blue-500/20 to-blue-600/5',
    starter: 'from-[#ffc425]/20 to-orange-500/5',
    premium: 'from-purple-500/20 to-pink-500/5',
    unlimited: 'from-emerald-500/20 to-teal-500/5',
    owner: 'from-primary/20 to-amber-500/5'
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${tierGradients[subscription.tier]} p-6`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center">
              {tierIcons[subscription.tier]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              <p className="text-slate-400">{plan.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">${plan.price}</p>
            <p className="text-sm text-slate-400">per month</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex gap-3 mt-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            subscription.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : subscription.status === 'trialing'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              subscription.status === 'active' ? 'bg-green-400' :
              subscription.status === 'trialing' ? 'bg-blue-400' : 'bg-orange-400'
            }`} />
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-slate-700/50 text-slate-300">
            <Calendar size={14} />
            {daysRemaining} days remaining
          </span>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-400" />
            <p className="text-sm text-orange-300">
              Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Usage stats */}
      <div className="p-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Usage This Month
        </h3>

        <UsageBar
          used={usage.pocketsGenerated}
          limit={usage.pocketsLimit}
          label="Job Pockets"
        />

        {/* Show Advanced Pockets for Premium and Unlimited tiers */}
        {(subscription.tier === 'premium' || subscription.tier === 'unlimited') && (
          <UsageBar
            used={usage.advancedPocketsGenerated}
            limit={usage.advancedPocketsLimit}
            label="Advanced Pockets (Deep Research)"
          />
        )}

        <UsageBar
          used={usage.resumesCreated}
          limit={usage.resumesLimit}
          label="Resumes"
        />
        <UsageBar
          used={usage.applicationsTracked}
          limit={usage.applicationsLimit}
          label="Applications"
        />

        {/* Show AI Messages for tiers that have limits */}
        {usage.aiMessagesLimit !== null && (
          <UsageBar
            used={usage.aiMessagesUsed}
            limit={usage.aiMessagesLimit}
            label="AI Messages"
          />
        )}

        {usage.aiSuggestionsLimit !== null && (
          <UsageBar
            used={usage.aiSuggestionsUsed}
            limit={usage.aiSuggestionsLimit}
            label="AI Suggestions"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-0 flex gap-3">
        <button
          onClick={onManage}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-colors"
        >
          <CreditCard size={18} />
          Manage Billing
        </button>
        {subscription.tier !== 'unlimited' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUpgrade}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#ffc425] to-orange-500 text-[#0f172a] rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Crown size={18} />
            Upgrade Plan
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default SubscriptionCard
