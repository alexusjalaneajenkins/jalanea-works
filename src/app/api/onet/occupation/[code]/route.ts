import { NextResponse } from 'next/server'
import {
  getOccupationDetails,
  getRelatedOccupations,
  isONetAvailable,
  onetCareerToCareerPath,
} from '@/lib/onet-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/onet/occupation/[code]
 *
 * Get detailed information about an O*NET occupation
 *
 * Path params:
 * - code: O*NET SOC code (e.g., "15-1254.00")
 *
 * Query params:
 * - include_related: Include related occupations (default: false)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(request.url)
  const includeRelated = searchParams.get('include_related') === 'true'

  if (!code) {
    return NextResponse.json(
      { error: 'Occupation code is required' },
      { status: 400 }
    )
  }

  if (!isONetAvailable()) {
    return NextResponse.json(
      { error: 'O*NET API not configured' },
      { status: 503 }
    )
  }

  try {
    const details = await getOccupationDetails(code)

    // Convert to our career path format with full details
    const careerPath = onetCareerToCareerPath(
      { code: details.code, title: details.title, href: '', tags: {} },
      details
    )

    // Get related occupations if requested
    let relatedOccupations = null
    if (includeRelated) {
      const related = await getRelatedOccupations(code)
      relatedOccupations = related.slice(0, 10).map(occ => ({
        code: occ.code,
        title: occ.title,
      }))
    }

    return NextResponse.json({
      ...careerPath,
      description: details.description,
      also_called: details.also_called,
      what_they_do: details.what_they_do,
      on_the_job: details.on_the_job,
      skills: details.skills?.slice(0, 10).map(s => ({
        name: s.name,
        description: s.description,
        level: s.level?.value,
      })),
      knowledge: details.knowledge?.slice(0, 10).map(k => ({
        name: k.name,
        description: k.description,
        level: k.level?.value,
      })),
      abilities: details.abilities?.slice(0, 10).map(a => ({
        name: a.name,
        description: a.description,
        level: a.level?.value,
      })),
      technology: details.technology?.slice(0, 15).map(t => ({
        name: t.name,
        hot_technology: t.hot_technology,
        category: t.category,
      })),
      education: details.education,
      job_outlook: details.job_outlook,
      related_occupations: relatedOccupations,
    })
  } catch (error) {
    console.error('O*NET occupation details error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get occupation details' },
      { status: 500 }
    )
  }
}
