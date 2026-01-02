/**
 * Stripe Billing Module
 *
 * Handles:
 * - Checkout session creation for subscription upgrades
 * - Webhook processing for payment events
 * - Customer portal for subscription management
 * - Subscription status sync with Supabase
 */

import Stripe from 'stripe';
import { supabase } from './db/client.js';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Price IDs from Stripe Dashboard (test mode)
export const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_1ShWLfFey3ZUkuBYBa3qjq6m',
  pro: process.env.STRIPE_PRICE_PRO || 'price_1ShWMCFey3ZUkuBYDPm8h5L1',
  unlimited: process.env.STRIPE_PRICE_UNLIMITED || 'price_1ShWMCFey3ZUkuBY4JE65dFO',
} as const;

// Tier limits for reference
export const TIER_LIMITS = {
  free: 10,
  starter: 50,
  pro: 200,
  unlimited: 999999,
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string): Promise<string> {
  // Check if user already has a Stripe customer ID
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Billing] Error fetching profile:', error);
    throw new Error('Failed to fetch user profile');
  }

  // Return existing customer ID if present
  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: email || profile?.email,
    name: name || profile?.full_name || undefined,
    metadata: {
      supabase_user_id: userId,
    },
  });

  // Store customer ID in Supabase
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  if (updateError) {
    console.error('[Billing] Error storing customer ID:', updateError);
    // Continue anyway - we have the customer ID
  }

  console.log(`[Billing] Created Stripe customer ${customer.id} for user ${userId}`);
  return customer.id;
}

/**
 * Create a checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  tier: 'starter' | 'pro' | 'unlimited',
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId, email);
  const priceId = PRICE_IDS[tier];

  if (!priceId) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      tier: tier,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        tier: tier,
      },
    },
  });

  console.log(`[Billing] Created checkout session ${session.id} for user ${userId}, tier ${tier}`);

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSession(
  userId: string,
  email: string,
  returnUrl: string
): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer(userId, email);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  console.log(`[Billing] Created portal session for user ${userId}`);

  return { url: session.url };
}

/**
 * Get current subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}> {
  // Get user's Stripe customer ID
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id, subscription_tier')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      tier: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // If no Stripe customer, return free tier
  if (!profile.stripe_customer_id) {
    return {
      tier: (profile.subscription_tier as SubscriptionTier) || 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  // Get active subscriptions from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    return {
      tier: 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const subscription = subscriptions.data[0];
  const tier = (subscription.metadata.tier as SubscriptionTier) || 'free';

  // Access current_period_end - it's a timestamp in seconds
  const periodEnd = (subscription as any).current_period_end as number;

  return {
    tier,
    status: subscription.status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

/**
 * Sync subscription status from Stripe to Supabase
 */
export async function syncSubscriptionStatus(
  customerId: string,
  subscriptionId: string,
  status: string,
  tier: SubscriptionTier
): Promise<void> {
  // Find user by Stripe customer ID
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (findError || !profile) {
    console.error('[Billing] Could not find user for customer:', customerId);
    return;
  }

  // Determine tier based on subscription status
  const effectiveTier = status === 'active' ? tier : 'free';

  // Update user's subscription tier
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: effectiveTier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    console.error('[Billing] Error updating subscription tier:', updateError);
    throw new Error('Failed to update subscription');
  }

  console.log(`[Billing] Synced subscription for user ${profile.id}: ${effectiveTier} (status: ${status})`);
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; event?: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Billing] STRIPE_WEBHOOK_SECRET not set - webhook verification disabled');
    // In development, parse without verification
    const event = JSON.parse(payload.toString());
    await processWebhookEvent(event);
    return { received: true, event: event.type };
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('[Billing] Webhook signature verification failed:', err);
    throw new Error('Webhook signature verification failed');
  }

  await processWebhookEvent(event);
  return { received: true, event: event.type };
}

/**
 * Process a verified webhook event
 */
async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`[Billing] Processing webhook event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const tier = (subscription.metadata.tier || session.metadata?.tier || 'starter') as SubscriptionTier;

        await syncSubscriptionStatus(
          session.customer as string,
          subscription.id,
          subscription.status,
          tier
        );
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const tier = (subscription.metadata.tier || 'starter') as SubscriptionTier;

      await syncSubscriptionStatus(
        subscription.customer as string,
        subscription.id,
        subscription.status,
        tier
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // Downgrade to free tier
      await syncSubscriptionStatus(
        subscription.customer as string,
        subscription.id,
        'canceled',
        'free'
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`[Billing] Payment failed for customer ${invoice.customer}`);
      // Could send notification to user here
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[Billing] Payment succeeded for customer ${invoice.customer}`);
      break;
    }

    default:
      console.log(`[Billing] Unhandled event type: ${event.type}`);
  }
}

/**
 * Cancel a subscription (at period end)
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean }> {
  // Get user's Stripe customer ID
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !profile?.stripe_customer_id) {
    throw new Error('No subscription found');
  }

  // Get active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    throw new Error('No active subscription');
  }

  // Cancel at period end (user keeps access until then)
  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: true,
  });

  console.log(`[Billing] Subscription scheduled for cancellation for user ${userId}`);
  return { success: true };
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string): Promise<{ success: boolean }> {
  // Get user's Stripe customer ID
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !profile?.stripe_customer_id) {
    throw new Error('No subscription found');
  }

  // Get subscription (even if set to cancel)
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    throw new Error('No subscription found');
  }

  // Remove cancellation
  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: false,
  });

  console.log(`[Billing] Subscription reactivated for user ${userId}`);
  return { success: true };
}

export { stripe };
