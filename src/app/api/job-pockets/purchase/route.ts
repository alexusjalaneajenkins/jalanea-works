/**
 * Job Pocket Purchase API
 *
 * POST /api/job-pockets/purchase
 *   Purchase an à la carte advanced or professional pocket
 *
 * Request body:
 *   - pocketType: 'advanced' | 'professional'
 *   - jobId: UUID of the job to generate pocket for
 *
 * Response:
 *   - checkoutUrl: Stripe checkout URL to complete purchase
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTierConfig,
  canAccessPocketType,
  createPocketPurchaseSession,
  getOrCreateCustomer,
  type SubscriptionTier,
  type PocketType,
  POCKET_PRICES
} from '@/lib/stripe'

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
    const { pocketType, jobId } = body

    if (!pocketType || !jobId) {
      return NextResponse.json(
        { error: 'Missing required fields: pocketType, jobId' },
        { status: 400 }
      )
    }

    if (!['advanced', 'professional'].includes(pocketType)) {
      return NextResponse.json(
        { error: 'Invalid pocketType. Must be "advanced" or "professional"' },
        { status: 400 }
      )
    }

    // Get user's subscription tier and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    const userTier = (profile?.subscription_tier || 'free') as SubscriptionTier

    // Check if user can access this pocket type
    // For purchase, user must be at least Starter (for advanced) or Professional (for professional)
    if (!canAccessPocketType(userTier, pocketType as PocketType)) {
      const tierConfig = getTierConfig(userTier)
      return NextResponse.json(
        {
          error: `Your ${tierConfig?.name || userTier} subscription does not include ${pocketType} pockets. Upgrade to access this feature.`,
          upgradeRequired: true,
          requiredTier: pocketType === 'professional' ? 'professional' : 'starter'
        },
        { status: 403 }
      )
    }

    // Verify job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if a pocket already exists for this job
    const { data: existingPocket } = await supabase
      .from('job_pockets')
      .select('id, pocket_type')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single()

    if (existingPocket) {
      const typeOrder: Record<string, number> = {
        regular: 1,
        advanced: 2,
        professional: 3
      }

      if (typeOrder[pocketType] <= typeOrder[existingPocket.pocket_type || 'regular']) {
        return NextResponse.json(
          {
            error: `A ${existingPocket.pocket_type || 'regular'} pocket already exists for this job.`,
            existingPocketId: existingPocket.id
          },
          { status: 409 }
        )
      }
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id
    const userEmail = profile?.email || user.email

    if (!customerId && userEmail) {
      customerId = await getOrCreateCustomer(user.id, userEmail)

      // Save customer ID to profile
      if (customerId) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Failed to setup payment. Please try again.' },
        { status: 500 }
      )
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard/job-pockets?purchase=success&jobId=${jobId}&type=${pocketType}`
    const cancelUrl = `${baseUrl}/dashboard/job-pockets?purchase=cancelled&jobId=${jobId}`

    // Create Stripe checkout session
    const session = await createPocketPurchaseSession(
      user.id,
      customerId,
      pocketType as 'advanced' | 'professional',
      jobId,
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
      sessionId: session.id,
      purchase: {
        pocketType,
        price: POCKET_PRICES[pocketType as keyof typeof POCKET_PRICES],
        jobTitle: job.title,
        company: job.company
      }
    })
  } catch (error) {
    console.error('Error creating pocket purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
