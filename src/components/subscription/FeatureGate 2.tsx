'use client'

/**
 * Feature Gate Component
 *
 * Wraps features that require specific subscription tiers.
 * Shows upgrade prompt if user doesn't have access.
 */

import { ReactNode } from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type SubscriptionTier = 'free' | 'essential' | 'starter' | 'premium' | 'unlimited'

interface FeatureGateProps {
  children: ReactNode
  requiredTier: SubscriptionTier
  currentTier: SubscriptionTier
  featureName: string
  description?: string
  compact?: boolean
}

// Tier hierarchy for comparison
const TIER_LEVELS: Record<SubscriptionTier, number> = {
  free: 0,
  essential: 1,
  starter: 2,
  premium: 3,
  unlimited: 4
}

// Tier display names
const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  essential: 'Essential',
  starter: 'Starter',
  premium: 'Premium',
  unlimited: 'Unlimited'
}

export default function FeatureGate({
  children,
  requiredTier,
  currentTier,
  featureName,
  description,
  compact = false
}: FeatureGateProps) {
  const hasAccess = TIER_LEVELS[currentTier] >= TIER_LEVELS[requiredTier]

  if (hasAccess) {
    return <>{children}</>
  }

  // Compact version (inline badge)
  if (compact) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            href="/dashboard/subscription"
            className="bg-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-purple-700 transition-colors"
          >
            <Lock className="w-3 h-3" />
            {TIER_NAMES[requiredTier]}+ Required
          </Link>
        </div>
      </div>
    )
  }

  // Full upgrade prompt
  return (
    <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 bg-purple-50/50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{featureName}</h3>
          <p className="text-gray-600 text-sm mt-1">
            {description || `This feature requires a ${TIER_NAMES[requiredTier]} subscription or higher.`}
          </p>
          <Link
            href="/dashboard/subscription"
            className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Upgrade to {TIER_NAMES[requiredTier]}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return TIER_LEVELS[currentTier] >= TIER_LEVELS[requiredTier]
}

/**
 * Get minimum tier for a feature
 */
export function getRequiredTier(feature: string): SubscriptionTier {
  const featureMap: Record<string, SubscriptionTier> = {
    'skills-translation': 'starter',
    'career-coach': 'premium',
    'shadow-calendar': 'essential',
    'interview-prep': 'starter',
    'ai-job-matching': 'essential',
    'priority-support': 'premium',
    'unlimited-applications': 'premium',
    'unlimited-ai': 'unlimited'
  }
  return featureMap[feature] || 'free'
}
