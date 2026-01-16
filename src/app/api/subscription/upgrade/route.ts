/**
 * Upgrade Subscription API
 *
 * POST /api/subscription/upgrade - Upgrade/downgrade subscription tier
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateSubscriptionTier,
  getTierConfig,
  createCheckoutSession,
  type SubscriptionTier
} from '@/lib/stripe'

/**
 * POST - Upgrade or downgrade subscription
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
    const { newTierId } = body

    if (!newTierId || newTierId === 'free') {
      return NextResponse.json(
        { error: 'Invalid tier selected. Use cancel endpoint to downgrade to free.' },
        { status: 400 }
      )
    }

    const newTier = getTierConfig(newTierId as SubscriptionTier)
    if (!newTier || !newTier.priceId) {
      return NextResponse.json(
        { error: 'Tier not available' },
        { status: 400 }
      )
    }

    // Get user's current subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to get profile' },
        { status: 500 }
      )
    }

    // If user has no subscription, create new checkout
    if (!profile?.stripe_subscription_id || profile.subscription_status === 'canceled') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const successUrl = `${baseUrl}/dashboard/subscription?success=true&tier=${newTierId}`
      const cancelUrl = `${baseUrl}/dashboard/subscription?canceled=true`

      const session = await createCheckoutSession(
        user.id,
        newTierId as SubscriptionTier,
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
        requiresCheckout: true,
        checkoutUrl: session.url,
        sessionId: session.id
      })
    }

    // Check if already on this tier
    if (profile.subscription_tier === newTierId) {
      return NextResponse.json(
        { error: 'Already subscribed to this tier' },
        { status: 400 }
      )
    }

    // Update existing subscription
    const subscription = await updateSubscriptionTier(
      profile.stripe_subscription_id,
      newTierId as SubscriptionTier
    )

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        subscription_tier: newTierId,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Log the change
    const currentTier = getTierConfig(profile.subscription_tier as SubscriptionTier)
    const isUpgrade = (newTier?.price || 0) > (currentTier?.price || 0)

    await supabase.from('subscription_history').insert({
      user_id: user.id,
      tier: newTierId,
      event_type: isUpgrade ? 'upgraded' : 'downgraded',
      stripe_subscription_id: profile.stripe_subscription_id,
      previous_tier: profile.subscription_tier,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      message: `Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${newTier.name}`,
      tier: newTierId,
      tierName: newTier.name
    })

  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
