/**
 * Single Resume API
 *
 * GET /api/resumes/[id] - Get a single resume
 * PUT /api/resumes/[id] - Update a resume
 * DELETE /api/resumes/[id] - Delete a resume
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production, fetch from Supabase
    // const { data: resume, error } = await supabase
    //   .from('resumes')
    //   .select('*')
    //   .eq('id', id)
    //   .eq('user_id', user.id)
    //   .single()

    return NextResponse.json({
      resume: {
        id: id,
        message: 'In production, this would return the full resume'
      }
    })
  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Update resume
    const updatedResume = {
      ...body,
      id: id,
      userId: user.id,
      lastUpdated: new Date().toISOString()
    }

    // In production, update in Supabase
    // const { data, error } = await supabase
    //   .from('resumes')
    //   .update(updatedResume)
    //   .eq('id', id)
    //   .eq('user_id', user.id)
    //   .select()
    //   .single()

    return NextResponse.json({
      resume: updatedResume
    })
  } catch (error) {
    console.error('Error updating resume:', error)
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production, delete from Supabase
    // const { error } = await supabase
    //   .from('resumes')
    //   .delete()
    //   .eq('id', id)
    //   .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      message: 'Resume deleted'
    })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}
