/**
 * Subscription Status API
 *
 * GET /api/stripe/subscription - Get current subscription details
 * POST /api/stripe/subscription - Update subscription (upgrade/downgrade)
 * DELETE /api/stripe/subscription - Cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  stripe,
  getCustomerSubscription,
  cancelSubscription,
  resumeSubscription,
  updateSubscriptionTier,
  getTierConfig,
  getTierByPriceId,
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

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select(`
      tier,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_status,
      subscription_started_at,
      subscription_current_period_end,
      subscription_cancel_at_period_end
    `)
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Get tier configuration
  const tierConfig = getTierConfig((profile.tier || 'free') as SubscriptionTier)

  // Get live subscription data from Stripe if available
  let stripeSubscription = null
  if (profile.stripe_customer_id && stripe) {
    stripeSubscription = await getCustomerSubscription(profile.stripe_customer_id)

    // Sync status if different
    if (stripeSubscription) {
      const stripeTier = getTierByPriceId(stripeSubscription.items.data[0]?.price.id || '')

      if (stripeTier?.id !== profile.tier || stripeSubscription.status !== profile.subscription_status) {
        // Update local data
        await supabase
          .from('users')
          .update({
            tier: stripeTier?.id || profile.tier,
            subscription_status: stripeSubscription.status,
            subscription_current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            subscription_cancel_at_period_end: stripeSubscription.cancel_at_period_end
          })
          .eq('id', user.id)
      }
    }
  }

  return NextResponse.json({
    tier: profile.tier || 'free',
    tierConfig,
    status: profile.subscription_status || 'none',
    startedAt: profile.subscription_started_at,
    currentPeriodEnd: profile.subscription_current_period_end,
    cancelAtPeriodEnd: profile.subscription_cancel_at_period_end || false,
    hasActiveSubscription: ['active', 'trialing'].includes(profile.subscription_status || ''),
    availableTiers: SUBSCRIPTION_TIERS.filter(t => t.id !== 'free').map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      features: t.features,
      popular: t.popular
    }))
  })
}

/**
 * POST - Update subscription (upgrade/downgrade)
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
    const { action, tierId } = body as { action: 'upgrade' | 'downgrade' | 'resume'; tierId?: SubscriptionTier }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription to modify' },
        { status: 400 }
      )
    }

    if (action === 'resume') {
      // Resume cancelled subscription
      const subscription = await resumeSubscription(profile.stripe_subscription_id)

      if (!subscription) {
        return NextResponse.json(
          { error: 'Failed to resume subscription' },
          { status: 500 }
        )
      }

      await supabase
        .from('users')
        .update({ subscription_cancel_at_period_end: false })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        message: 'Subscription resumed'
      })
    }

    if (!tierId) {
      return NextResponse.json(
        { error: 'Tier ID required for upgrade/downgrade' },
        { status: 400 }
      )
    }

    // Update subscription tier
    const subscription = await updateSubscriptionTier(
      profile.stripe_subscription_id,
      tierId
    )

    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Update local data
    await supabase
      .from('users')
      .update({
        tier: tierId,
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      message: `Subscription ${action}d to ${tierId}`,
      tier: tierId
    })

  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const immediately = searchParams.get('immediately') === 'true'

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json(
      { error: 'No active subscription to cancel' },
      { status: 400 }
    )
  }

  const subscription = await cancelSubscription(
    profile.stripe_subscription_id,
    immediately
  )

  if (!subscription) {
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }

  if (immediately) {
    // Immediate cancellation
    await supabase
      .from('users')
      .update({
        tier: 'free',
        subscription_status: 'cancelled',
        stripe_subscription_id: null
      })
      .eq('id', user.id)
  } else {
    // Cancel at period end
    await supabase
      .from('users')
      .update({
        subscription_cancel_at_period_end: true
      })
      .eq('id', user.id)
  }

  return NextResponse.json({
    success: true,
    message: immediately
      ? 'Subscription cancelled immediately'
      : 'Subscription will cancel at end of billing period',
    cancelAtPeriodEnd: !immediately
  })
}
