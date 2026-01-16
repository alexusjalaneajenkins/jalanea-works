/**
 * Job Pocket Upgrade API
 *
 * POST /api/job-pockets/upgrade
 *   Upgrade an existing regular pocket to advanced or professional
 *
 * Request body:
 *   - pocketId: UUID of the pocket to upgrade
 *   - targetType: 'advanced' | 'professional'
 *
 * Note: This action is IRREVERSIBLE. Uses credits from user's monthly allowance.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getTierConfig,
  canAccessPocketType,
  type SubscriptionTier,
  type PocketType
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
    const { pocketId, targetType } = body

    if (!pocketId || !targetType) {
      return NextResponse.json(
        { error: 'Missing required fields: pocketId, targetType' },
        { status: 400 }
      )
    }

    if (!['advanced', 'professional'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid targetType. Must be "advanced" or "professional"' },
        { status: 400 }
      )
    }

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = (profile?.subscription_tier || 'free') as SubscriptionTier

    // Check if user can access target pocket type
    if (!canAccessPocketType(userTier, targetType as PocketType)) {
      const tierConfig = getTierConfig(userTier)
      return NextResponse.json(
        {
          error: `Your ${tierConfig?.name || userTier} subscription does not include ${targetType} pockets.`,
          upgradeRequired: true,
          requiredTier: targetType === 'professional' ? 'professional' : 'starter'
        },
        { status: 403 }
      )
    }

    // Get the pocket to upgrade
    const { data: pocket, error: pocketError } = await supabase
      .from('job_pockets')
      .select('id, user_id, pocket_type, job_id')
      .eq('id', pocketId)
      .eq('user_id', user.id)
      .single()

    if (pocketError || !pocket) {
      return NextResponse.json(
        { error: 'Pocket not found or access denied' },
        { status: 404 }
      )
    }

    // Cannot downgrade or upgrade to same type
    const typeOrder: Record<string, number> = {
      regular: 1,
      advanced: 2,
      professional: 3
    }

    if (typeOrder[targetType] <= typeOrder[pocket.pocket_type || 'regular']) {
      return NextResponse.json(
        { error: `Cannot upgrade from ${pocket.pocket_type || 'regular'} to ${targetType}` },
        { status: 400 }
      )
    }

    // Check available credits using the database function
    const { data: credits, error: creditsError } = await supabase.rpc(
      'get_remaining_pocket_credits',
      {
        p_user_id: user.id,
        p_pocket_type: targetType
      }
    )

    if (creditsError) {
      console.error('Error checking credits:', creditsError)
      return NextResponse.json(
        { error: 'Failed to check available credits' },
        { status: 500 }
      )
    }

    if (!credits || credits.remaining <= 0) {
      return NextResponse.json(
        {
          error: `No ${targetType} pocket credits remaining this month`,
          canPurchase: true,
          purchaseMessage: `You can purchase an à la carte ${targetType} pocket to continue.`
        },
        { status: 402 }
      )
    }

    // Use a credit
    const { data: useResult, error: useError } = await supabase.rpc(
      'use_pocket_credit',
      {
        p_user_id: user.id,
        p_pocket_type: targetType
      }
    )

    if (useError || !useResult) {
      console.error('Error using credit:', useError)
      return NextResponse.json(
        { error: 'Failed to use pocket credit' },
        { status: 500 }
      )
    }

    // Update the pocket type
    const { data: updatedPocket, error: updateError } = await supabase
      .from('job_pockets')
      .update({
        pocket_type: targetType,
        upgraded_from: pocket.pocket_type || 'regular',
        upgraded_at: new Date().toISOString()
      })
      .eq('id', pocketId)
      .select()
      .single()

    if (updateError) {
      // Try to refund the credit if update failed
      await supabase.rpc('refund_pocket_credit', {
        p_user_id: user.id,
        p_pocket_type: targetType,
        p_reason: 'upgrade_failed'
      })

      console.error('Error updating pocket:', updateError)
      return NextResponse.json(
        { error: 'Failed to upgrade pocket. Credit has been refunded.' },
        { status: 500 }
      )
    }

    // Get updated credits remaining
    const { data: newCredits } = await supabase.rpc(
      'get_remaining_pocket_credits',
      {
        p_user_id: user.id,
        p_pocket_type: targetType
      }
    )

    return NextResponse.json({
      success: true,
      pocket: {
        id: updatedPocket.id,
        pocketType: updatedPocket.pocket_type,
        upgradedFrom: updatedPocket.upgraded_from,
        upgradedAt: updatedPocket.upgraded_at
      },
      credits: {
        type: targetType,
        remaining: newCredits?.remaining || 0,
        allowance: newCredits?.allowance || 0,
        used: newCredits?.used || 0
      },
      message: `Pocket upgraded to ${targetType}. This action cannot be undone.`
    })
  } catch (error) {
    console.error('Error upgrading pocket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
