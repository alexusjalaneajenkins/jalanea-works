'use client'

/**
 * PocketUsageIndicator - Shows monthly pocket usage stats
 * Displays usage bars and limits for Premium/Unlimited tiers
 */

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Calendar, Info } from 'lucide-react'

interface UsageData {
  periodStart: string
  periodEnd: string
  byTier: Record<string, {
    used: number
    limit: number
    remaining: number
  }>
}

interface PocketUsageIndicatorProps {
  userTier: string
  usage: UsageData
  compact?: boolean
}

const tierConfig: Record<string, { label: string; color: string; bgColor: string; progressColor: string }> = {
  essential: {
    label: 'Essential',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500'
  },
  starter: {
    label: 'Starter',
    color: 'text-[#ffc425]',
    bgColor: 'bg-[#ffc425]/10',
    progressColor: 'bg-[#ffc425]'
  },
  premium: {
    label: 'Premium',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500'
  },
  unlimited: {
    label: 'Unlimited',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    progressColor: 'bg-emerald-500'
  }
}

function UsageBar({
  label,
  used,
  limit,
  color,
  bgColor,
  progressColor,
  isUnlimited
}: {
  label: string
  used: number
  limit: number
  color: string
  bgColor: string
  progressColor: string
  isUnlimited: boolean
}) {
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const isNearLimit = !isUnlimited && percentage >= 80
  const isAtLimit = !isUnlimited && used >= limit

  return (
    <div className={`p-3 rounded-lg ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${color}`}>{label}</span>
        <span className="text-sm text-slate-400">
          {isUnlimited ? (
            <span className="flex items-center gap-1">
              <Sparkles size={14} className={color} />
              Unlimited
            </span>
          ) : (
            <>
              <span className={isAtLimit ? 'text-red-400 font-semibold' : ''}>
                {used}
              </span>
              <span className="text-slate-500"> / {limit}</span>
            </>
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : progressColor
            }`}
          />
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-400 mt-1">
          {limit - used} remaining this month
        </p>
      )}

      {isAtLimit && (
        <p className="text-xs text-red-400 mt-1">
          Limit reached - resets at end of month
        </p>
      )}
    </div>
  )
}

export function PocketUsageIndicator({ userTier, usage, compact = false }: PocketUsageIndicatorProps) {
  const config = tierConfig[userTier] || tierConfig.essential
  const tierUsage = usage.byTier[userTier]

  // Calculate days until reset
  const periodEnd = new Date(usage.periodEnd)
  const now = new Date()
  const daysUntilReset = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Determine if tier has limits
  const hasLimits = userTier === 'premium' || userTier === 'unlimited'
  const isUnlimited = tierUsage?.limit >= 999999

  if (compact) {
    // Compact version for sidebar/header
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor}`}>
        <Sparkles size={16} className={config.color} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
        {hasLimits && !isUnlimited && tierUsage && (
          <span className="text-xs text-slate-400">
            ({tierUsage.used}/{tierUsage.limit} used)
          </span>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <TrendingUp size={20} className={config.color} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Monthly Usage</h3>
            <p className="text-sm text-slate-400">
              Your {config.label} tier pocket allowance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar size={14} />
          <span>Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Usage bars based on tier */}
      <div className="space-y-3">
        {/* Show Tier 1 usage for all users */}
        {usage.byTier.essential && (
          <UsageBar
            label="Tier 1 (Quick Brief)"
            used={usage.byTier.essential.used}
            limit={usage.byTier.essential.limit}
            color={tierConfig.essential.color}
            bgColor={tierConfig.essential.bgColor}
            progressColor={tierConfig.essential.progressColor}
            isUnlimited={usage.byTier.essential.limit >= 999999}
          />
        )}

        {/* Show Tier 2 usage for Starter+ */}
        {(userTier === 'starter' || userTier === 'premium' || userTier === 'unlimited') && usage.byTier.starter && (
          <UsageBar
            label="Tier 2 (90-sec Breakdown)"
            used={usage.byTier.starter.used}
            limit={usage.byTier.starter.limit}
            color={tierConfig.starter.color}
            bgColor={tierConfig.starter.bgColor}
            progressColor={tierConfig.starter.progressColor}
            isUnlimited={usage.byTier.starter.limit >= 999999}
          />
        )}

        {/* Show Tier 3 usage for Premium */}
        {userTier === 'premium' && usage.byTier.premium && (
          <UsageBar
            label="Tier 3 (8-page Report)"
            used={usage.byTier.premium.used}
            limit={usage.byTier.premium.limit}
            color={tierConfig.premium.color}
            bgColor={tierConfig.premium.bgColor}
            progressColor={tierConfig.premium.progressColor}
            isUnlimited={false}
          />
        )}

        {/* Show Tier 3+ usage for Unlimited */}
        {userTier === 'unlimited' && usage.byTier.unlimited && (
          <UsageBar
            label="Tier 3+ (Deep Research)"
            used={usage.byTier.unlimited.used}
            limit={usage.byTier.unlimited.limit}
            color={tierConfig.unlimited.color}
            bgColor={tierConfig.unlimited.bgColor}
            progressColor={tierConfig.unlimited.progressColor}
            isUnlimited={false}
          />
        )}
      </div>

      {/* Upgrade hint */}
      {userTier !== 'unlimited' && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <Info size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            {userTier === 'essential' && 'Upgrade to Starter ($25/mo) for detailed 90-second breakdowns'}
            {userTier === 'starter' && 'Upgrade to Premium ($75/mo) for 5 comprehensive 8-page reports per month'}
            {userTier === 'premium' && 'Upgrade to Unlimited ($150/mo) for 10 Deep Research reports per month'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default PocketUsageIndicator
