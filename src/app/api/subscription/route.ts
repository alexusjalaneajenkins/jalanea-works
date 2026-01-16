/**
 * Subscription API
 *
 * GET /api/subscription - Get current subscription status
 * POST /api/subscription - Create checkout session for new subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCheckoutSession,
  getTierConfig,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier
} from '@/lib/stripe'

/**
 * GET - Get current subscription status
 */
export async function GET() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile with subscription info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      subscription_tier,
      subscription_status,
      subscription_started_at,
      subscription_ends_at,
      stripe_customer_id,
      stripe_subscription_id,
      monthly_applications,
      monthly_ai_credits_used
    `)
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404 }
    )
  }

  const tier = getTierConfig(profile.subscription_tier as SubscriptionTier || 'free')

  return NextResponse.json({
    subscription: {
      tier: profile.subscription_tier || 'free',
      tierName: tier?.name || 'Free',
      status: profile.subscription_status || 'none',
      startedAt: profile.subscription_started_at,
      endsAt: profile.subscription_ends_at,
      hasStripeCustomer: !!profile.stripe_customer_id,
      hasActiveSubscription: !!profile.stripe_subscription_id
    },
    usage: {
      applicationsThisMonth: profile.monthly_applications || 0,
      regularPocketsLimit: tier?.limits.regularPockets || 5,
      aiMessagesUsed: profile.monthly_ai_credits_used || 0,
      aiMessagesLimit: tier?.limits.aiMessagesPerWeek || 10,
      advancedPocketsPerMonth: tier?.limits.advancedPocketsPerMonth || 0,
      professionalPocketsPerMonth: tier?.limits.professionalPocketsPerMonth || 0
    },
    features: tier?.limits || {},
    availableTiers: SUBSCRIPTION_TIERS.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      features: t.features,
      popular: t.popular,
      communityContribution: t.communityContribution
    }))
  })
}

/**
 * POST - Create checkout session
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { tierId } = body

    if (!tierId || tierId === 'free') {
      return NextResponse.json(
        { error: 'Invalid tier selected' },
        { status: 400 }
      )
    }

    const tier = getTierConfig(tierId as SubscriptionTier)
    if (!tier || !tier.priceId) {
      return NextResponse.json(
        { error: 'Tier not available for purchase' },
        { status: 400 }
      )
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard/subscription?success=true&tier=${tierId}`
    const cancelUrl = `${baseUrl}/dashboard/subscription?canceled=true`

    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      tierId as SubscriptionTier,
      successUrl,
      cancelUrl
    )

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
