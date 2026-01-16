/**
 * Stripe Configuration & Utilities
 *
 * Handles Stripe integration for subscription management.
 * 4-tier model: Essential ($15), Starter ($25), Premium ($75), Unlimited ($150)
 */

import Stripe from 'stripe'

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY not set - Stripe functionality will be limited')
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true
    })
  : null

// Subscription tier types
export type SubscriptionTier = 'free' | 'essential' | 'starter' | 'premium' | 'unlimited'

// Tier configuration
export interface TierConfig {
  id: SubscriptionTier
  name: string
  price: number
  priceId?: string // Stripe Price ID
  productId?: string // Stripe Product ID
  description: string
  features: string[]
  limits: {
    jobsPerMonth: number
    resumeVersions: number
    applicationsPerMonth: number
    aiCredits: number
    skillsTranslation: boolean
    careerCoach: boolean
    shadowCalendar: boolean
    interviewPrep: boolean
    prioritySupport: boolean
  }
  popular?: boolean
  communityContribution: number // Amount that goes to community fund
}

// Revenue threshold before community contributions kick in
// $55k/year = ~$4,583/month in revenue needed first
export const COMMUNITY_FUND_REVENUE_THRESHOLD = 4583

// Community contribution percentages (10% of subscription price)
// These will be activated once revenue threshold is met
export const COMMUNITY_CONTRIBUTION_RATES: Record<SubscriptionTier, number> = {
  free: 0,
  essential: 1.50,  // 10% of $15
  starter: 2.50,    // 10% of $25
  premium: 7.50,    // 10% of $75
  unlimited: 15.00  // 10% of $150
}

// Tier configurations
export const SUBSCRIPTION_TIERS: TierConfig[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    description: 'Get started with basic features',
    features: [
      '5 job applications per month',
      '1 resume version',
      'Basic job search',
      'Application tracking'
    ],
    limits: {
      jobsPerMonth: 20,
      resumeVersions: 1,
      applicationsPerMonth: 5,
      aiCredits: 10,
      skillsTranslation: false,
      careerCoach: false,
      shadowCalendar: false,
      interviewPrep: false,
      prioritySupport: false
    },
    communityContribution: 0
  },
  {
    id: 'essential',
    name: 'Essential',
    price: 15,
    priceId: process.env.STRIPE_ESSENTIAL_PRICE_ID,
    productId: process.env.STRIPE_ESSENTIAL_PRODUCT_ID,
    description: 'Perfect for casual job seekers',
    features: [
      '25 job applications per month',
      '3 resume versions',
      'AI-powered job matching',
      'Application tracking',
      'Email notifications'
    ],
    limits: {
      jobsPerMonth: 50,
      resumeVersions: 3,
      applicationsPerMonth: 25,
      aiCredits: 50,
      skillsTranslation: false,
      careerCoach: false,
      shadowCalendar: true,
      interviewPrep: false,
      prioritySupport: false
    },
    communityContribution: 0 // Contributions start after $55k/yr revenue threshold
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 25,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    productId: process.env.STRIPE_STARTER_PRODUCT_ID,
    description: 'Great for active job seekers',
    popular: true,
    features: [
      '50 job applications per month',
      '5 resume versions',
      'AI job matching & recommendations',
      'Skills Translation Engine',
      'Shadow Calendar',
      'Basic interview prep'
    ],
    limits: {
      jobsPerMonth: 100,
      resumeVersions: 5,
      applicationsPerMonth: 50,
      aiCredits: 150,
      skillsTranslation: true,
      careerCoach: false,
      shadowCalendar: true,
      interviewPrep: true,
      prioritySupport: false
    },
    communityContribution: 0 // Contributions start after $55k/yr revenue threshold
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 75,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    productId: process.env.STRIPE_PREMIUM_PRODUCT_ID,
    description: 'Full access to all features',
    features: [
      'Unlimited applications',
      'Unlimited resume versions',
      'AI Career Coach (OSKAR)',
      'Advanced interview prep with AI feedback',
      'Priority job matching',
      'Skills Translation Engine',
      'Shadow Calendar with transit'
    ],
    limits: {
      jobsPerMonth: -1, // unlimited
      resumeVersions: -1,
      applicationsPerMonth: -1,
      aiCredits: 500,
      skillsTranslation: true,
      careerCoach: true,
      shadowCalendar: true,
      interviewPrep: true,
      prioritySupport: true
    },
    communityContribution: 0 // Contributions start after $55k/yr revenue threshold
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 150,
    priceId: process.env.STRIPE_UNLIMITED_PRICE_ID,
    productId: process.env.STRIPE_UNLIMITED_PRODUCT_ID,
    description: 'For power users and career changers',
    features: [
      'Everything in Premium',
      'Unlimited AI credits',
      '1-on-1 career coaching sessions',
      'Resume review by experts',
      'Priority support',
      'Early access to new features'
    ],
    limits: {
      jobsPerMonth: -1,
      resumeVersions: -1,
      applicationsPerMonth: -1,
      aiCredits: -1, // unlimited
      skillsTranslation: true,
      careerCoach: true,
      shadowCalendar: true,
      interviewPrep: true,
      prioritySupport: true
    },
    communityContribution: 0 // Contributions start after $55k/yr revenue threshold
  }
]

