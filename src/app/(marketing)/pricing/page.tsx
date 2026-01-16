'use client'

/**
 * Pricing Page
 *
 * Public pricing page showing all subscription tiers with features.
 * Handles checkout flow via Stripe.
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Sparkles,
  Heart,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Shield,
  Users,
  Star
} from 'lucide-react'
import { SUBSCRIPTION_TIERS, type TierConfig } from '@/lib/stripe'

// Wrapper component to handle Suspense boundary for useSearchParams
function PricingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const canceled = searchParams.get('canceled') === 'true'

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setIsLoggedIn(!!data.user)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  // Handle checkout
  const handleCheckout = async (tierId: string) => {
    if (!isLoggedIn) {
      // Redirect to signup with return URL
      router.push(`/signup?redirect=/pricing&tier=${tierId}`)
      return
    }

    setLoading(tierId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  // Filter out free tier for pricing display
  const paidTiers = SUBSCRIPTION_TIERS.filter(t => t.id !== 'free')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find the Perfect Plan for Your Job Search
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              From casual browsing to serious career moves, we have a plan that fits your needs.
              Start free and upgrade anytime.
            </p>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Canceled Notice */}
      {canceled && (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800">
              Checkout was canceled. Feel free to try again when you&apos;re ready!
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paidTiers.map((tier, idx) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                index={idx}
                loading={loading === tier.id}
                onSelect={() => handleCheckout(tier.id)}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Community Fund Banner */}
      <section className="py-12 bg-pink-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                10% Goes to Valencia Students
              </h3>
              <p className="text-gray-600">
                Once we reach sustainability, 10% of every subscription will support the Valencia
                College Community Fund—helping students with emergencies, textbooks, and career resources.
              </p>
            </div>
            <Link
              href="/community-fund"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors flex-shrink-0"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare All Features</h2>
            <p className="text-gray-600">See exactly what you get with each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-600">Feature</th>
                  {paidTiers.map(tier => (
                    <th key={tier.id} className="text-center py-4 px-4">
                      <span className={`font-semibold ${tier.popular ? 'text-primary-600' : 'text-gray-900'}`}>
                        {tier.name}
                      </span>
                      <span className="block text-sm text-gray-500">${tier.price}/mo</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FeatureRow
                  feature="Job Applications"
                  values={['25/mo', '50/mo', 'Unlimited', 'Unlimited']}
                />
                <FeatureRow
                  feature="Resume Versions"
                  values={['3', '5', 'Unlimited', 'Unlimited']}
                />
                <FeatureRow
                  feature="AI Credits"
                  values={['50', '150', '500', 'Unlimited']}
                />
                <FeatureRow
                  feature="Skills Translation"
                  values={[false, true, true, true]}
                />
                <FeatureRow
                  feature="Shadow Calendar"
                  values={[true, true, true, true]}
                />
                <FeatureRow
                  feature="Interview Prep"
                  values={[false, true, true, true]}
                />
                <FeatureRow
                  feature="AI Career Coach"
                  values={[false, false, true, true]}
                />
                <FeatureRow
                  feature="Priority Support"
                  values={[false, false, true, true]}
                />
                <FeatureRow
                  feature="Expert Resume Review"
                  values={[false, false, false, true]}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Secure Payments</span>
              <span className="text-xs text-gray-500">Powered by Stripe</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-8 h-8 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">Cancel Anytime</span>
              <span className="text-xs text-gray-500">No contracts</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Valencia Focused</span>
              <span className="text-xs text-gray-500">Built for students</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI Powered</span>
              <span className="text-xs text-gray-500">Gemini 3.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="Can I change my plan later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing date."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! You can sign up for free and explore basic features. When you're ready for more, upgrade to a paid plan."
            />
            <FAQItem
              question="How does the Community Fund work?"
              answer="Once Jalanea Works reaches $55K/year in revenue (our sustainability threshold), 10% of all subscription revenue will go directly to helping Valencia College students with emergencies, textbooks, and career resources."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Absolutely. There are no contracts or commitments. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards through Stripe, our secure payment processor. This includes Visa, Mastercard, American Express, and Discover."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Supercharge Your Job Search?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of Valencia students and alumni finding their dream jobs.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

// Loading fallback for Suspense
function PricingPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  )
}

// Main export with Suspense boundary
export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageLoading />}>
      <PricingPageContent />
    </Suspense>
  )
}

// Pricing Card Component
function PricingCard({
  tier,
  index,
  loading,
  onSelect,
  isLoggedIn
}: {
  tier: TierConfig
  index: number
  loading: boolean
  onSelect: () => void
  isLoggedIn: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-2xl p-6 ${
        tier.popular
          ? 'bg-primary-600 text-white ring-4 ring-primary-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>
            ${tier.price}
          </span>
          <span className={tier.popular ? 'text-purple-200' : 'text-gray-500'}>/month</span>
        </div>
        <p className={`text-sm mt-2 ${tier.popular ? 'text-purple-200' : 'text-gray-500'}`}>
          {tier.description}
        </p>
      </div>

      <ul className="space-y-3 mb-6">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className={`w-5 h-5 flex-shrink-0 ${
              tier.popular ? 'text-purple-200' : 'text-green-500'
            }`} />
            <span className={`text-sm ${tier.popular ? 'text-purple-100' : 'text-gray-600'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
          tier.popular
            ? 'bg-white text-primary-600 hover:bg-purple-50'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {isLoggedIn ? 'Subscribe Now' : 'Get Started'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  )
}

// Feature Row Component
function FeatureRow({
  feature,
  values
}: {
  feature: string
  values: (string | boolean)[]
}) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-4 text-gray-700">{feature}</td>
      {values.map((value, idx) => (
        <td key={idx} className="text-center py-4 px-4">
          {typeof value === 'boolean' ? (
            value ? (
              <Check className="w-5 h-5 text-green-500 mx-auto" />
            ) : (
              <X className="w-5 h-5 text-gray-300 mx-auto" />
            )
          ) : (
            <span className="text-gray-700">{value}</span>
          )}
        </td>
      ))}
    </tr>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}
