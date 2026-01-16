/**
 * Subscription Portal API
 *
 * POST /api/subscription/portal - Create billing portal session
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe'

/**
 * POST - Create billing portal session
 */
export async function POST() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's Stripe customer ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found' },
      { status: 404 }
    )
  }

  // Build return URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl = `${baseUrl}/dashboard/subscription`

  // Create portal session
  const session = await createBillingPortalSession(
    profile.stripe_customer_id,
    returnUrl
  )

  if (!session) {
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    portalUrl: session.url
  })
}
