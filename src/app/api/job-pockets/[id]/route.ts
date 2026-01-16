/**
 * Job Pocket by ID API
 *
 * GET /api/job-pockets/[id]
 *   Get a specific pocket by ID
 *
 * PATCH /api/job-pockets/[id]
 *   Update pocket metadata (favorite, viewed, applied)
 *   Request body:
 *     - isFavorite: boolean
 *     - appliedAfterViewing: boolean
 *
 * DELETE /api/job-pockets/[id]
 *   Delete a pocket
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET - Get pocket by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pocket with job details
    const { data: pocket, error } = await supabase
      .from('job_pockets')
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          location_address,
          location_city,
          location_state,
          salary_min,
          salary_max,
          salary_period,
          description,
          requirements,
          benefits,
          apply_url,
          posted_at,
          valencia_friendly,
          valencia_match_score,
          scam_severity,
          scam_flags
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !pocket) {
      return NextResponse.json(
        { error: 'Pocket not found' },
        { status: 404 }
      )
    }

    // Mark as viewed if not already
    if (!pocket.viewed_at) {
      await supabase
        .from('job_pockets')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', id)
    }

    // Check if expired
    const isExpired = pocket.expires_at
      ? new Date(pocket.expires_at) < new Date()
      : false

    return NextResponse.json({
      pocket: {
        id: pocket.id,
        jobId: pocket.job_id,
        tier: pocket.tier,
        data: pocket.pocket_data,
        modelUsed: pocket.model_used,
        generationTimeMs: pocket.generation_time_ms,
        tokensUsed: pocket.tokens_used,
        isFavorite: pocket.is_favorite,
        viewedAt: pocket.viewed_at || new Date().toISOString(),
        appliedAfterViewing: pocket.applied_after_viewing,
        createdAt: pocket.created_at,
        expiresAt: pocket.expires_at,
        isExpired
      },
      job: pocket.jobs ? {
        id: (pocket.jobs as any).id,
        title: (pocket.jobs as any).title,
        company: (pocket.jobs as any).company,
        location: (pocket.jobs as any).location_address ||
          `${(pocket.jobs as any).location_city || ''}, ${(pocket.jobs as any).location_state || 'FL'}`.trim(),
        salaryMin: (pocket.jobs as any).salary_min,
        salaryMax: (pocket.jobs as any).salary_max,
        salaryPeriod: (pocket.jobs as any).salary_period,
        description: (pocket.jobs as any).description,
        requirements: (pocket.jobs as any).requirements,
        benefits: (pocket.jobs as any).benefits,
        applyUrl: (pocket.jobs as any).apply_url,
        postedAt: (pocket.jobs as any).posted_at,
        valenciaMatch: (pocket.jobs as any).valencia_friendly,
        valenciaMatchScore: (pocket.jobs as any).valencia_match_score,
        scamSeverity: (pocket.jobs as any).scam_severity,
        scamFlags: (pocket.jobs as any).scam_flags
      } : null
    })
  } catch (error) {
    console.error('Error fetching pocket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update pocket metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify pocket belongs to user
    const { data: existing } = await supabase
      .from('job_pockets')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Pocket not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (typeof body.isFavorite === 'boolean') {
      updates.is_favorite = body.isFavorite
    }

    if (typeof body.appliedAfterViewing === 'boolean') {
      updates.applied_after_viewing = body.appliedAfterViewing
    }

    // Update pocket
    const { data: updated, error } = await supabase
      .from('job_pockets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating pocket:', error)
      return NextResponse.json(
        { error: 'Failed to update pocket' },
        { status: 500 }
      )
    }

    // Track analytics if marked as applied
    if (body.appliedAfterViewing === true) {
      await supabase.from('events').insert({
        user_id: user.id,
        event_name: 'pocket_led_to_application',
        event_data: {
          pocket_id: id,
          job_id: updated.job_id,
          tier: updated.tier
        }
      }).then(() => {}) // Fire and forget
    }

    return NextResponse.json({
      success: true,
      pocket: {
        id: updated.id,
        isFavorite: updated.is_favorite,
        appliedAfterViewing: updated.applied_after_viewing,
        updatedAt: updated.updated_at
      }
    })
  } catch (error) {
    console.error('Error updating pocket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a pocket
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete pocket (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from('job_pockets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting pocket:', error)
      return NextResponse.json(
        { error: 'Failed to delete pocket' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pocket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
