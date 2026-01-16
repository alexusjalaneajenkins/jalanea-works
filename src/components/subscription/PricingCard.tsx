'use client'

/**
 * Pricing Card Component
 *
 * Displays a single pricing tier with features and CTA.
 */

import { Check, Star } from 'lucide-react'

interface PricingCardProps {
  tier: {
    id: string
    name: string
    price: number
    description: string
    features: string[]
    popular?: boolean
    communityContribution: number
  }
  currentTier?: string
  onSelect: (tierId: string) => void
  loading?: boolean
}

export default function PricingCard({
  tier,
  currentTier,
  onSelect,
  loading
}: PricingCardProps) {
  const isCurrentTier = currentTier === tier.id
  const isFree = tier.id === 'free'

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 transition-all ${
        tier.popular
          ? 'border-purple-500 shadow-lg shadow-purple-100 scale-105'
          : isCurrentTier
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-purple-200'
      }`}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      {/* Current Tier Badge */}
      {isCurrentTier && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
      <p className="text-gray-500 text-sm mt-1">{tier.description}</p>

      {/* Price */}
      <div className="mt-4">
        <span className="text-4xl font-bold text-gray-900">
          ${tier.price}
        </span>
        {!isFree && (
          <span className="text-gray-500 text-sm">/month</span>
        )}
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className={`w-5 h-5 flex-shrink-0 ${
              tier.popular ? 'text-purple-500' : 'text-green-500'
            }`} />
            <span className="text-gray-600 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(tier.id)}
        disabled={isCurrentTier || loading || isFree}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          isCurrentTier
            ? 'bg-green-100 text-green-700 cursor-default'
            : isFree
            ? 'bg-gray-100 text-gray-400 cursor-default'
            : tier.popular
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        } disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : isCurrentTier ? (
          'Current Plan'
        ) : isFree ? (
          'Free Trial'
        ) : currentTier && currentTier !== 'free' ? (
          tier.price > (getTierPrice(currentTier) || 0) ? 'Upgrade' : 'Downgrade'
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  )
}

// Helper to get tier price for comparison
function getTierPrice(tierId: string): number {
  const prices: Record<string, number> = {
    free: 0,
    essential: 15,
    starter: 25,
    premium: 75,
    unlimited: 150
  }
  return prices[tierId] || 0
}
