'use client'

/**
 * Community Fund Page
 *
 * Shows our commitment to supporting Valencia students once sustainable.
 * Community contributions will begin after reaching $55k/yr revenue threshold.
 */

import { useState, useEffect } from 'react'
import {
  Heart,
  Target,
  TrendingUp,
  GraduationCap,
  Sparkles,
  Clock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

// Revenue milestone data
const REVENUE_MILESTONES = [
  { amount: 1000, label: '$1K/mo', description: 'Cover basic operating costs' },
  { amount: 2500, label: '$2.5K/mo', description: 'Sustainable side income' },
  { amount: 4583, label: '$4.6K/mo', description: '$55K/yr - Community Fund activates!', isTarget: true },
  { amount: 8333, label: '$8.3K/mo', description: '$100K/yr - Full-time sustainable' },
]

// Future fund categories
const PLANNED_CATEGORIES = [
  {
    icon: '🆘',
    name: 'Emergency Assistance',
    percentage: 40,
    description: 'Help students facing unexpected hardships'
  },
  {
    icon: '📚',
    name: 'Textbooks & Materials',
    percentage: 25,
    description: 'Cover required course materials'
  },
  {
    icon: '💼',
    name: 'Career Resources',
    percentage: 15,
    description: 'Professional attire and certifications'
  },
  {
    icon: '💻',
    name: 'Technology Access',
    percentage: 10,
    description: 'Laptops and software for students'
  },
  {
    icon: '🚌',
    name: 'Transportation',
    percentage: 10,
    description: 'LYNX passes and gas assistance'
  },
]

export default function CommunityFundPage() {
  const [currentRevenue, setCurrentRevenue] = useState(0) // Will come from API later
  const targetRevenue = 4583 // $55k/yr = $4,583/mo
  const progressPercent = Math.min(100, (currentRevenue / targetRevenue) * 100)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Community Fund</h1>
        </div>
        <p className="text-gray-600">
          Our commitment to giving back to Valencia College students
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-purple-100 leading-relaxed">
              The Community Fund will launch once Jalanea Works reaches sustainable revenue
              ($55K/year). We believe in being financially responsible first, so we can give
              back consistently and meaningfully to our Valencia community.
            </p>
          </div>
        </div>
      </div>

      {/* Progress to Sustainability */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Road to Sustainability</h3>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Once we reach $4,583/month in revenue (equivalent to a $55K annual salary),
          10% of all subscription revenue will go directly to the Community Fund.
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Current Progress</span>
            <span className="font-medium text-purple-600">
              ${currentRevenue.toLocaleString()} / ${targetRevenue.toLocaleString()}/mo
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progressPercent.toFixed(1)}% to Community Fund activation
          </p>
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          {REVENUE_MILESTONES.map((milestone, idx) => {
            const isReached = currentRevenue >= milestone.amount
            const isCurrent = currentRevenue < milestone.amount &&
              (idx === 0 || currentRevenue >= REVENUE_MILESTONES[idx - 1].amount)

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  milestone.isTarget
                    ? 'bg-pink-50 border-2 border-pink-200'
                    : isReached
                    ? 'bg-green-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isReached
                    ? 'bg-green-500 text-white'
                    : milestone.isTarget
                    ? 'bg-pink-200 text-pink-600'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isReached ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      milestone.isTarget ? 'text-pink-700' : 'text-gray-900'
                    }`}>
                      {milestone.label}
                    </span>
                    {milestone.isTarget && (
                      <span className="text-xs bg-pink-200 text-pink-700 px-2 py-0.5 rounded-full">
                        Target
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{milestone.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* What the Fund Will Support */}
      <div className="bg-white rounded-xl border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Planned Fund Allocation</h3>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          When activated, 10% of subscription revenue will be distributed to help
          Valencia students in these areas:
        </p>

        <div className="space-y-3">
          {PLANNED_CATEGORIES.map((category, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-purple-600 font-medium">
                    {category.percentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why This Matters */}
      <div className="bg-purple-50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Why We&apos;re Doing This</h3>
        </div>

        <div className="space-y-4 text-gray-700">
          <p>
            As a Valencia College graduate myself, I know firsthand how challenging it
            can be to balance school, work, and unexpected expenses. An emergency car
            repair or expensive textbook can derail an entire semester.
          </p>
          <p>
            That&apos;s why once Jalanea Works is sustainable, I&apos;m committed to giving
            10% back to help fellow Valencia students succeed. It&apos;s not just about
            building a business—it&apos;s about building a community that lifts each other up.
          </p>
          <p className="font-medium text-purple-700">
            Your subscription doesn&apos;t just help your career—it will help future
            Valencia graduates too.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Help us reach our sustainability goal and activate the Community Fund
        </p>
        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Heart className="w-5 h-5" />
          View Subscription Plans
        </Link>
        <div className="mt-4">
          <a
            href="https://valenciacollege.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Learn more about Valencia College
          </a>
        </div>
      </div>
    </div>
  )
}
