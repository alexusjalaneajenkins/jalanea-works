'use client'

/**
 * User Impact Component
 *
 * Shows the individual user's contribution impact.
 */

import { Heart, Sparkles, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

interface UserImpactProps {
  userImpact: {
    totalContribution: number
    formattedContribution: string
    monthsSubscribed: number
    studentsHelpedEquivalent: number
  }
  isSubscribed: boolean
}

export default function UserImpact({ userImpact, isSubscribed }: UserImpactProps) {
  if (!isSubscribed || userImpact.totalContribution === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Join the Community</h3>
            <p className="text-purple-100 mt-1">
              When you subscribe to Jalanea Works, 10% of your subscription goes directly
              to help fellow Valencia students with emergency assistance, textbooks, and career resources.
            </p>
            <Link
              href="/dashboard/subscription"
              className="mt-4 inline-flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              View Plans
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl overflow-hidden">
      <div className="p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Your Impact</h3>
            <p className="text-pink-100 text-sm">Thank you for making a difference</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{userImpact.formattedContribution}</p>
            <p className="text-xs text-pink-100 mt-1">Total Contributed</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{userImpact.monthsSubscribed}</p>
            <p className="text-xs text-pink-100 mt-1">
              {userImpact.monthsSubscribed === 1 ? 'Month' : 'Months'} Supporting
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">~{userImpact.studentsHelpedEquivalent}</p>
            <p className="text-xs text-pink-100 mt-1">
              {userImpact.studentsHelpedEquivalent === 1 ? 'Student' : 'Students'} Helped
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 px-6 py-3 flex items-center justify-between">
        <p className="text-pink-100 text-sm">
          Your contributions help Valencia students succeed
        </p>
        <span className="text-white text-2xl">💜</span>
      </div>
    </div>
  )
}
