/**
 * Stripe Billing Portal API
 *
 * POST /api/stripe/portal - Create billing portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession, getOrCreateCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const email = profile?.email || user.email
      if (!email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }

      customerId = await getOrCreateCustomer(user.id, email, profile?.full_name)

      if (customerId) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Could not find or create customer' },
        { status: 400 }
      )
    }

    // Build return URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL
    const returnUrl = `${origin}/dashboard/subscription`

    // Create portal session
    const session = await createBillingPortalSession(customerId, returnUrl)

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create billing portal session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: session.url
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
