/**
 * Application Reminders API
 *
 * GET /api/applications/[id]/reminders - Get all reminders for an application
 * POST /api/applications/[id]/reminders - Create a new reminder
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_REMINDER_TYPES = ['follow_up', 'interview_prep', 'deadline', 'custom'] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership of application
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Fetch reminders
    const { data: reminders, error } = await supabase
      .from('application_reminders')
      .select('*')
      .eq('application_id', applicationId)
      .order('due_at', { ascending: true })

    if (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }

    return NextResponse.json({
      reminders: (reminders || []).map(transformReminder)
    })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership of application
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reminder message is required' },
        { status: 400 }
      )
    }

    if (!body.dueAt) {
      return NextResponse.json(
        { error: 'Due date is required' },
        { status: 400 }
      )
    }

    // Validate reminder type
    const reminderType = body.type || 'custom'
    if (!VALID_REMINDER_TYPES.includes(reminderType)) {
      return NextResponse.json(
        { error: `Invalid reminder type. Must be one of: ${VALID_REMINDER_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Insert reminder
    const { data: reminder, error } = await supabase
      .from('application_reminders')
      .insert({
        application_id: applicationId,
        user_id: user.id,
        reminder_type: reminderType,
        message: body.message.trim(),
        due_at: body.dueAt
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reminder:', error)
      throw error
    }

    return NextResponse.json({
      reminder: transformReminder(reminder)
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}

function transformReminder(reminder: Record<string, unknown>) {
  return {
    id: reminder.id,
    applicationId: reminder.application_id,
    type: reminder.reminder_type,
    message: reminder.message,
    dueAt: reminder.due_at,
    completed: reminder.completed,
    completedAt: reminder.completed_at,
    createdAt: reminder.created_at,
    updatedAt: reminder.updated_at
  }
}
