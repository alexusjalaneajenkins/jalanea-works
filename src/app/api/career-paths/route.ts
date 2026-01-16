/**
 * GET /api/career-paths?program=program_key&school=school_id
 *
 * Returns career paths and skills for a specific program
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const programKey = searchParams.get('program')
  const school = searchParams.get('school')

  if (!programKey || !school) {
    return NextResponse.json(
      { error: 'Missing required parameters: program and school' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    // Get career paths for this program
    const { data: careerPathData, error: careerError } = await supabase
      .from('program_career_paths')
      .select(`
        career_paths (
          id,
          title,
          title_es,
          description,
          salary_min,
          salary_max,
          growth_rate
        )
      `)
      .eq('program_key', programKey)
      .eq('school', school)

    if (careerError) {
      console.error('Error fetching career paths:', careerError)
      return NextResponse.json(
        { error: 'Failed to fetch career paths' },
        { status: 500 }
      )
    }

    // Get skills for this program
    const { data: skillsData, error: skillsError } = await supabase
      .from('program_skills')
      .select(`
        skills (
          id,
          name,
          name_es,
          category
        )
      `)
      .eq('program_key', programKey)
      .eq('school', school)

    if (skillsError) {
      console.error('Error fetching skills:', skillsError)
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      )
    }

    // Transform the data
    const careerPaths = careerPathData
      ?.map((item) => item.career_paths)
      .filter(Boolean)
      .map((cp: any) => ({
        id: cp.id,
        title: cp.title,
        titleEs: cp.title_es,
        description: cp.description,
        salaryMin: cp.salary_min,
        salaryMax: cp.salary_max,
        growthRate: cp.growth_rate,
      })) || []

    const skills = skillsData
      ?.map((item) => item.skills)
      .filter(Boolean)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        nameEs: s.name_es,
        category: s.category,
      })) || []

    return NextResponse.json({
      programKey,
      school,
      careerPaths,
      skills,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
