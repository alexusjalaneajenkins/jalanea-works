'use client'

/**
 * TransactionHistory - Recent community fund transactions
 *
 * Shows recent contributions to and allocations from the community fund.
 */

import { Clock, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/community-fund'

interface Allocation {
  category: string
  amount: number
  description: string
  recipientCount: number
  semester: string
  allocatedAt: string
}

interface TransactionHistoryProps {
  allocations: Allocation[]
  totalBalance?: number
}

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  emergency: { icon: '🆘', color: 'text-red-700', bgColor: 'bg-red-50' },
  textbooks: { icon: '📚', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  career: { icon: '💼', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  technology: { icon: '💻', color: 'text-green-700', bgColor: 'bg-green-50' },
  transportation: { icon: '🚌', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  business_grant: { icon: '🏪', color: 'text-pink-700', bgColor: 'bg-pink-50' },
  other: { icon: '💰', color: 'text-gray-700', bgColor: 'bg-gray-50' }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateString)
}

export default function TransactionHistory({
  allocations,
  totalBalance
}: TransactionHistoryProps) {
  if (!allocations || allocations.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Fund allocations will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Allocations</h3>
            <p className="text-sm text-gray-500 mt-1">
              How funds have been distributed
            </p>
          </div>
          {totalBalance !== undefined && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y">
        {allocations.map((allocation, idx) => {
          const config = CATEGORY_CONFIG[allocation.category] || CATEGORY_CONFIG.other
          return (
            <div
              key={idx}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{config.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {allocation.category.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {allocation.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold ${config.color}`}>
                        {formatCurrency(allocation.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {allocation.recipientCount} {allocation.recipientCount === 1 ? 'recipient' : 'recipients'}
                    </span>
                    <span>{allocation.semester}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(allocation.allocatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <p className="text-center text-sm text-gray-500">
          All allocations are verified and transparent
        </p>
      </div>
    </div>
  )
}
