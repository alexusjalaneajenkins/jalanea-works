import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('valencia_programs')
      .select('program_id, program_name, program_type, school, career_pathway, keywords, typical_salary_min, typical_salary_max')
      .order('program_name')

    if (error) {
      console.error('Error fetching Valencia programs:', error)
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in valencia-programs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
