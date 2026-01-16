/**
 * Subscription Management API
 *
 * POST /api/settings/subscription - Change subscription tier
 * DELETE /api/settings/subscription - Cancel subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tier } = body

    // Validate tier (4 tiers: essential, starter, premium, unlimited)
    const validTiers = ['essential', 'starter', 'premium', 'unlimited']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    // In production, this would:
    // 1. Create/update Stripe subscription
    // 2. Handle proration for upgrades/downgrades
    // 3. Update database with new subscription info

    // Mock response for demo
    const updatedSubscription = {
      tier,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    }

    return NextResponse.json({
      subscription: updatedSubscription,
      message: `Successfully upgraded to ${tier} plan`
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production, this would:
    // 1. Cancel Stripe subscription at period end
    // 2. Update database to reflect cancellation

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAtPeriodEnd: true
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
