/**
 * Cancel Subscription API
 *
 * POST /api/subscription/cancel - Cancel subscription
 * POST /api/subscription/cancel?resume=true - Resume cancelled subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSubscription, resumeSubscription } from '@/lib/stripe'

/**
 * POST - Cancel or resume subscription
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if resuming
  const { searchParams } = new URL(request.url)
  const isResume = searchParams.get('resume') === 'true'

  // Get user's subscription ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, subscription_status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.stripe_subscription_id) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    )
  }

  try {
    let body: { immediately?: boolean } = {}
    try {
      body = await request.json()
    } catch {
      // No body provided, use defaults
    }

    if (isResume) {
      // Resume subscription
      if (profile.subscription_status !== 'canceling') {
        return NextResponse.json(
          { error: 'Subscription is not scheduled for cancellation' },
          { status: 400 }
        )
      }

      const subscription = await resumeSubscription(profile.stripe_subscription_id)

      if (!subscription) {
        return NextResponse.json(
          { error: 'Failed to resume subscription' },
          { status: 500 }
        )
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_ends_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return NextResponse.json({
        message: 'Subscription resumed successfully',
        status: 'active'
      })

    } else {
      // Cancel subscription
      const subscription = await cancelSubscription(
        profile.stripe_subscription_id,
        body.immediately || false
      )

      if (!subscription) {
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500 }
        )
      }

      // Update profile based on cancellation type
      if (body.immediately) {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            subscription_ends_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        return NextResponse.json({
          message: 'Subscription cancelled immediately',
          status: 'canceled'
        })
      } else {
        const subData = subscription as unknown as { current_period_end?: number }
        const endsAt = subData.current_period_end
          ? new Date(subData.current_period_end * 1000).toISOString()
          : null

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceling',
            subscription_ends_at: endsAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        return NextResponse.json({
          message: 'Subscription will be cancelled at end of billing period',
          status: 'canceling',
          endsAt
        })
      }
    }

  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
