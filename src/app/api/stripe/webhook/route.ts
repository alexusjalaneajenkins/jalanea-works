/**
 * Stripe Webhook Handler
 *
 * POST /api/stripe/webhook - Handle Stripe webhook events
 *
 * Events handled:
 * - checkout.session.completed - New subscription created
 * - customer.subscription.updated - Subscription changed
 * - customer.subscription.deleted - Subscription cancelled
 * - invoice.payment_succeeded - Successful payment (for community fund)
 * - invoice.payment_failed - Failed payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, getTierByPriceId, COMMUNITY_CONTRIBUTION_RATES } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentFailedEmail } from '@/lib/email'

// Use service role for webhook (no auth context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe or webhook secret not configured')
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
      { error: 'Missing signature' },
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

  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

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
 * Handle checkout.session.completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!userId) {
    console.error('No user ID in checkout session')
    return
  }

  console.log(`Checkout completed for user: ${userId}`)

  // Get subscription details
  const subscription = await stripe!.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? getTierByPriceId(priceId) : null

  // Update user profile
  await supabaseAdmin
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      tier: tier?.id || 'essential',
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
      subscription_current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
    })
    .eq('id', userId)

  console.log(`User ${userId} subscribed to ${tier?.id || 'unknown'} tier`)
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const customerId = subscription.customer as string

  // Find user by customer ID if not in metadata
  let targetUserId = userId
  if (!targetUserId) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1)

    targetUserId = users?.[0]?.id
  }

  if (!targetUserId) {
    console.error('Could not find user for subscription update')
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const tier = priceId ? getTierByPriceId(priceId) : null

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'expired'
  }

  await supabaseAdmin
    .from('users')
    .update({
      tier: tier?.id || 'free',
      subscription_status: statusMap[subscription.status] || subscription.status,
      subscription_current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      subscription_cancel_at_period_end: (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end
    })
    .eq('id', targetUserId)

  console.log(`Subscription updated for user ${targetUserId}: ${tier?.id}, status: ${subscription.status}`)
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  const customerId = subscription.customer as string

  // Find user by customer ID if not in metadata
  let targetUserId = userId
  if (!targetUserId) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1)

    targetUserId = users?.[0]?.id
  }

  if (!targetUserId) {
    console.error('Could not find user for subscription deletion')
    return
  }

  await supabaseAdmin
    .from('users')
    .update({
      tier: 'free',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      subscription_cancel_at_period_end: false
    })
    .eq('id', targetUserId)

  console.log(`Subscription cancelled for user ${targetUserId}`)
}

/**
 * Handle successful payment - record community fund contribution
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as unknown as { subscription: string }).subscription as string

  if (!subscriptionId) {
    // Not a subscription payment
    return
  }

  // Get user
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, tier')
    .eq('stripe_customer_id', customerId)
    .limit(1)

  const user = users?.[0]
  if (!user) {
    console.error('Could not find user for payment')
    return
  }

  // Calculate community contribution (10% of subscription)
  const tier = user.tier as keyof typeof COMMUNITY_CONTRIBUTION_RATES
  const contribution = COMMUNITY_CONTRIBUTION_RATES[tier] || 0

  if (contribution > 0) {
    // Record contribution to community fund
    await supabaseAdmin.rpc('record_fund_contribution', {
      p_user_id: user.id,
      p_amount: contribution,
      p_source: (invoice as unknown as { billing_reason: string }).billing_reason === 'subscription_create' ? 'subscription' : 'subscription_renewal',
      p_tier: tier,
      p_stripe_payment_id: (invoice as unknown as { payment_intent: string }).payment_intent as string,
      p_stripe_invoice_id: invoice.id
    })

    console.log(`Recorded $${contribution} community fund contribution from user ${user.id}`)
  }

  console.log(`Payment succeeded for user ${user.id}: $${(invoice.amount_paid / 100).toFixed(2)}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Get user
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .limit(1)

  const user = users?.[0]
  if (!user) {
    return
  }

  // Update subscription status
  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due'
    })
    .eq('id', user.id)

  // Send email notification about failed payment
  if (user.email) {
    await sendPaymentFailedEmail(user.email)
  }

  console.log(`Payment failed for user ${user.id}`)
}
