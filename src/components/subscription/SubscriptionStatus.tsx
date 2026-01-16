'use client'

/**
 * Subscription Status Component
 *
 * Shows current subscription status with usage stats.
 */

import {
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  FileText
} from 'lucide-react'

interface SubscriptionStatusProps {
  subscription: {
    tier: string
    tierName: string
    status: string
    startedAt?: string
    endsAt?: string
  }
  usage: {
    applicationsThisMonth: number
    applicationsLimit: number
    aiCreditsUsed: number
    aiCreditsLimit: number
  }
  onManageBilling?: () => void
  onCancelSubscription?: () => void
  onResumeSubscription?: () => void
}

export default function SubscriptionStatus({
  subscription,
  usage,
  onManageBilling,
  onCancelSubscription,
  onResumeSubscription
}: SubscriptionStatusProps) {
  const isFree = subscription.tier === 'free'
  const isCanceling = subscription.status === 'canceling'
  const isPastDue = subscription.status === 'past_due'

  // Calculate usage percentages
  const appUsagePercent = usage.applicationsLimit === -1
    ? 0
    : Math.min(100, (usage.applicationsThisMonth / usage.applicationsLimit) * 100)
  const aiUsagePercent = usage.aiCreditsLimit === -1
    ? 0
    : Math.min(100, (usage.aiCreditsUsed / usage.aiCreditsLimit) * 100)

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${
        isPastDue ? 'bg-red-50' :
        isCanceling ? 'bg-amber-50' :
        isFree ? 'bg-gray-50' :
        'bg-gradient-to-r from-purple-600 to-indigo-600'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-bold ${
                isFree || isCanceling || isPastDue ? 'text-gray-900' : 'text-white'
              }`}>
                {subscription.tierName}
              </h3>
              {isPastDue && (
                <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Past Due
                </span>
              )}
              {isCanceling && (
                <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Canceling
                </span>
              )}
              {subscription.status === 'active' && !isFree && (
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${
              isFree || isCanceling || isPastDue ? 'text-gray-600' : 'text-purple-100'
            }`}>
              {isFree ? 'Upgrade for more features' :
               isCanceling ? `Access until ${formatDate(subscription.endsAt)}` :
               isPastDue ? 'Please update your payment method' :
               `Member since ${formatDate(subscription.startedAt)}`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isFree && onManageBilling && (
              <button
                onClick={onManageBilling}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPastDue || isCanceling
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <CreditCard className="w-4 h-4 inline-block mr-1" />
                Manage Billing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-6 space-y-4">
        <h4 className="font-medium text-gray-900">This Month&apos;s Usage</h4>

        {/* Applications */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Job Applications
            </span>
            <span className="font-medium">
              {usage.applicationsThisMonth} / {usage.applicationsLimit === -1 ? '∞' : usage.applicationsLimit}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                appUsagePercent >= 90 ? 'bg-red-500' :
                appUsagePercent >= 70 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              style={{ width: usage.applicationsLimit === -1 ? '10%' : `${appUsagePercent}%` }}
            />
          </div>
        </div>

        {/* AI Credits */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              AI Credits
            </span>
            <span className="font-medium">
              {usage.aiCreditsUsed} / {usage.aiCreditsLimit === -1 ? '∞' : usage.aiCreditsLimit}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                aiUsagePercent >= 90 ? 'bg-red-500' :
                aiUsagePercent >= 70 ? 'bg-amber-500' :
                'bg-purple-500'
              }`}
              style={{ width: usage.aiCreditsLimit === -1 ? '10%' : `${aiUsagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      {!isFree && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          {isCanceling ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Your subscription will end on {formatDate(subscription.endsAt)}
              </p>
              {onResumeSubscription && (
                <button
                  onClick={onResumeSubscription}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Resume Subscription
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Next billing date: {formatDate(subscription.endsAt)}
              </p>
              {onCancelSubscription && (
                <button
                  onClick={onCancelSubscription}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
