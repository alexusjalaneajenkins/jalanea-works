/**
 * Single Note API
 *
 * PUT /api/applications/[id]/notes/[noteId] - Update a note
 * DELETE /api/applications/[id]/notes/[noteId] - Delete a note
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: applicationId, noteId } = await params
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
      .from('application_notes')
      .select('id')
      .eq('id', noteId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate content
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      )
    }

    // Update note
    const { data: note, error } = await supabase
      .from('application_notes')
      .update({
        content: body.content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      throw error
    }

    return NextResponse.json({
      note: transformNote(note)
    })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: applicationId, noteId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Hard delete since notes table doesn't have deleted_at
    const { error } = await supabase
      .from('application_notes')
      .delete()
      .eq('id', noteId)
      .eq('application_id', applicationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting note:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted'
    })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}

function transformNote(note: Record<string, unknown>) {
  return {
    id: note.id,
    applicationId: note.application_id,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at
  }
}
