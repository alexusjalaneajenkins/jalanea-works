'use client'

/**
 * Career Coach Page
 *
 * AI-powered career coaching using the OSKAR framework.
 * Available for Premium tier users.
 */

import { useState, useEffect } from 'react'
import { Sparkles, BookOpen, Target, TrendingUp, HelpCircle } from 'lucide-react'
import { CareerCoach } from '@/components/coach'
import { OSKAR_PHASES } from '@/data/oskar-framework'

export default function CoachPage() {
  const [userTier, setUserTier] = useState<'essential' | 'starter' | 'professional' | 'max'>('professional')
  const [showGuide, setShowGuide] = useState(false)

  // Fetch user tier on mount
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/career-coach')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 'essential')
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
      }
    }
    fetchUserTier()
  }, [])

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Career Coach</h1>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Premium
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            AI-powered coaching to help you achieve your career goals
          </p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          How it works
        </button>
      </div>

      {/* OSKAR Guide */}
      {showGuide && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">The OSKAR Coaching Framework</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Your Career Coach uses the OSKAR framework, a solution-focused coaching model
            that helps you define goals, assess progress, and create actionable plans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {OSKAR_PHASES.map((phase) => (
              <div key={phase.id} className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="text-2xl mb-2">{phase.emoji}</div>
                <h3 className="font-medium text-gray-900 text-sm">{phase.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Coaching Style</p>
              <p className="font-semibold text-gray-900">Solution-Focused</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Framework</p>
              <p className="font-semibold text-gray-900">OSKAR Model</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Focus Areas</p>
              <p className="font-semibold text-gray-900">6 Topics Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Coach Interface */}
      <CareerCoach
        userTier={userTier}
        onUpgradeClick={() => {
          // Navigate to subscription page
          window.location.href = '/dashboard/settings?tab=subscription'
        }}
      />

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Tips for Great Coaching Sessions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Be specific about your career goals and challenges</li>
          <li>• Use the scaling questions to honestly assess where you are</li>
          <li>• Commit to small, achievable action items after each session</li>
          <li>• Come back regularly to review your progress and adjust plans</li>
        </ul>
      </div>
      </div>
    </main>
  )
}
