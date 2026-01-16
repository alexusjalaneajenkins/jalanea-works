'use client'

/**
 * Subscription Management Page
 *
 * View and manage subscription, upgrade/downgrade, billing.
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Heart,
  CheckCircle,
  XCircle,
  Sparkles,
  Shield,
  Users,
  Zap
} from 'lucide-react'
import {
  PricingGrid,
  SubscriptionStatus
} from '@/components/subscription'

interface SubscriptionData {
  subscription: {
    tier: string
    tierName: string
    status: string
    startedAt?: string
    endsAt?: string
    hasStripeCustomer: boolean
    hasActiveSubscription: boolean
  }
  usage: {
    applicationsThisMonth: number
    applicationsLimit: number
    aiCreditsUsed: number
    aiCreditsLimit: number
  }
  features: Record<string, boolean | number>
  availableTiers: Array<{
    id: string
    name: string
    price: number
    description: string
    features: string[]
    popular?: boolean
    communityContribution: number
  }>
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCanceled, setShowCanceled] = useState(false)

  // Check URL params for success/cancel
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      // Clear param from URL
      window.history.replaceState({}, '', '/dashboard/subscription')
    }
    if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true)
      window.history.replaceState({}, '', '/dashboard/subscription')
    }
  }, [searchParams])

  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle billing portal
  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST'
      })
      if (response.ok) {
        const result = await response.json()
        if (result.portalUrl) {
          window.location.href = result.portalUrl
        }
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  // Handle cancellation
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll keep access until the end of your billing period.')) {
      return
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediately: false })
      })

      if (response.ok) {
        // Refresh data
        const newData = await fetch('/api/subscription').then(r => r.json())
        setData(newData)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancellation error:', error)
      alert('Failed to cancel subscription. Please try again.')
    }
  }

  // Handle resume
  const handleResumeSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/cancel?resume=true', {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh data
        const newData = await fetch('/api/subscription').then(r => r.json())
        setData(newData)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to resume subscription')
      }
    } catch (error) {
      console.error('Resume error:', error)
      alert('Failed to resume subscription. Please try again.')
    }
  }

  // Handle tier selection
  const handleSelectTier = async (tierId: string) => {
    const currentTier = data?.subscription.tier

    if (currentTier && currentTier !== 'free' && data?.subscription.hasActiveSubscription) {
      // Upgrade/downgrade existing subscription
      try {
        const response = await fetch('/api/subscription/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newTierId: tierId })
        })

        const result = await response.json()

        if (result.requiresCheckout && result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        } else if (response.ok) {
          // Refresh data
          const newData = await fetch('/api/subscription').then(r => r.json())
          setData(newData)
          setShowSuccess(true)
        } else {
          alert(result.error || 'Failed to update subscription')
        }
      } catch (error) {
        console.error('Upgrade error:', error)
        throw error
      }
    } else {
      // Create new subscription via checkout
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout')
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Subscription updated successfully!</p>
              <p className="text-sm text-green-700">Thank you for supporting Valencia students.</p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-600 hover:text-green-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Canceled Banner */}
      {showCanceled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Checkout was canceled</p>
              <p className="text-sm text-amber-700">No changes were made to your subscription.</p>
            </div>
          </div>
          <button
            onClick={() => setShowCanceled(false)}
            className="text-amber-600 hover:text-amber-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Subscription Status */}
      {data && (
        <div className="mb-12">
          <SubscriptionStatus
            subscription={data.subscription}
            usage={data.usage}
            onManageBilling={data.subscription.hasStripeCustomer ? handleManageBilling : undefined}
            onCancelSubscription={
              data.subscription.hasActiveSubscription && data.subscription.status !== 'canceling'
                ? handleCancelSubscription
                : undefined
            }
            onResumeSubscription={
              data.subscription.status === 'canceling' ? handleResumeSubscription : undefined
            }
          />
        </div>
      )}

      {/* Future Community Fund Note */}
      <div className="mb-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Future: Community Fund</h3>
            <p className="text-purple-100 mt-1">
              Once Jalanea Works reaches sustainability ($55K/yr revenue), 10% of all subscriptions
              will support the Valencia College Community Fund—helping fellow students with emergency
              assistance, textbooks, and career resources.{' '}
              <a href="/dashboard/community" className="underline hover:text-white">Learn more →</a>
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600 mt-2">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>

        {data && (
          <PricingGrid
            tiers={data.availableTiers}
            currentTier={data.subscription.tier}
            onSelectTier={handleSelectTier}
          />
        )}
      </div>

      {/* Feature Comparison */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Why Upgrade?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">AI-Powered Features</h4>
            <p className="text-gray-600 text-sm mt-2">
              Get personalized job matches, resume optimization, and interview coaching
              powered by advanced AI.
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Unlimited Applications</h4>
            <p className="text-gray-600 text-sm mt-2">
              Apply to as many jobs as you want with Premium and Unlimited plans.
              Never miss an opportunity.
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Priority Support</h4>
            <p className="text-gray-600 text-sm mt-2">
              Get help when you need it with priority support for Premium and
              Unlimited subscribers.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Can I cancel anytime?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yes! You can cancel your subscription at any time. You&apos;ll keep access until
              the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What about the Community Fund?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Once we reach sustainable revenue ($55K/year), 10% of all subscriptions will go to
              the Valencia College Community Fund to help students with emergency expenses.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Can I upgrade or downgrade?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Absolutely! You can change your plan at any time. Upgrades take effect immediately,
              and downgrades take effect at the next billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Is there a free trial?</h4>
            <p className="text-gray-600 text-sm mt-1">
              Yes! All paid plans include a 7-day free trial. You won&apos;t be charged until
              the trial ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