/**
 * Get tier configuration by ID
 */
export function getTierConfig(tierId: SubscriptionTier): TierConfig | undefined {
  return SUBSCRIPTION_TIERS.find(t => t.id === tierId)
}

/**
 * Get tier by Stripe Price ID
 */
export function getTierByPriceId(priceId: string): TierConfig | undefined {
  return SUBSCRIPTION_TIERS.find(t => t.priceId === priceId)
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: keyof TierConfig['limits']
): boolean {
  const tier = getTierConfig(userTier)
  if (!tier) return false

  const value = tier.limits[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return false
}

/**
 * Check if user is within limit
 */
export function isWithinLimit(
  userTier: SubscriptionTier,
  limit: 'jobsPerMonth' | 'resumeVersions' | 'applicationsPerMonth' | 'aiCredits',
  currentUsage: number
): boolean {
  const tier = getTierConfig(userTier)
  if (!tier) return false

  const limitValue = tier.limits[limit]
  if (limitValue === -1) return true // unlimited
  return currentUsage < limitValue
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  tierId: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    console.error('Stripe not initialized')
    return null
  }

  const tier = getTierConfig(tierId)
  if (!tier || !tier.priceId) {
    console.error('Invalid tier or missing price ID')
    return null
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tier.priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        tierId: tier.id,
        communityContribution: tier.communityContribution.toString()
      },
      subscription_data: {
        metadata: {
          userId,
          tierId: tier.id
        }
      },
      allow_promotion_codes: true
    })

    return session
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return null
  }
}

/**
 * Create Stripe billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) {
    console.error('Stripe not initialized')
    return null
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    })

    return session
  } catch (error) {
    console.error('Failed to create billing portal session:', error)
    return null
  }
}

/**
 * Get customer's subscription
 */
export async function getCustomerSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })

    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Failed to get subscription:', error)
    return null
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null

  try {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    return null
  }
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null

  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  } catch (error) {
    console.error('Failed to resume subscription:', error)
    return null
  }
}

/**
 * Update subscription to new tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTierId: SubscriptionTier
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null

  const newTier = getTierConfig(newTierId)
  if (!newTier || !newTier.priceId) return null

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const itemId = subscription.items.data[0]?.id

    if (!itemId) return null

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          price: newTier.priceId
        }
      ],
      metadata: {
        tierId: newTierId
      },
      proration_behavior: 'create_prorations'
    })
  } catch (error) {
    console.error('Failed to update subscription:', error)
    return null
  }
}

/**
 * Get or create Stripe customer
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string | null> {
  if (!stripe) return null

  try {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    })

    return customer.id
  } catch (error) {
    console.error('Failed to get/create customer:', error)
    return null
  }
}

export default stripe
