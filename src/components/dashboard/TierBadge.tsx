'use client'

/**
 * TierBadge - Displays user's subscription tier
 * Essential | Starter | Premium | Max
 */

import { motion } from 'framer-motion'
import { Zap, Star, Crown, Rocket, Sparkles } from 'lucide-react'

export type Tier = 'essential' | 'starter' | 'professional' | 'max'

interface TierBadgeProps {
  tier: Tier
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const tierConfig = {
  essential: {
    label: 'Essential',
    icon: Zap,
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    description: '$15/mo • 5 pockets/month'
  },
  starter: {
    label: 'Starter',
    icon: Star,
    color: '#ffc425',
    bgColor: 'bg-[#ffc425]/10',
    borderColor: 'border-[#ffc425]/20',
    textColor: 'text-[#ffc425]',
    description: '$25/mo • 15 pockets/month'
  },
  professional: {
    label: 'Professional',
    icon: Crown,
    color: '#a855f7',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    description: '$50/mo • Unlimited AI'
  },
  max: {
    label: 'Max',
    icon: Rocket,
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    description: '$100/mo • 10 Advanced/month'
  }
}

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    iconSize: 12,
    textSize: 'text-xs'
  },
  md: {
    padding: 'px-3 py-1.5',
    iconSize: 14,
    textSize: 'text-sm'
  },
  lg: {
    padding: 'px-4 py-2',
    iconSize: 16,
    textSize: 'text-base'
  }
}

export function TierBadge({
  tier,
  showLabel = true,
  size = 'md',
  onClick
}: TierBadgeProps) {
  const config = tierConfig[tier]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full
        ${sizes.padding} ${config.bgColor} border ${config.borderColor}
        ${onClick ? 'cursor-pointer hover:opacity-90' : ''}
        transition-all
      `}
    >
      <Icon size={sizes.iconSize} className={config.textColor} />
      {showLabel && (
        <span className={`${sizes.textSize} font-semibold ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </Component>
  )
}

// Full tier display with description (for settings/upgrade pages)
export function TierCard({
  tier,
  isActive = false,
  onSelect
}: {
  tier: Tier
  isActive?: boolean
  onSelect?: () => void
}) {
  const config = tierConfig[tier]
  const Icon = config.icon

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all
        ${isActive
          ? `${config.bgColor} border-2`
          : 'bg-transparent border-slate-700 hover:border-slate-600'
        }
      `}
      style={{ borderColor: isActive ? config.color : undefined }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center`}
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon size={20} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{config.label}</span>
            {isActive && (
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-medium">
                Current
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">{config.description}</p>
        </div>
        {!isActive && (
          <Sparkles size={16} className="text-slate-500" />
        )}
      </div>
    </motion.button>
  )
}

export default TierBadge
