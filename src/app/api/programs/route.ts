/**
 * GET /api/programs?school=valencia
 *
 * Returns available programs for a school from the seeded JSON data.
 * Used by the onboarding flow's program selector.
 */

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// Map school IDs to their JSON file names
const schoolToFile: Record<string, string> = {
  valencia: 'valencia.json',
  ucf: 'ucf.json',
  seminole: 'seminole.json',
  fullsail: 'fullsail.json',
  orange: 'orange.json',
  'orlando-tech': 'orange.json', // Alias for consistency with constants.tsx
}

interface ProgramData {
  name: string
  degree_type: string
  career_paths: unknown[]
  skills: unknown[]
}

interface SchoolData {
  school: string
  programs: ProgramData[]
}

// Generate program key matching the seed script logic
function generateProgramKey(schoolId: string, programName: string): string {
  const cleanName = programName
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove degree type in parentheses
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores

  return `${schoolId}_${cleanName}`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const schoolId = searchParams.get('school')

  if (!schoolId) {
    return NextResponse.json(
      { error: 'Missing required parameter: school' },
      { status: 400 }
    )
  }

  const fileName = schoolToFile[schoolId]
  if (!fileName) {
    return NextResponse.json(
      { error: `Unknown school: ${schoolId}` },
      { status: 400 }
    )
  }

  try {
    // Read the JSON file from src/data/career-mappings
    const filePath = path.join(process.cwd(), 'src', 'data', 'career-mappings', fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const schoolData: SchoolData = JSON.parse(fileContent)

    // Transform programs for the frontend
    // Normalize school ID (orlando-tech -> orange for key generation)
    const normalizedSchoolId = schoolId === 'orlando-tech' ? 'orange' : schoolId

    const programs = schoolData.programs.map((program) => ({
      key: generateProgramKey(normalizedSchoolId, program.name),
      name: program.name,
      degreeType: program.degree_type,
      careerPathCount: program.career_paths.length,
      skillCount: program.skills.length,
    }))

    // Sort by name
    programs.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      school: schoolId,
      schoolName: schoolData.school,
      programs,
    })
  } catch (error) {
    console.error('Error loading programs:', error)
    return NextResponse.json(
      { error: 'Failed to load programs' },
      { status: 500 }
    )
  }
}
