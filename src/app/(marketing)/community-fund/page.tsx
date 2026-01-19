'use client'

/**
 * Community Fund Transparency Page
 *
 * Public-facing page showing how subscription revenue supports Valencia students.
 * Displays real-time statistics, fund allocation, impact stories, and milestones.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Trophy,
  Target,
  CheckCircle,
  Quote,
  ArrowRight,
  ExternalLink,
  Sparkles,
  PieChart,
  AlertTriangle
} from 'lucide-react'

interface FundStats {
  totalRaised: number
  formattedTotalRaised: string
  totalAllocated: number
  formattedTotalAllocated: string
  currentBalance: number
  formattedCurrentBalance: string
  contributorsCount: number
  studentsHelped: number
  averageGrant: number
  formattedAverageGrant: string
}

interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
  percentage: number
  allocated: number
  formattedAmount: string
}

interface Story {
  id: string
  category: string
  quote: string
  program: string
  semester: string
  amount: number
}

interface Milestone {
  amount: number
  title: string
  description: string
  achieved: boolean
  achievedAt?: string
  formattedAmount: string
}

interface FundData {
  stats: FundStats
  categoryBreakdown: Category[]
  impactStories: Story[]
  milestones: Milestone[]
  milestoneProgress: {
    current: Milestone | null
    next: Milestone | null
    progress: number
  }
}

export default function CommunityFundPage() {
  const [fundData, setFundData] = useState<FundData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFundData() {
      try {
        const response = await fetch('/api/community-fund')
        if (response.ok) {
          const data = await response.json()
          setFundData(data)
        } else {
          setError('Unable to load fund data. Please try again later.')
        }
      } catch (error) {
        console.error('Failed to load fund data:', error)
        setError('Unable to load fund data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadFundData()
  }, [])

  const categoryColors: Record<string, { bg: string; bar: string; text: string; ring: string }> = {
    red: { bg: 'bg-red-50', bar: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-500' },
    blue: { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-500' },
    purple: { bg: 'bg-purple-50', bar: 'bg-purple-500', text: 'text-purple-700', ring: 'ring-purple-500' },
    green: { bg: 'bg-green-50', bar: 'bg-green-500', text: 'text-green-700', ring: 'ring-green-500' },
    amber: { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-500' }
  }

  const categoryStoryColors: Record<string, string> = {
    emergency: 'border-red-200 bg-red-50',
    textbooks: 'border-blue-200 bg-blue-50',
    career: 'border-purple-200 bg-purple-50',
    technology: 'border-green-200 bg-green-50',
    transportation: 'border-amber-200 bg-amber-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading fund data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Fund Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-medium rounded-xl hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = fundData?.stats
  const categories = fundData?.categoryBreakdown || []
  const stories = fundData?.impactStories || []
  const milestones = fundData?.milestones || []
  const milestoneProgress = fundData?.milestoneProgress

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Heart className="w-4 h-4" />
              Valencia College Community Fund
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Investing in Our Community
            </h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto mb-8">
              10% of every Jalanea Works subscription goes directly to supporting
              Valencia College students with emergency assistance, textbooks, and career resources.
            </p>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <p className="text-3xl font-bold">{stats.formattedTotalRaised}</p>
                  <p className="text-pink-200 text-sm">Total Raised</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <p className="text-3xl font-bold">{stats.contributorsCount}</p>
                  <p className="text-pink-200 text-sm">Contributors</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <p className="text-3xl font-bold">{stats.studentsHelped}</p>
                  <p className="text-pink-200 text-sm">Students Helped</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <p className="text-3xl font-bold">{stats.formattedAverageGrant}</p>
                  <p className="text-pink-200 text-sm">Avg. Grant</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every subscription to Jalanea Works directly contributes to helping fellow Valencia students succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">10% of Subscriptions</h3>
              <p className="text-gray-600">
                A portion of every subscription is automatically allocated to the Community Fund.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Allocation</h3>
              <p className="text-gray-600">
                Funds are distributed across 5 categories based on student needs and impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Impact</h3>
              <p className="text-gray-600">
                Students receive assistance for emergencies, textbooks, and career development.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fund Allocation */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Where the Funds Go</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete transparency on how your contributions are allocated to help students.
            </p>
          </div>

          {/* Allocation Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="h-6 rounded-full overflow-hidden flex shadow-inner bg-gray-100">
              {categories.map((cat) => {
                const colors = categoryColors[cat.color] || categoryColors.purple
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${cat.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`${colors.bar} first:rounded-l-full last:rounded-r-full`}
                    title={`${cat.name}: ${cat.percentage}%`}
                  />
                )
              })}
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const colors = categoryColors[cat.color] || categoryColors.purple
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`${colors.bg} rounded-xl p-6 border-2 border-transparent hover:border-current transition-colors`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{cat.icon}</span>
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {cat.percentage}%
                    </span>
                  </div>
                  <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>{cat.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{cat.description}</p>
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {cat.formattedAmount} allocated
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Student Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from Valencia students whose lives have been impacted by the Community Fund.
              <span className="text-gray-500 text-sm block mt-1">(Names removed for privacy)</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-xl border-2 p-6 ${categoryStoryColors[story.category] || 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Quote className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-700 italic leading-relaxed text-lg">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div>
                    <p className="font-medium text-gray-900">{story.program} Student</p>
                    <p className="text-sm text-gray-500">{story.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${story.amount}</p>
                    <p className="text-xs text-gray-500">Grant received</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Milestones</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together, we&apos;re building something meaningful. Track our progress toward bigger goals.
            </p>
          </div>

          {/* Progress to Next Milestone */}
          {milestoneProgress?.next && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-amber-100 text-sm">Next Milestone</p>
                  <p className="text-xl font-bold">{milestoneProgress.next.title}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-100">Progress</span>
                  <span className="font-medium">{milestoneProgress.next.formattedAmount}</span>
                </div>
                <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(100, milestoneProgress.progress)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
              <p className="text-amber-100 text-sm">
                {Math.round(milestoneProgress.progress)}% complete
              </p>
            </motion.div>
          )}

          {/* Milestone Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.achieved
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Target className="w-6 h-6" />
                    )}
                  </div>

                  <div className={`flex-1 bg-white rounded-xl border p-4 ${
                    milestone.achieved ? '' : 'opacity-60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      <span className={`font-bold ${
                        milestone.achieved ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {milestone.formattedAmount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    {milestone.achieved && milestone.achievedAt && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Achieved {new Date(milestone.achievedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why This Matters</h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="prose prose-purple max-w-none text-gray-700">
              <p className="text-lg leading-relaxed">
                As a Valencia College graduate, I know firsthand how challenging it can be to balance
                school, work, and unexpected expenses. An emergency car repair or expensive textbook
                can derail an entire semester.
              </p>
              <p className="text-lg leading-relaxed">
                That&apos;s why 10% of every Jalanea Works subscription goes directly to helping fellow
                Valencia students succeed. It&apos;s not just about building a business—it&apos;s about
                building a community that lifts each other up.
              </p>
              <p className="text-lg leading-relaxed font-medium text-purple-700">
                Your subscription doesn&apos;t just help your career—it helps future Valencia graduates too.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Jalanea Jenkins</p>
                <p className="text-sm text-gray-500">Founder, Valencia Class of 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Movement
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Start your job search journey and help support fellow Valencia students at the same time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-pink-50 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              View Plans
            </Link>
          </div>

          <div className="mt-8">
            <a
              href="https://valenciacollege.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-200 hover:text-white inline-flex items-center gap-1 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Learn more about Valencia College
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>
            This page is updated in real-time as contributions are received and funds are allocated.
            All financial data is verified and transparent.
          </p>
          <p className="mt-2">
            Questions? Contact us at{' '}
            <a href="mailto:fund@jalanea.works" className="text-pink-400 hover:text-pink-300">
              fund@jalanea.works
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
