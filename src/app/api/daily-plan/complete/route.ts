/**
 * Daily Plan Job Completion API
 *
 * PUT /api/daily-plan/complete
 *   Mark a job in the daily plan as applied/skipped/saved
 *
 * GET /api/daily-plan/complete
 *   Get completion status for today
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT - Mark a job as complete
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, status, notes } = body

    if (!jobId || !status) {
      return NextResponse.json(
        { error: 'jobId and status are required' },
        { status: 400 }
      )
    }

    if (!['applied', 'skipped', 'saved', 'pending', 'viewed'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be applied, skipped, saved, pending, or viewed' },
        { status: 400 }
      )
    }

    // Update the job status using the database function
    const { data: result, error } = await supabase.rpc(
      'update_daily_plan_job_status',
      {
        p_job_id: jobId,
        p_status: status
      }
    )

    if (error) {
      console.error('Error updating job status:', error)
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      )
    }

    if (!result?.success) {
      return NextResponse.json(
        { error: result?.error || 'Failed to update job status' },
        { status: 400 }
      )
    }

    // If status is 'applied', optionally create an application record
    if (status === 'applied') {
      // Get job details
      const { data: jobData } = await supabase
        .from('daily_plan_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobData) {
        // Create application record
        await supabase.from('applications').insert({
          user_id: user.id,
          job_id: jobData.job_id,
          company: jobData.company,
          job_title: jobData.job_title,
          location: jobData.location,
          job_url: jobData.application_url,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          status: 'applied',
          applied_at: new Date().toISOString(),
          source: 'daily_plan',
          notes: notes || null
        })
      }
    }

    // Get updated stats
    const { data: stats } = await supabase.rpc('get_daily_plan_stats', {
      p_user_id: user.id,
      p_days: 1
    })

    return NextResponse.json({
      success: true,
      job: result.job,
      stats: stats || {
        appliedCount: 0,
        skippedCount: 0,
        savedCount: 0
      }
    })
  } catch (error) {
    console.error('Complete job error:', error)
    return NextResponse.json(
      { error: 'Failed to mark job as complete' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get completion status for today
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's plan with jobs
    const { data: plan } = await supabase.rpc('get_daily_plan_with_jobs', {
      p_user_id: user.id
    })

    if (!plan) {
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0],
        completions: [],
        stats: {
          applied: 0,
          skipped: 0,
          saved: 0,
          pending: 0,
          total: 0
        }
      })
    }

    const jobs = plan.jobs || []

    // Calculate stats
    const applied = jobs.filter(
      (j: Record<string, unknown>) => j.status === 'applied'
    ).length
    const skipped = jobs.filter(
      (j: Record<string, unknown>) => j.status === 'skipped'
    ).length
    const saved = jobs.filter(
      (j: Record<string, unknown>) => j.status === 'saved'
    ).length
    const pending = jobs.filter(
      (j: Record<string, unknown>) => j.status === 'pending'
    ).length

    // Get completions (non-pending jobs)
    const completions = jobs
      .filter((j: Record<string, unknown>) => j.status !== 'pending')
      .map((j: Record<string, unknown>) => ({
        jobId: j.id,
        status: j.status,
        completedAt: j.statusChangedAt
      }))

    return NextResponse.json({
      date: plan.date,
      completions,
      stats: {
        applied,
        skipped,
        saved,
        pending,
        total: jobs.length
      }
    })
  } catch (error) {
    console.error('Get completions error:', error)
    return NextResponse.json(
      { error: 'Failed to get completion status' },
      { status: 500 }
    )
  }
}
