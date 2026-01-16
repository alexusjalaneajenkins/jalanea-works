'use client'

/**
 * ScamShieldBadge - Shows scam risk level for a job
 */

import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

export type ScamRiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface ScamShieldBadgeProps {
  riskLevel: ScamRiskLevel
  reasons?: string[]
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const riskConfig = {
  low: {
    icon: ShieldCheck,
    label: 'Safe',
    color: 'bg-green-500/10 text-green-400 border-green-500/20'
  },
  medium: {
    icon: Shield,
    label: 'Caution',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  },
  high: {
    icon: ShieldAlert,
    label: 'Warning',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  critical: {
    icon: AlertTriangle,
    label: 'Danger',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  }
}

export function ScamShieldBadge({
  riskLevel,
  reasons,
  size = 'sm',
  showLabel = true
}: ScamShieldBadgeProps) {
  const config = riskConfig[riskLevel]
  const Icon = config.icon

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5'

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.color} ${sizeClass}`}
      title={reasons?.join(', ') || `Risk level: ${riskLevel}`}
    >
      <Icon size={iconSize} />
      {showLabel && <span className="font-medium">{config.label}</span>}
    </span>
  )
}

export default ScamShieldBadge
