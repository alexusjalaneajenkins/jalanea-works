/**
 * Job Pocket Refund API
 *
 * POST /api/job-pockets/[id]/refund
 *   Request a refund for an unused advanced/professional pocket
 *
 * Request body:
 *   - reason: string (optional) - Reason for refund
 *
 * Refund eligibility:
 *   - Pocket must be advanced or professional type
 *   - Pocket must not have been viewed (viewed_at is null)
 *   - Pocket must not have been used to apply (applied_after_viewing is false)
 *   - Pocket must be less than 24 hours old
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PocketType } from '@/lib/stripe'

const REFUND_WINDOW_HOURS = 24

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: pocketId } = await params
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'user_requested'

    // Get the pocket
    const { data: pocket, error: pocketError } = await supabase
      .from('job_pockets')
      .select('id, user_id, pocket_type, viewed_at, applied_after_viewing, created_at, refunded')
      .eq('id', pocketId)
      .eq('user_id', user.id)
      .single()

    if (pocketError || !pocket) {
      return NextResponse.json(
        { error: 'Pocket not found or access denied' },
        { status: 404 }
      )
    }

    // Check if pocket is eligible for refund
    const pocketType = pocket.pocket_type as PocketType

    // 1. Must be advanced or professional
    if (!['advanced', 'professional'].includes(pocketType)) {
      return NextResponse.json(
        {
          error: 'Only advanced and professional pockets are eligible for refunds',
          eligible: false
        },
        { status: 400 }
      )
    }

    // 2. Must not have been refunded already
    if (pocket.refunded) {
      return NextResponse.json(
        {
          error: 'This pocket has already been refunded',
          eligible: false
        },
        { status: 400 }
      )
    }

    // 3. Must not have been viewed
    if (pocket.viewed_at) {
      return NextResponse.json(
        {
          error: 'Cannot refund a pocket that has been viewed',
          eligible: false,
          viewedAt: pocket.viewed_at
        },
        { status: 400 }
      )
    }

    // 4. Must not have been used to apply
    if (pocket.applied_after_viewing) {
      return NextResponse.json(
        {
          error: 'Cannot refund a pocket that was used for an application',
          eligible: false
        },
        { status: 400 }
      )
    }

    // 5. Must be within refund window
    const createdAt = new Date(pocket.created_at)
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > REFUND_WINDOW_HOURS) {
      return NextResponse.json(
        {
          error: `Refund window has expired. Pockets must be refunded within ${REFUND_WINDOW_HOURS} hours of creation.`,
          eligible: false,
          hoursOld: Math.round(hoursSinceCreation),
          refundWindowHours: REFUND_WINDOW_HOURS
        },
        { status: 400 }
      )
    }

    // Process refund using database function
    const { data: refundResult, error: refundError } = await supabase.rpc(
      'refund_pocket_credit',
      {
        p_user_id: user.id,
        p_pocket_type: pocketType,
        p_reason: reason
      }
    )

    if (refundError) {
      console.error('Error processing refund:', refundError)
      return NextResponse.json(
        { error: 'Failed to process refund' },
        { status: 500 }
      )
    }

    // Mark pocket as refunded
    const { error: updateError } = await supabase
      .from('job_pockets')
      .update({
        refunded: true,
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', pocketId)

    if (updateError) {
      console.error('Error marking pocket as refunded:', updateError)
      // Note: Credit was already refunded, so we don't roll back
      // Just log the error
    }

    // Get updated credits
    const { data: newCredits } = await supabase.rpc(
      'get_remaining_pocket_credits',
      {
        p_user_id: user.id,
        p_pocket_type: pocketType
      }
    )

    return NextResponse.json({
      success: true,
      refund: {
        pocketId,
        pocketType,
        reason,
        refundedAt: new Date().toISOString()
      },
      credits: {
        type: pocketType,
        remaining: newCredits?.remaining || 0,
        allowance: newCredits?.allowance || 0
      },
      message: `${pocketType.charAt(0).toUpperCase() + pocketType.slice(1)} pocket credit has been refunded.`
    })
  } catch (error) {
    console.error('Error processing refund:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/job-pockets/[id]/refund
 *   Check refund eligibility for a pocket
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: pocketId } = await params

    // Get the pocket
    const { data: pocket, error: pocketError } = await supabase
      .from('job_pockets')
      .select('id, pocket_type, viewed_at, applied_after_viewing, created_at, refunded')
      .eq('id', pocketId)
      .eq('user_id', user.id)
      .single()

    if (pocketError || !pocket) {
      return NextResponse.json(
        { error: 'Pocket not found or access denied' },
        { status: 404 }
      )
    }

    const pocketType = pocket.pocket_type as PocketType
    const createdAt = new Date(pocket.created_at)
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    const hoursRemaining = Math.max(0, REFUND_WINDOW_HOURS - hoursSinceCreation)

    // Determine eligibility
    const ineligibilityReasons: string[] = []

    if (!['advanced', 'professional'].includes(pocketType)) {
      ineligibilityReasons.push('Only advanced and professional pockets are eligible')
    }

    if (pocket.refunded) {
      ineligibilityReasons.push('Pocket has already been refunded')
    }

    if (pocket.viewed_at) {
      ineligibilityReasons.push('Pocket has been viewed')
    }

    if (pocket.applied_after_viewing) {
      ineligibilityReasons.push('Pocket was used for an application')
    }

    if (hoursSinceCreation > REFUND_WINDOW_HOURS) {
      ineligibilityReasons.push(`Refund window of ${REFUND_WINDOW_HOURS} hours has expired`)
    }

    const eligible = ineligibilityReasons.length === 0

    return NextResponse.json({
      pocketId,
      pocketType,
      eligible,
      ineligibilityReasons: eligible ? null : ineligibilityReasons,
      refundWindow: {
        totalHours: REFUND_WINDOW_HOURS,
        hoursElapsed: Math.round(hoursSinceCreation * 10) / 10,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
        expired: hoursSinceCreation > REFUND_WINDOW_HOURS
      }
    })
  } catch (error) {
    console.error('Error checking refund eligibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
