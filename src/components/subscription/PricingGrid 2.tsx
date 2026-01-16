'use client'

/**
 * Pricing Grid Component
 *
 * Displays all subscription tiers in a responsive grid.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PricingCard from './PricingCard'

interface Tier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  communityContribution: number
}

interface PricingGridProps {
  tiers: Tier[]
  currentTier?: string
  onSelectTier?: (tierId: string) => Promise<void>
}

export default function PricingGrid({
  tiers,
  currentTier,
  onSelectTier
}: PricingGridProps) {
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  const handleSelect = async (tierId: string) => {
    if (tierId === 'free' || tierId === currentTier) return

    setLoadingTier(tierId)

    try {
      if (onSelectTier) {
        await onSelectTier(tierId)
      } else {
        // Default behavior: create checkout session
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId })
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
      console.error('Selection error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingTier(null)
    }
  }

  // Filter out free tier for the grid (show separately or not at all)
  const paidTiers = tiers.filter(t => t.id !== 'free')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
      {paidTiers.map(tier => (
        <PricingCard
          key={tier.id}
          tier={tier}
          currentTier={currentTier}
          onSelect={handleSelect}
          loading={loadingTier === tier.id}
        />
      ))}
    </div>
  )
}
