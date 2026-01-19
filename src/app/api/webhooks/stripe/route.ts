/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription management.
 * Events: checkout.session.completed, customer.subscription.updated/deleted,
 * invoice.paid/payment_failed
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, getTierByPriceId, type SubscriptionTier } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { sendPaymentFailedEmail } from '@/lib/email'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

/**
 * POST - Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe not configured for webhooks')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(supabase, session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(supabase, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabase, invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: Stripe.Checkout.Session
) {
  const userId = session.client_reference_id || session.metadata?.userId
  const tierId = session.metadata?.tierId as SubscriptionTier
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const communityContribution = parseFloat(session.metadata?.communityContribution || '0')

  if (!userId || !tierId) {
    console.error('Missing userId or tierId in checkout session')
    return
  }

  // Update user's subscription in database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tierId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to update user subscription:', updateError)
    return
  }

  // Record community contribution
  if (communityContribution > 0) {
    await supabase.from('community_contributions').insert({
      user_id: userId,
      amount: communityContribution,
      source: 'subscription',
      subscription_tier: tierId,
      stripe_payment_id: session.payment_intent as string,
      created_at: new Date().toISOString()
    })
  }

  // Create subscription history record
  await supabase.from('subscription_history').insert({
    user_id: userId,
    tier: tierId,
    event_type: 'subscribed',
    stripe_subscription_id: subscriptionId,
    amount: session.amount_total ? session.amount_total / 100 : 0,
    created_at: new Date().toISOString()
  })

  console.log(`User ${userId} subscribed to ${tierId}`)
}

/**
 * Handle subscription update (upgrade/downgrade)
 */
async function handleSubscriptionUpdated(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.userId
  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? getTierByPriceId(priceId) : null

  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single()

    if (!profile) {
      console.error('Could not find user for subscription update')
      return
    }
  }

  const targetUserId = userId || (await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single()
    .then(r => r.data?.id))

  if (!targetUserId) return

  // Cast subscription to include Stripe properties that TypeScript doesn't recognize
  const sub = subscription as unknown as {
    cancel_at_period_end?: boolean
    cancel_at?: number
    current_period_end?: number
    status: string
    id: string
  }

  // Determine subscription status
  let status = 'active'
  if (sub.cancel_at_period_end) {
    status = 'canceling'
  } else if (sub.status === 'past_due') {
    status = 'past_due'
  } else if (sub.status === 'unpaid') {
    status = 'unpaid'
  }

  // Update user profile
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier?.id || 'free',
      subscription_status: status,
      subscription_ends_at: sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', targetUserId)

  if (error) {
    console.error('Failed to update subscription:', error)
    return
  }

  // Log the change
  await supabase.from('subscription_history').insert({
    user_id: targetUserId,
    tier: tier?.id || 'free',
    event_type: sub.cancel_at_period_end ? 'cancellation_scheduled' : 'updated',
    stripe_subscription_id: subscription.id,
    created_at: new Date().toISOString()
  })

  console.log(`Subscription updated for user ${targetUserId}`)
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.userId

  // Find user by customer ID if not in metadata
  const targetUserId = userId || (await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single()
    .then(r => r.data?.id))

  if (!targetUserId) {
    console.error('Could not find user for subscription deletion')
    return
  }

  // Revert to free tier
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_ends_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', targetUserId)

  if (error) {
    console.error('Failed to handle subscription deletion:', error)
    return
  }

  // Log the cancellation
  await supabase.from('subscription_history').insert({
    user_id: targetUserId,
    tier: 'free',
    event_type: 'canceled',
    stripe_subscription_id: subscription.id,
    created_at: new Date().toISOString()
  })

  console.log(`Subscription canceled for user ${targetUserId}`)
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const inv = invoice as unknown as { subscription?: string; customer: string; payment_intent?: string }
  if (!inv.subscription) return

  const subscriptionId = inv.subscription as string
  const customerId = inv.customer as string

  // Find user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, subscription_tier')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Could not find user for invoice payment')
    return
  }

  // Get tier for community contribution
  const tier = await (async () => {
    if (!stripe) return null
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = sub.items.data[0]?.price.id
      return priceId ? getTierByPriceId(priceId) : null
    } catch {
      return null
    }
  })()

  // Record community contribution for renewal
  if (tier && tier.communityContribution > 0) {
    await supabase.from('community_contributions').insert({
      user_id: profile.id,
      amount: tier.communityContribution,
      source: 'subscription_renewal',
      subscription_tier: tier.id,
      stripe_payment_id: inv.payment_intent as string,
      created_at: new Date().toISOString()
    })
  }

  // Reset monthly usage counters
  await supabase
    .from('profiles')
    .update({
      monthly_applications: 0,
      monthly_ai_credits_used: 0,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  console.log(`Invoice paid for user ${profile.id}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const inv = invoice as unknown as { customer: string; subscription?: string }
  const customerId = inv.customer as string

  // Find user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    console.error('Could not find user for failed payment')
    return
  }

  // Update status
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  // Log the event
  await supabase.from('subscription_history').insert({
    user_id: profile.id,
    tier: null,
    event_type: 'payment_failed',
    stripe_subscription_id: inv.subscription as string,
    created_at: new Date().toISOString()
  })

  // Send email notification about failed payment
  if (profile.email) {
    await sendPaymentFailedEmail(profile.email)
  }

  console.log(`Payment failed for user ${profile.id}`)
}
