/**
 * User Career Paths API
 *
 * GET /api/user/career-paths - Get user's selected career paths
 * POST /api/user/career-paths - Save user's career path selections
 * DELETE /api/user/career-paths - Clear all user's career paths
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Types for Supabase query results
interface CareerPathData {
  id: string
  title: string
  title_es: string | null
  salary_min: number | null
  salary_max: number | null
  growth_rate: string | null
}

interface UserCareerPathInsert {
  user_id: string
  career_path_id: string | null
  is_custom: boolean
  custom_title?: string | null
  custom_title_es?: string | null
  priority: number
}

// GET: Fetch user's selected career paths
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('user_career_paths')
      .select(`
        id,
        is_custom,
        custom_title,
        custom_title_es,
        priority,
        career_paths (
          id,
          title,
          title_es,
          salary_min,
          salary_max,
          growth_rate
        )
      `)
      .eq('user_id', user.id)
      .order('priority')

    if (error) {
      console.error('Error fetching user career paths:', error)
      return NextResponse.json(
        { error: 'Failed to fetch career paths' },
        { status: 500 }
      )
    }

    // Transform the data
    const careerPaths = data?.map((item) => {
      const cp = item.career_paths as unknown as CareerPathData | null
      return {
        id: item.id,
        isCustom: item.is_custom,
        customTitle: item.custom_title,
        customTitleEs: item.custom_title_es,
        priority: item.priority,
        careerPath: cp
          ? {
              id: cp.id,
              title: cp.title,
              titleEs: cp.title_es,
              salaryMin: cp.salary_min,
              salaryMax: cp.salary_max,
              growthRate: cp.growth_rate,
            }
          : null,
      }
    }) || []

    return NextResponse.json({ careerPaths })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Save user's career path selections
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { selectedPaths, customPaths } = body

    // Validate input
    if (!Array.isArray(selectedPaths)) {
      return NextResponse.json(
        { error: 'selectedPaths must be an array' },
        { status: 400 }
      )
    }

    // Delete existing user career paths
    const { error: deleteError } = await supabase
      .from('user_career_paths')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting existing paths:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update career paths' },
        { status: 500 }
      )
    }

    // Prepare rows to insert
    const rows: UserCareerPathInsert[] = []

    // Add selected career paths (from database)
    selectedPaths.forEach((pathId: string, index: number) => {
      rows.push({
        user_id: user.id,
        career_path_id: pathId,
        is_custom: false,
        priority: index + 1,
      })
    })

    // Add custom career paths
    if (Array.isArray(customPaths)) {
      customPaths.forEach((custom: { title: string; titleEs?: string }, index: number) => {
        rows.push({
          user_id: user.id,
          career_path_id: null,
          is_custom: true,
          custom_title: custom.title,
          custom_title_es: custom.titleEs || null,
          priority: selectedPaths.length + index + 1,
        })
      })
    }

    // Insert all rows
    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('user_career_paths')
        .insert(rows)

      if (insertError) {
        console.error('Error inserting career paths:', insertError)
        return NextResponse.json(
          { error: 'Failed to save career paths' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Clear all user's career paths
export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('user_career_paths')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting career paths:', error)
      return NextResponse.json(
        { error: 'Failed to delete career paths' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
