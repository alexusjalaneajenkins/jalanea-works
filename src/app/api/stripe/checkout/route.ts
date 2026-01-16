/**
 * Stripe Checkout API
 *
 * POST /api/stripe/checkout - Create checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCheckoutSession,
  getOrCreateCustomer,
  getTierConfig,
  type SubscriptionTier
} from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { tierId } = body as { tierId: SubscriptionTier }

    // Validate tier
    const tier = getTierConfig(tierId)
    if (!tier || tier.id === 'free') {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    if (!tier.priceId) {
      return NextResponse.json(
        { error: 'Subscription tier not configured in Stripe' },
        { status: 400 }
      )
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('users')
      .select('email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email
    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      customerId = await getOrCreateCustomer(user.id, email, profile?.full_name)

      if (customerId) {
        // Save customer ID to profile
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    // Build URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const successUrl = `${origin}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/pricing?canceled=true`

    // Create checkout session
    const session = await createCheckoutSession(
      user.id,
      tierId,
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
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
