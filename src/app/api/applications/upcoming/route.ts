/**
 * Upcoming Events API
 *
 * GET /api/applications/upcoming - Get upcoming interviews and reminders
 *
 * Query params:
 * - days: Number of days to look ahead (default: 7)
 * - type: Filter by type ('interviews', 'reminders', 'all')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const type = searchParams.get('type') || 'all'

    const results: {
      interviews: Array<Record<string, unknown>>
      reminders: Array<Record<string, unknown>>
    } = {
      interviews: [],
      reminders: []
    }

    // Get upcoming interviews
    if (type === 'all' || type === 'interviews') {
      const { data: interviews } = await supabase.rpc('get_upcoming_interviews', {
        p_user_id: user.id,
        p_days: days
      })

      if (interviews) {
        results.interviews = interviews.map((interview: Record<string, unknown>) => ({
          id: interview.interview_id,
          applicationId: interview.application_id,
          jobTitle: interview.job_title,
          company: interview.company,
          type: interview.interview_type,
          scheduledAt: interview.scheduled_at,
          duration: interview.duration_minutes,
          location: interview.location_address,
          prepCompleted: interview.prep_completed,
          notes: interview.notes
        }))
      }
    }

    // Get pending reminders
    if (type === 'all' || type === 'reminders') {
      const { data: reminders } = await supabase.rpc('get_pending_reminders', {
        p_user_id: user.id,
        p_days: days
      })

      if (reminders) {
        results.reminders = reminders.map((reminder: Record<string, unknown>) => ({
          id: reminder.reminder_id,
          applicationId: reminder.application_id,
          jobTitle: reminder.job_title,
          company: reminder.company,
          type: reminder.reminder_type,
          message: reminder.message,
          dueAt: reminder.due_at
        }))
      }
    }

    // Calculate summary stats
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    const todayInterviews = results.interviews.filter(i => {
      const date = new Date(i.scheduledAt as string)
      return date >= today && date < tomorrow
    })

    const overdue = results.reminders.filter(r => {
      const date = new Date(r.dueAt as string)
      return date < now
    })

    return NextResponse.json({
      interviews: results.interviews,
      reminders: results.reminders,
      summary: {
        totalInterviews: results.interviews.length,
        totalReminders: results.reminders.length,
        todayInterviews: todayInterviews.length,
        overdueReminders: overdue.length
      }
    })
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    )
  }
}
