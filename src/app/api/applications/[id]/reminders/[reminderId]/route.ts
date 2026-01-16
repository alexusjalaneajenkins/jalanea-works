/**
 * Single Reminder API
 *
 * PUT /api/applications/[id]/reminders/[reminderId] - Update a reminder
 * PATCH /api/applications/[id]/reminders/[reminderId] - Toggle reminder completion
 * DELETE /api/applications/[id]/reminders/[reminderId] - Delete a reminder
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_REMINDER_TYPES = ['follow_up', 'interview_prep', 'deadline', 'custom'] as const

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const { id: applicationId, reminderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('application_reminders')
      .select('id')
      .eq('id', reminderId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Update message if provided
    if (body.message !== undefined) {
      if (!body.message || body.message.trim().length === 0) {
        return NextResponse.json(
          { error: 'Reminder message is required' },
          { status: 400 }
        )
      }
      updateData.message = body.message.trim()
    }

    // Update type if provided
    if (body.type !== undefined) {
      if (!VALID_REMINDER_TYPES.includes(body.type)) {
        return NextResponse.json(
          { error: `Invalid reminder type. Must be one of: ${VALID_REMINDER_TYPES.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.reminder_type = body.type
    }

    // Update due date if provided
    if (body.dueAt !== undefined) {
      updateData.due_at = body.dueAt
    }

    // Handle completion status
    if (body.completed !== undefined) {
      updateData.completed = body.completed
      updateData.completed_at = body.completed ? new Date().toISOString() : null
    }

    // Update reminder
    const { data: reminder, error } = await supabase
      .from('application_reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating reminder:', error)
      throw error
    }

    return NextResponse.json({
      reminder: transformReminder(reminder)
    })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  // PATCH delegates to PUT for partial updates
  return PUT(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reminderId: string }> }
) {
  try {
    const { id: applicationId, reminderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hard delete since reminders table doesn't have deleted_at
    const { error } = await supabase
      .from('application_reminders')
      .delete()
      .eq('id', reminderId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting reminder:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder deleted'
    })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
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
